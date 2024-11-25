import logger from '../../lib/logger';
import { bbbtaskPushNews, bbtaskPushNews, dbytaskPushNews, srtaskPushNews, wdtaskPushNews, ystaskPushNews, zzztaskPushNews } from './models/task';

export const tasks = [
  { taskFunction: bbbtaskPushNews, cronExpression: '0/1 * * * * ?' },
  { taskFunction: bbtaskPushNews, cronExpression: '0/1 * * * * ?' },
  { taskFunction: ystaskPushNews, cronExpression: '0/1 * * * * ?' },
  { taskFunction: wdtaskPushNews, cronExpression: '0/1 * * * * ?' },
  { taskFunction: dbytaskPushNews, cronExpression: '0/1 * * * * ?' },
  { taskFunction: zzztaskPushNews, cronExpression: '0/1 * * * * ?' },
  { taskFunction: srtaskPushNews, cronExpression: '0/1 * * * * ?' },
]

logger.info('mihoyo 插件中的所有推送任务已注册');