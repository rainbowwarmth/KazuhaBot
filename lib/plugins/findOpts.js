import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import logger from '../../lib/logger/logger.js';
import isAdmin from '../../lib/core/isAdmin.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function findOpts(msg) {
    if (!msg.content)
        return null; // 如果内容为空，返回 null
    const pluginsDir = path.resolve(__dirname, '../../plugins');
    const pluginPaths = await getPluginPaths(pluginsDir); // 获取插件路径
    for (const plugin of pluginPaths) {
        const configPath = path.resolve(pluginsDir, plugin, 'config', 'command.json'); // 直接使用 plugins 目录下的命令配置文件路径
        try {
            // 检查配置文件是否存在
            await fs.access(configPath).catch(() => {
                logger.warn(`未找到插件 ${plugin} 的配置文件: ${configPath}`);
                return null;
            });
            // 读取并解析配置文件
            const configContent = await fs.readFile(configPath, 'utf-8');
            const fnc = JSON.parse(configContent);
            const command = fnc.command;
            // 遍历插件命令配置
            for (const mainKey in command) {
                const group = command[mainKey];
                const groupDir = group.directory; // 使用插件组中的 directory 字段
                for (const key in group) {
                    if (key === "directory")
                        continue; // 跳过 directory 字段
                    const opt = group[key];
                    // 检查消息类型是否匹配
                    if (opt.type && !opt.type.includes(msg.messageType))
                        continue;
                    // 检查正则是否匹配消息内容
                    const regex = opt.reg ? new RegExp(opt.reg) : null;
                    if (regex && !regex.test(msg.content))
                        continue;
                    // 权限检查
                    if (opt.permission !== "anyone") {
                        const isUserAdmin = await isAdmin(msg.author.id, msg.messageType === "GUILD" ? msg.member : undefined, msg.messageType === "DIRECT" ? msg.src_guild_id : undefined);
                        if (!isUserAdmin)
                            continue;
                    }
                    // 返回匹配的命令配置
                    return {
                        directory: groupDir,
                        file: mainKey,
                        fnc: opt.fnc,
                    };
                }
            }
        }
        catch (error) {
            logger.error(`加载插件 ${plugin} 的配置时出错:`, error);
        }
    }
    // 如果没有找到匹配的命令，返回 null
    return null;
}
// 获取插件目录路径
async function getPluginPaths(pluginsDir) {
    const pluginPaths = [];
    const files = await fs.readdir(pluginsDir);
    for (const file of files) {
        const filePath = path.join(pluginsDir, file);
        if ((await fs.stat(filePath)).isDirectory()) {
            pluginPaths.push(file);
        }
    }
    return pluginPaths;
}
export default findOpts;
