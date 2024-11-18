"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path_1 = require("path");
const logger_1 = __importDefault(require("../../lib/logger"));
async function update(msg) {
    const projectRoot = process.cwd();
    const packageJsonPath = (0, path_1.join)(projectRoot, 'package.json');
    const gitDir = (0, path_1.join)(projectRoot, '.git');
    try {
        const packageJson = JSON.parse(await fs_1.promises.readFile(packageJsonPath, 'utf-8'));
        const installedVersion = packageJson.version;
        const latestVersion = await fetchLatestVersion();
        if (installedVersion !== latestVersion) {
            await handlePackageUpdate(msg, installedVersion, latestVersion);
        }
        else {
            logger_1.default.info('kazuha-bot 已经是最新版本。');
            msg.sendMsgEx({ content: 'kazuha-bot 已经是最新版本。' });
        }
        if (await fileExists(gitDir)) {
            await handleGitUpdate(msg);
        }
        else {
            await initializeProject(msg);
        }
    }
    catch (error) {
        logger_1.default.error('更新过程出错:', error);
        msg.sendMsgEx({ content: `更新过程出错：${error}` });
    }
}
async function handlePackageUpdate(msg, installedVersion, latestVersion) {
    logger_1.default.info(`新版本的 kazuha-bot 可用，更新从 ${installedVersion} 到 ${latestVersion}...`);
    await execCommand('pnpm i kazuha-bot --registry=https://registry.npmmirror.com && node node_modules/kazuha-bot/init.js');
    msg.sendMsgEx({ content: `更新完成，当前版本 ${latestVersion}` });
}
async function handleGitUpdate(msg) {
    logger_1.default.info('找到 .git 目录。运行 git pull...');
    const pullResult = await execCommand('git pull');
    if (pullResult.includes('Already up to date.')) {
        logger_1.default.info('当前存储库已是最新的。');
        msg.sendMsgEx({ content: '当前为最新版本' });
    }
    else {
        const commits = await execCommand('git log --oneline -n 5');
        logger_1.default.info('Git 拉取成功。最新提交：\n' + commits);
        msg.sendMsgEx({ content: '更新完成，重启中...' });
        restartBot(msg);
    }
}
async function initializeProject(msg) {
    logger_1.default.info('未找到 .git 目录。运行 pnpm i 并初始化...');
    await execCommand('pnpm i kazuha-bot --registry=https://registry.npmmirror.com && node node_modules/kazuha-bot/init.js');
    msg.sendMsgEx({ content: '初始化完成，重启中...' });
    restartBot(msg);
}
async function fileExists(path) {
    try {
        await fs_1.promises.access(path);
        return true;
    }
    catch {
        return false;
    }
}
async function fetchLatestVersion() {
    const response = await fetch('https://registry.npmmirror.com/kazuha-bot');
    if (!response.ok)
        throw new Error('无法获取最新版本号');
    const data = await response.json();
    return data['dist-tags'].latest;
}
function execCommand(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, { encoding: 'utf-8' }, (error, stdout) => {
            if (error)
                reject(error);
            else
                resolve(stdout.trim());
        });
    });
}
function restartBot(msg) {
    logger_1.default.info('重启前台服务...');
    msg.sendMsgEx({ content: '重启中' });
    // 启动 npm start
    execCommand('npm start')
        .then(() => process.exit(0)) // 退出当前进程
        .catch(error => logger_1.default.error('重启 Bot 时出错:', error));
}
//# sourceMappingURL=update.js.map