"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
exports.renderURL = renderURL;
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const art_template_1 = __importDefault(require("art-template"));
const sharp_1 = __importDefault(require("sharp")); // 引入 sharp 库
const common_1 = require("./common");
const global_1 = require("./global");
const kazuha_1 = __importDefault(require("../kazuha"));
const logger_1 = __importDefault(require("./logger"));
const path_1 = __importDefault(require("path"));
const html = {};
var restartNum = 30;
var renderNum = 0;
var lock = false;
var shoting = [];
async function render(renderData) {
    const pluginsDir = path_1.default.resolve(__dirname, '../plugins');
    const pluginPaths = fs_1.default.readdirSync(pluginsDir).filter((file) => {
        const filePath = path_1.default.join(pluginsDir, file);
        return fs_1.default.statSync(filePath).isDirectory();
    });
    const excludedPlugins = ['other', 'system', 'example'];
    for (const plugin of pluginPaths) {
        if (excludedPlugins.includes(plugin)) {
            continue;
        }
        if (renderData.render.template) {
            renderData.render.resFile = `${global_1._path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/${renderData.render.template}.html`;
        }
        else {
            renderData.render.resFile = `${global_1._path}/plugins/${plugin}/resources/html/${renderData.app}/${renderData.type}/index.html`;
        }
        if (excludedPlugins.includes(plugin)) {
            renderData.data.resPath = `${global_1._path}/`;
        }
        else {
            renderData.data.resPath = `${global_1._path}/plugins/mihoyo/resources/`;
        }
    }
    if (!renderData.render.saveFile)
        renderData.render.saveFile = `${global_1._path}/data/html/${renderData.app}/${renderData.type}/${renderData.render.saveId}.html`;
    return await doRender(renderData).catch(err => {
        logger_1.default.error(err);
    });
}
async function doRender(renderData) {
    var { app, type, imgType, render, data } = renderData;
    const savePic = `${render.saveFile}.${imgType}`;
    const tempPic = `${render.saveFile}_temp.${imgType}`;
    html[`${app}.${type}`] = fs_1.default.readFileSync(render.resFile, "utf8");
    var tmpHtml = art_template_1.default.render(html[`${app}.${type}`], data);
    (0, common_1.writeFileSyncEx)(render.saveFile, tmpHtml);
    if (!(await browserInit()))
        return null;
    if (!global.browser)
        return null;
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
        await (0, sharp_1.default)(savePic)
            .jpeg({ quality: 80 }) // 设置压缩质量
            .toFile(tempPic); // 覆盖原文件，生成压缩版本
        fs_1.default.renameSync(tempPic, savePic);
    }).catch(err => {
        logger_1.default.error(err);
    });
    await page.close();
    if (fs_1.default.existsSync(savePic)) {
        global_1.botStatus.imageRenderNum++;
        return savePic;
    }
    else {
        return null;
    }
}
async function renderURL(renderData) {
    var { app, type, imgType, url, saveId } = renderData;
    const savePath = `${global_1._path}/data/url/${app}/${type}/${saveId}.${imgType}`;
    const tempPath = `${global_1._path}/data/url/${app}/${type}/${saveId}_temp.${imgType}`;
    if (!(await browserInit()))
        return false;
    if (!global.browser)
        return false;
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
            await (0, sharp_1.default)(savePath)
                .jpeg({ quality: 80 }) // 设置压缩质量
                .toFile(savePath); // 覆盖原文件，生成压缩版本
            fs_1.default.renameSync(tempPath, savePath);
        }
    }).catch(err => {
        logger_1.default.error(err);
    });
    await page.close();
    return savePath;
}
async function browserInit() {
    if (global.browser) {
        if (kazuha_1.default.config.devEnv)
            logger_1.default.debug(`puppeteer已经启动`);
        return true;
    }
    if (lock) {
        return false;
    }
    lock = true;
    logger_1.default.mark("puppeteer启动中");
    await puppeteer_1.default.launch({
        executablePath: kazuha_1.default.config.executablePath || undefined,
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
        logger_1.default.info("puppeteer启动成功");
        global.browser.on("disconnected", function () {
            logger_1.default.error("Chromium实例关闭或崩溃！");
            global.browser = null;
        });
    }).catch((err) => {
        logger_1.default.error(err);
    });
    lock = false;
    return true;
}
;
;
//# sourceMappingURL=render.js.map