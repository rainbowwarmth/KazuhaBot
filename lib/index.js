import { init } from "../lib/config/init.js"
import path from "path"
import { pathToFileURL } from "url"
import { ws } from "../lib/core/link.js"
import logger from "../lib/config/logger.js"
import { IMessageEx } from "../lib/core/IMessageEx.js"
import loadGuildTree from "../lib/core/loadGuildTree.js"
import findOpts from "../lib/plugins/findOpts.js"
import { _path, redis } from "../lib/global/global.js"

/**ws事件监听 */
export async function initialize() {
    await init()
    ws.on('READY', (data) => logger.info('[READY] 事件接收 :', data))
    ws.on('ERROR', (data) => logger.error('[ERROR] 事件接收 :', data))
    ws.on('GUILD_MESSAGES', async (data) => {
        if (data.eventType === "MESSAGE_CREATE") {
            const msg = new IMessageEx(data.msg, "GUILD")
            await execute(msg)
        }
    });
    ws.on("DIRECT_MESSAGE", async (data) => {
        if (data.eventType === 'DIRECT_MESSAGE_CREATE') {
            const msg = new IMessageEx(data.msg, "DIRECT")
            await redis.hSet(`genshin:config:${msg.author.id}`, "guildId", msg.guild_id)
            await execute(msg)
        }
    });
    ws.on("GUILDS", async () => {
        logger.info(`重新加载频道树中`)
        try {
            await loadGuildTree()
            logger.info(`频道树加载完毕`)
        }
        catch (err) {
            logger.error(`频道树加载失败`, err)
        }
    })
}
async function execute(msg) {
    try {
        await redis.set("lastestMsgId", msg.id, { EX: 4 * 60 })
        if (!msg?.content) {
            logger.error('检查消息为空，可能是图片和GIF导致的')
            return
        }
        msg.content = msg.content.trim().replace(/^\//, "#")
        const opt = await findOpts(msg)
        if (!opt || opt.directory === "err")
            return;
        const pluginFilePath = path.join(_path, "plugins", opt.directory, "apps", `${opt.file}.js`)
        const pluginURL = pathToFileURL(pluginFilePath).href
        logger.debug(`插件路径: ${pluginURL}`)
        try {
            const plugin = await import(pluginURL)
            if (typeof plugin[opt.fnc] === "function") {
                await plugin[opt.fnc](msg)
            }
            else {
                logger.error(`未找到函数 ${opt.fnc}() 在 "${pluginURL}"`)
            }
        }
        catch (importErr) {
            logger.error('插件导入失败:', importErr)
        }
    }
    catch (err) {
        logger.error('执行过程中发生错误:', err)
    }
}
