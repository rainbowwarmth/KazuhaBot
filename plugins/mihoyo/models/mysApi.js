import HttpClient from "../../../lib/core/httpclient.js";
const apiClient = new HttpClient({
    baseURL: 'https://bbs-api-static.miyoushe.com',
    defaultHeaders: {
      Referer: 'https://www.miyoushe.com',
      Origin: 'https://www.miyoushe.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    }
})

async function fetchMihoyoAPI(url) {
    const res = await apiClient.get(url)
    return res.data.data || Promise.reject(new Error("No data found"));
}

async function miGetNewsList(gid, type, pageSize = 10) {
    const url = `/painter/wapi/getNewsList?gids=${gid}&page_size=${pageSize}&type=${type}`
    return fetchMihoyoAPI(url)
}
async function miGetPostFull(gid, postId) {
    const url = `/post/wapi/getPostFull?gids=${gid}&read=1&post_id=${postId}`
    return fetchMihoyoAPI(url)
}
async function bbbmiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(1, type, pageSize)
}
async function bbbmiGetPostFull(postId) {
    return miGetPostFull(1, postId)
}
async function ysmiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(2, type, pageSize)
}
async function ysmiGetPostFull(postId) {
    return miGetPostFull(2, postId)
}
async function bbmiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(3, type, pageSize)
}
async function bbmiGetPostFull(postId) {
    return miGetPostFull(3, postId)
}
async function wdmiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(4, type, pageSize)
}
async function wdmiGetPostFull(postId) {
    return miGetPostFull(4, postId)
}
async function dbymiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(5, type, pageSize)
}
async function dbymiGetPostFull(postId) {
    return miGetPostFull(5, postId)
}
async function srmiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(6, type, pageSize);
}
async function srmiGetPostFull(postId) {
    return miGetPostFull(6, postId)
}
async function zzzmiGetNewsList(type, pageSize = 10) {
    return miGetNewsList(8, type, pageSize)
}
async function zzzmiGetPostFull(postId) {
    return miGetPostFull(8, postId)
}

export { miGetNewsList, miGetPostFull, bbbmiGetNewsList, bbbmiGetPostFull, ysmiGetNewsList, ysmiGetPostFull, bbmiGetNewsList, bbmiGetPostFull, wdmiGetNewsList, wdmiGetPostFull, dbymiGetNewsList, dbymiGetPostFull, srmiGetNewsList, srmiGetPostFull, zzzmiGetNewsList, zzzmiGetPostFull }