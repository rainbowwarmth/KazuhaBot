import fetch from 'node-fetch'
import FormData from 'form-data'
import { logger } from '../config/logger.js'

class HttpClient {
  /**
   * 创建HTTP客户端实例
   * @param {Object} config - 客户端配置
   * @param {string} [config.baseURL] - 基础URL
   * @param {Object} [config.defaultHeaders] - 默认请求头
   * @param {Function} [config.authHandler] - 鉴权处理器
   * @param {number} [config.timeout=30000] - 默认超时时间(毫秒)
   */
  constructor(config = {}) {
    this.baseURL = config.baseURL || ''
    this.defaultHeaders = config.defaultHeaders || {}
    this.authHandler = config.authHandler || null
    this.timeout = config.timeout || 30000
  }

    /**
   * 发送HTTP请求
   * @param {Object} options - 请求配置
   * @param {string} options.url - 请求地址
   * @param {string} [options.method='GET'] - 请求方法
   * @param {Object} [options.headers] - 请求头
   * @param {*} [options.data] - 请求体数据
   * @param {number} [options.timeout] - 超时时间(毫秒)
   * @returns {Promise<Object>}
   */
  async request(options) {
    const { url, method = 'GET', headers = {}, data, timeout = this.timeout } = options

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      // 深度拷贝避免污染原始 headers
      const finalHeaders = await this._prepareHeaders({ ...headers })
      const fullURL = this._buildURL(url)
      const body = this._prepareBody(data, finalHeaders)

      // 关键修改点：确保 FormData 的 Content-Type 优先级最高
      if (data instanceof FormData) {
        Object.assign(finalHeaders, data.getHeaders())
      }

      const response = await fetch(fullURL, {
        method: method.toUpperCase(),
        headers: finalHeaders,
        body,
        signal: controller.signal
      })

      return this._handleResponse(response)
    } catch (error) {
      return this._handleError(error, options)
    } finally {
      clearTimeout(timer)
    }
  }

  async _prepareHeaders(customHeaders) {
    // 合并顺序：默认头 < 自定义头 < 鉴权头
    const merged = { 
      ...this.defaultHeaders,
      ...customHeaders,  // 允许用户自定义覆盖默认头
      ...(this.authHandler ? await this.authHandler() : {})
    }
    return merged
  }

  _buildURL(url) {
    return url.startsWith('http') ? url : `${this.baseURL}${url}`
  }

  _prepareBody(data, headers) {
    if (!data) return undefined

    const contentType = headers['Content-Type'] || headers['content-type']

    // 场景1：用户直接传递 FormData 实例
    if (data instanceof FormData) {
      return data
    }

    // 场景2：用户通过 content-type 声明需要 form-data
    if (contentType?.includes('multipart/form-data')) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => formData.append(key, val))
      Object.assign(headers, formData.getHeaders()) // 自动添加 boundary
      return formData
    }

    // 场景3：JSON 请求
    if (contentType?.includes('application/json')) {
      return JSON.stringify(data)
    }

    // 其他类型直接传递
    return data
  }

  async _handleResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    let data

    // 使用 arrayBuffer() 替代弃用的 buffer()
    const arrayBuffer = await response.arrayBuffer()

    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(Buffer.from(arrayBuffer).toString('utf-8'))
      } catch (e) {
        throw new Error(`JSON解析失败: ${e.message}`)
      }
    } else if (contentType.startsWith('image/')) {
      data = Buffer.from(arrayBuffer)
    } else {
      data = Buffer.from(arrayBuffer).toString('utf-8')
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data
    }
  }

  _handleError(error, options) {
    const errorInfo = {
      url: options.url,
      method: options.method,
      code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      message: error.message
    }

    logger.error('HTTP Request Failed:', errorInfo)
    throw Object.assign(error, errorInfo)
  }

  // 快捷方法
  get(url, options = {}) {
    return this.request({ ...options, url, method: 'GET' })
  }

  post(url, data, options = {}) {
    return this.request({ ...options, url, method: 'POST', data })
  }

  put(url, data, options = {}) {
    return this.request({ ...options, url, method: 'PUT', data })
  }

  delete(url, options = {}) {
    return this.request({ ...options, url, method: 'DELETE' })
  }
}

export default HttpClient