import { createClient } from 'redis'
import { createOpenAPI, createWebsocket } from 'qq-bot-sdk'
import { config } from '@src/kazuha'
import logger from '@src/lib/logger'

export const adminId = config.initConfig.adminId
export const _path = process.cwd()
export const botStatus = {
    startTime: new Date(),
    msgSendNum: 0,
    imageRenderNum: 0,
}

export const redis = createClient({
    socket: { host: "127.0.0.1", port: 6379, },
    database: 1,
});

const initConfig = {
    appID: config.initConfig.appID,
    token: config.initConfig.token,
    intents: config.initConfig.intents,
    sandbox: config.initConfig.sandbox,
    logger: logger
}
export const client = createOpenAPI(initConfig)
export const ws = createWebsocket(initConfig as any)