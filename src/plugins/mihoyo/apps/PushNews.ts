import { redis } from "@src/lib/global";
import { render } from "@src/lib/render";
import { detalData } from "@plugin/mihoyo/apps/mysNew";
import { sendImage } from "@src/lib/IMessageEx";
import logger from "@src/lib/logger";
import { bbbmiGetNewsList, bbbmiGetPostFull, bbmiGetNewsList, bbmiGetPostFull, dbymiGetNewsList, dbymiGetPostFull, srmiGetNewsList, srmiGetPostFull, wdmiGetNewsList, wdmiGetPostFull, ysmiGetNewsList, ysmiGetPostFull, zzzmiGetNewsList, zzzmiGetPostFull } from "@plugin/mihoyo/models/mysApi";
import kazuha from "@src/kazuha";

export async function bbbtaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:bbbnewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`崩坏3官方公告检查中`);
    const ignoreReg = /已开奖|封禁名单|商品资讯|活动资讯/;
    const pagesData = [{ type: "公告", list: (await bbbmiGetNewsList(1))?.list }, { type: "资讯", list: (await bbbmiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await bbbmiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[崩坏三公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`崩坏3官方公告检查完成`);
}

export async function ystaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:ysnewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`原神官方公告检查中`);
    const ignoreReg = /已开奖|战绩|攻略|工具更新|积分赛|绘画征集|内容专题页|作品展示|开售|贩卖|新品|养成计算器|集中反馈|纪行|冒险助力|封禁名单|大别野/;
    const pagesData = [{ type: "公告", list: (await ysmiGetNewsList(1))?.list }, { type: "资讯", list: (await ysmiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await ysmiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[原神公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`原神官方公告检查完成`);
}

export async function bbtaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:bbnewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`崩坏学园2官方公告检查中`);
    const ignoreReg = /已开奖/;
    const pagesData = [{ type: "公告", list: (await bbmiGetNewsList(1))?.list }, { type: "资讯", list: (await bbmiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await bbmiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[崩坏学圆2公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`崩坏学园2官方公告检查完成`);
}

export async function wdtaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:wdnewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`未定事件簿官方公告检查中`);
    const ignoreReg = /已开奖/;
    const pagesData = [{ type: "公告", list: (await wdmiGetNewsList(1))?.list }, { type: "资讯", list: (await wdmiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await wdmiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[未定事件簿公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`未定事件簿官方公告检查完成`);
}

export async function dbytaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:dbynewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`大别野官方公告检查中`);
    const ignoreReg = /已开奖/;
    const pagesData = [{ type: "公告", list: (await dbymiGetNewsList(1))?.list }, { type: "资讯", list: (await dbymiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await dbymiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[大别野公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`大别野官方公告检查完成`);
}

export async function srtaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:srnewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`崩坏星穹铁道官方公告检查中`);
    const ignoreReg = /已开奖|绘画征集|攻略|工具更新|新品|实物|展示视频|封禁|意见反馈|黑塔•协议|无名勋礼/;
    const pagesData = [{ type: "公告", list: (await srmiGetNewsList(1))?.list }, { type: "资讯", list: (await srmiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await srmiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[崩坏星穹铁道公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`崩坏星穹铁道官方公告检查完成`);
}

export async function zzztaskPushNews() {
    const msgId = await redis.get("lastestMsgId");
    if (!msgId) return;

    const sendChannels: string[] = [];
    const _newsPushChannels = await redis.hGetAll("config:zzznewsPush").catch(err => { logger.error(err); });
    if (!_newsPushChannels) return;

    for (const channel in _newsPushChannels) {
        if (_newsPushChannels[channel] == "true")
            sendChannels.push(channel);
    }
    if (sendChannels.length == 0) return;

    logger.debug(`绝区零官方公告检查中`);
    const ignoreReg = /已开奖|战绩|新品|攻略|丽都城募|商城/;
    const pagesData = [{ type: "公告", list: (await zzzmiGetNewsList(1))?.list }, { type: "资讯", list: (await zzzmiGetNewsList(3))?.list }];
    const postIds: string[] = [];

    for (const pageData of pagesData) {
        if (!pageData.list) continue;
        for (const page of pageData.list) {
            if (ignoreReg.test(page.post.subject)) continue;
            if (new Date().getTime() / 1000 - page.post.created_at > 79862) continue;
            if (await redis.get(`mysNews:${page.post.post_id}`) == `${true}`) continue;
            await redis.set(`mysNews:${page.post.post_id}`, `${true}`, { EX: 3600 * 2 });
            postIds.push(page.post.post_id);
        }
    }
    for (const postId of postIds) {
        const postFull = await zzzmiGetPostFull(postId);
        if (!postFull) return;
        const data = await detalData(postFull.post);
        //log.debug(data);
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
                logger.mark(kazuha.chalk.blueBright(`[绝区零公告推送] taskPushNews/mysNew.js`))
                return Promise.all(_sendQueue).catch(err => {
                    logger.error(err);
                });
            }
        }).catch(err => {
            logger.error(err);
        });
    }

    logger.debug(`崩坏星穹铁道绝区零官方公告检查完成`);
}