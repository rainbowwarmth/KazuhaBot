import { Bootstrap } from "./bot.js"
import { _path } from "./global/global.js"
import { EventManager } from "./core/event.js"

export async function initialize() {
    // 初始化核心系统
    const bot = new Bootstrap()
    await bot.initialize()
    // 启动事件监听系统
    const eventManager = new EventManager(bot.pluginCache)
    await eventManager.initialize()
}