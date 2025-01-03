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

export async function initialize() {
    await init();

    ws.on('READY', (data) => logger.info('[READY] 事件接收 :', data));
    ws.on('ERROR', (data) => logger.error('[ERROR] 事件接收 :', data));
    ws.on('GUILDS', reloadGuildTree);
    ws.on('GUILD_MESSAGES', (data: IntentMessage) => handleMessage(data, "GUILD"));
    ws.on('DIRECT_MESSAGE', (data: IntentMessage) => handleMessage(data, "DIRECT"));
}

async function reloadGuildTree() {
    try {
        logger.info(`重新加载频道树中`);
        await loadGuildTree();
        logger.info(`频道树加载完毕`);
    } catch (err) {
        logger.error(`频道树加载失败`, err);
    }
}

async function handleMessage(data: IntentMessage, messageType: "DIRECT" | "GUILD") {
    if ((messageType === "GUILD" && data.eventType === "MESSAGE_CREATE") || 
        (messageType === "DIRECT" && data.eventType === 'DIRECT_MESSAGE_CREATE')) {
        
        const msg = new IMessageEx(data.msg, messageType);
        
        if (messageType === "DIRECT") {
            await redis.hSet(`genshin:config:${msg.author.id}`, "guildId", msg.guild_id);
        }
        
        await execute(msg);
    }
}

async function execute(msg: IMessageEx) {
    try {
        await redis.set("lastestMsgId", msg.id, { EX: 4 * 60 });

        if (!msg.content) {
            logger.error('消息为空，可能是图片和GIF导致的');
            return;
        }

        msg.content = msg.content.trim().replace(/^\//, "#");

        const opt = await findOpts(msg);
        if (!opt || opt.directory === "err") return;

        const pluginFilePath = path.join(_path, "plugins", opt.directory, "apps", `${opt.file}.js`);
        const pluginURL = pathToFileURL(pluginFilePath).href;

        logger.debug(`插件路径: ${pluginURL}`);

        await import(pluginURL)
            .then((plugin) => {
                if (typeof plugin[opt.fnc] === "function") {
                    return plugin[opt.fnc](msg);
                }
                logger.error(`未找到函数 ${opt.fnc}() 在 "${pluginURL}"`);
            })
            .catch((importErr) => {
                logger.error('插件导入失败:', importErr);
            });
    } catch (err) {
        logger.error('执行过程中发生错误:', err);
    }
}

type PluginFnc = (msg: IMessageEx) => Promise<any>;
