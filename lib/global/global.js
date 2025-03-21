import { createClient } from 'redis'
import { config } from '../config/config.js'

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
})
