import { Bot, logger } from "#config"
import chalk from "chalk"
import { Bootstrap } from "./lib/bot.js"
import { EventManager } from "./lib/core/event.js"

export class app {
    async app() {
        await new Bootstrap().initialize()
        await new EventManager().initialize()
        logger.mark(chalk.cyan('KazuhaBot' + ' v' + Bot.version + '启动成功'))
    }
}

new app().app()