import schedule from 'node-schedule';
import logger from '@src/lib/config/logger';
import { bbbtaskPushNews, bbtaskPushNews, dbytaskPushNews, srtaskPushNews, wdtaskPushNews, ystaskPushNews, zzztaskPushNews } from '@src/plugins/mihoyo/apps/mysNew';
async function Task() {
    logger.info('初始化：正在创建定时任务');
    ////崩坏2公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => bbtaskPushNews());
    ////崩坏3公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => bbbtaskPushNews());
    ////原神公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => ystaskPushNews());
    ////星铁公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => srtaskPushNews());
    ////未定公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => wdtaskPushNews());
    ////绝区零公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => zzztaskPushNews());
    ////大别野公告推送
    schedule.scheduleJob("0/1 * * * * ?  ", () => dbytaskPushNews());
}

export default Task;