"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.initGlobals = initGlobals;
exports.loadGuildTree = loadGuildTree;
const global_1 = require("./global");
const fs_1 = __importDefault(require("fs"));
const kazuha_1 = __importDefault(require("../kazuha"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
const mysNew_1 = require("../plugins/mihoyo/apps/mysNew");
async function init() {
    logger_1.default.mark(`-------(≡^∇^≡)-------`);
    logger_1.default.mark(kazuha_1.default.chalk.cyan(kazuha_1.default.Bot.name + ' v' + kazuha_1.default.Bot.version + '启动中...'));
    logger_1.default.mark(kazuha_1.default.chalk.greenBright('https://github.com/rainbowwarmth/KazuhaBot_Newmys.git'));
    process.title = 'kazuhaBot' + ' v' + kazuha_1.default.Bot.version + ' © 2023-2024 ' + '@' + kazuha_1.default.Bot.author;
    process.env.TZ = "Asia/Shanghai";
    await initGlobals();
}
function loadPluginConfig(pluginName) {
    const configPath = path_1.default.join(global_1._path, 'config', 'command', `${pluginName}.json`);
    try {
        const config = require(configPath);
        return config;
    }
    catch (err) {
        logger_1.default.error(`加载插件配置文件失败: ${configPath}`, err);
        return null;
    }
}
async function initGlobals() {
    logger_1.default.info('初始化：正在创建定时任务');
    const taskList = [
        mysNew_1.taskPushNews
    ];
    taskList.forEach(task => node_schedule_1.default.scheduleJob('0/1 * * * * ?', task));
    function getPluginFolders() {
        const pluginsDir = path_1.default.join(global_1._path, 'plugins');
        return fs_1.default.readdirSync(pluginsDir).filter(folder => {
            const fullPath = path_1.default.join(pluginsDir, folder);
            return fs_1.default.statSync(fullPath).isDirectory() && !['other', 'example', 'system'].includes(folder);
        });
    }
    const pluginFolders = getPluginFolders();
    logger_1.default.info('初始化：正在创建热加载监听');
    pluginFolders.forEach(pluginName => {
        const pluginConfigPath = path_1.default.join(global_1._path, 'plugins', pluginName, 'config', 'command.json');
        fs_1.default.watchFile(pluginConfigPath, () => {
            fs_1.default.access(pluginConfigPath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                    logger_1.default.warn(`插件配置文件 ${pluginConfigPath} 不存在，跳过加载`);
                }
                else {
                    logger_1.default.mark(`插件配置文件 ${pluginConfigPath} 发生变化，正在进行热更新`);
                    delete require.cache[require.resolve(pluginConfigPath)];
                    loadPluginConfig(pluginName);
                }
            });
        });
    });
    // 根目录 config/command/ 中的特定文件热更新逻辑
    const configDirPath = path_1.default.join(global_1._path, 'config', 'command');
    const specificFolders = ['other', 'system', 'example'];
    specificFolders.forEach(folderName => {
        const configFilePath = path_1.default.join(configDirPath, `${folderName}.json`);
        fs_1.default.watchFile(configFilePath, () => {
            fs_1.default.access(configFilePath, fs_1.default.constants.F_OK, (err) => {
                if (err) {
                    logger_1.default.warn(`配置文件 ${configFilePath} 不存在，跳过加载`);
                }
                else {
                    logger_1.default.mark(`配置文件 ${configFilePath} 发生变化，正在进行热更新`);
                    delete require.cache[require.resolve(configFilePath)];
                    loadPluginConfig(folderName);
                }
            });
        });
    });
    logger_1.default.info('初始化：正在连接数据库');
    await global_1.redis.connect().then(() => {
        logger_1.default.info('初始化：redis数据库连接成功');
    }).catch(err => {
        logger_1.default.error(`初始化：redis数据库连接失败，正在退出程序\n${err}`);
        process.exit();
    });
    logger_1.default.info('初始化：正在创建client与ws');
    global_1.client;
    global_1.ws;
    logger_1.default.info('初始化：正在创建频道树');
    global.saveGuildsTree = [];
    await loadGuildTree(true);
}
async function loadGuildTree(init = false) {
    global.saveGuildsTree = [];
    for (const guild of (await global_1.client.meApi.meGuilds()).data) {
        if (init)
            logger_1.default.info(`${guild.name}(${guild.id})`);
        const _guild = [];
        for (const channel of (await global_1.client.channelApi.channels(guild.id)).data) {
            if (init)
                logger_1.default.info(`${guild.name}(${guild.id})-${channel.name}(${channel.id})-father:${channel.parent_id}`);
            _guild.push({ name: channel.name, id: channel.id });
        }
        global.saveGuildsTree.push({ name: guild.name, id: guild.id, channel: _guild });
    }
}
//# sourceMappingURL=Bot.js.map