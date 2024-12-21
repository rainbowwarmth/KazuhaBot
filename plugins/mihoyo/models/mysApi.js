import fetch from "node-fetch";
async function bbbmiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=1&page_size=${pageSize}&type=${type}`, {
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
async function bbbmiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=1&read=1&post_id=${postId}`, {
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
async function ysmiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=2&page_size=${pageSize}&type=${type}`, {
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
async function ysmiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=2&read=1&post_id=${postId}`, {
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
async function bbmiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=3&page_size=${pageSize}&type=${type}`, {
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
async function bbmiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=3&read=1&post_id=${postId}`, {
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
async function wdmiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=4&page_size=${pageSize}&type=${type}`, {
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
async function wdmiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=4&read=1&post_id=${postId}`, {
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
async function dbymiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=5&page_size=${pageSize}&type=${type}`, {
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
async function dbymiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=5&read=1&post_id=${postId}`, {
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
async function srmiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=6&page_size=${pageSize}&type=${type}`, {
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
async function srmiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=6&read=1&post_id=${postId}`, {
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
async function zzzmiGetNewsList(type, pageSize = 10) {
    return fetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?gids=8&page_size=${pageSize}&type=${type}`, {
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
async function zzzmiGetPostFull(postId) {
    return fetch(`https://bbs-api.miyoushe.com/post/wapi/getPostFull?gids=8&read=1&post_id=${postId}`, {
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
export { bbbmiGetNewsList, bbbmiGetPostFull, ysmiGetNewsList, ysmiGetPostFull, bbmiGetNewsList, bbmiGetPostFull, wdmiGetNewsList, wdmiGetPostFull, dbymiGetNewsList, dbymiGetPostFull, srmiGetNewsList, srmiGetPostFull, zzzmiGetNewsList, zzzmiGetPostFull };
