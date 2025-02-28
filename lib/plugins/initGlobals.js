// pluginLoader.js
import fs from 'fs/promises'
import path from 'path'
import { _path } from '../global/global.js'
import { logger } from '../config/logger.js'

const PLUGIN_DIR = path.join(_path, 'plugins')
const CONFIG_DIR = path.join(_path, 'config/command')

export async function initGlobals() {
  const pluginFolders = await getValidFolders(PLUGIN_DIR)
  const configFolders = ['other', 'system', 'example']

  await Promise.all([
    watchConfigs(pluginFolders, PLUGIN_DIR),
    watchConfigs(configFolders, CONFIG_DIR)
  ])
}

async function getValidFolders(basePath) {
  try {
    const entries = await fs.readdir(basePath)
    return entries.filter(async entry => {
      const stats = await fs.stat(path.join(basePath, entry))
      return stats.isDirectory()
    })
  } catch (error) {
    logger.error('目录扫描失败:', error)
    return []
  }
}

async function watchConfigs(names, basePath) {
  names.forEach(async name => {
    const configPath = path.join(basePath, name, 'config','command.json')
    try {
      const watcher = fs.watch(configPath)
      for await (const event of watcher) {
        logger.mark(`🔄 配置更新: ${path.relative(_path, configPath)}`)
        await reloadConfig(configPath)
      }
    } catch (error) {
      logger.warn(`⚠️ 监听失败: ${configPath}`, error)
    }
  })
}

async function reloadConfig(configPath) {
  try {
    delete require.cache[require.resolve(configPath)]
    return require(configPath)
  } catch (error) {
    logger.error(`配置重载失败: ${configPath}`, error)
  }
}
export default initGlobals
