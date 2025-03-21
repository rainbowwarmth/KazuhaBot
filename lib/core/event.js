import { ws } from './init.js'
import { logger } from '../config/logger.js'
import { IMessageEx } from './message.js'
import { redis, _path } from '../global/global.js'
import { loader } from './loader.js'

export class EventManager {
    constructor(pluginCache) {
      this.messageQueue = new Map()
      this.pluginCache = pluginCache
      this.metricTimer = null
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
              await new loader().execute(msg)
          }
      });
      ws.on("DIRECT_MESSAGE", async (data) => {
          if (data.eventType === 'DIRECT_MESSAGE_CREATE') {
              const msg = new IMessageEx(data.msg, "DIRECT")
              await redis.hSet(`genshin:config:${msg.author.id}`, "guildId", msg.guild_id)
              await new loader().execute(msg)
          }
      });
      ws.on("GUILDS", async () => {
          logger.info(`重新加载频道树中`)
          try {
              await new loader().loadGuildTree()
              logger.info(`频道树加载完毕`)
          }
          catch (err) {
              logger.error(`频道树加载失败`, err)
          }
      })
    }
}