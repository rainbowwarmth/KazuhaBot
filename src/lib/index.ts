import { init } from "@src/lib/config/init";
import path from "path";
import { pathToFileURL } from "url";
import { ws } from "@src/lib/core/link";
import logger from "@src/lib/config/logger";
import { IntentMessage } from "@src/lib/core/type";
import { IMessageEx } from "@src/lib/core/IMessageEx";
import loadGuildTree from "@src/lib/core/loadGuildTree";
import findOpts from "@src/lib/plugins/findOpts";
import { _path, redis } from "@src/lib/global/global";

export async function initialize(){
    init().then(() => {

        ws.on('READY', (data: any) =>{
            logger.info('[READY] 事件接收 :', data)
        });
        ws.on('ERROR', (data: any) => {
            logger.error('[ERROR] 事件接收 :', data);
          });
        ws.on('GUILD_MESSAGES', async (data: IntentMessage) => {
            if (data.eventType != "MESSAGE_CREATE") return;
            const msg = new IMessageEx(data.msg, "GUILD");
            execute(msg);
    
        });
    
        ws.on("DIRECT_MESSAGE", async (data: IntentMessage) => {
            if (data.eventType != 'DIRECT_MESSAGE_CREATE') return;
            const msg = new IMessageEx(data.msg, "DIRECT");
            redis.hSet(`genshin:config:${msg.author.id}`, "guildId", msg.guild_id);
            execute(msg);
        });
    
    
        ws.on("GUILDS", () => {
            logger.info(`重新加载频道树中`);
            loadGuildTree().then(() => {
                logger.info(`频道树加载完毕`);
            }).catch((err: any) => {
                logger.error(`频道树加载失败`, err);
            });
        });
    });
}

async function execute(msg: IMessageEx) {  
    try {
        redis.set("lastestMsgId", msg.id, { EX: 4 * 60 });

        if (msg && msg.content) {
            msg.content = msg.content.trim().replace(/^\//, "#");
        } else {
            logger.error('检查消息为空，可能是图片和GIF导致的');
            return;
        }

        const opt = await findOpts(msg);
        if (!opt || opt.directory === "err") {
            return;
        }

        const isSpecialDir = ["system", "example", "other"].includes(opt.directory);
        const pluginFilePath = isSpecialDir
            ? path.join(_path, "plugins", opt.directory, `${opt.file}.js`)
            : path.join(_path, "plugins", opt.directory, "apps", `${opt.file}.js`);

        const pluginURL = pathToFileURL(pluginFilePath).href; // Convert file path to file:// URL
        logger.debug(`插件路径: ${pluginURL}`);

        try {
            const plugin = await import(pluginURL);
            if (typeof plugin[opt.fnc] === "function") {
                return plugin[opt.fnc](msg).catch((err: any) => {
                    logger.error('插件函数执行时发生错误:', err);
                });
            } else {
                logger.error(`未找到函数 ${opt.fnc}() 在 "${pluginURL}"`);
            }
        } catch (importErr) {
            logger.error('插件导入失败:', importErr);
        }
    } catch (err) {
        logger.error('执行过程中发生错误:', err);
    }
}


type PluginFnc = (msg: IMessageEx) => Promise<any>
