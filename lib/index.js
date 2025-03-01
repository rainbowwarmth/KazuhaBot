import { Bootstrap } from "../lib/config/init.js"
import { _path } from "../lib/global/global.js"
import { EventManager } from "./core/eventManager.js"

export async function initialize() {
    // 初始化核心系统
    const bot = new Bootstrap()
    await bot.initialize()
    // 启动事件监听系统
    const eventManager = new EventManager()
    await eventManager.initialize()
}