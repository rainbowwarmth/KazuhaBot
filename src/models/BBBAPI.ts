import md5 from "md5";
import lodash from "lodash";
import fetch from "node-fetch";
import { PostList, PostSearch, PostFull, Emoticon} from "#kazuha.models"

export async function bbbmiGetNewsList(type: number, pageSize = 20) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/getNewsList?gids=1&page_size=${pageSize}&type=${type}`, {
        method: "GET",
        headers: { Referer: "https://bbs.mihoyo.com/" }
    }).then(res => {
        return res.json();
    }).then((json: MihoyoAPI<PostList>) => {
        if (json.data) return json.data;
        else throw new Error("not found data");
    }).catch(err => {
        log.error(err);
        return null;
    });
}

export async function bbbmiGetPostFull(postId: string) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/getPostFull?gids=1&read=1&post_id=${postId}`, {
        method: "GET",
        headers: { Referer: "https://bbs.mihoyo.com/" }
    }).then(res => {
        return res.json();
    }).then((json: MihoyoAPI<PostFull>) => {
        if (json.data) return json.data;
        else throw new Error("not found data");
    }).catch(err => {
        log.error(err);
        return null;
    });
}

export async function bbbmiSearchPosts(keyword: string, gids = 1, size = 20) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/searchPosts?keyword=${keyword}&gids=${gids}&size=${size}`, {
        method: "GET",
        headers: { Referer: "https://bbs.mihoyo.com/" }
    }).then(res => {
        return res.json();
    }).then((json: MihoyoAPI<PostSearch>) => {
        if (json.data) return json.data;
        else throw json;
    }).catch(err => {
        log.error(err);
        return null;
    });

}

export async function bbbmiGetEmoticon() {
    return fetch(`https://bbs-api-static.mihoyo.com/misc/api/emoticon_set?gids=1`).then(res => {
        return res.json();
    }).then((json: MihoyoAPI<Emoticon>) => {
        if (json.data) return json.data;
        else throw new Error("not found data");
    }).catch(err => {
        log.error(err);
    });
}
