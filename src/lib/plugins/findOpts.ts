import { IMessageEx } from "@src/lib/core/IMessageEx";
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import isAdmin from "@src/lib/core/isAdmin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CommandOption {
    reg?: string;
    fnc?: string;
    type?: string[];
    permission?: string;
    describe?: string;
}

interface CommandGroup {
    directory: string;
    [key: string]: CommandOption | string;
}

async function findOpts(msg: IMessageEx): Promise<{ directory: string; file: string; fnc: string; } | null> {
    if (!msg.content) return null;

    const pluginsDir = path.resolve(__dirname, '../../plugins');
    const pluginPaths = await getPluginPaths(pluginsDir);

    for (const plugin of pluginPaths) {
        const configPath = path.resolve(pluginsDir, plugin, 'config', 'command.json');

        try {
            await fs.access(configPath).catch(() => {
                logger.warn(`未找到插件 ${plugin} 的配置文件: ${configPath}`);
                return null;
            });

            const command = JSON.parse(await fs.readFile(configPath, 'utf-8')).command;

            for (const mainKey in command) {
                const group = command[mainKey];
                const groupDir = group.directory;

                for (const key in group) {
                    if (key === "directory") continue;

                    const opt = group[key] as CommandOption;

                    if (opt.type && !opt.type.includes(msg.messageType)) continue;

                    const regex = opt.reg ? new RegExp(opt.reg) : null;
                    if (regex && !regex.test(msg.content)) continue;

                    if (opt.permission !== "anyone" && !(await isAdmin(
                        msg.author.id,
                        msg.messageType === "GUILD" ? msg.member : undefined,
                        msg.messageType === "DIRECT" ? msg.src_guild_id : undefined
                    ))) continue;

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

    return null;
}

async function getPluginPaths(pluginsDir: string) {
    const files = await fs.readdir(pluginsDir);
    const pluginPaths = await Promise.all(files.map(async file => {
        const filePath = path.join(pluginsDir, file);
        return (await fs.stat(filePath)).isDirectory() ? file : null;
    }));
    return pluginPaths.filter(Boolean) as string[];
}

export default findOpts;
