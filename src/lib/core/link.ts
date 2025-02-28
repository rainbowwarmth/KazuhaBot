import { createOpenAPI, createWebsocket } from "qq-bot-sdk"
import { config } from "@src/lib/config/config"
import logger from "@src/lib/config/logger"

const initConfig = {
    appID: config.initConfig.appID,
    token: config.initConfig.token,
    intents: config.initConfig.intents,
    sandbox: config.initConfig.sandbox,
    logger: logger
}
const client = createOpenAPI(initConfig)
const ws = createWebsocket(initConfig as any)

export { client, ws }