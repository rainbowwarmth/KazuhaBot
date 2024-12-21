import cluster from 'cluster';
import { exec } from 'child_process';
import logger from '@src/lib/logger/logger';
import { IMessageEx } from '@src/lib/core/IMessageEx';

// 执行命令的函数
function execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { encoding: 'utf-8' }, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout.trim());
        });
    });
}

// 使用 cluster 管理 Bot 重启
async function restartBot(msg: IMessageEx) {
    if (cluster.isPrimary) {
        msg.sendMsgEx({ content: `kazuha-bot 正在进行重启`})
        logger.mark(chalk.blueBright('正在进行重启'));
        const worker = cluster.fork();

        worker.on('exit', (code) => {
            if (code !== 0) {
                msg.sendMsgEx({ content: `kazuha-bot 异常退出，退出代码: ${code}. 正在重新启动...`})
                logger.error(`kazuha-bot 异常退出，退出代码: ${code}. 正在重新启动...`);
                cluster.fork(); // 出现错误时，重新 fork 一个新进程
            }
        });
        msg.sendMsgEx({ content: `kazuha-bot 启动成功`})
        logger.mark(chalk.blueBright('kazuha-bot 启动成功'));
    } else {
        msg.sendMsgEx({ content: `kazuha-bot 已启动，运行 kazuha-bot...`})
        logger.mark(chalk.blueBright('kazuha-bot 已启动，运行 kazuha-bot...'));
        execCommand('npm start').catch((error) => {
            logger.error('启动 kazuha-bot 时发生错误:', error);
            process.exit(1); // 退出以便主进程触发重启
        });
    }
}

// 初始启动时确保主进程 fork 一个工作进程
if (cluster.isPrimary) {
    cluster.fork();

    cluster.on('exit', (worker, code) => {
        logger.warn(`kazuha-bot ${worker.process.pid} 已退出，退出码: ${code}`);
        if (code !== 0) {
            logger.mark('kazuha-bot 重启中');
            cluster.fork();
        }
    });
} else {
    execCommand('npm start').catch((error) => {
        logger.error('启动 kazuha-bot 时出错:', error);
        process.exit(1);
    });
}

export { execCommand, restartBot };