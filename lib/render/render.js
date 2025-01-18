import fs from "fs";
import template from "art-template";
import sharp from "sharp";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { config } from "../../lib/config/config.js";
import { _path, botStatus } from "../../lib/global/global.js";
import { writeFileSyncEx } from "../../lib/common/common.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const html = {};
var lock = false;
// 外部浏览器选项
const fetchTimeout = (url, options = {}, timeout) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('fetch timeout'));
        }, config.render.timeout * 1000);
        fetch(url, options)
            .then(response => {
            clearTimeout(timer);
            resolve(response);
        })
            .catch(error => {
            clearTimeout(timer);
            reject(error);
        });
    });
};
// 渲染主函数
async function render(renderData) {
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    const pluginPaths = fs.readdirSync(pluginsDir).filter((file) => {
        const filePath = path.join(pluginsDir, file);
        return fs.statSync(filePath).isDirectory();
    });
    const excludedPlugins = ['other', 'system', 'example'];
    // 为每个插件生成HTML文件路径
    for (const plugin of pluginPaths) {
        if (excludedPlugins.includes(plugin)) {
            continue;
        }
        if (renderData.render.template) {
            renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/${renderData.render.template}.html`;
        }
        else {
            renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/index.html`;
        }
        if (excludedPlugins.includes(plugin)) {
            renderData.data.resPath = `${_path}/`;
        }
        else {
            renderData.data.resPath = `${_path}/plugins/mihoyo/resources/`;
        }
    }
    if (!renderData.render.saveFile)
        renderData.render.saveFile = `${_path}/temp/html/${renderData.app}/${renderData.type}/${renderData.render.saveId}.html`;
    // 调用渲染函数
    return await doRender(renderData).catch(err => {
        logger.error(err);
    });
}
// 渲染HTML并生成截图
async function doRender(renderData) {
    var { app, type, imgType, render, data } = renderData;
    const savePic = `${render.saveFile}.${imgType}`;
    const tempPic = `${render.saveFile}_temp.${imgType}`;
    // 读取模板文件并生成HTML
    if (!render.resFile) {
        throw new Error("render.resFile is undefined");
    }
    html[`${app}.${type}`] = fs.readFileSync(render.resFile, "utf8");
    var tmpHtml = template.render(html[`${app}.${type}`], data);
    if (render.saveFile) {
        writeFileSyncEx(render.saveFile, tmpHtml); // 保存生成的HTML文件
    }
    else {
        throw new Error("render.saveFile is undefined");
    }
    // 如果使用外部浏览器，则传递HTML文件给外部渲染器
    if (config.render.useExternalBrowser) {
        const filePath = `file://${render.saveFile}`; // 使用生成的 HTML 文件路径
        const payload = {
            file: filePath,
            pageGotoParams: {
                waitUntil: "networkidle2"
            }
        };
        try {
            // 通过 HTTP 请求将文件路径和渲染参数传递给外部渲染器
            const response = await fetchTimeout(`${config.render.host}:${config.render.port}/puppeteer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': config.render.authorization
                },
                body: JSON.stringify(payload)
            }, config.render.timeout);
            // 检查响应是否为图像数据
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
                const buffer = Buffer.from(await response.arrayBuffer()); // 获取图像数据
                fs.writeFileSync(savePic, buffer); // 保存图像
                logger.debug(`外部浏览器渲染成功，保存路径：${savePic}`);
            }
            else {
                // 如果不是图像数据，则处理 JSON 响应
                const jsonResponse = await response.json();
                if (jsonResponse.success && jsonResponse.screenshotPath) {
                    logger.debug(`外部浏览器渲染成功: ${jsonResponse.screenshotPath}`);
                    fs.renameSync(jsonResponse.screenshotPath, savePic); // 直接覆盖保存图片
                }
                else {
                    logger.error("外部浏览器渲染失败：未返回截图路径");
                }
            }
        }
        catch (err) {
            logger.error("外部浏览器请求失败：", err);
        }
    }
    else {
        // 如果不使用外部浏览器，使用 puppeteer 本地渲染
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
            // 使用 sharp 压缩截图
            await sharp(savePic)
                .jpeg({ quality: 80 }) // 设置压缩质量
                .toFile(tempPic); // 覆盖原文件，生成压缩版本
            fs.renameSync(tempPic, savePic);
        })
            .catch(err => {
            logger.error(err);
        });
        await page.close();
    }
    if (fs.existsSync(savePic)) {
        botStatus.imageRenderNum++;
        return savePic;
    }
    else {
        return null;
    }
}
// 浏览器初始化函数，支持外部浏览器
async function browserInit() {
    if (global.browser) {
        if (config.devEnv)
            logger.debug(`puppeteer已经启动`);
        return true;
    }
    if (lock) {
        return false;
    }
    lock = true;
    logger.mark("浏览器启动中");
    if (config.render.useExternalBrowser) {
        logger.debug("使用外部浏览器启动");
        try {
            // 启动外部渲染器，传递启动命令
            const response = await fetchTimeout(`${config.render.host}:${config.render.port}/puppeteer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': config.render.authorization
                },
                body: JSON.stringify({ action: 'launch' })
            }, config.render.timeout);
            // 假设外部渲染器返回一个标识字段
            const jsonResponse = await response.json();
            if (jsonResponse && jsonResponse.success && jsonResponse.browserId) {
                logger.debug("外部浏览器启动成功，Browser ID: " + jsonResponse.browserId);
                global.browser = jsonResponse; // 这里只是一个示例，根据实际返回值调整
            }
            else {
                logger.error("外部浏览器返回的不是预期的浏览器实例标识");
            }
        }
        catch (err) {
            logger.error("外部浏览器初始化失败：", err);
        }
    }
    else {
        try {
            // 使用 puppeteer 启动本地浏览器
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
                global.browser = _browser;
                logger.debug("puppeteer启动成功");
            }
            else {
                logger.error("启动的浏览器实例无效");
            }
            global.browser?.on("disconnected", function () {
                logger.error("Chromium实例关闭或崩溃！");
                global.browser = null;
            });
        }
        catch (err) {
            logger.error("启动 puppeteer 浏览器失败：", err);
        }
    }
    lock = false;
    return true;
}
export default render;
