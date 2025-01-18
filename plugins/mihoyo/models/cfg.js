import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'yaml'

/**读取 YAML 配置文件 */
const configFilePath = path.resolve(process.cwd(), 'plugins', 'mihoyo', 'config', 'config.yaml')

if (!fs.existsSync(configFilePath)) {
    console.error(`配置文件 ${configFilePath} 不存在`)
    process.exit(1);
}

/**读取并解析 YAML 配置文件 */
const configFile = fs.readFileSync(configFilePath, 'utf8')
const config = parse(configFile);

/**
 * 外部浏览器选项
 * @param {*} gamePrefix 游戏类别
 * @returns 
 */
function getIgnoreReg(gamePrefix) {
    const gameConfig = config[gamePrefix]
    if (!gameConfig || !gameConfig.ignoreReg) {
        console.error(`未找到 ${gamePrefix} 的 ignoreReg 配置`)
        return null;
    }
    return new RegExp(gameConfig.ignoreReg.join('|'))
}

export default getIgnoreReg