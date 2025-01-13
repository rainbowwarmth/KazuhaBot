import pluginFolders from "../../lib/plugins/getPluginFolders.js";
import * as fs from 'fs';
import * as path from 'path';
import { _path } from "../../lib/global/global.js";
import logger from "../../lib/config/logger.js";
function loadPluginConfig(pluginName) {
    const configPath = path.join(_path, 'config', 'command', `${pluginName}.json`);
    try {
        const config = import(configPath);
        return config;
    }
    catch (err) {
        logger.error(`加载插件配置文件失败: ${configPath}`, err);
        return null;
    }
}
function setupFileWatcher(configFilePath, pluginName) {
    fs.watchFile(configFilePath, () => {
        fs.access(configFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                logger.warn(`配置文件 ${configFilePath} 不存在，跳过加载`);
            }
            else {
                logger.mark(`配置文件 ${configFilePath} 发生变化，正在进行热更新`);
                import(configFilePath)
                    .then(() => {
                    loadPluginConfig(pluginName);
                })
                    .catch(err => {
                    logger.error(`加载插件配置文件失败: ${configFilePath}`, err);
                });
            }
        });
    });
}
async function initGlobals() {
    logger.info('初始化：正在创建热加载监听');
    pluginFolders.forEach(pluginName => {
        const pluginConfigPath = path.join(_path, 'plugins', pluginName, 'config', 'command.json');
        setupFileWatcher(pluginConfigPath, pluginName);
    });
    const configDirPath = path.join(_path, 'config', 'command');
    const specificFolders = ['other', 'system', 'example'];
    specificFolders.forEach(folderName => {
        const configFilePath = path.join(configDirPath, `${folderName}.json`);
        setupFileWatcher(configFilePath, folderName);
    });
}
export default initGlobals;
