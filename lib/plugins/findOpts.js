// findOpts.js
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import isAdmin from "../../lib/core/isAdmin.js";
import {logger} from '../../lib/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let configCache = null;

async function getPluginPaths(pluginsDir) {
  const files = await fs.readdir(pluginsDir);
  const pluginPaths = await Promise.all(files.map(async (file) => {
    const filePath = path.join(pluginsDir, file);
    return (await fs.stat(filePath)).isDirectory() ? file : null;
  }));
  return pluginPaths.filter(Boolean);
}

export async function preloadConfigs() {
  const pluginsDir = path.resolve(__dirname, '../../plugins');
  const pluginDirs = await getPluginPaths(pluginsDir);
  const cache = [];

  for (const pluginDir of pluginDirs) {
    const configPath = path.resolve(pluginsDir, pluginDir, 'config', 'command.json');
    try {
      // Check if config file exists
      await fs.access(configPath);
      
      // Read and parse config
      const configContent = await fs.readFile(configPath, 'utf-8');
      const commandConfig = JSON.parse(configContent);
      
      // Process commands
      for (const mainKey in commandConfig.command) {
        const group = commandConfig.command[mainKey];
        const groupDir = group.directory;
        
        for (const key in group) {
          if (key === 'directory') continue;
          
          const opt = group[key];
          cache.push({
            directory: groupDir,
            file: mainKey,
            fnc: opt.fnc,
            type: opt.type,
            permission: opt.permission,
            regex: opt.reg ? new RegExp(opt.reg) : null
          });
        }
      }
    } catch (error) {
      logger.error(`[预加载] 插件 ${pluginDir} 加载失败:`, error);
    }
  }
  
  configCache = cache;
  logger.info(`[预加载] 完成加载 ${cache.length} 个命令`);
}

export default async function findOpts(msg) {
  if (!msg.content) return null;
  if (!configCache) {
    logger.error('配置未初始化，请先调用 preloadConfigs');
    return null;
  }

  for (const command of configCache) {
    // 检查消息类型
    if (command.type && !command.type.includes(msg.messageType)) continue;
    
    // 正则匹配
    if (command.regex && !command.regex.test(msg.content)) continue;
    
    // 权限检查
    if (command.permission !== "anyone") {
      const isUserAdmin = await isAdmin(
        msg.author.id,
        msg.messageType === "GUILD" ? msg.member : undefined,
        msg.messageType === "DIRECT" ? msg.src_guild_id : undefined
      );
      if (!isUserAdmin) continue;
    }

    return {
      directory: command.directory,
      file: command.file,
      fnc: command.fnc
    };
  }
  
  return null;
}