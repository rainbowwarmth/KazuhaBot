import { logger } from '../config/logger.js'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

const pluginsDir = path.resolve('./plugins')
const pluginDirs = fs.readdirSync(pluginsDir)

let newsTasks = [];
for (const dir of pluginDirs) {
  try {
    const indexPath = path.join(pluginsDir, dir, 'index.js')
    if (process.platform === 'win32' && !indexPath.startsWith('file://')) {
      if (!fs.existsSync(indexPath)) continue
      const moduleUrl = pathToFileURL(indexPath).href
      var pluginModule = await import(moduleUrl)
    } else {
      if (!fs.existsSync(indexPath)) continue;
      var pluginModule = await import(`file://${indexPath}`)
    }

    const PluginClass = pluginModule.default
    if (!PluginClass) {
      logger.warn(`[WARN] 插件 ${dir} 未导出默认类`)
      continue
    }
    
    const instance = new PluginClass();
    if (typeof instance.Tasks !== 'function') {
      logger.warn(`[WARN] 插件 ${dir} 缺少Tasks方法`)
      continue
    }
    
    const tasks = instance.Tasks()
    newsTasks = newsTasks.concat(tasks)
  } catch (e) {
    logger.error(`[ERROR] 加载插件 ${dir} 失败:`, e.message)
  }
}

/**
 * 获取激活的任务列表
 * @returns {ScheduledTask[]}
 */
export function getActiveTasks() {
  return newsTasks.filter(task => task.enabled !== false);
}

// 时区校验增强版
const isChinaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Shanghai'
if (!isChinaTZ) {
  const currentTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
  logger.warn(`⚠️  系统时区 ${currentTZ} 非中国时区，定时任务可能异常`)
}