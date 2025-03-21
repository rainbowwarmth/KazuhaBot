import path from 'path'

export class PluginCache {
    constructor() {
      this.cache = new Map()
      this.metrics = new Map()
    }
  
    async get(pluginURL) {
      if (!this.cache.has(pluginURL)) {
        const start = Temporal.Now.instant()
        const module = await import(pluginURL)
        const loadTime = Temporal.Now.instant().since(start).milliseconds
        
        this.cache.set(pluginURL, module)
        this.metrics.set(pluginURL, {
          loadCount: 0,
          totalLoadTime: loadTime,
          lastUsed: Temporal.Now.instant()
        })
        
        logger.debug(`✅ 缓存插件: ${path.basename(pluginURL)} (加载耗时 ${loadTime}ms)`)
      }
      return this.cache.get(pluginURL)
    }
  
    async preload(pluginURL) {
      try {
        const module = await import(pluginURL)
        this.cache.set(pluginURL, module)
        logger.debug(`🚀 预加载完成: ${path.basename(pluginURL)}`)
      } catch (err) {
        logger.error(`预加载失败: ${pluginURL}`, err)
      }
    }
  
    getMetrics() {
      return Array.from(this.metrics.entries()).map(([url, data]) => ({
        plugin: path.basename(url),
        ...data
      }))
    }
  }
  