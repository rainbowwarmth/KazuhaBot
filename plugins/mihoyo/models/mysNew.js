import fetch from "node-fetch";
import logger from '../../../lib/logger.js';
export async function miGetNewsList(gid, type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=${gid}&page_size=${pageSize}&type=${type}`, {
        method: "GET",
        headers: { Referer: 'https://www.miyoushe.com', origin: 'https://www.miyoushe.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0' }
    }).then(res => {
        return res.json();
    }).then((json) => {
        if (json.data)
            return json.data;
        else
            throw new Error("not found data");
    }).catch(err => {
        logger.error(err);
        return null;
    });
}
export async function miGetPostFull(gid, postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=${gid}&read=1&post_id=${postId}`, {
        method: "GET",
        headers: { Referer: 'https://www.miyoushe.com', origin: 'https://www.miyoushe.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0' }
    }).then(res => {
        return res.json();
    }).then((json) => {
        if (json.data)
            return json.data;
        else
            throw new Error("not found data");
    }).catch(err => {
        logger.error(err);
        return null;
    });
}
;
