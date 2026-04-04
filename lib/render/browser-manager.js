import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import { config } from '../config/config.js'
import { logger } from '../config/logger.js'
import HttpClient from '../core/httpclient.js'
import { _path, redis } from '../global/global.js'

class BrowserManager {
  constructor() {
    this.browser = null
    this.cacheDir = path.join(process.env.HOME || process.env.USERPROFILE, '.cache', 'puppeteer')
    process.env.PUPPETEER_CACHE_DIR = this.cacheDir
    delete process.env.PUPPETEER_PRODUCT

    // 自定义渲染地址（唯一）
    this.renderUrl = config.render.url || ''
    this.useExternal = config.render.useExternalBrowser || false

    this.httpClient = new HttpClient({
      timeout: config.render.timeout * 1000,
      authHandler: () => {
        if (config.render.authorization) return { 'Authorization': config.render.authorization }
        return {}
      }
    })
  }

  async initialize() {
    if (this.browser) return
    if (this.useExternal) {
      await this._initExternal()
    } else {
      await this._initInternal()
    }
  }

  // 内置浏览器初始化
  async _initInternal() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox", "--single-process"]
      })
      this.browser.on('disconnected', () => {
        logger.error('内置浏览器实例断开')
        this.browser = null
      })
      logger.mark('✅ 内置浏览器启动成功')
    } catch (err) {
      logger.error('❌ 内置浏览器启动失败，自动切换外置模式', err.message)
      this.useExternal = true
      config.render.useExternalBrowser = true
    }
  }

  // 外置浏览器初始化 + 健康检测
  async _initExternal() {
    logger.debug('使用外部浏览器服务')

    if (!this.renderUrl) {
      const err = '外部渲染已启用，但未配置 render.url'
      logger.error(err)
      throw new Error(err)
    }

    // 启动时检测外置服务是否可用
    await this._checkExternalHealth()
  }

  // ======================
  // 外置服务健康检测
  // ======================
  async _checkExternalHealth() {
    try {
      logger.mark(`🔍 正在检测外部渲染服务：${this.renderUrl}`)
      
      // 发送一个最简单的 POST 检测
      const res = await this.httpClient.post(this.renderUrl, { test: true }, { timeout: 5000 })
      
      if (res.status >= 200 && res.status < 500) {
        logger.mark('✅ 外部渲染服务连接正常')
        return true
      } else {
        throw new Error(`服务响应异常，状态码：${res.status}`)
      }
    } catch (err) {
      logger.error(`❌ 外部渲染服务不可用：${err.message}`)
      logger.error(`请检查：${this.renderUrl} 是否启动`)
      
      // 强制切换回内置模式
      this.useExternal = false
      config.render.useExternalBrowser = false
      logger.mark('👉 已自动切换为内置浏览器模式')
      return false
    }
  }

  async createPage() {
    await this.initialize()
    if (this.useExternal) return null
    return this.browser ? await this.browser.newPage() : null
  }

  async internalScreenshot(page, savePath) {
    if (!page) throw new Error('内置浏览器不可用')
    await page.goto(`file://${this._normalizePath(savePath.html)}`, { waitUntil: 'networkidle2' })
    const container = await page.$('#container')
    return container.screenshot({ path: savePath.image, type: 'png', omitBackground: true })
  }
  
  async externalRender(params) {
    if (!this.useExternal) throw new Error('未启用外部渲染')
    try {
    const htmlPath = this._normalizePath(params.htmlPath)
    const savePath = params.savePath
    const payload = {
      file: `file://${htmlPath}`,
      pageGotoParams: { waitUntil: "networkidle2", ...params.pageGotoParams }
    }
    
    const response = await this.httpClient.post(this.renderUrl, payload)
    let buffer
    if (response.data?.status === true && response.data.data?.result) {
      buffer = Buffer.from(response.data.data.result, 'base64')
      fs.writeFileSync(savePath, buffer)
      return { path: savePath, buffer }
    }
    if (response.headers['content-type']?.startsWith('image/')) {
      buffer = response.data
      fs.writeFileSync(savePath, buffer)
      return { path: savePath, buffer }
    }

    throw new Error('不支持的响应格式')
  } catch (error) {
    logger.error('[外部渲染失败]', error.stack)
    throw error
  }
}

  _normalizePath(filePath) {
    return path.resolve(filePath).replace(/\\/g, '/').replace(/^file:\/\//, '')
  }

  async renderinit() {
    try {
      const KEY = 'KazuhaBot:puppeteer:version'
      let needInstall = true
      let platform = null
      let version = null

      const redisData = await redis.get(KEY)
      if (redisData) {
        try {
          const data = JSON.parse(redisData)
          platform = data.platform
          version = data.version

          if (platform && version) {
            const browserPath = path.join(this.cacheDir, 'chrome', `${platform}-${version}`)
            if (fs.existsSync(browserPath)) {
              logger.mark(`✅ Chrome 已存在 [Redis] → ${platform}-${version}`)
              needInstall = false
            }
          }
        } catch (e) {}
      }

      if (needInstall && !this.useExternal) {
        logger.mark('🖥 未找到 Chrome，开始安装...')
        execSync('npx puppeteer browsers install chrome', {
          stdio: 'ignore',
          windowsHide: true
        })

        if (process.platform === 'win32') platform = 'win64'
        else if (process.platform === 'darwin') platform = 'mac'
        else platform = 'linux'

        const chromeDir = path.join(this.cacheDir, 'chrome')
        if (fs.existsSync(chromeDir)) {
          const dirs = fs.readdirSync(chromeDir)
          const target = dirs.find(d => d.startsWith(`${platform}-`))
          if (target) {
            version = target.replace(`${platform}-`, '')
          }
        }

        if (platform && version) {
          await redis.set(KEY, JSON.stringify({ platform, version }))
          logger.mark(`✅ 安装完成，已写入Redis → ${platform}-${version}`)
        }
      }

      this.useExternal
        ? logger.mark('✅ 当前模式：外置浏览器')
        : logger.mark('✅ 当前模式：内置浏览器')

    } catch (e) {
      logger.error('⚠️ 初始化失败，自动切换外置', e.message)
      this.useExternal = true
      config.render.useExternalBrowser = true
    }
  }
}

export const browserManager = new BrowserManager()