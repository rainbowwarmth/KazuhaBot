import { initialize } from './index.js';
import logger from './lib/logger/logger.js';
import { Bot } from './lib/config/config.js';
import chalk from "chalk";
initialize().then(() => {
    logger.mark(chalk.cyan('kazuhaBot' + ' v' + Bot.version + '启动成功'));
});
