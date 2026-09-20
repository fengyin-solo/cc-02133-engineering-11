/**
 * Vite 插件：站点配置校验
 *
 * - config（启动）：本地开发与构建启动时先校验一次；构建失败直接中断
 * - transformIndexHtml（本地开发）：配置无效时首页返回 500，Vite 在浏览器显示错误遮罩；
 *   修复配置保存后自动重新校验并恢复
 * - buildStart（构建）：rollup 构建阶段兜底再校验一次
 *
 * 监听配置 / 模板 / index.html 变化自动重新校验；
 * 配合 package.json 的 predev / prebuild 钩子，命令行启动阶段也会先拦截一次。
 */

import { resolve } from 'node:path'
import { validateSiteConfig, PROJECT_ROOT } from './validate-site-config.mjs'

const WATCHED_RELATIVE_PATHS = [
  'src/config/site.config.js',
  'src/config/products.config.js',
  'src/views/HomeView.vue',
  'src/components/HeroBanner.vue',
  'src/router/index.js',
  'index.html'
]

function formatErrors(errors) {
  return ['站点配置校验失败：', ...errors.map((message) => `✗ ${message}`)].join('\n')
}

export function siteConfigPlugin() {
  let lastResult = null

  const run = async () => {
    lastResult = await validateSiteConfig()
    if (!lastResult.ok) {
      // 终端始终输出完整失败原因
      console.error(`\n${formatErrors(lastResult.errors)}\n`)
    }
    return lastResult
  }

  return {
    name: 'site-config-validation',
    enforce: 'pre',

    async config(_config, { command }) {
      const result = await run()
      if (!result.ok && command === 'build') {
        throw new Error(`\n${formatErrors(result.errors)}\n\n构建已终止，请修复站点配置后重试。`)
      }
    },

    configureServer(server) {
      const watched = new Set(
        WATCHED_RELATIVE_PATHS.map((relativePath) => resolve(PROJECT_ROOT, relativePath))
      )

      const onFileChange = async (file) => {
        if (!watched.has(file)) return
        const result = await run()
        if (result.ok) {
          // 配置恢复，刷新页面重新加载
          server.ws.send({ type: 'full-reload' })
        } else {
          // 仍失败，更新浏览器错误遮罩内容
          server.ws.send({ type: 'error', err: { message: formatErrors(result.errors), stack: '' } })
        }
      }

      server.watcher.on('change', onFileChange)
      server.watcher.on('add', onFileChange)
      server.watcher.on('unlink', (file) => {
        if (!watched.has(file)) return
        run()
        server.ws.send({ type: 'error', err: { message: `配置相关文件被删除：${file}`, stack: '' } })
      })
    },

    // 首页请求时若配置无效，交给 Vite 渲染错误遮罩；配置有效则正常放行
    transformIndexHtml() {
      if (lastResult && !lastResult.ok) {
        throw new Error(formatErrors(lastResult.errors))
      }
      return null
    },

    async buildStart() {
      // 兜底：即使绕过钩子，构建阶段仍会再次校验
      const result = lastResult?.ok ? lastResult : await run()
      if (!result.ok) {
        throw new Error(`\n${formatErrors(result.errors)}\n\n构建已终止，请修复站点配置后重试。`)
      }
    }
  }
}
