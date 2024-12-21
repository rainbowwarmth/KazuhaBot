import chalk from 'chalk';
import logger from './lib/logger/logger.js';
import initGlobals from './lib/core/initGlobals.js';
import { Bot, config } from './lib/config/config.js';
import database from './lib/core/database.js';
import Task from './lib/core/schedule.js';
import { client, ws } from './lib/core/link.js';
import { loadGuildTree } from './lib/core/loadGuildTree.js';
export async function init() {
    logger.mark(`-------(≡^∇^≡)-------`);
    logger.mark(chalk.cyan(Bot.name + ' v' + Bot.version + '启动中...'));
    logger.mark(chalk.greenBright('https://github.com/rainbowwarmth/KazuhaBot_Newmys.git'));
    process.title = 'kazuhaBot' + ' v' + Bot.version + ' © 2023-2024 ' + '@' + Bot.author;
    process.env.TZ = "Asia/Shanghai";
    await initGlobals();
    await Task();
    await database();
    global.chalk = chalk;
    client;
    ws;
    logger.info('初始化：正在创建频道树');
    global.saveGuildsTree = [];
    await loadGuildTree(config.loadGuildTree);
}
