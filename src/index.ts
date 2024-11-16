import { init } from "./init"
import { loadGuildTree } from "./lib/Bot"
import kazuha from "./kazuha";
import { IMessageEx } from "./lib/IMessageEx";
import { ws, redis, _path } from "./lib/global"; 
import { IntentMessage } from "./lib/type";
import logger from "./lib/logger";
import path from "path";

export async function initialize(){
    init().then(() => {

        ws.on('READY', (data: any) =>{
            logger.mark('[READY] 事件接收 :', data)
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
    
    
        ws.on("GUILDS", (data) => {
            logger.mark(`重新加载频道树中`);
            loadGuildTree().then(() => {
                logger.mark(`频道树加载完毕`);
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

        const opt = await kazuha.findOpts(msg);
        if (!opt || opt.directory === "err") {
            return;
        }

        if (kazuha.config.devEnv && ["system", "example", "other"].includes(opt.directory)) {
            logger.debug(`${_path}/plugins/${opt.directory}/${opt.file}:${opt.fnc}`);
        } else if(kazuha.config.devEnv) {
            logger.debug(`${_path}/plugins/${opt.directory}/apps/${opt.file}:${opt.fnc}`);
        }

        const isSpecialDir = ["system", "example", "other"].includes(opt.directory);

        const pluginPath = isSpecialDir
            ? path.join(_path, "plugins", opt.directory, `${opt.file}.js`)
            : path.join(_path, "plugins", opt.directory, "apps", `${opt.file}.js`)
        
        logger.debug(`插件路径: ${pluginPath}`);

        try {
            const plugin = await import(pluginPath);
            if (typeof plugin[opt.fnc] === "function") {
                return (plugin[opt.fnc] as PluginFnc)(msg).catch(err => {});
            } else {
                logger.error(`未找到函数 ${opt.fnc}() 在 "${pluginPath}"`);
            }
        } catch (importErr) {
            logger.error('插件导入失败:', importErr);
        }

    } catch (err) {
        logger.error('执行过程中发生错误:', err);
    }
}


type PluginFnc = (msg: IMessageEx) => Promise<any>
