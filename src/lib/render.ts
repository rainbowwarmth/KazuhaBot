﻿import fs from "fs";
import puppeteer from "puppeteer";
import template from "art-template";
import sharp from "sharp"; // 引入 sharp 库
import { writeFileSyncEx } from "@src/lib/common";
import { _path, botStatus } from "@src/lib/global";
import kazuha from "@src/kazuha";
import logger from "@src/lib/logger";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const html: any = {};
var lock = false;

export async function render(renderData: Render) {
    const pluginsDir = path.resolve(__dirname, '../plugins');
    const pluginPaths = fs.readdirSync(pluginsDir).filter((file) => {
        const filePath = path.join(pluginsDir, file);
        return fs.statSync(filePath).isDirectory();
    });
    
    const excludedPlugins = ['other', 'system', 'example'];

    for (const plugin of pluginPaths) {
        if (excludedPlugins.includes(plugin)) {
            continue;
        }

        if (renderData.render.template) {
            renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/${renderData.render.template}.html`;
        } else {
            renderData.render.resFile = `${_path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/index.html`;
        }
        
        if (excludedPlugins.includes(plugin)){
            renderData.data.resPath = `${_path}/`;
        } else {
            renderData.data.resPath = `${_path}/plugins/mihoyo/resources/`;
        }
    }
    
    if (!renderData.render.saveFile)
        renderData.render.saveFile = `${_path}/data/html/${renderData.app}/${renderData.type}/${renderData.render.saveId}.html`;

    return await doRender(renderData).catch(err => {
        logger.error(err);
    });
}

async function doRender(renderData: Render): Promise<string | null> {
    var { app, type, imgType, render, data } = renderData;
    const savePic = `${render.saveFile}.${imgType}`;
    const tempPic = `${render.saveFile}_temp.${imgType}`
    html[`${app}.${type}`] = fs.readFileSync(render.resFile!, "utf8");

    var tmpHtml = template.render(html[`${app}.${type}`], data);
    writeFileSyncEx(render.saveFile!, tmpHtml);

    if (!(await browserInit())) return null;
    if (!global.browser) return null;

    const page = await global.browser.newPage();

    await page.goto(`file://${renderData.render.saveFile}`, {
        waitUntil: "networkidle0",
    }).then(() => {
        return page.$("#container");
    }).then(async (body) => {
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
    }).catch(err => {
        logger.error(err);
    });

    await page.close();
    if (fs.existsSync(savePic)) {
        botStatus.imageRenderNum++;
        return savePic;
    } else {
        return null;
    }
}

export async function renderURL(renderData: RenderURL) {
    var { app, type, imgType, url, saveId } = renderData;
    const savePath = `${_path}/data/url/${app}/${type}/${saveId}.${imgType}`;
    const tempPath = `${_path}/data/url/${app}/${type}/${saveId}_temp.${imgType}`;

    if (!(await browserInit())) return false;
    if (!global.browser) return false;

    const page = await global.browser.newPage();
    await page.goto(url, {
        waitUntil: "networkidle0",
    });
    await page.evaluate(() => {
        document.querySelector("#__layout > div > div.header")?.remove();
    });

    await page.$("#__layout > div > div.root-page-container > div > div.mhy-layout__main > div.mhy-article-page__main.mhy-container").then(async (f) => {
        if (f) {
            await f.screenshot({
                type: imgType,
                encoding: "binary",
                quality: 100,
                path: savePath,
                omitBackground: true,
            });
            // 使用 sharp 压缩截图
            await sharp(savePath)
                .jpeg({ quality: 80 }) // 设置压缩质量
                .toFile(tempPath); // 覆盖原文件，生成压缩版本
            fs.renameSync(tempPath, savePath);
        }
    }).catch(err => {
        logger.error(err);
    });

    await page.close();
    return savePath;
}

async function browserInit() {
    if (global.browser) {
        if (kazuha.config.devEnv) logger.debug(`puppeteer已经启动`);
        return true;
    }
    if (lock) {
        return false;
    }
    lock = true;
    logger.mark("puppeteer启动中");

    await puppeteer.launch({
        executablePath: kazuha.config.executablePath || undefined,
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
    }).then(_browser => {
        global.browser = _browser;
        logger.info("puppeteer启动成功");
        global.browser.on("disconnected", function () {
            logger.error("Chromium实例关闭或崩溃！");
            global.browser = null;
        });
    }).catch((err) => {
        logger.error(err);
    });
    lock = false;

    return true;
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
};

interface RenderURL {
    app: string;
    type: string;
    imgType: "jpeg" | "png";
    url: string;
    saveId: string;
};