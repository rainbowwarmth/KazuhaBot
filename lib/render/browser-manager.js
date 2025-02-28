// browser-manager.js
import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'
import { config } from '../config/config.js'
import { logger } from '../config/logger.js'
import HttpClient from '../core/HttpClient.js'

class BrowserManager {
  constructor() {
    this.browser = null
    this.httpClient = new HttpClient({
      baseURL: `${config.render.host}:${config.render.port}`,
      timeout: config.render.timeout * 1000,
      authHandler: () => ({
        'Authorization': config.render.authorization
      })
    })
  }

  /**​ 统一初始化方法 */
  async initialize() {
    if (this.browser) return
    
    if (config.render.useExternalBrowser) {
      await this._initExternal()
    } else {
      await this._initInternal()
    }
  }

  /**​ 初始化内置浏览器 */
  async _initInternal() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--single-process"
      ]
    })

    this.browser.on('disconnected', () => {
      logger.error('内置浏览器实例断开')
      this.browser = null
    })
  }

  /**​ 初始化外部浏览器服务 */
  async _initExternal() {
    logger.debug('使用外部浏览器服务')
  }

  /**​ 创建页面 */
  async createPage() {
    await this.initialize()
    return config.render.useExternalBrowser 
      ? this._createExternalPage()
      : this.browser.newPage()
  }

  /**​ 内置浏览器截图方法 */
  async internalScreenshot(page, savePath) {
    await page.goto(`file://${this._normalizePath(savePath.html)}`, {
      waitUntil: 'networkidle2'
    })
    
    const container = await page.$('#container')
    return container.screenshot({
      path: savePath.image,
      type: 'png',
      omitBackground: true
    })
  }

  /**​ 外部浏览器渲染方法 */
  async externalRender(params) {
    let response;
    try {
      // 生成标准化路径
      const htmlPath = params.htmlPath
      const savePath = (params.savePath)

      // 构造请求参数
      const payload = {
        file: `file://${htmlPath}`,
        pageGotoParams: {
          waitUntil: "networkidle2",
          ...params.pageGotoParams
        }
      }

      logger.debug('[渲染请求]', { payload })

      // 发送渲染请求
      response = await this.httpClient.post('/puppeteer', payload, {
        headers: {
          'Content-Type': 'application/json',
          'authorization': config.render.authorization
        }
      })
  
      // 处理二进制响应（现在 response.data 已经是 Buffer 类型）
      if (response.headers['content-type']?.startsWith('image/')) {
        fs.writeFileSync(params.savePath, response.data)
        return { 
          path: params.savePath,
          buffer: response.data
        }
      }
  
      // 处理JSON响应
      if (response.headers['content-type']?.includes('application/json')) {
        if (response.data?.success && response.data.screenshotPath) {
          fs.renameSync(response.data.screenshotPath, params.savePath)
          return { 
            path: params.savePath,
            buffer: fs.readFileSync(params.savePath)
          }
        }
      }
  
      throw new Error(`不支持的响应类型: ${response.headers['content-type']}`)
    } catch (error) {
      logger.error('[外部渲染失败]', {
        error: error.stack,
        request: payload,
        response: response ? {
          status: response.status,
          headers: response.headers,
          data: response.data?.toString('hex').substring(0, 40) + '...'
        } : null
      })
      throw error
    }
  }

  /**​ 路径标准化处理 */
  _normalizePath(filePath) {
    return path.resolve(filePath)
      .replace(/\\/g, '/')          // 统一斜杠方向
      .replace(/^file:\/\//, '')    // 移除协议头
      .replace(/\/+/g, '/')         // 合并重复斜杠
  }

  async renderinit() {
    let response
    if(config.render.useExternalBrowser = false) {
      logger.mark('未使用外置浏览器，内置浏览器启用中')
    } else {
      response = await this.httpClient.get('/ping', {})

      if(response.status == '200') {
        logger.mark('外置浏览器连接成功')
      } else {
        logger.error('外置浏览器连接失败')
        process.exit(1)
      }
    }
  }
}

export const browserManager = new BrowserManager()