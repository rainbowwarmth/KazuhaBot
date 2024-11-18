import { isAdmin } from "../plugins/other/admin";
import { IMessageEx } from "./IMessageEx";
import path from 'path';
import fs from 'fs';
import logger from "./logger";

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
    if (!msg.content) return null; // 如果内容为空，返回 null

    const pluginsDir = path.resolve(__dirname, '../plugins');
    const pluginPaths = fs.readdirSync(pluginsDir).filter((file) => {
        const filePath = path.join(pluginsDir, file);
        return fs.statSync(filePath).isDirectory();
    });

    for (const plugin of pluginPaths) {
        // 根据插件名称确定配置文件路径
        const configPath = ['other', 'system', 'example'].includes(plugin)
            ? path.resolve(__dirname, `../config/command/${plugin}.json`)
            : path.resolve(pluginsDir, plugin, 'config', 'command.json');
        
        try {
            // 检查配置文件是否存在
            if (!fs.existsSync(configPath)) {
                logger.warn(`未找到插件 ${plugin} 的配置文件: ${configPath}`);
                continue;
            }

            // 动态导入配置文件
            const fnc = await import(configPath);
            const command: { [mainKey: string]: CommandGroup } = fnc.command;

            // 遍历插件命令配置
            for (const mainKey in command) {
                const group = command[mainKey];
                const groupDir = group.directory; // 使用插件组的 directory 字段

                for (const key in group) {
                    if (key === "directory") continue; // 跳过 directory 字段
                    const opt = group[key] as CommandOption;

                    // 检查消息类型是否匹配
                    if (!opt.type?.includes(msg.messageType)) continue;

                    // 检查正则表达式是否匹配消息内容
                    const regex = opt.reg ? new RegExp(opt.reg) : null;
                    if (!regex || !regex.test(msg.content)) continue;

                    // 权限检查
                    if (opt.permission !== "anyone") {
                        const isUserAdmin = await isAdmin(
                            msg.author.id,
                            msg.messageType === "GUILD" ? msg.member : undefined,
                            msg.messageType === "DIRECT" ? msg.src_guild_id : undefined
                        );
                        if (!isUserAdmin) continue;
                    }

                    // 返回匹配的指令配置
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

    // 如果没有匹配项，返回 null
    return null;
}
