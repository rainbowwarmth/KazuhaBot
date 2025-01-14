import fs from "fs";
import { _path, redis } from "../../lib/global/global.js";
export function writeFileSyncEx(filePath, data, options) {
    const pathPart = filePath.split("/").slice(0, -1);
    const dirPath = pathPart.join("/");
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, data, options);
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function cacheJson(opt, app, data) {
    const jsonPath = `${_path}/generate/cache/${app}.json`;
    try {
        if (opt === "r") {
            if (!fs.existsSync(jsonPath))
                return null;
            const jsonData = fs.readFileSync(jsonPath, "utf8");
            return JSON.parse(jsonData);
        }
        else {
            writeFileSyncEx(jsonPath, JSON.stringify(data), { encoding: "utf8" });
            return true;
        }
    }
    catch (error) {
        logger.error(error);
        return opt === "r" ? null : false;
    }
}
export async function redisCache(type, key, field, data, expire) {
    if (type === "r") {
        return await redis.hGet(key, field) || null;
    }
    if (type === "w") {
        await redis.hSet(key, field, data);
        if (expire) {
            await redis.expire(key, expire);
        }
    }
    return null;
}
export const Format = {
    int: (d) => parseInt(d),
    comma: (num, fix = 0) => {
        const [integer, decimal] = num.toFixed(fix).split('.');
        return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimal ? '.' + decimal : '');
    },
    pct: (num, fix = 1) => num.toFixed(fix) + '%',
    percent: (num, fix = 1) => Format.pct(num * 100, fix)
};
