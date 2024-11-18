"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCommand = execCommand;
exports.restartBot = restartBot;
const cluster_1 = __importDefault(require("cluster"));
const child_process_1 = require("child_process");
const logger_1 = __importDefault(require("../../lib/logger"));
const kazuha_1 = __importDefault(require("../../kazuha"));
// 执行命令的函数
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
// 使用 cluster 管理 Bot 重启
async function restartBot(msg) {
    if (cluster_1.default.isPrimary) {
        msg.sendMsgEx({ content: `kazuha-bot 正在进行重启` });
        logger_1.default.mark(kazuha_1.default.chalk.blueBright('正在进行重启'));
        const worker = cluster_1.default.fork();
        worker.on('exit', (code) => {
            if (code !== 0) {
                msg.sendMsgEx({ content: `kazuha-bot 异常退出，退出代码: ${code}. 正在重新启动...` });
                logger_1.default.error(`kazuha-bot 异常退出，退出代码: ${code}. 正在重新启动...`);
                cluster_1.default.fork(); // 出现错误时，重新 fork 一个新进程
            }
        });
        msg.sendMsgEx({ content: `kazuha-bot 启动成功` });
        logger_1.default.mark(kazuha_1.default.chalk.blueBright('kazuha-bot 启动成功'));
    }
    else {
        msg.sendMsgEx({ content: `kazuha-bot 已启动，运行 kazuha-bot...` });
        logger_1.default.mark(kazuha_1.default.chalk.blueBright('kazuha-bot 已启动，运行 kazuha-bot...'));
        execCommand('npm start').catch((error) => {
            logger_1.default.error('启动 kazuha-bot 时发生错误:', error);
            process.exit(1); // 退出以便主进程触发重启
        });
    }
}
// 初始启动时确保主进程 fork 一个工作进程
if (cluster_1.default.isPrimary) {
    cluster_1.default.fork();
    cluster_1.default.on('exit', (worker, code) => {
        logger_1.default.warn(`kazuha-bot ${worker.process.pid} 已退出，退出码: ${code}`);
        if (code !== 0) {
            logger_1.default.mark('kazuha-bot 重启中');
            cluster_1.default.fork();
        }
    });
}
else {
    execCommand('npm start').catch((error) => {
        logger_1.default.error('启动 kazuha-bot 时出错:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=restart.js.map