import fetch from 'node-fetch'
import { config } from '../config/config.js'
import logger from '../config/logger.js'

/**
 * 检查是否使用外置浏览器
 */
async function renderinit(){
    if (config.render.useExternalBrowser) {
        const host = `${config.render.host}:${config.render.port}/ping`
        fetch(host)
          .then(response => {
            if (!response.ok) {
              throw new Error(`请求失败，状态码: ${response.status}`)
            }
            logger.mark('[Puppeteer]外部浏览器连接成功')
          })
          .catch(error => {
            logger.error('[Puppeteer]外置浏览器连接失败:', error)
            logger.error('正在退出程序')
            process.exit(1)
          });
      } else {
        continueProcess()
      }
}

/**
 * 打印使用内置浏览器
 */
function continueProcess() {
    logger.mark('[Puppeteer]未设置使用外置浏览器，使用内置浏览器');
}

export default renderinit