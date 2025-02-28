import { IMessageEx, sendImage } from "@src/lib/core/IMessageEx";
import { redis } from '@src/lib/global/global';
import { miGetNewsList, miGetPostFull, PostFullPost } from "@plugin/mihoyo/models/mysNew";
import render from "@src/lib/render/render";
import { bbbmiGetNewsList, bbbmiGetPostFull, bbmiGetNewsList, bbmiGetPostFull, dbymiGetNewsList, dbymiGetPostFull, srmiGetNewsList, srmiGetPostFull, wdmiGetNewsList, wdmiGetPostFull, ysmiGetNewsList, ysmiGetPostFull, zzzmiGetNewsList, zzzmiGetPostFull } from "@plugin/mihoyo/models/mysNew";

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

const gamePrefixes: { [key: number]: string } = {
    1: "bbb",
    2: "ys",
    3: "bb",
    4: "wd",
    5: "dby",
    6: "sr",
    8: "zzz"
};

function getGameIdAndName(content: string): { gid: number, gameName: string } {
    if (content.includes("崩坏星穹铁道") || content.includes("星铁")) return { gid: 6, gameName: "崩坏星穹铁道" };
    if (content.includes("崩坏三") || content.includes("崩三")) return { gid: 1, gameName: "崩坏三" };
    if (content.includes("原神")) return { gid: 2, gameName: "原神" };
    if (content.includes("崩坏学园二") || content.includes("崩坏二") || content.includes("崩二")) return { gid: 3, gameName: "崩坏二" };
    if (content.includes("未定事件簿")) return { gid: 4, gameName: "未定事件簿" };
    if (content.includes("大别野") || content.includes("别野")) return { gid: 5, gameName: "大别野" };
    if (content.includes("绝区零")) return { gid: 8, gameName: "绝区零" };
    return { gid: 2, gameName: "原神" };
}

function getTypeAndName(content: string): { type: number, typeName: string } {
    if (content.includes("公告")) return { type: 1, typeName: "公告" };
    if (content.includes("资讯")) return { type: 3, typeName: "资讯" };
    if (content.includes("活动")) return { type: 2, typeName: "活动" };
    return { type: 1, typeName: "公告" };
}

export async function handleNewsContent(msg: IMessageEx, gid: number, type: number, page: number) {
    const pagesData = await miGetNewsList(gid, type);
    if (!pagesData) return;

    if (page <= 0 || page > pagesData.list.length) {
        msg.sendMsgEx({ content: "目前只查前10条最新的公告，请输入1-10之间的整数。" });
        return true;
    }

    const postFull = await miGetPostFull(gid, pagesData.list[page - 1].post.post_id);
    if (!postFull) return;

    const data = await detalData(postFull.post);
    render({
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
        logger.mark(chalk.blueBright(`[${gameIds[gid]}公告] newsContentBBS/mysNew.js`));
    }).catch((err: any) => {
        logger.error(err);
    });
}

export async function handleNewsList(msg: IMessageEx, gid: number, gameName: string, type: number, typeName: string) {
    const data = await miGetNewsList(gid, type);
    if (!data) return;

    const datas = data.list;
    if (datas.length === 0) return true;

    datas.forEach((element: { post: { created_at: number; }; }) => {
        (element.post as any).created_at = new Date(element.post.created_at * 1000).toLocaleString();
    });

    await render({
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
        logger.mark(chalk.blueBright(`[${gameName}${typeName}列表] newListBBS/mysNew.js`));
    }).catch((err: any) => {
        logger.error(err);
    });
}

export async function newsContentBBS(msg: IMessageEx) {
    logger.mark(`[${msg.guild_name}-${msg.channel_name}(${msg.guild_id}-${msg.channel_id}), ${msg.author.username}(${msg.author.id})][${msg.content}]`);
    const { gid } = getGameIdAndName(msg.content);
    const { type } = getTypeAndName(msg.content);
    const _page = msg.content.match(/[0-9]+/);
    const page = _page ? parseInt(_page[0]) : 1;
    await handleNewsContent(msg, gid, type, page);
}

export async function newsListBBS(msg: IMessageEx) {
    logger.mark(`[${msg.guild_name}-${msg.channel_name}(${msg.guild_id}-${msg.channel_id}), ${msg.author.username}(${msg.author.id})][${msg.content}]`);
    const { gid, gameName } = getGameIdAndName(msg.content);
    const { type, typeName } = getTypeAndName(msg.content);
    await handleNewsList(msg, gid, gameName, type, typeName);
}

export async function changePushTask(msg: IMessageEx) {
    logger.mark(`[${msg.guild_name}-${msg.channel_name}(${msg.guild_id}-${msg.channel_id}), ${msg.author.username}(${msg.author.id})][${msg.content}]`);
    if (msg.messageType !== "GUILD") return true;
    const { gid } = getGameIdAndName(msg.content);
    const gamePrefix = gamePrefixes[gid] || "unknown";
    const value = msg.content.includes("开启");
    await redis.hSet(`config:${gamePrefix}newsPush`, parseInt(msg.channel_id), `${value}`)
        .then(() => {
            const gameName = gameIds[gid] || "未知游戏";
            const statusMessage = value
                ? `${gameName}米游社公告推送已开启\n每1分钟自动检测一次是否存在新更新公告\n如有更新自动发送公告内容至此。`
                : `${gameName}米游社公告推送已关闭`;

            msg.sendMsgEx({ content: statusMessage });
            const loggerMessage = value
                ? `[${gameName}开启公告推送] changePushTask/mysNew.js`
                : `[${gameName}关闭公告推送] changePushTask/mysNew.js`;

            logger.mark(loggerMessage);
        })
        .catch((err: any) => logger.error(err));
}

export async function taskPushNews(gamePrefix: string, getNewsList: Function, getPostFull: Function, ignoreReg: RegExp, logMessage: string) {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll(`config:${gamePrefix}newsPush`).catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(logMessage);
    const pagesData = [{ type: "公告", list: (await getNewsList(1))?.list }, { type: "资讯", list: (await getNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 3600) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await getPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        await render({
            app: "mys",
            type: "mysNew",
            imgType: "jpeg",
            render: { saveId: data.post.post_id },
            data: {
                dataConent: data.post.content,
                data,
            }
        }).then(savePath => {
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
                logger.mark(chalk.blueBright(`[${logMessage}] taskPushNews/mysNew.js`));
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`${logMessage}检查完成`);
}

export async function bbbtaskPushNews() {
    await taskPushNews("bbb", bbbmiGetNewsList, bbbmiGetPostFull, /已开奖|封禁名单|商品资讯|活动资讯|近期更新|征集活动/, "崩坏三官方公告检查中");
}

export async function ystaskPushNews() {
    await taskPushNews("ys", ysmiGetNewsList, ysmiGetPostFull, /已开奖|战绩|攻略|工具更新|积分赛|绘画征集|内容专题页|作品展示|开售|贩卖|新品|养成计算器|集中反馈|纪行|冒险助力|封禁名单|大别野/, "原神官方公告检查中");
}

export async function bbtaskPushNews() {
    await taskPushNews("bb", bbmiGetNewsList, bbmiGetPostFull, /已开奖/, "崩坏学园2官方公告检查中");
}

export async function wdtaskPushNews() {
    await taskPushNews("wd", wdmiGetNewsList, wdmiGetPostFull, /已开奖/, "未定事件簿官方公告检查中");
}

export async function dbytaskPushNews() {
    await taskPushNews("dby", dbymiGetNewsList, dbymiGetPostFull, /已开奖/, "大别野官方公告检查中");
}

export async function srtaskPushNews() {
    await taskPushNews("sr", srmiGetNewsList, srmiGetPostFull, /已开奖|绘画征集|攻略|工具更新|新品|实物|展示视频|封禁|意见反馈|黑塔•协议|无名勋礼/, "崩坏星穹铁道官方公告检查中");
}

export async function zzztaskPushNews() {
    await taskPushNews("zzz", zzzmiGetNewsList, zzzmiGetPostFull, /已开奖|战绩|新品|攻略|丽都城募|商城/, "绝区零官方公告检查中");
}

export async function detalData(data: PostFullPost) {
    var json;
    try {
        json = JSON.parse(data.post.content);
    } catch (error) { }

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
