import md5 from "md5";
import lodash from "lodash";
import fetch from "node-fetch";

export async function miGetNewsList(type: number, pageSize = 10) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/getNewsList?gids=3&page_size=${pageSize}&type=${type}`, {
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

export async function miGetPostFull(postId: string) {
    return fetch(`https://bbs-api.mihoyo.com/post/wapi/getPostFull?gids=3&read=1&post_id=${postId}`, {
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

export async function miSearchPosts(keyword: string, gids = 3, size = 20) {
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

export async function miGetEmoticon() {
    return fetch(`https://bbs-api-static.mihoyo.com/misc/api/emoticon_set?gids=3`).then(res => {
        return res.json();
    }).then((json: MihoyoAPI<Emoticon>) => {
        if (json.data) return json.data;
        else throw new Error("not found data");
    }).catch(err => {
        log.error(err);
    });
}


export interface PostList {
    list: PostListInfo[];
    last_id: number;
    is_last: boolean;
};

export interface PostListInfo {
    post: {
        game_id: number;
        post_id: string;
        f_forum_id: number;
        uid: string;
        subject: string;
        content: string;
        cover: string;
        view_type: number;
        created_at: number;
        images: string[];
        post_status: {
            is_top: boolean;
            is_good: boolean;
            is_official: boolean;
        };
        topic_ids: number[];
        view_status: number;
        max_floor: number;
        is_original: number;
        republish_authorization: number;
        reply_time: string;
        is_deleted: number;
        is_interactive: boolean;
        structured_content: string;
        structured_content_rows: any[];
        review_id: number;
        is_profit: boolean;
        is_in_profit: boolean;
        updated_at: number;
        deleted_at: number;
        pre_pub_status: number;
        cate_id: number;
    };
    forum: {
        id: number;
        name: string;
        icon: string;
        game_id: number;
        forum_cate?: any;
    };
    topics: {
        id: number;
        name: string;
        cover: string;
        is_top: boolean;
        is_good: boolean;
        is_interactive: boolean;
        game_id: number;
        content_type: number;
    }[];
    user: {
        uid: string;
        nickname: string;
        introduce: string;
        avatar: string;
        gender: number;
        certification: {
            type: number;
            label: string;
        };
        level_exp: {
            level: number;
            exp: number;
        };
        is_following: boolean;
        is_followed: boolean;
        avatar_url: string;
        pendant: string;
    };
    self_operation: {
        attitude: number;
        is_collected: boolean;
    };
    stat: {
        view_num: number;
        reply_num: number;
        like_num: number;
        bookmark_num: number;
        forward_num: number;
    };
    help_sys: {
        top_up?: any;
        top_n: any[];
        answer_num: number;
    };
    cover: {
        url: string;
        height: number,
        width: number,
        format: string;
        size: string;
        image_id: string;
        entity_type: string;
        entity_id: string;
    };
    image_list: {
        url: string;
        height: number;
        width: number;
        format: string;
        size: string;
        crop?: any;
        is_user_set_cover: boolean;
        image_id: string;
        entity_type: string;
        entity_id: string;
    }[];
    is_official_master: boolean;
    is_user_master: boolean;
    hot_reply_exist: boolean;
    vote_count: number;
    last_modify_time: number;
    recommend_type: string;
    collection: null;
    vod_list: [];
    is_block_on: boolean;
    link_card_list: [];
}

export interface PostSearch {
    posts: PostListInfo[];
    last_id: string;
    is_last: number;
    token_list: string[];
    databox: { [postId: string]: string };
}


export interface PostFull {
    post: PostFullPost;
}


export interface PostFullPost {
    post: {
        game_id: number;
        post_id: string;
        f_forum_id: number;
        uid: string;
        subject: string;
        content: string;
        cover: string;
        view_type: number;
        created_at: number;
        images: string[];
        post_status: {
            is_top: boolean;
            is_good: boolean;
            is_official: boolean;
        };
        topic_ids: any[];
        view_status: number;
        max_floor: number;
        is_original: number;
        republish_authorization: number;
        reply_time: string;
        is_deleted: number;
        is_interactive: boolean;
        structured_content: string;
        structured_content_rows: any[];
        review_id: number;
        is_profit: boolean;
        is_in_profit: boolean;
        updated_at: number;
        deleted_at: number;
        pre_pub_status: number;
        cate_id: number;
    };
    forum: {
        id: number;
        name: string;
        icon: string;
        game_id: number;
        forum_cate?: any;
    };
    topics: any[];
    user: {
        uid: string;
        nickname: string;
        introduce: string;
        avatar: string;
        gender: number;
        certification: {
            type: number;
            label: string;
        };
        level_exp: {
            level: number;
            exp: number;
        };
        is_following: boolean;
        is_followed: boolean;
        avatar_url: string;
        pendant: string;
    };
    self_operation: {
        attitude: number;
        is_collected: boolean;
    };
    /* stat: {
        view_num: number;
        reply_num: number;
        like_num: number;
        bookmark_num: number;
        forward_num: number;
    }; */
    stat: {
        [key: string]: number;
    };
    help_sys?: any;
    cover?: any;
    image_list: {
        url: string;
        height: number;
        width: number;
        format: string;
        size: string;
        crop?: any;
        is_user_set_cover: boolean;
        image_id: string;
        entity_type: string;
        entity_id: string;
    }[];
    is_official_master: boolean;
    is_user_master: boolean;
    hot_reply_exist: boolean;
    vote_count: number;
    last_modify_time: number;
    recommend_type: string;
    collection?: any;
    vod_list: any[];
    is_block_on: boolean;
    forum_rank_info?: any;
    link_card_list: any[];
}


export interface Emoticon {
    list: {
        id: number;
        name: string;
        icon: string;
        sort_order: number;
        num: number;
        status: string;
        list: {
            id: number;
            name: string;
            icon: string;
            sort_order: number;
            static_icon: string;
            updated_at: number;
            is_available: boolean;
            status: string;
        }[];
        updated_at: number;
        is_available: boolean;
    }[];
    recently_emoticon?: any;
}