import { initialize } from "./lib/index.js"
import { Bot, logger } from "#config"
import chalk from "chalk"
initialize().then(() => {
    logger.mark(chalk.cyan('KazuhaBot' + ' v' + Bot.version + '启动成功'))
})
