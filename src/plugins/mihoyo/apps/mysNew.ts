import kazuha from "../../../kazuha";
import { IMessageEx, sendImage } from "../../../lib/IMessageEx"
import logger from "../../../lib/logger"
import { redis } from '../../../lib/global'
import { miGetNewsList, miGetPostFull } from "../models/mysNew"
import { PostFullPost } from "../models/mysNew"

var emoticon: Map<any, any> | null = null;

const gameIds: { [key: number]: string } = {
    1: '崩坏三',
    2: '原神',
    3: '崩坏二',
    4: '未定事件簿',
    5: '大别野',
    6: '崩坏星穹铁道',
    8: '绝区零'
};


export async function newsContentBBS(msg: IMessageEx) {
    let gid = 2

    if (msg.content.includes("崩坏星穹铁道") || msg.content.includes("星铁")) {
        gid = 6;  // 崩坏星穹铁道
        logger.debug("匹配到 崩坏星穹铁道 -> gid = 6");
    } 
    else if (msg.content.includes("崩坏三") || msg.content.includes("崩三")) {
        gid = 1;  // 崩坏三
        logger.debug("匹配到 崩坏三 -> gid = 1");
    } 
    else if (msg.content.includes("原神")) {
        gid = 2;  // 原神
        logger.debug("匹配到 原神 -> gid = 2");
    } 
    else if (msg.content.includes("崩坏学园二") || msg.content.includes("崩坏二") || msg.content.includes("崩二")) {
        gid = 3;  // 崩坏二
        logger.debug("匹配到 崩坏二 -> gid = 3");
    } 
    else if (msg.content.includes("未定事件簿")) {
        gid = 4;  // 未定事件簿
        logger.debug("匹配到 未定事件簿 -> gid = 4");
    } 
    else if (msg.content.includes("大别野") || msg.content.includes("别野")) {
        gid = 5;  // 大别野
        logger.debug("匹配到 大别野 -> gid = 5");
    } 
    else if (msg.content.includes("绝区零")) {
        gid = 8;  // 绝区零
        logger.debug("匹配到 绝区零 -> gid = 8");
    }

    let type = 1;
    if (msg.content.includes("公告")) type = 1
    if (msg.content.includes("资讯")) type = 3
    if (msg.content.includes("活动")) type = 2

    const pagesData = await miGetNewsList(gid, type)
    const _page = msg.content.match(/[0-9]+/)
    const page = _page ? parseInt(_page[0]) : 1
    if (!pagesData) return;

    if (page <= 0 || page > pagesData.list.length) {
        msg.sendMsgEx({ content: "目前只查前10条最新的公告，请输入1-10之间的整数。" })
        return true;
    }
    const postFull = await miGetPostFull(gid, pagesData.list[page - 1].post.post_id)
    if (!postFull) return;
    const data = await detalData(postFull.post);
    kazuha.render({
        app: "mys",
        type: "mysNew",
        imgType: "jpeg",
        render: { saveId: msg.author.id },
        data: {
            dataConent: data.post.content,
            data,
        }
    }).then((savePath: any) => {
        if (savePath) msg.sendMsgEx({ content: data.post.subject, imagePath: savePath });
        logger.mark(kazuha.chalk.blueBright(`[${gameIds[gid]}公告] newsContentBBS/mysNew.ts`));
    }).catch((err: any) => {
        logger.error(err);
    });
}

export async function newsListBBS(msg: IMessageEx) {
    let gid = 2, gameName = "原神"

    if (msg.content.includes("崩坏星穹铁道") || msg.content.includes("星铁")) {
        gid = 6, gameName = "崩坏星穹铁道"
        logger.debug("匹配到 崩坏星穹铁道 -> gid = 6");
    } 
    else if (msg.content.includes("崩坏三") || msg.content.includes("崩三")) {
        gid = 1, gameName = "崩坏3"
        logger.debug("匹配到 崩坏三 -> gid = 1");
    } 
    else if (msg.content.includes("原神")) {
        gid = 2, gameName = "原神"
        logger.debug("匹配到 原神 -> gid = 2");
    } 
    else if (msg.content.includes("崩坏学园二") || msg.content.includes("崩坏二") || msg.content.includes("崩二")) {
        gid = 3, gameName = "崩坏学圆2"
        logger.debug("匹配到 崩坏二 -> gid = 3");
    } 
    else if (msg.content.includes("未定事件簿")) {
        gid = 4, gameName = "未定事件簿"
        logger.debug("匹配到 未定事件簿 -> gid = 4");
    } 
    else if (msg.content.includes("大别野") || msg.content.includes("别野")) {
        gid = 5, gameName = "大别野"
        logger.debug("匹配到 大别野 -> gid = 5");
    } 
    else if (msg.content.includes("绝区零")) {
        gid = 8, gameName = "绝区零"
        logger.debug("匹配到 绝区零 -> gid = 8");
    }

    let type = 1, typeName = "公告";
    if (msg.content.includes("公告")) type = 1, typeName = "公告";
    if (msg.content.includes("资讯")) type = 3, typeName = "资讯";
    if (msg.content.includes("活动")) type = 2, typeName = "活动";

    const data = await miGetNewsList(gid, type);
    if (!data) return;

    const datas = data.list;
    if (datas.length === 0) return true;

    datas.forEach((element: { post: { created_at: number; }; }) => {
        (element.post as any).created_at = new Date(element.post.created_at * 1000).toLocaleString();
    });

    await kazuha.render({
        app: "mys",
        type: "mysNewList",
        imgType: "jpeg",
        render: { saveId: msg.author.id },
        data: {
            datas,
            typeName,
            gameName
        }
    }).then((savePath: any) => {
        if (savePath) msg.sendMsgEx({ imagePath: savePath });
        logger.mark(kazuha.chalk.blueBright(`[${gameName}${typeName}列表] newListBBS/mysNew.ts`));
    }).catch((err: any) => {
        logger.error(err);
    });
}

export async function changePushTask(msg: IMessageEx) {
    if (msg.messageType !== "GUILD") return true;
    let gid = 1;
    if (msg.content.includes("崩坏星穹铁道") || msg.content.includes("星铁")) {
        gid = 6;  // 崩坏星穹铁道
        logger.debug("匹配到 崩坏星穹铁道 -> gid = 6");
    } 
    else if (msg.content.includes("崩坏三") || msg.content.includes("崩三")) {
        gid = 1;  // 崩坏三
        logger.debug("匹配到 崩坏三 -> gid = 1");
    } 
    else if (msg.content.includes("原神")) {
        gid = 2;  // 原神
        logger.debug("匹配到 原神 -> gid = 2");
    } 
    else if (msg.content.includes("崩坏学园二") || msg.content.includes("崩坏二") || msg.content.includes("崩二")) {
        gid = 3;  // 崩坏二
        logger.debug("匹配到 崩坏二 -> gid = 3");
    } 
    else if (msg.content.includes("未定事件簿")) {
        gid = 4;  // 未定事件簿
        logger.debug("匹配到 未定事件簿 -> gid = 4");
    } 
    else if (msg.content.includes("大别野") || msg.content.includes("别野")) {
        gid = 5;  // 大别野
        logger.debug("匹配到 大别野 -> gid = 5");
    } 
    else if (msg.content.includes("绝区零")) {
        gid = 8;  // 绝区零
        logger.debug("匹配到 绝区零 -> gid = 8");
    }

    // 记录最终的gid值
    logger.debug(`最终匹配的gid值: ${gid}`);

    // 游戏前缀处理
    const gamePrefix = gid === 1 ? 'bbb' :
                       gid === 2 ? 'ys' :
                       gid === 3 ? 'bb' :
                       gid === 4 ? 'wd' :  // 确保未定事件簿匹配到 wd
                       gid === 5 ? 'dby' :
                       gid === 6 ? 'sr' :  // 崩坏星穹铁道 xq
                       gid === 8 ? 'zzz' :
                       'unknown'; 

    logger.debug(`设置的gamePrefix: ${gamePrefix}`);

    const value = msg.content.includes("开启");
    await redis.hSet(`config:${gamePrefix}newsPush`, parseInt(msg.channel_id), `${value}`)
        .then(() => {
            const gameName = gameIds[gid] || "未知游戏";
            const statusMessage = value 
                ? `${gameName}米游社公告推送已开启\n每1分钟自动检测一次是否存在新更新公告\n如有更新自动发送公告内容至此。` 
                : `${gameName}米游社公告推送已关闭`;

            // 发送状态信息
            msg.sendMsgEx({ content: statusMessage });
            const loggerMessage = value 
            ? `[${gameName}开启公告推送] changePushTask/mysNew.ts` 
            : `[${gameName}关闭公告推送] changePushTask/mysNew.ts`;

            logger.mark(loggerMessage)
        })
        .catch((err: any) => logger.error(err));
}

export async function taskPushNewsForGame(gid: number) {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const _newsPushChannels = await redis.hGetAll(`config:${getGamePrefix(gid)}newsPush`).catch((err: any) => { 
        logger.error(`Error fetching news push channels for gid ${gid}:`, err); 
    });

    if (!_newsPushChannels) return;

    const sendChannels: string[] = [];
    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] === "true") {
            sendChannels.push(channel);
        }
    }

    if (sendChannels.length === 0) return;

    const gameName = getGameName(gid);
    logger.debug(`${gameName} 官方公告检查中`);

    const ignoreReg = getIgnoreReg(gid);
    const pagesData = [
        { type: "公告", list: (await miGetNewsList(gid, 1))?.list },
        { type: "资讯", list: (await miGetNewsList(gid, 3))?.list }
    ];

    const postIds: string[] = [];
    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 3600) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) === "true") continue;
            await redis.set(`mysNews:${page.post.post_id}`, "true", { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }

    for (const postId of postIds) {
        const postFull = await miGetPostFull(gid, postId);
        if (!postFull) continue;

        const data = await detalData(postFull.post);
        await kazuha.render({
            app: "mys",
            type: "mysNew",
            imgType: "jpeg",
            render: { saveId: data.post.post_id },
            data: {
                dataConent: data.post.content,
                data,
            }
        }).then((savePath: any) => {
            if (savePath) {
                const _sendQueue: Promise<any>[] = [];
                for (const sendChannel of sendChannels) {
                    _sendQueue.push(sendImage({
                        msgId,
                        content: data.post.subject,
                        imagePath: savePath,
                        channelId: sendChannel,
                        messageType: "GUILD"
                    }));
                }
                logger.mark(kazuha.chalk.blueBright(`[${gameName}公告推送] taskPushNews/mysNew.ts`));
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch((err: any) => {
            logger.error(err);
        });
    }

    logger.debug(`${gameName} 官方公告检查完成`);
}
export async function taskPushNews() {
    const gameIds = [1, 2, 3, 4, 5, 6, 8];
    for (const gid of gameIds) {
        await taskPushNewsForGame(gid);
    }
}


export async function detalData(data: PostFullPost) {
    var json;
    try {
        json = JSON.parse(data.post.content);
    } catch (error) {

    }
    if (typeof json == "object") {
        if (json.imgs && json.imgs.length > 0) {
            for (const val of json.imgs) {
                data.post.content = ` <div class="ql-image-box"><img src="${val}?x-oss-process=image//resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg"></div>`;
            }
        }
    } else {
        for (const img of data.post.images) {
            data.post.content = data.post.content.replace(img, img + "?x-oss-process=image//resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg");
        }
        data.post.content = data.post.content.replace(/_\([^)]*\)/g, function (t, e) {
            t = t.replace(/_\(|\)/g, "");
            if (emoticon?.has(t)) {
                return `<img class="emoticon-image" src="${emoticon.get(t)}"/>`;
            } else {
                return "";
            }
        });
        var arrEntities: { [key: string]: string } = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
        data.post.content = data.post.content.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
            return arrEntities[t];
        });
    }
    (data.post as any).created_time = new Date(data.post.created_at * 1000).toLocaleString();
    for (const i in data.stat) {
        (data as any).stat[i] = data.stat[i] > 10000 ? (data.stat[i] / 10000).toFixed(2) + "万" : data.stat[i];
    }

    return data;
}


function getGameName(gid: number): string {
    const gameNames: { [key: number]: string } = {
        1: '崩坏三',
        2: '原神',
        3: '崩坏二',
        4: '未定事件簿',
        5: '大别野',
        6: '崩坏星穹铁道',
        8: '绝区零'
    };
    return gameNames[gid] || "未知游戏";
}

function getIgnoreReg(gid: number): RegExp {
    const ignoreRegs: { [key: number]: RegExp } = {
        1: /已开奖|封禁名单|商品资讯|活动资讯/,
        2: /已开奖|战绩|攻略|工具更新|积分赛|绘画征集|内容专题页|作品展示|开售|贩卖|新品|养成计算器|集中反馈|纪行|冒险助力|封禁名单|大别野/,
        3: /已开奖/,
        4: /已开奖/,
        5: /已开奖/,
        6: /已开奖|绘画征集|攻略|工具更新|新品|实物|展示视频|封禁|意见反馈|黑塔•协议|无名勋礼/,
        8: /已开奖|战绩|新品|攻略|丽都城募|商城/
    };
    return ignoreRegs[gid] || /大别野/;
}

function getGamePrefix(gid: number): string {
    const gamePrefixes: { [key: number]: string } = {
        1: "bbb",   // 崩坏3
        2: "ys",    // 原神
        3: "bb",    // 崩坏学园2
        4: "wd",    // 未定
        5: "dby",   // 大别野
        6: "sr",    // 星铁
        8: "zzz"    // 绝区零
    };

    return gamePrefixes[gid] || "unknown"
}