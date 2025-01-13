import { initialize } from "./lib/index.js";
import logger from "./lib/config/logger.js";
import { Bot } from "./lib/config/config.js";
import chalk from "chalk";
initialize().then(() => {
    logger.mark(chalk.cyan('kazuhaBot' + ' v' + Bot.version + '启动成功'));
});
