import md5 from "md5";
import lodash from "lodash";
import fetch from "node-fetch";
import { PostList, PostFull} from "./API"

export async function wdmiGetNewsList(type: number, pageSize = 10) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/getNewsList?gids=4&page_size=${pageSize}&type=${type}`, {
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

export async function wdmiGetPostFull(postId: string) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/getPostFull?gids=4&read=1&post_id=${postId}`, {
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


