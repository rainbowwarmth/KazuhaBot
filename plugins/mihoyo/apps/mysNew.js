import { sendImage } from "../../../lib/core/IMessageEx.js";
import { redis } from '../../../lib/global/global.js';
import { miGetNewsList, miGetPostFull } from "../../mihoyo/models/mysNew.js";
import render from "../../../lib/render/render.js";
import { bbbmiGetNewsList, bbbmiGetPostFull, bbmiGetNewsList, bbmiGetPostFull, dbymiGetNewsList, dbymiGetPostFull, srmiGetNewsList, srmiGetPostFull, wdmiGetNewsList, wdmiGetPostFull, ysmiGetNewsList, ysmiGetPostFull, zzzmiGetNewsList, zzzmiGetPostFull } from "../../mihoyo/models/mysNew.js";
const emoticon = null;
const gameIds = {
    1: '崩坏三', 2: '原神', 3: '崩坏二', 4: '未定事件簿', 5: '大别野', 6: '崩坏星穹铁道', 8: '绝区零'
};
const gamePrefixes = {
    1: "bbb", 2: "ys", 3: "bb", 4: "wd", 5: "dby", 6: "sr", 8: "zzz"
};
const gameKeywords = [
    { id: 6, name: "崩坏星穹铁道", keywords: ["崩坏星穹铁道", "星铁"] },
    { id: 1, name: "崩坏三", keywords: ["崩坏三", "崩三"] },
    { id: 2, name: "原神", keywords: ["原神"] },
    { id: 3, name: "崩坏二", keywords: ["崩坏学园二", "崩坏二", "崩二"] },
    { id: 4, name: "未定事件簿", keywords: ["未定事件簿"] },
    { id: 5, name: "大别野", keywords: ["大别野", "别野"] },
    { id: 8, name: "绝区零", keywords: ["绝区零"] }
];
const typeKeywords = [
    { type: 1, name: "公告", keywords: ["公告"] },
    { type: 3, name: "资讯", keywords: ["资讯"] },
    { type: 2, name: "活动", keywords: ["活动"] }
];
function getGameIdAndName(content) {
    for (const game of gameKeywords) {
        if (game.keywords.some(keyword => content.includes(keyword))) {
            return { gid: game.id, gameName: game.name };
        }
    }
    return { gid: 2, gameName: "原神" };
}
function getTypeAndName(content) {
    for (const type of typeKeywords) {
        if (type.keywords.some(keyword => content.includes(keyword))) {
            return { type: type.type, typeName: type.name };
        }
    }
    return { type: 1, typeName: "公告" };
}
async function handleNewsContent(msg, gid, type, page) {
    const pagesData = await miGetNewsList(gid, type);
    if (!pagesData)
        return;
    if (page <= 0 || page > pagesData.list.length) {
        msg.sendMsgEx({ content: "目前只查前10条最新的公告，请输入1-10之间的整数。" });
        return true;
    }
    const postFull = await miGetPostFull(gid, pagesData.list[page - 1].post.post_id);
    if (!postFull)
        return;
    const data = await detalData(postFull.post);
    render({
        app: "mys",
        type: "mysNew",
        imgType: "jpeg",
        render: { saveId: msg.author.id },
        data: { dataConent: data.post.content, data }
    }).then(savePath => {
        if (savePath)
            msg.sendMsgEx({ content: data.post.subject, imagePath: savePath });
        logger.mark(chalk.blueBright(`[${gameIds[gid]}公告] newsContentBBS/mysNew.js`));
    }).catch(logger.error);
}
async function handleNewsList(msg, gid, gameName, type, typeName) {
    const data = await miGetNewsList(gid, type);
    if (!data)
        return;
    const datas = data.list;
    if (datas.length === 0)
        return true;
    datas.forEach(element => {
        element.post.created_at = new Date(element.post.created_at * 1000).toLocaleString();
    });
    await render({
        app: "mys",
        type: "mysNewList",
        imgType: "jpeg",
        render: { saveId: msg.author.id },
        data: { datas, typeName, gameName }
    }).then(savePath => {
        if (savePath)
            msg.sendMsgEx({ imagePath: savePath });
        logger.mark(chalk.blueBright(`[${gameName}${typeName}列表] newListBBS/mysNew.js`));
    }).catch(logger.error);
}
export async function newsContentBBS(msg) {
    logger.mark(`[${msg.guild_name}-${msg.channel_name}(${msg.guild_id}-${msg.channel_id}), ${msg.author.username}(${msg.author.id})][${msg.content}]`);
    const { gid } = getGameIdAndName(msg.content);
    const { type } = getTypeAndName(msg.content);
    const page = parseInt(msg.content.match(/[0-9]+/)?.[0] || "1");
    await handleNewsContent(msg, gid, type, page);
}
export async function newsListBBS(msg) {
    logger.mark(`[${msg.guild_name}-${msg.channel_name}(${msg.guild_id}-${msg.channel_id}), ${msg.author.username}(${msg.author.id})][${msg.content}]`);
    const { gid, gameName } = getGameIdAndName(msg.content);
    const { type, typeName } = getTypeAndName(msg.content);
    await handleNewsList(msg, gid, gameName, type, typeName);
}
export async function changePushTask(msg) {
    logger.mark(`[${msg.guild_name}-${msg.channel_name}(${msg.guild_id}-${msg.channel_id}), ${msg.author.username}(${msg.author.id})][${msg.content}]`);
    if (msg.messageType !== "GUILD")
        return true;
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
        .catch(logger.error);
}
async function taskPushNews(gamePrefix, getNewsList, getPostFull, ignoreReg, logMessage) {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId)
        return;
    const sendChannels = await redis.hGetAll(`config:${gamePrefix}newsPush`).then(channels => Object.keys(channels).filter(channel => channels[channel] === "true")).catch(logger.error);
    if (!sendChannels || !sendChannels.length)
        return;
    logger.debug(logMessage);
    const pagesData = [{ type: "公告", list: (await getNewsList(1))?.list }, { type: "资讯", list: (await getNewsList(3))?.list }];
    const postIds = [];
    for (const pageData of pagesData) {
        if (!pageData.list)
            continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject) || new Date().getTime() / 1000 - page.post.created_at > 3600 || await redis.get(`mysNews:${page.post.post_id}`) === "true")
                continue;
            await redis.set(`mysNews:${page.post.post_id}`, "true", { EX: 7200 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await getPostFull(postId);
        if (!postFull)
            return;
        const data = await detalData(postFull.post);
        await render({
            app: "mys",
            type: "mysNew",
            imgType: "jpeg",
            render: { saveId: data.post.post_id },
            data: { dataConent: data.post.content, data }
        }).then(savePath => {
            if (savePath) {
                const sendQueue = sendChannels.map((channel) => sendImage({
                    msgId,
                    content: data.post.subject,
                    imagePath: savePath,
                    channelId: channel,
                    messageType: "GUILD"
                }));
                logger.mark(chalk.blueBright(`[${logMessage}] taskPushNews/mysNew.js`));
                return Promise.all(sendQueue).catch(logger.error);
            }
        }).catch(logger.error);
    }
    logger.debug(`${logMessage}检查完成`);
}
export const bbbtaskPushNews = () => taskPushNews("bbb", bbbmiGetNewsList, bbbmiGetPostFull, /已开奖|封禁名单|商品资讯|活动资讯|反馈/, "崩坏三官方公告推送");
export const ystaskPushNews = () => taskPushNews("ys", ysmiGetNewsList, ysmiGetPostFull, /手办|突围赛|揭晓|公开赛|枫达杯|生日月历|征集活动|亮相|版本内容页|周边|贩售|已开奖|绘画|战绩|攻略|工具更新|积分赛|绘画征集|内容专题页|作品展示|开售|贩卖|新品|养成计算器|集中反馈|纪行|冒险助力|封禁名单|大别野/, "原神官方公告推送");
export const bbtaskPushNews = () => taskPushNews("bb", bbmiGetNewsList, bbmiGetPostFull, /已开奖|反馈/, "崩坏学园2官方公告推送");
export const wdtaskPushNews = () => taskPushNews("wd", wdmiGetNewsList, wdmiGetPostFull, /已开奖|反馈/, "未定事件簿官方公告推送");
export const dbytaskPushNews = () => taskPushNews("dby", dbymiGetNewsList, dbymiGetPostFull, /已开奖|反馈/, "大别野官方公告推送");
export const srtaskPushNews = () => taskPushNews("sr", srmiGetNewsList, srmiGetPostFull, /已开奖|绘画征集|攻略|工具更新|新品|实物|展示视频|封禁|意见反馈|黑塔•协议|无名勋礼|反馈/, "崩坏星穹铁道官方公告推送");
export const zzztaskPushNews = () => taskPushNews("zzz", zzzmiGetNewsList, zzzmiGetPostFull, /已开奖|战绩|新品|攻略|丽都城募|商城|反馈/, "绝区零官方公告推送");
export async function detalData(data) {
    let json;
    try {
        json = JSON.parse(data.post.content);
    }
    catch { }
    if (typeof json === "object" && json.imgs?.length) {
        json.imgs.forEach((val) => {
            data.post.content = ` <div class="ql-image-box"><img src="${val}?x-oss-process=image//resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg"></div>`;
        });
    }
    else {
        data.post.images.forEach(img => {
            data.post.content = data.post.content.replace(img, `${img}?x-oss-process=image//resize,s_600/quality,q_80/auto-orient,0/interlace,1/format,jpg`);
        });
        data.post.content = data.post.content.replace(/_\([^)]*\)/g, t => {
            t = t.replace(/_\(|\)/g, "");
            return emoticon?.has(t) ? `<img class="emoticon-image" src="${emoticon.get(t)}"/>` : "";
        });
        const arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
        data.post.content = data.post.content.replace(/&(lt|gt|nbsp|amp|quot);/ig, (_, t) => arrEntities[t]);
    }
    data.post.created_at = new Date(data.post.created_at * 1000).toLocaleString();
    Object.keys(data.stat).forEach(key => {
        data.stat[key] = data.stat[key] > 10000 ? parseFloat((data.stat[key] / 10000).toFixed(2)) : data.stat[key];
    });
    return data;
}
