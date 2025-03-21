import { client } from "./init.js"
import { getActiveTasks } from "./task.js"
import schedule from 'node-schedule'
import { redis, _path, adminId} from '../global/global.js'
import findOpts from "../plugin/findOpts.js"
import path from 'path'
import { pathToFileURL } from 'node:url'

const taskRegistry = new Map()
export class loader {
    async loadGuildTree(init = false) {
        global.saveGuildsTree = []
        for (const guild of (await client.meApi.meGuilds()).data) {
            if (init)
                logger.info(`${guild.name}(${guild.id})`)
            const _guild = []
            for (const channel of (await client.channelApi.channels(guild.id)).data) {
                if (init)
                    logger.info(`${guild.name}(${guild.id})-${channel.name}(${channel.id})-father:${channel.parent_id}`)
                _guild.push({ name: channel.name, id: channel.id })
            }
            global.saveGuildsTree.push({ name: guild.name, id: guild.id, channel: _guild })
        }
    }
    
    async isAdmin(uid, iMember, srcGuild) {
        if (adminId.includes(uid))
            return true
        if (srcGuild) {
            iMember = await client.guildApi.guildMember(srcGuild, uid).then(d => {
                return d.data
            }).catch(err => {
                logger.error(err)
                return undefined
            });
        }
        if (iMember && (iMember.roles.includes("2") || iMember.roles.includes("4")))
            return true
        return await redis.hGet("auth", uid).then(auth => {
            if (auth == "admin")
                return true
            return false
        })
    }
    async initScheduler() {
        const activeTasks = getActiveTasks()
        await Promise.all(
          activeTasks.map(task => 
            this.registerTask(task).catch(error => 
              logger.error(`任务 ${task.name} 注册失败:`, error)
            )
          )
        )
    }
    async registerTask(task) {
        return new Promise((resolve, reject) => {
          try {
            const job = schedule.scheduleJob(task.cron, async () => {
              try {
                logger.debug(`⏰ 开始执行任务: ${task.name}`)
                await task.job()
                logger.debug(`✅ 任务完成: ${task.name}`)
              } catch (error) {
                logger.error(`❌ 任务失败 ${task.name}:`, error.stack)
              }
            })
            
            taskRegistry.set(task.name, job)
            logger.mark(`⏲ 已注册定时任务: ${task.name} (${task.cron})`)
            resolve(job)
          } catch (error) {
            reject(error)
          }
        })
    }
      
      /**
       * 获取任务执行状态
       * @returns {Array<{name: string, nextRun: Date}>}
       */
    getSchedulerStatus() {
        return Array.from(taskRegistry.entries()).map(([name, job]) => ({
          name,
          nextRun: job.nextInvocation(),
          state: job.pendingInvocations.length > 0 ? 'active' : 'idle'
        }))
      }
      
      /**
       * 手动触发任务执行
       * @param {string} taskName 
       */
    async triggerTask(taskName) {
        const job = taskRegistry.get(taskName)
        if (!job) throw new Error('任务不存在')
        
        try {
          await job.invoke()
          return { success: true, message: `手动触发任务成功: ${taskName}` }
        } catch (error) {
          logger.error(`手动触发任务失败: ${taskName}`, error)
          return { success: false, message: error.message }
        }
    }

    async execute(msg) {
        try {
          await redis.set("lastestMsgId", msg.id, { EX: 4 * 60 });
          
          if (!msg?.content) {
            logger.debug('检查消息为空，可能是图片和GIF导致的');
            return;
          }
          
          msg.content = msg.content.trim().replace(/^\//, "#");
          const opt = await findOpts(msg);
          
          if (!opt || opt.directory === "err") return;
      
          const pluginFilePath = path.join(_path, "plugins", opt.directory, "apps", `${opt.file}.js`);
          const pluginURL = pathToFileURL(pluginFilePath).href;
          
          logger.debug(`插件路径: ${pluginURL}`);
          
          try {
            const plugin = await import(pluginURL);
            if (typeof plugin[opt.fnc] === "function") {
              await plugin[opt.fnc](msg);
            } else {
              logger.error(`未找到函数 ${opt.fnc}() 在 "${pluginURL}"`);
            }
          } catch (importErr) {
            logger.error('插件导入失败:', importErr);
          }
        } catch (err) {
          logger.error('执行过程中发生错误:', err);
        }
    }
}