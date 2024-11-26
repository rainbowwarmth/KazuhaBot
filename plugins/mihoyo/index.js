import { bbbtaskPushNews, bbtaskPushNews, dbytaskPushNews, srtaskPushNews, wdtaskPushNews, ystaskPushNews, zzztaskPushNews } from '../mihoyo/apps/mysNew.js';
import logger from '../../lib/logger.js';
export const tasks = [
    { taskFunction: ystaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: bbbtaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: bbtaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: ystaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: wdtaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: dbytaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: zzztaskPushNews, cronExpression: '0/1 * * * * ?' },
    { taskFunction: srtaskPushNews, cronExpression: '0/1 * * * * ?' },
];
logger.info('mihoyo 插件定时任务注册成功');
