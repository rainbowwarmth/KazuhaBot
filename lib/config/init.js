import chalk from 'chalk'
import { Temporal } from '@js-temporal/polyfill'
import {logger} from '../../lib/config/logger.js'
import initGlobals from '../../lib/plugins/initGlobals.js'
import { Bot } from '../../lib/config/config.js'
import database from '../../lib/config/redis.js'
import { initScheduler } from '../core/scheduler.js'
import loadGuildTree from '../core/loadGuildTree.js'
import {browserManager} from '../render/browser-manager.js'

global.chalk = chalk
global.logger = logger
global.saveGuildsTree = []

export class Bootstrap {
    constructor() {
      this.startTime = Temporal.Now.instant()
    }
  
    async initialize() {
      try {
        this.printBanner()
        await this.setupRuntime()
        await this.initCoreSystems()
        await browserManager.renderinit()
        logger.mark('✅ 系统初始化完成')
      } catch (error) {
        logger.error(`❌ 启动失败: ${error.stack}`)
        process.exit(1)
      }
    }
  
    printBanner() {
      logger.mark(chalk.cyan(`${'≡^∇^≡'.padEnd(35)}`))
      logger.mark(chalk.cyan.bold(`KazuhaBot v${Bot.version}`))
      process.title = `KazuhaBot v${Bot.version} © 2024 - 2025 ${Bot.author}`
    }
  
    async setupRuntime() {
      process.env.TZ = 'Asia/Shanghai'
      Temporal.TimeZone.from('Asia/Shanghai')
      logger.debug('⏲  时区设置为中国标准时间')
    }
  
    async initCoreSystems() {
      const initSteps = [
        { task: initGlobals, name: '插件系统' },
        { task: database, name: '数据存储' },
        { task: loadGuildTree, name: '频道架构', args: [true] },
        { task: initScheduler, name: '定时任务' }
      ]
  
      for (const { task, name, args = [] } of initSteps) {
        logger.info(`🛠  正在初始化 ${name}...`)
        await task(...args)
      }
    }
  }