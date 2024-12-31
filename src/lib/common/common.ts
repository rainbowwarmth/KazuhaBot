import fs from "fs";
import { _path, redis } from "@src/lib/global/global";

export function writeFileSyncEx(filePath: string, data: string | Buffer, options?: fs.WriteFileOptions) {
    const dirPath = filePath.split("/").slice(0, -1).join("/");
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, data, options);
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function cacheJson<T>(opt: "w" | "r", app: string, data?: T): T | boolean | null {
    const jsonPath = `${_path}/generate/cache/${app}.json`;
    try {
        if (opt === "r") {
            if (!fs.existsSync(jsonPath)) return null;
            return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as T;
        } else {
            writeFileSyncEx(jsonPath, JSON.stringify(data), { encoding: "utf8" });
            return true;
        }
    } catch (error) {
        logger.error(error);
        return opt === "r" ? null : false;
    }
}

export async function redisCache(type: "r" | "w", key: string, field: string, data?: string, expire?: number): Promise<string | null> {
    if (type === "r") {
        return await redis.hGet(key, field) || null;
    }
    if (type === "w") {
        await redis.hSet(key, field, data!);
        if (expire) {
            await redis.expire(key, expire);
        }
    }
    return null;
}

export const Format = {
    int: (d: string): number => parseInt(d),
    comma: (num: number, fix = 0): string => {
        const [integer, decimal] = num.toFixed(fix).split('.');
        return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (decimal ? '.' + decimal : '');
    },
    pct: (num: number, fix = 1): string => num.toFixed(fix) + '%',
    percent: (num: number, fix = 1): string => Format.pct(num * 100, fix)
};
