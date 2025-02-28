import log4js from 'log4js'
import path from 'path'
import { _path } from '../../lib/global/global.js'
import { config } from '../config/config.js'

// 正确引入 layouts 模块
const { errors } = log4js
const layouts = log4js.layouts // 独立获取 layouts 对象

// 系统常量
const LOG_DIR = path.join(_path, 'logs')
const DEFAULT_LOG_PATTERN = '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}][%z][%p]%] %m%n'

// 智能日志分级配置
const configureLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production'

  log4js.configure({
    appenders: {
      stdout: {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: DEFAULT_LOG_PATTERN.replace('%z', 'MAIN')
        }
      },
      errorFile: {
        type: 'dateFile',
        filename: path.join(LOG_DIR, 'error.log'),
        pattern: 'yyyy-MM-dd',
        keepFileExt: true,
        compress: true,
        layout: layouts // 使用正确的布局创建方式
      },
      hierarchyError: {
        type: 'logLevelFilter',
        appender: 'errorFile',
        level: 'error'
      }
    },
    categories: {
      default: {
        appenders: ['stdout', 'hierarchyError'],
        level: 'all',
        enableCallStack: !isProduction
      }
    }
  })
}

// 初始化日志系统
configureLogger()

// 获取核心日志实例
const baseLogger = log4js.getLogger()

// 动态元数据增强
const enrichLogContext = (loggerInstance) => {
  const enhancedLogger = Object.create(loggerInstance)
  
  enhancedLogger.addTraceId = function(id) {
    this.addContext('traceId', id)
    return this
  }

  enhancedLogger.trackRequest = function(req) {
    this.addContext('ip', req.ip)
    this.addContext('userAgent', req.headers['user-agent'])
    return this
  }

  return enhancedLogger
}

// 开发环境堆栈追踪优化
const configureDevStackTraces = () => {
  if (process.env.NODE_ENV === 'development') {
    baseLogger.setParseCallStackFunction((error) => {
      const stack = errors.parseError(error)
      return {
        functionName: stack[0]?.functionName || 'anonymous',
        fileName: path.relative(_path, stack[0]?.fileName || ''),
        lineNumber: stack[0]?.lineNumber,
        columnNumber: stack[0]?.columnNumber,
        callStack: stack.slice(1).map(frame => 
          `${path.basename(frame.fileName)}:${frame.lineNumber}`
        ).join('\n')
      }
    })
}
}

// 初始化增强功能
const enhancedLogger = enrichLogContext(baseLogger)
configureDevStackTraces()

// 全局错误处理挂钩
process.on('uncaughtException', (err) => {
  enhancedLogger.error('未捕获异常:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  enhancedLogger.error('未处理的Promise拒绝:', reason)
})

export { enhancedLogger as logger }