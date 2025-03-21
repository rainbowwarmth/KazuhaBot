import chalk from 'chalk'
import {logger} from './config/logger.js'
import { initGlobals } from './plugin/initGlobals.js'
import { Bot, config } from './config/config.js'
import database from './config/redis.js'
import { loader } from './core/loader.js'
import { browserManager } from './render/browser-manager.js'
import { preloadConfigs } from './plugin/findOpts.js'
import { PluginCache } from './plugin/PluginCache.js'
import { pathToFileURL } from 'url'
import path from 'path'

global._path = process.cwd()
global.chalk = chalk
global.logger = logger
global.saveGuildsTree = []

export class Bootstrap {
    constructor() {
      this.pluginCache = new PluginCache()
    }
  
    async initialize() {
      try {
        this.printBanner()
        await this.setupRuntime()
        await this.initCoreSystems()
        await preloadConfigs()
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
      logger.debug('⏲  时区设置为中国标准时间')
    }
  
    async initCoreSystems() {
      const initSteps = [
        { task: async () => new initGlobals().initGlobals(), name: '插件系统' },
        { task: database, name: '数据存储' },
        { task: async () => new loader().loadGuildTree(), name: '频道架构', args: [config.loadGuild] },
        { task: async () => new loader().initScheduler(), name: '定时任务' },
        { task: this.preloadEssentials.bind(this), name: '核心插件预加载' }
      ]
  
      for (const { task, name, args = [] } of initSteps) {
        logger.info(`🛠  正在初始化 ${name}...`)
        await task(...args)
      }
    }

    async preloadEssentials() {
      const corePlugins = [
        'mihoyo/apps/mysNew.js',
      ]

      await Promise.all(corePlugins.map(async pluginPath => {
        const pluginURL = pathToFileURL(path.join(_path, 'plugins', pluginPath)).href
        await this.pluginCache.preload(pluginURL)
      }))}
    }