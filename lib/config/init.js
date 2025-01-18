import chalk from 'chalk'
import schedule from 'node-schedule'
import logger from '../../lib/config/logger.js'
import initGlobals from '../../lib/plugins/initGlobals.js'
import { Bot, config } from '../../lib/config/config.js'
import { bbbtaskPushNews, bbtaskPushNews, dbytaskPushNews, srtaskPushNews, wdtaskPushNews, ystaskPushNews, zzztaskPushNews } from '../../plugins/mihoyo/apps/mysNew.js'
import { client, ws } from '../../lib/core/link.js'
import loadGuildTree from '../../lib/core/loadGuildTree.js'
import database from '../../lib/config/redis.js'
import renderinit from '../render/init.js'

export async function init() {
    logger.mark(`-------(≡^∇^≡)-------`)
    logger.mark(chalk.cyan('KazuhaBot' + ' v' + Bot.version + '启动中...'))
    logger.mark(chalk.greenBright('https://github.com/rainbowwarmth/KazuhaBot_Newmys.git'))
    process.title = 'KazuhaBot' + ' v' + Bot.version + ' © 2023-2025 ' + '@' + Bot.author
    process.env.TZ = "Asia/Shanghai"
    logger.info('初始化：正在创建定时任务');

    ////崩坏2公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => bbtaskPushNews())
    ////崩坏3公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => bbbtaskPushNews())
    ////原神公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => ystaskPushNews())
    ////星铁公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => srtaskPushNews())
    ////未定公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => wdtaskPushNews())
    ////绝区零公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => zzztaskPushNews())
    ////大别野公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => dbytaskPushNews())
    
    await initGlobals()
    await renderinit()
    await database()
    global.chalk = chalk
    global.logger = logger
    client
    ws
    logger.info('初始化：正在创建频道树')
    global.saveGuildsTree = []
    await loadGuildTree(config.loadGuildTree)
}
