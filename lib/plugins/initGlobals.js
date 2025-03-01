// pluginLoader.js
import fs from 'fs/promises';
import path from 'path';
import { _path } from '../global/global.js';
import { logger } from '../config/logger.js';

const PLUGIN_DIR = path.join(_path, 'plugins');
const CONFIG_DIR = path.join(_path, 'config/command');
const configCache = new Map();

async function checkFolderExistence(folderName, basePath) {
  try {
    const fullPath = path.join(basePath, folderName);
    await fs.access(fullPath);
    const stats = await fs.stat(fullPath);
    return stats.isDirectory();
  } catch (error) {
    logger.debug(`⏩ 跳过不存在的目录: ${folderName}`);
    return false;
  }
}


async function getValidFolders(basePath) {
  try {
    const entries = await fs.readdir(basePath);
    const validEntries = await Promise.all(
      entries.map(async entry => {
        try {
          const fullPath = path.join(basePath, entry);
          const stats = await fs.stat(fullPath);
          return stats.isDirectory() ? entry : null;
        } catch (error) {
          logger.warn(`⚠️ 无效目录条目: ${entry}`, error);
          return null;
        }
      })
    );
    return validEntries.filter(entry => {
      const isValid = typeof entry === 'string' && entry.length > 0;
      if (!isValid) logger.warn(`🚫 过滤无效目录: ${entry}`);
      return isValid;
    });
  } catch (error) {
    logger.error('目录扫描失败:', error);
    return [];
  }
}

// 配置加载函数
async function loadConfig(name, basePath = PLUGIN_DIR) {
  if (typeof name !== 'string') {
    logger.error(`🚨 配置名称类型错误: ${typeof name} (${JSON.stringify(name)})`);
    return;
  }

  if (name.includes('..') || name.includes('/')) {
    logger.error(`🚨 非法路径参数: ${name}`);
    return;
  }

  const configPath = path.join(basePath, name, 'config', 'command.json');
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    configCache.set(configPath, JSON.parse(content));
    logger.mark(`✅ 加载配置: ${path.relative(_path, configPath)}`);
  } catch (error) {
    logger.error(`配置加载失败: ${configPath}`, error);
  }
}

// 配置文件监听函数
async function watchConfigs(names, basePath) {
  for (const name of names) {
    if (typeof name !== 'string' || name.includes('..')) {
      logger.error(`🚨 非法监听名称: ${name}`);
      continue;
    }

    const configPath = path.join(basePath, name, 'config', 'command.json');
    try {
      await fs.access(configPath);
      const watcher = fs.watch(configPath, { persistent: false });
      logger.debug(`👂 开始监听配置: ${path.relative(_path, configPath)}`);

      (async () => {
        try {
          for await (const event of watcher) {
            if (event.eventType === 'change') {
              logger.mark(`🔄 检测到配置更新: ${path.relative(_path, configPath)}`);
              await loadConfig(name, basePath);
            }
          }
        } catch (error) {
          logger.error(`监听中断: ${configPath}`, error);
        }
      })();
    } catch (error) {
      logger.error(`📛 监听初始化失败: ${configPath}`, error);
    }
  }
}

// 主初始化函数
export async function initGlobals() {
  try {
    // 获取存在的插件目录
    const pluginFolders = (await getValidFolders(PLUGIN_DIR)).filter(Boolean);

    // 动态检查系统配置目录存在性
    const requiredFolders = ['other', 'system', 'example'];
    const existingConfigFolders = await Promise.all(
      requiredFolders.map(async folder => {
        const exists = await checkFolderExistence(folder, CONFIG_DIR);
        return exists ? folder : null;
      })
    ).then(results => results.filter(Boolean));

    // 预加载配置
    await Promise.all([
      ...pluginFolders.map(name => {
        if (typeof name !== 'string') {
          logger.error(`🚨 插件目录名无效: ${typeof name} (${name})`);
          return Promise.resolve();
        }
        return loadConfig(name);
      }),
      ...existingConfigFolders.map(folder => loadConfig(folder, CONFIG_DIR))
    ]);

    // 启动监听
    await Promise.all([
      watchConfigs(pluginFolders, PLUGIN_DIR).catch(e => 
        logger.error('插件监听失败:', e)
      ),
      watchConfigs(existingConfigFolders, CONFIG_DIR).catch(e => 
        logger.error('配置监听失败:', e)
      )
    ]);
    
    logger.mark(`⚡ 完成初始化，加载 ${configCache.size} 个配置`);
  } catch (error) {
    logger.error('🔥 初始化失败:', error);
    process.exit(1);
  }
}

// 配置获取接口
export function getConfig(configPath) {
  const resolvedPath = path.resolve(configPath);
  return configCache.get(resolvedPath) || {};
}

export default {
  initGlobals,
  getConfig
};