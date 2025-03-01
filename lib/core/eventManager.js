// lib/core/eventManager.js
import path from 'path'
import { pathToFileURL } from 'url'
import { ws } from './link.js'
import { logger } from '../config/logger.js'
import { IMessageEx } from './IMessageEx.js'
import { redis, _path } from '../global/global.js'
import findOpts from '../plugins/findOpts.js'
import loadGuildTree from './loadGuildTree.js'

export class EventManager {
  constructor() {
    this.messageQueue = new Map()
  }

  async initialize() {
    this.setupWSListeners()
    logger.mark('🎧 事件监听系统就绪')
  }

  setupWSListeners() {
    ws.on('READY', (data) => logger.info('[READY] 事件接收 :', data))
    ws.on('ERROR', (data) => logger.debug('[ERROR] 事件接收 :', data))
    ws.on('GUILD_MESSAGES', async (data) => {
        if (data.eventType === "MESSAGE_CREATE") {
            const msg = new IMessageEx(data.msg, "GUILD")
            await this.execute(msg)
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
  
  async execute(msg) {
   try {
        await redis.set("lastestMsgId", msg.id, { EX: 4 * 60 })
        if (!msg?.content) {
            logger.debug('检查消息为空，可能是图片和GIF导致的')
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
}