import { initialize } from "@src/index";
import logger from "@src/lib/logger/logger";
import { Bot } from "@src/lib/config/config";
import chalk from "chalk";

initialize().then(() => {
    logger.mark(chalk.cyan('kazuhaBot' + ' v' + Bot.version + '启动成功'))
})