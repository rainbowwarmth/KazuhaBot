// core/scheduler.js
import schedule from 'node-schedule'
import { getActiveTasks } from '../config/task.js'
import { logger } from '../config/logger.js'

// 任务缓存映射表
const taskRegistry = new Map()

export async function initScheduler() {
  const activeTasks = getActiveTasks()
  
  await Promise.all(
    activeTasks.map(task => 
      registerTask(task).catch(error => 
        logger.error(`任务 ${task.name} 注册失败:`, error)
      )
    )
  )
}

async function registerTask(task) {
  return new Promise((resolve, reject) => {
    try {
      const job = schedule.scheduleJob(task.cron, async () => {
        try {
          logger.debug(`⏰ 开始执行任务: ${task.name}`)
          await task.job()
          logger.debug(`✅ 任务完成: ${task.name}`)
        } catch (error) {
          logger.error(`❌ 任务失败 ${task.name}:`, error.stack)
        }
      })
      
      taskRegistry.set(task.name, job)
      logger.mark(`⏲ 已注册定时任务: ${task.name} (${task.cron})`)
      resolve(job)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 获取任务执行状态
 * @returns {Array<{name: string, nextRun: Date}>}
 */
export function getSchedulerStatus() {
  return Array.from(taskRegistry.entries()).map(([name, job]) => ({
    name,
    nextRun: job.nextInvocation(),
    state: job.pendingInvocations.length > 0 ? 'active' : 'idle'
  }))
}

/**
 * 手动触发任务执行
 * @param {string} taskName 
 */
export async function triggerTask(taskName) {
  const job = taskRegistry.get(taskName)
  if (!job) throw new Error('任务不存在')
  
  try {
    await job.invoke()
    return { success: true, message: `手动触发任务成功: ${taskName}` }
  } catch (error) {
    logger.error(`手动触发任务失败: ${taskName}`, error)
    return { success: false, message: error.message }
  }
}