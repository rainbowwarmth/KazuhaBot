import { pluginFolders } from "@src/lib/plugins/getPluginFolders";
import * as fs from 'fs'
import * as path from 'path'
import { _path } from "@src/lib/global/global";
import logger from "@src/lib/logger/logger";

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

async function initGlobals() {
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
}

export default initGlobals;