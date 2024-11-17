"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
const init_1 = require("./init");
const Bot_1 = require("./lib/Bot");
const kazuha_1 = __importDefault(require("./kazuha"));
const IMessageEx_1 = require("./lib/IMessageEx");
const global_1 = require("./lib/global");
const logger_1 = __importDefault(require("./lib/logger"));
const path_1 = __importDefault(require("path"));
async function initialize() {
    (0, init_1.init)().then(() => {
        global_1.ws.on('READY', (data) => {
            logger_1.default.mark('[READY] 事件接收 :', data);
        });
        global_1.ws.on('ERROR', (data) => {
            logger_1.default.error('[ERROR] 事件接收 :', data);
        });
        global_1.ws.on('GUILD_MESSAGES', async (data) => {
            if (data.eventType != "MESSAGE_CREATE")
                return;
            const msg = new IMessageEx_1.IMessageEx(data.msg, "GUILD");
            execute(msg);
        });
        global_1.ws.on("DIRECT_MESSAGE", async (data) => {
            if (data.eventType != 'DIRECT_MESSAGE_CREATE')
                return;
            const msg = new IMessageEx_1.IMessageEx(data.msg, "DIRECT");
            global_1.redis.hSet(`genshin:config:${msg.author.id}`, "guildId", msg.guild_id);
            execute(msg);
        });
        global_1.ws.on("GUILDS", () => {
            logger_1.default.mark(`重新加载频道树中`);
            (0, Bot_1.loadGuildTree)().then(() => {
                logger_1.default.mark(`频道树加载完毕`);
            }).catch((err) => {
                logger_1.default.error(`频道树加载失败`, err);
            });
        });
    });
}
async function execute(msg) {
    try {
        global_1.redis.set("lastestMsgId", msg.id, { EX: 4 * 60 });
        if (msg && msg.content) {
            msg.content = msg.content.trim().replace(/^\//, "#");
        }
        else {
            logger_1.default.error('检查消息为空，可能是图片和GIF导致的');
            return;
        }
        const opt = await kazuha_1.default.findOpts(msg);
        if (!opt || opt.directory === "err") {
            return;
        }
        if (kazuha_1.default.config.devEnv && ["system", "example", "other"].includes(opt.directory)) {
            logger_1.default.debug(`${global_1._path}/plugins/${opt.directory}/${opt.file}:${opt.fnc}`);
        }
        else if (kazuha_1.default.config.devEnv) {
            logger_1.default.debug(`${global_1._path}/plugins/${opt.directory}/apps/${opt.file}:${opt.fnc}`);
        }
        const isSpecialDir = ["system", "example", "other"].includes(opt.directory);
        const pluginPath = isSpecialDir
            ? path_1.default.join(global_1._path, "plugins", opt.directory, `${opt.file}.js`)
            : path_1.default.join(global_1._path, "plugins", opt.directory, "apps", `${opt.file}.js`);
        logger_1.default.debug(`插件路径: ${pluginPath}`);
        try {
            const plugin = await Promise.resolve(`${pluginPath}`).then(s => __importStar(require(s)));
            if (typeof plugin[opt.fnc] === "function") {
                return plugin[opt.fnc](msg).catch(err => { });
            }
            else {
                logger_1.default.error(`未找到函数 ${opt.fnc}() 在 "${pluginPath}"`);
            }
        }
        catch (importErr) {
            logger_1.default.error('插件导入失败:', importErr);
        }
    }
    catch (err) {
        logger_1.default.error('执行过程中发生错误:', err);
    }
}
//# sourceMappingURL=index.js.map