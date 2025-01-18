import { createOpenAPI, createWebsocket } from "qq-bot-sdk"
import { config } from "../../lib/config/config.js"
import logger from "../../lib/config/logger.js"

/**检查 appID 和 token 是否填写 */
if (!config.initConfig.appID || !config.initConfig.token) {
    logger.error("未填写 appID 或 token，终止运行")
    process.exit(1)
} else {
    logger.mark("[Client] 机器人成功连接")
}

const initConfig = {
    appID: config.initConfig.appID,
    token: config.initConfig.token,
    intents: config.initConfig.intents,
    sandbox: config.initConfig.sandbox,
    logger: logger
}

const client = createOpenAPI(initConfig)
const ws = createWebsocket(initConfig)

export { client, ws }
