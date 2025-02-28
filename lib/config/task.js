// config/tasks.js
import { bbtaskPushNews, bbbtaskPushNews, ystaskPushNews, srtaskPushNews, wdtaskPushNews, zzztaskPushNews, dbytaskPushNews } from '../../plugins/mihoyo/apps/mysNew.js'
import { logger } from './logger.js'

/**
 * 定时任务配置项说明：
 * @typedef {Object} ScheduledTask
 * @property {string} name - 任务显示名称
 * @property {string} cron - cron表达式 (秒 分 时 日 月 周)
 * @property {Function} job - 任务执行函数
 * @property {boolean} [enabled=true] - 是否启用任务
 */

/**​ 
 * 游戏公告推送任务配置
 * @type {ScheduledTask[]} 
 */
export const newsTasks = [
  {
    name: '崩坏2公告',
    cron: '0/1 * * * * ?', // 每30分钟执行
    job: async () => {
      logger.debug('开始执行崩坏2公告检查')
      await bbtaskPushNews()
    }
  },
  {
    name: '崩坏3公告',
    cron: '0/1 * * * * ?',
    job: async () => {
      logger.debug('开始执行崩坏3公告检查')
      await bbbtaskPushNews()
    }
  },
  {
    name: '原神公告',
    cron: '0/1 * * * * ?',
    job: async () => {
      logger.debug('开始执行原神公告检查')
      await ystaskPushNews()
    }
  },
  {
    name: '星穹铁道公告',
    cron: '0/1 * * * * ?',
    job: async () => {
      logger.debug('开始执行星铁公告检查')
      await srtaskPushNews()
    }
  },
  {
    name: '未定公告',
    cron: '0/1 * * * * ?',
    job: async () => {
      logger.debug('开始执行未定公告检查')
      await wdtaskPushNews()
    }
  },
  {
    name: '绝区零公告',
    cron: '0/1 * * * * ?',
    job: async () => {
      logger.debug('开始执行绝区零公告检查')
      await zzztaskPushNews()
    }
  },
  {
    name: '大别野公告',
    cron: '0/1 * * * * ?',
    job: async () => {
      logger.debug('开始执行大别野公告检查')
      await dbytaskPushNews()
    },
    enabled: process.env.NODE_ENV === 'production' // 仅生产环境启用
  }
]

/**
 * 获取激活的任务列表
 * @returns {ScheduledTask[]}
 */
export function getActiveTasks() {
  return newsTasks.filter(task => task.enabled !== false)
}

// 时区校验（中国时区）
if (Intl.DateTimeFormat().resolvedOptions().timeZone !== 'Asia/Shanghai') {
  logger.warn('⚠️  系统时区非中国时区，定时任务执行时间可能与预期不符')
}