import path from 'path'
import fs from 'fs/promises'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'url'
import { logger } from '../config/logger.js'
import { loader } from '../core/loader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let commandCache = new Map();
let lastReloadTime = 0

async function getPluginPaths(pluginsDir) {
  try {
    const entries = await fs.readdir(pluginsDir, { withFileTypes: true })
    return entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
  } catch (error) {
    logger.error('[目录扫描] 插件目录读取失败:', error)
    return []
  }
}

const withErrorHandling = (fn) => async (...args) => {
  try {
    return await fn(...args)
  } catch (error) {
    logger.error(`[运行时异常] ${fn.name}:`, error)
    return null
  }
};

async function _preloadConfigs() {
  const startTime = performance.now()
  const pluginsDir = path.resolve(__dirname, '../../plugins')
  
  const pluginDirs = await getPluginPaths(pluginsDir)
  const configPromises = pluginDirs.map(async pluginDir => {
    const configPath = path.resolve(pluginsDir, pluginDir, 'config', 'command.json')
    
    try {
      const configContent = await fs.readFile(configPath, 'utf-8')
      const commandConfig = JSON.parse(configContent)
      return { pluginDir, commandConfig }
    } catch (error) {
      logger.warn(`[配置加载] 插件 ${pluginDir} 跳过: ${error.message}`)
      return null
    }
  });

  const tempCache = new Map();
  const configResults = (await Promise.all(configPromises)).filter(Boolean)

  for (const { pluginDir, commandConfig } of configResults) {
    for (const [mainKey, group] of Object.entries(commandConfig.command)) {
      const { directory: groupDir, ...commands } = group
      
      for (const [key, opt] of Object.entries(commands)) {
        const commandTypes = opt.type || ['default']
        const compiledRegex = opt.reg ? new RegExp(opt.reg) : null
        const commandEntry = {
          directory: groupDir,
          file: mainKey,
          fnc: opt.fnc,
          permission: opt.permission,
          regex: compiledRegex
        }

        commandTypes.forEach(t => {
          if (!tempCache.has(t)) tempCache.set(t, [])
          tempCache.get(t).push(commandEntry)
        })
      }
    }
  }

  commandCache = tempCache
  lastReloadTime = Date.now()
  
  const loadTime = performance.now() - startTime
  logger.info(`[预加载] 完成 ${pluginDirs.length} 插件加载，耗时 ${loadTime.toFixed(2)}ms`)
  return true
}

export const preloadConfigs = withErrorHandling(_preloadConfigs)

export default withErrorHandling(async function findOpts(msg) {
  if (!msg.content || !commandCache.size) return null
  
  const relevantTypes = [
    msg.messageType,
    'default'
  ]

  for (const type of relevantTypes) {
    const candidates = commandCache.get(type) || []
    
    for (const command of candidates) {
      if (command.regex && !command.regex.test(msg.content)) continue
      
      if (command.permission !== "anyone") {
        const isAdmin = await new loader().isAdmin(
          msg.author.id,
          msg.messageType === "GUILD" ? msg.member : undefined,
          msg.messageType === "DIRECT" ? msg.src_guild_id : undefined
        )
        if (!isAdmin) continue
      }

      return {
        directory: command.directory,
        file: command.file,
        fnc: command.fnc
      }
    }
  }
  
  return null
})