import { _path, redis, client, ws } from '@src/lib/global'
import fs from 'fs';
import kazuha from '@src/kazuha';
import schedule from 'node-schedule'
import path from 'path';
import { IMessageEx } from '@src/lib/IMessageEx';
import logger from '@src/lib/logger';
import { bbbtaskPushNews, bbtaskPushNews, dbytaskPushNews, srtaskPushNews, wdtaskPushNews, ystaskPushNews, zzztaskPushNews } from '@src/plugins/mihoyo/apps/mysNew';


type PluginFnc = (msg: IMessageEx) => Promise<any>;

interface Task {
    taskFunction: () => void;
    cronExpression: string;
}

export async function init() {
    logger.mark(`-------(≡^∇^≡)-------`);
    logger.mark(kazuha.chalk.cyan(kazuha.Bot.name + ' v' + kazuha.Bot.version + '启动中...'));
    logger.mark(kazuha.chalk.greenBright('https://github.com/rainbowwarmth/KazuhaBot_Newmys.git'));
    process.title = 'kazuhaBot' + ' v' + kazuha.Bot.version + ' © 2023-2024 ' + '@' + kazuha.Bot.author;
    process.env.TZ = "Asia/Shanghai";
    
    await initGlobals(); 
}

function loadPluginConfig(pluginName: string) {
    const configPath = path.join(_path, 'config', 'command', `${pluginName}.json`);
    try {
        const config = require(configPath);
        return config;
    } catch (err) {
        logger.error(`加载插件配置文件失败: ${configPath}`, err);
        return null;
    }
}

export async function initGlobals() {
    logger.info('初始化：正在创建定时任务');

    const taskList = [
        ystaskPushNews,
        bbbtaskPushNews,
        bbtaskPushNews,
        zzztaskPushNews,
        srtaskPushNews,
        wdtaskPushNews,
        dbytaskPushNews
    ]

    taskList.forEach(task => schedule.scheduleJob('0/1 * * * * ?', task));

    function getPluginFolders(): string[] {
        const pluginsDir = path.join(_path, 'plugins');
        return fs.readdirSync(pluginsDir).filter(folder => {
            const fullPath = path.join(pluginsDir, folder);
            return fs.statSync(fullPath).isDirectory() && !['other', 'example', 'system'].includes(folder);
        });
    }
    
    const pluginFolders = getPluginFolders();

    logger.info('初始化：正在创建热加载监听');
    pluginFolders.forEach(pluginName => {
        const pluginConfigPath = path.join(_path, 'plugins', pluginName, 'config', 'command.json');
        
        fs.watchFile(pluginConfigPath, () => {
            fs.access(pluginConfigPath, fs.constants.F_OK, (err) => {
                if (err) {
                    logger.warn(`插件配置文件 ${pluginConfigPath} 不存在，跳过加载`);
                } else {
                    logger.mark(`插件配置文件 ${pluginConfigPath} 发生变化，正在进行热更新`);
                    delete require.cache[require.resolve(pluginConfigPath)];
                    loadPluginConfig(pluginName);
                }
            });
        });
    });
    
    // 根目录 config/command/ 中的特定文件热更新逻辑
    const configDirPath = path.join(_path, 'config', 'command');
    const specificFolders = ['other', 'system', 'example'];
    
    specificFolders.forEach(folderName => {
        const configFilePath = path.join(configDirPath, `${folderName}.json`);
        
        fs.watchFile(configFilePath, () => {
            fs.access(configFilePath, fs.constants.F_OK, (err) => {
                if (err) {
                    logger.warn(`配置文件 ${configFilePath} 不存在，跳过加载`);
                } else {
                    logger.mark(`配置文件 ${configFilePath} 发生变化，正在进行热更新`);
                    delete require.cache[require.resolve(configFilePath)];
                    loadPluginConfig(folderName);
                }
            });
        });
    });

    logger.info('初始化：正在连接数据库');
    await redis.connect().then(() => {
        logger.info('初始化：redis数据库连接成功');
    }).catch(err => {
        logger.error(`初始化：redis数据库连接失败，正在退出程序\n${err}`);
        process.exit();
    });

    logger.info('初始化：正在创建client与ws');
    client;
    ws;

    logger.info('初始化：正在创建频道树');
    global.saveGuildsTree = [];
    await loadGuildTree(true);
}

export async function loadGuildTree(init = false) {
    global.saveGuildsTree = [];
    for (const guild of (await client.meApi.meGuilds()).data) {
        if (init) logger.info(`${guild.name}(${guild.id})`);
        const _guild = [];
        for (const channel of (await client.channelApi.channels(guild.id)).data) {
            if (init) logger.info(`${guild.name}(${guild.id})-${channel.name}(${channel.id})-father:${channel.parent_id}`);
            _guild.push({ name: channel.name, id: channel.id });
        }
        global.saveGuildsTree.push({ name: guild.name, id: guild.id, channel: _guild });
    }
}
