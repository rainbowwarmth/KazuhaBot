"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.miGetNewsList = miGetNewsList;
exports.miGetPostFull = miGetPostFull;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = __importDefault(require("../../../lib/logger"));
async function miGetNewsList(gid, type, pageSize = 10) {
    try {
        const response = await (0, node_fetch_1.default)(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=${gid}&page_size=${pageSize}&type=${type}`, {
            method: "GET",
            headers: {
                Referer: 'https://www.miyoushe.com',
                origin: 'https://www.miyoushe.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 miHoYoBBS/2.77.1'
            }
        });
        const json = await response.json();
        if (json.data) {
            return json.data;
        }
        else {
            throw new Error("Data not found");
        }
    }
    catch (err) {
        logger_1.default.error(err);
        return null;
    }
}
async function miGetPostFull(gid, postId) {
    try {
        const response = await (0, node_fetch_1.default)(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=${gid}&read=1&post_id=${postId}`, {
            method: "GET",
            headers: {
                Referer: 'https://www.miyoushe.com',
                origin: 'https://www.miyoushe.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 miHoYoBBS/2.77.1'
            }
        });
        const json = await response.json();
        if (json.data) {
            return json.data;
        }
        else {
            throw new Error("Data not found");
        }
    }
    catch (err) {
        logger_1.default.error(err);
        return null;
    }
}
;
//# sourceMappingURL=mysNew.js.map