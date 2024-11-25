import { isAdmin } from "@src/plugins/other/admin";
import { IMessageEx } from "@src/lib/IMessageEx";
import path from 'path';
import fs from 'fs/promises';
import logger from "@src/lib/logger";
import { fileURLToPath } from 'url';

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

export async function findOpts(msg: IMessageEx): Promise<{ directory: string; file: string; fnc: string; } | null> {
    if (!msg.content) return null; // If content is empty, return null

    const pluginsDir = path.resolve(__dirname, '../plugins');
    const pluginPaths = (await fs.readdir(pluginsDir)).filter(async (file) => {
        const filePath = path.join(pluginsDir, file);
        return (await fs.stat(filePath)).isDirectory();
    });

    for (const plugin of pluginPaths) {
        // Determine the config file path based on the plugin name
        const configPath = ['other', 'system', 'example'].includes(plugin)
            ? path.resolve(__dirname, `../config/command/${plugin}.json`)
            : path.resolve(pluginsDir, plugin, 'config', 'command.json');

        try {
            // Check if the config file exists
            try {
                await fs.access(configPath);
            } catch {
                logger.warn(`未找到插件 ${plugin} 的配置文件: ${configPath}`);
                continue;
            }

            // Read and parse the JSON file manually
            const configContent = await fs.readFile(configPath, 'utf-8');
            const fnc = JSON.parse(configContent);
            const command = fnc.command;

            // Iterate over plugin command configurations
            for (const mainKey in command) {
                const group = command[mainKey];
                const groupDir = group.directory; // Use the directory field from the plugin group
                for (const key in group) {
                    if (key === "directory") continue; // Skip directory field
                    const opt = group[key];

                    // Check if the message type matches
                    if (!opt.type?.includes(msg.messageType)) continue;

                    // Check if the regex matches the message content
                    const regex = opt.reg ? new RegExp(opt.reg) : null;
                    if (!regex || !regex.test(msg.content)) continue;

                    // Permission check
                    if (opt.permission !== "anyone") {
                        const isUserAdmin = await isAdmin(
                            msg.author.id,
                            msg.messageType === "GUILD" ? msg.member : undefined,
                            msg.messageType === "DIRECT" ? msg.src_guild_id : undefined
                        );
                        if (!isUserAdmin) continue;
                    }

                    // Return the matching command configuration
                    return {
                        directory: groupDir,
                        file: mainKey,
                        fnc: opt.fnc,
                    };
                }
            }
        } catch (error) {
            logger.error(`加载插件 ${plugin} 的配置时出错:`, error);
        }
    }

    // Return null if no match is found
    return null;
}
