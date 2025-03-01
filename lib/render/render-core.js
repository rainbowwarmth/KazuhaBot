// render-core.js
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import template from 'art-template'
import sharp from 'sharp'
import { browserManager } from './browser-manager.js'
import { config } from '../config/config.js'

class RenderCore {
  constructor() {
    this.templateCache = new Map()
  }

  async render(renderData) {
    const { app, type, data } = renderData
    try {
      // 解析模板路径
      const templatePath = this._resolveTemplatePath(renderData)
      
      // 生成保存路径
      const savePath = this._generatePaths(renderData)
      
      // 渲染HTML
      await this._renderHTML(templatePath, savePath.html, data)
      
      // 执行截图
      return config.render.useExternalBrowser 
        ? await this._externalRender(savePath)
        : await this._internalRender(savePath)
    } catch (error) {
      logger.error(`[${app}.${type}] 渲染失败:`, error)
      throw error
    }
  }

  /**​ 内置浏览器渲染流程 */
  async _internalRender(savePath) {
    const page = await browserManager.createPage()
    try {
      await browserManager.internalScreenshot(page, savePath)
      await this._optimizeImage(savePath.image)
      return savePath.image
    } finally {
      await page.close()
    }
  }

  /**​ 外部服务渲染流程 */
  async _externalRender(savePath) {
    const result = await browserManager.externalRender({
      htmlPath: savePath.html,
      savePath: savePath.image
    })
    
    if (result.buffer) {
      await fsp.writeFile(savePath.image, result.buffer)
    }
    return savePath.image
  }

  /**​ 模板路径解析 */
  _resolveTemplatePath({ app, type, render }) {
    const basePath = path.join(process.cwd(), 'plugins')
    const pluginDirs = fs.readdirSync(basePath)
      .filter(file => {
        const fullPath = path.join(basePath, file)
        return fs.statSync(fullPath).isDirectory()
      })
      .filter(plugin => !['system', 'example'].includes(plugin))

    for (const plugin of pluginDirs) {
      const templateFile = render?.template 
        ? path.join(plugin, 'resources', 'html', app, type, `${render.template}.html`)
        : path.join(plugin, 'resources', 'html', app, type, 'index.html')

      const fullPath = path.join(basePath, templateFile)
      if (fs.existsSync(fullPath)) return fullPath
    }

    throw new Error(`未找到模板文件 [${app}/${type}]`)
  }

  /**​ 生成文件路径 */
  _generatePaths({ app, type, render }) {
    const baseDir = path.join(process.cwd(), 'temp/html', app, type)
    const filename = render?.saveId || Date.now().toString()

    return {
      html: path.join(baseDir, `${filename}.html`),
      image: path.join(baseDir, `${filename}.${render?.imgType || 'png'}`)
    }
  }

  /**​ 渲染HTML内容 */
  async _renderHTML(templatePath, savePath, data) {
    const content = this.templateCache.get(templatePath) || 
      await fsp.readFile(templatePath, 'utf-8')
    
    if (!this.templateCache.has(templatePath)) {
      this.templateCache.set(templatePath, content)
    }

    const html = template.render(content, data)
    await fsp.mkdir(path.dirname(savePath), { recursive: true })
    await fsp.writeFile(savePath, html)
  }

  /**​ 图片优化 */
  async _optimizeImage(imagePath) {
    const tempPath = `${imagePath}.tmp`;
    await sharp(imagePath)
      .jpeg({ quality: 80 })
      .toFile(tempPath);
  
    const maxRetries = 5;
    let retries = 0;
    let error = null;
  
    while (retries < maxRetries) {
      try {
        await fsp.rename(tempPath, imagePath);
        return; // 成功则退出
      } catch (err) {
        error = err;
        if (err.code === 'EPERM') {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 100 * retries));
        } else {
          break;
        }
      }
    }

    throw error;
  }
}

export const renderCore = new RenderCore()