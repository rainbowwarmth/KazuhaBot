import axios from 'axios'
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
    // 创建 axios 实例
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || '',
      headers: config.defaultHeaders || {},
      timeout: config.timeout || 30000,
      // 统一响应处理
      transformResponse: [data => data], // 禁用自动 JSON 解析
      responseType: 'arraybuffer' // 统一获取二进制数据
    })

    // 添加鉴权拦截器
    this.authHandler = config.authHandler || null

    // 修复点1：正确的拦截器上下文绑定
    if (this.authHandler) {
      this.axiosInstance.interceptors.request.use(async (config) => {
        // 修复点2：使用实例的 authHandler
        const authHeaders = await this.authHandler()
        config.headers = { ...config.headers, ...authHeaders }
        return config
      })
    }

    // 错误处理拦截器
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => Promise.reject(this._handleError(error))
    )
  }

  /**
   * 发送HTTP请求（核心方法）
   * @param {Object} options - 请求配置
   * @param {string} options.url - 请求地址
   * @param {string} [options.method='GET'] - 请求方法
   * @param {Object} [options.headers] - 请求头
   * @param {*} [options.data] - 请求体数据
   * @param {number} [options.timeout] - 超时时间(毫秒)
   * @returns {Promise<Object>}
   */
  async request(options) {
    const finalConfig = this._mergeRequestConfig(options)
    
    // 处理 FormData 的边界问题
    if (finalConfig.data instanceof FormData) {
      finalConfig.headers = {
        ...finalConfig.headers,
        ...finalConfig.data.getHeaders() // 自动添加 multipart headers
      }
    }

    try {
      const response = await this.axiosInstance.request(finalConfig)
      return this._parseResponse(response)
    } catch (error) {
      error.config = finalConfig // 附加配置信息到错误对象
      throw error
    }
  }

  /**
   * 合并请求配置
   */
  _mergeRequestConfig(options) {
    const { url, method = 'GET', headers = {}, data, timeout } = options
    
    return {
      url,
      method: method.toLowerCase(), // axios 需要小写方法名
      headers,
      data: this._transformRequestData(data, headers),
      timeout,
      validateStatus: () => true // 统一处理所有状态码
    }
  }

  /**
   * 转换请求数据
   */
  _transformRequestData(data, headers) {
    const contentType = headers['Content-Type'] || headers['content-type']

    if (contentType?.includes('application/json')) {
      return JSON.stringify(data)
    }

    // 处理手动指定的 multipart 类型
    if (contentType?.includes('multipart/form-data') && !(data instanceof FormData)) {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => formData.append(key, val))
      return formData
    }

    return data
  }

  /**
   * 解析响应数据
   */
  _parseResponse(response) {
    const { status, headers, data } = response
    const parsedHeaders = this._normalizeHeaders(headers)
    const contentType = parsedHeaders['content-type'] || ''

    let parsedData = data
    
    // JSON 解析
    if (contentType.includes('application/json')) {
      try {
        parsedData = JSON.parse(Buffer.from(data).toString('utf-8'))
      } catch (e) {
        throw new Error(`JSON 解析失败: ${e.message}`)
      }
    }
    // 二进制数据处理
    else if (contentType.startsWith('image/')) {
      parsedData = Buffer.from(data)
    }
    // 文本数据处理
    else {
      parsedData = Buffer.from(data).toString('utf-8')
    }

    return {
      status,
      headers: parsedHeaders,
      data: parsedData
    }
  }

  /**
   * 错误处理（通过拦截器统一处理）
   */
  _handleError(error) {
    const errorInfo = {
      code: 'NETWORK_ERROR',
      message: error.message
    }

    if (error.response) {
      // 服务器响应错误
      errorInfo.code = `HTTP_${error.response.status}`
      errorInfo.message = error.response.statusText
      errorInfo.response = {
        status: error.response.status,
        headers: this._normalizeHeaders(error.response.headers),
        data: error.response.data
      }
    } else if (error.code === 'ECONNABORTED') {
      errorInfo.code = 'TIMEOUT'
    }

    logger.error('HTTP 请求失败:', {
      url: error.config?.url,
      method: error.config?.method,
      ...errorInfo
    })

    return Object.assign(error, errorInfo)
  }

  /**
   * 标准化 headers 格式
   */
  _normalizeHeaders(headers) {
    if (headers && typeof headers.toJSON === 'function') {
      return headers.toJSON()
    }
    return headers
  }

  // 保留快捷方法（无需修改）
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