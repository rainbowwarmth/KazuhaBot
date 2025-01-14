import { promises as fs } from 'fs';
import { join } from 'path';
import { IMessageEx } from '@src/lib/core/IMessageEx';
import { restartBot } from '@plugin/other/restart';
import { execCommand } from '@plugin/other/restart'

async function update(msg: IMessageEx) {
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

export { update };