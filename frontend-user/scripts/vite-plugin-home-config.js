/**
 * Vite 插件：在本地开发服务器启动与构建打包前强制执行首页配置校验。
 * - dev：configureServer 中 await，配置不合法时服务器启动失败并打印全部错误
 * - build：buildStart 中抛错，构建立即失败
 */
import { validateHomeConfig } from './validate-home-config.js'

export default function homeConfigPlugin() {
  let validated = false

  const runValidation = async () => {
    if (validated) return
    await validateHomeConfig({ projectRoot: process.cwd() })
    validated = true
  }

  return {
    name: 'validate-home-config',
    async configResolved() {
      // build 场景：在解析配置后、打包前失败
      if (process.argv.some((arg) => arg === 'build' || arg.endsWith('/vite/build'))) {
        await runValidation()
      }
    },
    async configureServer(server) {
      try {
        await runValidation()
      } catch (error) {
        // dev 场景：让 Vite 在启动阶段以错误形式输出，而不是等到浏览器请求时
        server.httpServer?.close?.()
        throw error
      }
    },
    async buildStart() {
      await runValidation()
    }
  }
}
