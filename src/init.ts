import chalk from 'chalk';
import logger from '@src/lib/logger/logger';
import initGlobals from '@src/lib/core/initGlobals';
import { Bot, config } from '@src/lib/config/config';
import database from '@src/lib/core/database';
import Task from '@src/lib/core/schedule';
import { client, ws } from '@src/lib/core/link';
import loadGuildTree from '@src/lib/core/loadGuildTree';

export async function init() {
    logger.mark(`-------(≡^∇^≡)-------`);
    logger.mark(chalk.cyan(Bot.name + ' v' + Bot.version + '启动中...'))
    logger.mark(chalk.greenBright('https://github.com/rainbowwarmth/KazuhaBot_Newmys.git'))
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