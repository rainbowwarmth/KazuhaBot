import * as fs from 'fs'
import * as path from 'path'
import { parse, stringify } from 'yaml'

/**读取 YAML 配置文件 */
const configFilePath = path.resolve(process.cwd(), 'plugins', 'mihoyo', 'config', 'config.yaml')

if (!fs.existsSync(configFilePath)) {
    console.error(`配置文件 ${configFilePath} 不存在`)
    process.exit(1);
}

/**
 * 读取并解析 YAML 配置文件
 * @returns {Object} 配置对象
 */
function readConfig() {
    const configFile = fs.readFileSync(configFilePath, 'utf8')
    return parse(configFile);
}

/**
 * 写入配置到 YAML 文件
 * @param {Object} config 配置对象
 */
function writeConfig(config) {
    const configFile = stringify(config)
    fs.writeFileSync(configFilePath, configFile, 'utf8')
}

/**
 * 获取推送频道配置
 * @param {string} gamePrefix 游戏类别
 * @returns {Object} 推送频道配置
 */
function getNewsPushConfig(gamePrefix) {
    const config = readConfig()
    const gameConfig = config[gamePrefix]
    if (!gameConfig) {
        console.error(`未找到 ${gamePrefix} 的配置`)
        return {}
    }
    return gameConfig.newsPush || {}
}

/**
 * 设置推送频道配置
 * @param {string} gamePrefix 游戏类别
 * @param {string} channelId 频道ID
 * @param {boolean} value 是否开启推送
 */
function setNewsPushConfig(gamePrefix, channelId, value) {
    const config = readConfig()
    if (!config[gamePrefix]) {
        config[gamePrefix] = {}
    }
    if (!config[gamePrefix].newsPush) {
        config[gamePrefix].newsPush = {}
    }
    config[gamePrefix].newsPush[channelId] = value
    writeConfig(config)
}

/**
 * 外部浏览器选项
 * @param {*} gamePrefix 游戏类别
 * @returns 
 */
function getIgnoreReg(gamePrefix) {
    const config = readConfig()
    const gameConfig = config[gamePrefix]
    if (!gameConfig || !gameConfig.ignoreReg) {
        console.error(`未找到 ${gamePrefix} 的 ignoreReg 配置`)
        return null;
    }
    return new RegExp(gameConfig.ignoreReg.join('|'))
}

export { getIgnoreReg, getNewsPushConfig, setNewsPushConfig }