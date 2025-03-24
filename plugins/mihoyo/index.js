import { 
    bbtaskPushNews, bbbtaskPushNews, 
    ystaskPushNews, srtaskPushNews, 
    wdtaskPushNews, zzztaskPushNews, 
    dbytaskPushNews } from '../../plugins/mihoyo/apps/mysNew.js'

export default class mihoyo {
    Tasks() {
        return [
            {
                name: '崩坏2公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行崩坏2公告检查')
                  await bbtaskPushNews()
                }
              },
              {
                name: '崩坏3公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行崩坏3公告检查')
                  await bbbtaskPushNews()
                }
              },
              {
                name: '原神公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行原神公告检查')
                  await ystaskPushNews()
                }
              },
              {
                name: '星穹铁道公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行星铁公告检查')
                  await srtaskPushNews()
                }
              },
              {
                name: '未定公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行未定公告检查')
                  await wdtaskPushNews()
                }
              },
              {
                name: '绝区零公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行绝区零公告检查')
                  await zzztaskPushNews()
                }
              },
              {
                name: '大别野公告',
                cron: '0 0/1 * * * ?',
                job: async () => {
                  logger.debug('开始执行大别野公告检查')
                  await dbytaskPushNews()
                },
              }
        ]
    }
}