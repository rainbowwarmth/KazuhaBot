import { createOpenAPI, createWebsocket } from "qq-bot-sdk"
import { config } from "../../lib/config/config.js"
import {logger} from "../../lib/config/logger.js"

// 配置校验模块
const validateBotConfig = () => {
  const requiredFields = ['appID', 'token']
  const missing = requiredFields.filter(field => !config.initConfig[field])
  
  if (missing.length) {
    logger.error(`缺少必要配置项: ${missing.join(', ')}`)
    process.exit(1)
  }

  if (typeof config.initConfig.appID !== 'string' || !/^\d+$/.test(config.initConfig.appID)) {
    logger.error('appID 格式错误，应为数字字符串')
    process.exit(1)
  }
}

// 客户端配置生成
const createClientConfig = () => ({
  appID: config.initConfig.appID,
  token: config.initConfig.token,
  intents: config.initConfig.intents || '',
  sandbox: config.initConfig.sandbox || false,
  logger: logger
})

// 服务初始化
const initializeBotClient = () => {
  try {
    validateBotConfig()
    logger.mark("[Client] 正在初始化机器人连接...")
    
    const clientConfig = createClientConfig()
    const client = createOpenAPI(clientConfig)
    const ws = createWebsocket(clientConfig)
    
    logger.mark("[Client] 机器人连接就绪")
    return { client, ws }
  } catch (error) {
    logger.error("客户端初始化失败:", error.stack)
    process.exit(1)
  }
}

// 导出初始化结果
const { client, ws } = initializeBotClient()
export { client, ws }