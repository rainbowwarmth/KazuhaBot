import fs from "fs"
import path from "path"
import { _path, redis } from "../../lib/global/global.js"

export function writeFileSyncEx(filePath, data, options) {
    const dirPath = path.dirname(filePath)
    try {
        fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 })
    } catch (e) {
        if (e.code !== 'EEXIST') throw e
    }
    fs.writeFileSync(filePath, data, options)
}

export function sleep(ms) {
    let timeoutId
    const promise = new Promise(resolve => {
        timeoutId = setTimeout(resolve, ms)
    })
    promise.cancel = () => clearTimeout(timeoutId)
    return promise
}

export async function redisCache(type, key, field, value, ttl) {
    if (type === 'r') {
        return (await redis.hGet(key, field)) || null
    }
    
    if (type === 'w') {
        const commands = [['hSet', key, field, value]]
        ttl && commands.push(['expire', key, ttl])
        await redis.multi(commands).exec()
    }
}

const numberFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
})

export const Format = {
    int: d => parseInt(d, 10),
    comma: (num, fix = 0) => {
        return numberFormatter.format(num).replace(/\.?0+$/, '')
    },
    pct: (num, fix = 1) => num.toFixed(fix) + '%',
    percent: (num, fix = 1) => Format.pct(num * 100, fix)
}