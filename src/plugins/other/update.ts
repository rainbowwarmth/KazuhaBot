import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { join } from 'path';
import logger from '../../lib/logger';
import { IMessageEx } from '../../lib/IMessageEx';

export async function update(msg: IMessageEx) {
    const projectRoot = process.cwd();
    const packageJsonPath = join(projectRoot, 'package.json');
    const gitDir = join(projectRoot, '.git');

    try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        const installedVersion = packageJson.version;
        const latestVersion = await fetchLatestVersion();

        if (installedVersion !== latestVersion) {
            await handlePackageUpdate(msg, installedVersion, latestVersion);
        } else {
            logger.info('kazuha-bot 已经是最新版本。');
            msg.sendMsgEx({ content: 'kazuha-bot 已经是最新版本。' });
        }

        if (await fileExists(gitDir)) {
            await handleGitUpdate(msg);
        } else {
            await initializeProject(msg);
        }
    } catch (error) {
        logger.error('更新过程出错:', error);
        msg.sendMsgEx({ content: `更新过程出错：${error}` });
    }
}

async function handlePackageUpdate(msg: IMessageEx, installedVersion: string, latestVersion: string) {
    logger.info(`新版本的 kazuha-bot 可用，更新从 ${installedVersion} 到 ${latestVersion}...`);
    await execCommand('pnpm i kazuha-bot --registry=https://registry.npmmirror.com && node node_modules/kazuha-bot/init.js');
    msg.sendMsgEx({ content: `更新完成，当前版本 ${latestVersion}` });
}

async function handleGitUpdate(msg: IMessageEx) {
    logger.info('找到 .git 目录。运行 git pull...');
    const pullResult = await execCommand('git pull');
    if (pullResult.includes('Already up to date.')) {
        logger.info('当前存储库已是最新的。');
        msg.sendMsgEx({ content: '当前为最新版本' });
    } else {
        const commits = await execCommand('git log --oneline -n 5');
        logger.info('Git 拉取成功。最新提交：\n' + commits);
        msg.sendMsgEx({ content: '更新完成，重启中...' });
        restartBot(msg);
    }
}

async function initializeProject(msg: IMessageEx) {
    logger.info('未找到 .git 目录。运行 pnpm i 并初始化...');
    await execCommand('pnpm i kazuha-bot --registry=https://registry.npmmirror.com && node node_modules/kazuha-bot/init.js');
    msg.sendMsgEx({ content: '初始化完成，重启中...' });
    restartBot(msg);
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

async function fetchLatestVersion(): Promise<string> {
    const response = await fetch('https://registry.npmmirror.com/kazuha-bot');
    if (!response.ok) throw new Error('无法获取最新版本号');
    const data = await response.json();
    return data['dist-tags'].latest;
}

function execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { encoding: 'utf-8' }, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout.trim());
        });
    });
}

function restartBot(msg: IMessageEx) {
    logger.info('重启前台服务...');
    msg.sendMsgEx({ content: '重启中'})

    // 启动 npm start
    execCommand('npm start')
        .then(() => process.exit(0)) // 退出当前进程
        .catch(error => logger.error('重启 Bot 时出错:', error));
}
