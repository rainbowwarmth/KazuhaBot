import fs from "fs"
import template from "art-template"
import sharp from "sharp"
import puppeteer from "puppeteer"
import path from "path"
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { config } from "../../lib/config/config.js"
import { _path, botStatus } from "../../lib/global/global.js"
import { writeFileSyncEx } from "../../lib/common/common.js"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const html = {}
var lock = false

/**外部浏览器选项 */
const fetchTimeout = (url, options = {}, timeout) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('fetch timeout'))
        }, config.render.timeout * 1000)
        fetch(url, options)
            .then(response => {
            clearTimeout(timer)
            resolve(response)
        })
            .catch(error => {
            clearTimeout(timer)
            reject(error)
        })
    })
}

/**渲染主函数 */
async function render(renderData) {
    const pluginsDir = path.resolve(__dirname, '../../plugins')
    const pluginPaths = fs.readdirSync(pluginsDir).filter((file) => {
        const filePath = path.join(pluginsDir, file)
        return fs.statSync(filePath).isDirectory()
    });
    const excludedPlugins = ['other', 'system', 'example']
    for (const plugin of pluginPaths) {
        if (excludedPlugins.includes(plugin)) {
            continue;
        }
        if (renderData.render.template) {
            renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/${renderData.render.template}.html`
        }
        else {
            renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/index.html`
        }
        if (excludedPlugins.includes(plugin)) {
            renderData.data.resPath = `${_path}/`
        }
        else {
            renderData.data.resPath = `${_path}/plugins/mihoyo/resources/`
        }
    }
    if (!renderData.render.saveFile)
        renderData.render.saveFile = `${_path}/temp/html/${renderData.app}/${renderData.type}/${renderData.render.saveId}.html`
    return await doRender(renderData).catch(err => {
        logger.error(err)
    });
}

/**渲染HTML并生成截图 */
async function doRender(renderData) {
    var { app, type, imgType, render, data } = renderData
    const savePic = `${render.saveFile}.${imgType}`
    const tempPic = `${render.saveFile}_temp.${imgType}`
    if (!render.resFile) {
        throw new Error("render.resFile is undefined")
    }
    html[`${app}.${type}`] = fs.readFileSync(render.resFile, "utf8")
    var tmpHtml = template.render(html[`${app}.${type}`], data)
    if (render.saveFile) {
        writeFileSyncEx(render.saveFile, tmpHtml)
    }
    else {
        throw new Error("render.saveFile is undefined")
    }
    if (config.render.useExternalBrowser) {
        const filePath = `file://${render.saveFile}`
        const payload = {
            file: filePath,
            pageGotoParams: {
                waitUntil: "networkidle2"
            }
        };
        try {
            const response = await fetchTimeout(`${config.render.host}:${config.render.port}/puppeteer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': config.render.authorization
                },
                body: JSON.stringify(payload)
            }, config.render.timeout)
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('image')) {
                const buffer = Buffer.from(await response.arrayBuffer())
                fs.writeFileSync(savePic, buffer)
                logger.debug(`外部浏览器渲染成功，保存路径：${savePic}`)
            }
            else {
                const jsonResponse = await response.json();
                if (jsonResponse.success && jsonResponse.screenshotPath) {
                    logger.debug(`外部浏览器渲染成功: ${jsonResponse.screenshotPath}`)
                    fs.renameSync(jsonResponse.screenshotPath, savePic)
                }
                else {
                    logger.error("外部浏览器渲染失败：未返回截图路径")
                }
            }
        }
        catch (err) {
            logger.error("外部浏览器请求失败：", err)
        }
    }
    else {
        if (!(await browserInit()))
            return null;
        if (!global.browser)
            return null;
        const page = await global.browser.newPage();
        await page.goto(`file://${renderData.render.saveFile}`, { waitUntil: "networkidle0" })
            .then(() => page.$("#container"))
            .then(async (body) => {
            await body?.screenshot({
                type: imgType,
                encoding: "binary",
                quality: 100,
                path: savePic,
                omitBackground: true,
            });
            await sharp(savePic)
                .jpeg({ quality: 80 }) 
                .toFile(tempPic)
            fs.renameSync(tempPic, savePic)
        })
            .catch(err => {
            logger.error(err)
        });
        await page.close()
    }
    if (fs.existsSync(savePic)) {
        botStatus.imageRenderNum++
        return savePic
    }
    else {
        return null
    }
}

/**浏览器初始化函数，支持外部浏览器 */
async function browserInit() {
    if (global.browser) {
        if (config.devEnv)
            logger.debug(`puppeteer已经启动`)
        return true
    }
    if (lock) {
        return false
    }
    lock = true;
    logger.mark("浏览器启动中");
    if (config.render.useExternalBrowser) {
        logger.debug("使用外部浏览器启动")
        try {
            const response = await fetchTimeout(`${config.render.host}:${config.render.port}/puppeteer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': config.render.authorization
                },
                body: JSON.stringify({ action: 'launch' })
            }, config.render.timeout);
            const jsonResponse = await response.json()
            if (jsonResponse && jsonResponse.success && jsonResponse.browserId) {
                logger.debug("外部浏览器启动成功，Browser ID: " + jsonResponse.browserId)
                global.browser = jsonResponse
            }
            else {
                logger.error("外部浏览器返回的不是预期的浏览器实例标识")
            }
        }
        catch (err) {
            logger.error("外部浏览器初始化失败：", err)
        }
    }
    else {
        try {
            const _browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--disable-gpu",
                    "--disable-dev-shm-usage",
                    "--disable-setuid-sandbox",
                    "--no-first-run",
                    "--no-sandbox",
                    "--no-zygote",
                    "--single-process",
                    "--window-size=1920,1080"
                ]
            });
            if (_browser && typeof _browser.newPage === 'function') {
                global.browser = _browser
                logger.debug("puppeteer启动成功")
            }
            else {
                logger.error("启动的浏览器实例无效")
            }
            global.browser?.on("disconnected", function () {
                logger.error("Chromium实例关闭或崩溃！")
                global.browser = null
            })
        }
        catch (err) {
            logger.error("启动 puppeteer 浏览器失败：", err)
        }
    }
    lock = false
    return true
}
export default render
