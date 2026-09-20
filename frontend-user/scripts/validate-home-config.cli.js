#!/usr/bin/env node
/**
 * CLI 入口：`npm run validate:home`
 * 退出码 0 表示通过，非 0 表示配置存在问题（供 CI / git hook 使用）。
 */
import { validateHomeConfig } from './validate-home-config.js'

validateHomeConfig({ projectRoot: process.cwd() })
  .then(() => {
    console.log('✓ 首页配置校验通过：区块顺序、链接、元数据与数据完整性均符合基线')
  })
  .catch((error) => {
    console.error(`\n${error.message}\n`)
    process.exit(1)
  })
