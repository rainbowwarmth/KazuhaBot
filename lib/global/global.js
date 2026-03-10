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
    socket: { host: config.databaseConfig.host, port: config.databaseConfig.port },
    database: 1,
    password: config.databaseConfig.password
})
