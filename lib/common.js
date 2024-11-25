import fs from "fs";
import { _path, redis } from '../lib/global.js';
import logger from '../lib/logger.js';
export function writeFileSyncEx(filePath, data, options) {
    const pathPart = filePath.split("/");
    pathPart.pop();
    if (fs.existsSync(pathPart.join("/"))) {
        fs.writeFileSync(filePath, data, options);
    }
    else {
        var _p = "";
        for (const [iv, _part] of pathPart.entries()) {
            //if (iv + 1 == pathPart.length) break;
            _p += `${_part}/`;
            if (fs.existsSync(_p))
                continue;
            else
                fs.mkdirSync(_p);
        }
        writeFileSyncEx(filePath, data, options);
    }
}
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function cacheJson(opt, app, data) {
    const jsonPath = `${_path}/generate/cache/${app}.json`;
    try {
        if (opt == "r") {
            if (!fs.existsSync(jsonPath))
                return null;
            const data = fs.readFileSync(jsonPath, { encoding: "utf8" });
            const json = JSON.parse(data);
            return json;
        }
        else {
            writeFileSyncEx(jsonPath, JSON.stringify(data), { encoding: "utf8" });
            return true;
        }
    }
    catch (error) {
        logger.error(error);
        if (opt == "r")
            return null;
        else
            return false;
    }
}
export async function redisCache(type, key, field, data, expire) {
    if (type == "r") {
        return await redis.hGet(key, field) || null;
    }
    ;
    if (type == "w") {
        redis.hSet(key, field, data).then(() => {
            if (expire)
                redis.expire(key, expire);
        });
    }
    return null;
}
export const Format = {
    /**
     * string to number
     * @param d string
     * @returns number
     */
    int: (d) => {
        return parseInt(d);
    },
    comma: (num, fix = 0) => {
        num = parseFloat((num * 1).toFixed(fix));
        let [integer, decimal] = num.toString().split('.');
        integer = integer.replace(/\d(?=(\d{3})+$)/g, '$&,');
        return `${integer}${decimal ? '.' + decimal : ''}`;
    },
    pct: (num, fix = 1) => {
        return num.toFixed(fix) + '%';
    },
    percent: (num, fix = 1) => {
        return Format.pct(num * 100, fix);
    }
};
