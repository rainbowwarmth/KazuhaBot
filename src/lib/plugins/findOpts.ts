import { IMessageEx } from "@src/lib/core/IMessageEx"; 
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import isAdmin from "@src/lib/core/isAdmin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义插件命令的类型，不包含 directory 字段
interface CommandOption {
    reg?: string;
    fnc?: string;
    type?: string[];
    permission?: string;
    describe?: string;
}

// 定义插件组的类型，包含必需的 directory 字段
interface CommandGroup {
    directory: string; // 每个插件组必须有一个 directory 字段
    [key: string]: CommandOption | string; // 其他字段为命令项或 directory
}

async function findOpts(msg: IMessageEx): Promise<{ directory: string; file: string; fnc: string; } | null> {
    if (!msg.content) return null; // 如果内容为空，返回 null

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
                    if (key === "directory") continue; // 跳过 directory 字段

                    const opt = group[key];

                    // 检查消息类型是否匹配
                    if (opt.type && !opt.type.includes(msg.messageType)) continue;

                    // 检查正则是否匹配消息内容
                    const regex = opt.reg ? new RegExp(opt.reg) : null;
                    if (regex && !regex.test(msg.content)) continue;

                    // 权限检查
                    if (opt.permission !== "anyone") {
                        const isUserAdmin = await isAdmin(
                            msg.author.id,
                            msg.messageType === "GUILD" ? msg.member : undefined,
                            msg.messageType === "DIRECT" ? msg.src_guild_id : undefined
                        );
                        if (!isUserAdmin) continue;
                    }

                    // 返回匹配的命令配置
                    return {
                        directory: groupDir,
                        file: mainKey,
                        fnc: opt.fnc!,
                    };
                }
            }
        } catch (error) {
            logger.error(`加载插件 ${plugin} 的配置时出错:`, error);
        }
    }

    // 如果没有找到匹配的命令，返回 null
    return null;
}

// 获取插件目录路径
async function getPluginPaths(pluginsDir: string) {
    const pluginPaths: string[] = [];
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