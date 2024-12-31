import fs from "fs";
import template from "art-template";
import sharp from "sharp";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { config } from "@src/lib/config/config";
import { _path, botStatus } from "@src/lib/global/global";
import { writeFileSyncEx } from "@src/lib/common/common";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const html: { [key: string]: string } = {};
let lock = false;

const fetchTimeout = (url: string, options: object = {}, timeout: number) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('fetch timeout')), config.render.timeout * 1000);
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

async function render(renderData: Render) {
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    const pluginPaths = fs.readdirSync(pluginsDir).filter(file => fs.statSync(path.join(pluginsDir, file)).isDirectory());
    const excludedPlugins = ['other', 'system', 'example'];

    for (const plugin of pluginPaths) {
        if (excludedPlugins.includes(plugin)) continue;
        renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/${renderData.render.template || 'index'}.html`;
        renderData.data.resPath = excludedPlugins.includes(plugin) ? `${_path}/` : `${_path}/plugins/mihoyo/resources/`;
    }

    renderData.render.saveFile ||= `${_path}/data/html/${renderData.app}/${renderData.type}/${renderData.render.saveId}.html`;

    try {
        return await doRender(renderData);
    } catch (err) {
        logger.error(err);
    }
}

async function doRender(renderData: Render): Promise<string | null> {
    const { app, type, imgType, render, data } = renderData;
    const savePic = `${render.saveFile}.${imgType}`;
    const tempPic = `${render.saveFile}_temp.${imgType}`;

    if (!render.resFile) throw new Error("render.resFile is undefined");
    html[`${app}.${type}`] = fs.readFileSync(render.resFile, "utf8");
    const tmpHtml = template.render(html[`${app}.${type}`], data);
    if (!render.saveFile) throw new Error("render.saveFile is undefined");
    writeFileSyncEx(render.saveFile, tmpHtml);

    if (config.render.useExternalBrowser) {
        return await renderWithExternalBrowser(render, savePic, tempPic);
    } else {
        return await renderWithPuppeteer(renderData, savePic, tempPic);
    }
}

async function renderWithExternalBrowser(render: any, savePic: string, tempPic: string): Promise<string | null> {
    const filePath = `file://${render.saveFile}`;
    const payload = {
        file: filePath,
        pageGotoParams: { waitUntil: "networkidle2" }
    };

    try {
        const response = await fetchTimeout(config.render.host, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': config.render.authorization
            },
            body: JSON.stringify(payload)
        }, config.render.timeout);

        const contentType = (response as Response).headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            const buffer = Buffer.from(await (response as Response).arrayBuffer());
            fs.writeFileSync(savePic, buffer);
            logger.debug(`外部浏览器渲染成功，保存路径：${savePic}`);
        } else {
            const jsonResponse: any = await (response as Response).json();
            if (jsonResponse.success && jsonResponse.screenshotPath) {
                logger.debug(`外部浏览器渲染成功: ${jsonResponse.screenshotPath}`);
                fs.renameSync(jsonResponse.screenshotPath, savePic);
            } else {
                logger.error("外部浏览器渲染失败，未返回截图路径");
            }
        }
    } catch (err) {
        logger.error("外部浏览器请求失败", err);
    }

    return fs.existsSync(savePic) ? savePic : null;
}

async function renderWithPuppeteer(renderData: Render, savePic: string, tempPic: string): Promise<string | null> {
    if (!(await browserInit())) return null;
    if (!global.browser) return null;
    const page = await global.browser.newPage();
    try {
        await page.goto(`file://${renderData.render.saveFile}`, { waitUntil: "networkidle0" });
        const body = await page.$("#container");
        await body?.screenshot({
            type: renderData.imgType,
            encoding: "binary",
            quality: 100,
            path: savePic,
            omitBackground: true,
        });
        await sharp(savePic).jpeg({ quality: 80 }).toFile(tempPic);
        fs.renameSync(tempPic, savePic);
    } catch (err) {
        logger.error(err);
    } finally {
        await page.close();
    }

    return fs.existsSync(savePic) ? savePic : null;
}

async function browserInit() {
    if (global.browser) {
        if (config.devEnv) logger.debug(`puppeteer已经启动`);
        return true;
    }
    if (lock) return false;
    lock = true;
    logger.mark("浏览器启动中");

    try {
        if (config.render.useExternalBrowser) {
            await initExternalBrowser();
        } else {
            await initPuppeteer();
        }
    } catch (err) {
        logger.error("浏览器初始化失败", err);
    } finally {
        lock = false;
    }
    return true;
}

async function initExternalBrowser() {
    logger.debug("使用外部浏览器启动");
    const response = await fetchTimeout(config.render.host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': config.render.authorization
        },
        body: JSON.stringify({ action: 'launch' })
    }, config.render.timeout);

    const jsonResponse = await (response as Response).json();
    if (jsonResponse?.success && jsonResponse.browserId) {
        logger.debug("外部浏览器启动成功，Browser ID: " + jsonResponse.browserId);
        global.browser = jsonResponse;
    } else {
        throw new Error("外部浏览器返回的不是预期的浏览器实例标识");
    }
}

async function initPuppeteer() {
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
        global.browser.on("disconnected", () => {
            logger.error("Chromium实例关闭或崩溃！");
            global.browser = null;
        });
    } else {
        throw new Error("启动的浏览器实例无效");
    }
}

interface Render {
    app: string;
    type: string;
    imgType: "jpeg" | "png";
    render: {
        saveId: string;
        resFile?: string;
        saveFile?: string;
        template?: string;
    };
    data: any;
}

export default render;
