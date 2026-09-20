/**
 * 站点配置校验器
 *
 * 在本地开发（predev / Vite dev server）与构建（prebuild / Vite build）时执行，
 * 对统一配置进行强一致性校验。任一规则不满足即明确失败：
 *
 *   1. 配置缺项：site / nav / home 各必填字段缺失或为空字符串、空数组
 *   2. 数据为空：区块数据数组为空、条目字段为空
 *   3. 重复入口：导航 path/name、各区块条目 id/title/name 重复
 *   4. 链接失效：
 *      - 内部链接必须命中 nav 中真实存在的路由
 *      - 首页精选产品 id 必须存在于产品目录
 *      - hero.statIds 必须引用真实服务统计
 *      - 外链必须为合法 http(s) URL
 *   5. 区块顺序：HomeView / HeroBanner 模板中的 data-section 顺序必须与 baseline 一致
 *   6. 元数据一致：index.html 的 title/description/keywords 必须与 site 配置一致，
 *      router 必须以 nav 为唯一来源，view 文件必须真实存在
 *   7. 图标合法：配置中的 icon 必须是 @element-plus/icons-vue 真实导出
 *
 * 用法：
 *   node scripts/validate-site-config.mjs           # CLI，失败退出码 1
 *   import { validateSiteConfig } from './...mjs'   # Vite 插件复用
 */

import { readFile, access } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// 默认以项目根目录为准；允许通过环境变量指向临时副本，便于在隔离环境做故障注入测试
export const PROJECT_ROOT = process.env.SITE_CONFIG_PROJECT_ROOT
  ? resolve(process.env.SITE_CONFIG_PROJECT_ROOT)
  : resolve(__dirname, '..')

/** 读取文本文件，文件不存在返回 null（由调用方决定是否算失败） */
async function readText(relativePath) {
  try {
    return await readFile(resolve(PROJECT_ROOT, relativePath), 'utf-8')
  } catch {
    return null
  }
}

async function fileExists(relativePath) {
  try {
    await access(resolve(PROJECT_ROOT, relativePath))
    return true
  } catch {
    return false
  }
}

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0

/** 从 @element-plus/icons-vue 的类型声明解析全部合法图标名 */
async function loadIconNames() {
  const dts = await readText('node_modules/@element-plus/icons-vue/dist/types/components/index.d.ts')
  if (!dts) return null
  const names = new Set()
  for (const match of dts.matchAll(/as\s+([A-Za-z0-9]+)\s*\}/g)) {
    names.add(match[1])
  }
  return names.size > 0 ? names : null
}

/** 动态加载项目内 ESM 配置（加时间戳绕过模块缓存，供 dev 长进程反复校验） */
async function loadConfigModule(relativePath, bustCache = false) {
  const url = pathToFileURL(resolve(PROJECT_ROOT, relativePath)).href
  return import(bustCache ? `${url}?t=${Date.now()}` : url)
}

/**
 * 执行全部校验
 * @returns {Promise<{ok: boolean, errors: string[], warnings: string[]}>}
 */
export async function validateSiteConfig() {
  const errors = []
  const warnings = []
  const fail = (message) => errors.push(message)

  // ---------- 加载配置 ----------
  let siteConfig
  let productCatalog
  try {
    ;[siteConfig, productCatalog] = await Promise.all([
      loadConfigModule('src/config/site.config.js', true),
      loadConfigModule('src/config/products.config.js', true)
    ])
  } catch (error) {
    return {
      ok: false,
      errors: [`配置文件无法加载：${error.message}`],
      warnings
    }
  }

  const { site, nav, home, baseline } = siteConfig
  const products = productCatalog.default

  if (!site || !nav || !home || !baseline) {
    fail('site.config.js 必须导出 site / nav / home / baseline 四个顶级配置块')
    return { ok: false, errors, warnings }
  }

  const iconNames = await loadIconNames()
  if (!iconNames) {
    fail('无法解析 @element-plus/icons-vue 图标清单，请确认依赖已正确安装')
  }
  const assertIcon = (icon, where) => {
    if (!isNonEmptyString(icon)) fail(`${where} 的 icon 缺失或为空`)
    else if (iconNames && !iconNames.has(icon)) fail(`${where} 引用了不存在的 Element Plus 图标：${icon}`)
  }

  // ---------- 1. site 元数据 ----------
  for (const key of ['name', 'shortName', 'htmlTitle', 'description', 'keywords']) {
    if (!isNonEmptyString(site[key])) fail(`site.${key} 缺失或为空`)
  }

  // ---------- 2. nav 导航 / 路由唯一来源 ----------
  if (!Array.isArray(nav) || nav.length === 0) {
    fail('nav 必须为非空数组')
  } else {
    if (nav[0].path !== '/') fail('nav 第一项必须是首页（path 为 "/"），保证首次进入基线')
    const navPaths = new Set()
    const navNames = new Set()
    for (const item of nav) {
      if (!item || typeof item !== 'object') {
        fail('nav 中存在非法条目')
        continue
      }
      if (!isNonEmptyString(item.name)) fail(`nav(path=${item.path}) 的 name 缺失或为空`)
      if (!isNonEmptyString(item.title)) fail(`nav(path=${item.path}) 的 title 缺失或为空`)
      if (!isNonEmptyString(item.path) || !item.path.startsWith('/')) {
        fail(`nav(name=${item.name}) 的 path 缺失或不是以 / 开头的内部路径`)
      }
      if (!isNonEmptyString(item.view) || !/^[A-Za-z0-9]+View$/.test(item.view)) {
        fail(`nav(path=${item.path}) 的 view 缺失或格式非法（应为 XxxView）`)
      }
      if (navPaths.has(item.path)) fail(`导航 path 重复入口：${item.path}`)
      if (item.name && navNames.has(item.name)) fail(`导航 name 重复入口：${item.name}`)
      navPaths.add(item.path)
      navNames.add(item.name)
    }
  }
  const internalPaths = new Set(nav.map((item) => item.path))
  const assertInternalLink = (link, where) => {
    if (!isNonEmptyString(link)) {
      fail(`${where} 的链接缺失或为空`)
      return
    }
    if (!internalPaths.has(link)) fail(`${where} 的内部链接失效（nav 中不存在该路由）：${link}`)
  }

  // ---------- 3. 产品目录 ----------
  if (!Array.isArray(products) || products.length === 0) {
    fail('产品目录 products.config.js 为空')
  } else {
    const productIds = new Set()
    for (const product of products) {
      const where = `产品(id=${product?.id ?? '?'})`
      for (const key of ['id', 'tag', 'shortTitle', 'title', 'description', 'icon', 'gradient']) {
        if (!isNonEmptyString(product[key])) fail(`${where} 缺少字段 ${key} 或为空`)
      }
      if (typeof product.reverse !== 'boolean') fail(`${where} 的 reverse 必须为布尔值`)
      if (productIds.has(product.id)) fail(`产品目录存在重复 id：${product.id}`)
      productIds.add(product.id)
      assertIcon(product.icon, where)
      for (const listKey of ['features', 'technologies', 'steps']) {
        if (!Array.isArray(product[listKey]) || product[listKey].length === 0) {
          fail(`${where} 的 ${listKey} 必须为非空数组`)
          continue
        }
        product[listKey].forEach((entry, index) => {
          // features 使用 desc；technologies / steps 使用 description
          const textKey = listKey === 'features' ? 'desc' : 'description'
          if (!isNonEmptyString(entry.title)) fail(`${where}.${listKey}[${index}] 缺少 title`)
          if (!isNonEmptyString(entry[textKey])) fail(`${where}.${listKey}[${index}] 缺少 ${textKey}`)
          if (listKey === 'technologies') assertIcon(entry.icon, `${where}.technologies[${index}]`)
        })
      }
    }
  }

  // ---------- 4. home 区块与基线顺序 ----------
  // 区块键 -> baseline 中的 section id；顺序即首页自上而下的基线
  const SECTION_MAP = [
    ['hero', 'hero'],
    ['features', 'features'],
    ['featuredProducts', 'products'],
    ['stats', 'stats'],
    ['cases', 'cases'],
    ['partners', 'partners'],
    ['cta', 'cta']
  ]
  for (const [key] of SECTION_MAP) {
    if (!home[key]) fail(`home.${key} 区块配置缺失`)
  }

  const expectedOrder = SECTION_MAP.map(([, section]) => section)
  const baselineOrder = baseline?.sectionOrder
  if (!Array.isArray(baselineOrder) || baselineOrder.join('|') !== expectedOrder.join('|')) {
    fail(
      `baseline.sectionOrder 与首页区块基线不一致。\n` +
      `      期望：${expectedOrder.join(' > ')}\n` +
      `      实际：${Array.isArray(baselineOrder) ? baselineOrder.join(' > ') : String(baselineOrder)}`
    )
  }

  // 4.1 hero 主视觉（品牌概览 + 咨询入口）
  const hero = home.hero
  if (hero) {
    for (const key of ['titleHighlight', 'titleTail', 'description']) {
      if (!isNonEmptyString(hero[key])) fail(`home.hero.${key} 缺失或为空`)
    }
    if (!Array.isArray(hero.actions) || hero.actions.length === 0) {
      fail('home.hero.actions 必须为非空数组（主视觉入口不允许为空）')
    } else {
      hero.actions.forEach((action, index) => {
        const where = `home.hero.actions[${index}]`
        if (!isNonEmptyString(action.label)) fail(`${where} 缺少 label`)
        assertInternalLink(action.link, where)
      })
      const expectedActions = baseline.heroActions
      if (
        !Array.isArray(expectedActions) ||
        expectedActions.length !== hero.actions.length ||
        expectedActions.some(
          (expected, index) =>
            expected.label !== hero.actions[index].label || expected.link !== hero.actions[index].link
        )
      ) {
        fail(
          `home.hero.actions 与 baseline.heroActions 不一致（主视觉入口基线被改动）：\n` +
          `      配置：${hero.actions.map((a) => `${a.label}->${a.link}`).join(', ')}\n` +
          `      基线：${(expectedActions || []).map((a) => `${a.label}->${a.link}`).join(', ')}`
        )
      }
    }
    if (!Array.isArray(hero.statIds) || hero.statIds.length === 0) {
      fail('home.hero.statIds 必须为非空数组')
    }
  }

  // 通用：校验区块内条目数组
  const assertItems = (list, where, requiredKeys) => {
    if (!Array.isArray(list) || list.length === 0) {
      fail(`${where} 必须为非空数组（数据为空不允许上线）`)
      return
    }
    const seen = new Map()
    list.forEach((item, index) => {
      const itemWhere = `${where}[${index}]`
      if (!item || typeof item !== 'object') {
        fail(`${itemWhere} 不是合法对象`)
        return
      }
      for (const key of requiredKeys) {
        if (!isNonEmptyString(item[key])) fail(`${itemWhere} 缺少字段 ${key} 或为空`)
      }
      for (const uniqueKey of ['id', 'title', 'name']) {
        if (item[uniqueKey] !== undefined) {
          if (!seen.has(uniqueKey)) seen.set(uniqueKey, new Set())
          const set = seen.get(uniqueKey)
          if (set.has(item[uniqueKey])) fail(`${where} 存在重复${uniqueKey}入口：${item[uniqueKey]}`)
          set.add(item[uniqueKey])
        }
      }
    })
  }

  // 4.2 features 核心优势
  if (home.features) {
    if (!isNonEmptyString(home.features.title) || !isNonEmptyString(home.features.subtitle)) {
      fail('home.features 的 title/subtitle 缺失或为空')
    }
    assertItems(home.features.items, 'home.features.items', ['id', 'icon', 'title', 'description'])
    ;(home.features.items || []).forEach((item, index) => assertIcon(item.icon, `home.features.items[${index}]`))
  }

  // 4.3 featuredProducts 首页精选产品（id 必须命中产品目录）
  if (home.featuredProducts) {
    const fp = home.featuredProducts
    if (!isNonEmptyString(fp.title) || !isNonEmptyString(fp.subtitle)) {
      fail('home.featuredProducts 的 title/subtitle 缺失或为空')
    }
    assertItems(fp.items, 'home.featuredProducts.items', ['id', 'icon', 'title', 'description'])
    ;(fp.items || []).forEach((item, index) => {
      const where = `home.featuredProducts.items[${index}](id=${item.id})`
      assertIcon(item.icon, where)
      if (isNonEmptyString(item.id) && Array.isArray(products) && !products.some((p) => p.id === item.id)) {
        fail(`${where} 的 id 在产品目录中不存在（产品详情链接将失效）`)
      }
      if (!Array.isArray(item.features) || item.features.length === 0) {
        fail(`${where} 的 features 必须为非空数组`)
      } else {
        item.features.forEach((text, featureIndex) => {
          if (!isNonEmptyString(text)) fail(`${where}.features[${featureIndex}] 为空`)
        })
      }
    })
  }

  // 4.4 stats 服务统计（hero.statIds 必须引用真实统计）
  if (home.stats) {
    assertItems(home.stats.items, 'home.stats.items', ['id', 'icon', 'value', 'label'])
    ;(home.stats.items || []).forEach((item, index) => assertIcon(item.icon, `home.stats.items[${index}]`))
    const statIds = new Set((home.stats.items || []).map((item) => item.id))
    ;(hero?.statIds || []).forEach((id) => {
      if (!statIds.has(id)) fail(`home.hero.statIds 引用了不存在的服务统计 id：${id}`)
    })
    if (hero && Array.isArray(hero.statIds) && new Set(hero.statIds).size !== hero.statIds.length) {
      fail('home.hero.statIds 存在重复统计入口')
    }
  }

  // 4.5 cases 成功案例
  if (home.cases) {
    const cases = home.cases
    if (!isNonEmptyString(cases.title) || !isNonEmptyString(cases.subtitle) || !isNonEmptyString(cases.moreText)) {
      fail('home.cases 的 title/subtitle/moreText 缺失或为空')
    }
    assertInternalLink(cases.moreLink, 'home.cases.moreLink')
    assertItems(cases.items, 'home.cases.items', ['id', 'title', 'description', 'tag', 'industry'])
  }

  // 4.6 partners 合作伙伴
  if (home.partners) {
    const partners = home.partners
    if (!isNonEmptyString(partners.title) || !isNonEmptyString(partners.subtitle)) {
      fail('home.partners 的 title/subtitle 缺失或为空')
    }
    assertItems(partners.items, 'home.partners.items', ['id', 'name'])
    // 合作伙伴若配置了外链，必须为合法 http(s) URL（当前基线无外链）
    ;(partners.items || []).forEach((item, index) => {
      if (item.link !== undefined) {
        if (item.link === null || item.link === '') return
        try {
          const url = new URL(item.link)
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            fail(`home.partners.items[${index}].link 仅允许 http(s) 链接：${item.link}`)
          }
        } catch {
          fail(`home.partners.items[${index}].link 不是合法 URL：${item.link}`)
        }
      }
    })
  }

  // 4.7 cta 咨询入口
  if (home.cta) {
    const cta = home.cta
    for (const key of ['title', 'description', 'actionText', 'actionLink']) {
      if (!isNonEmptyString(cta[key])) fail(`home.cta.${key} 缺失或为空`)
    }
    assertInternalLink(cta.actionLink, 'home.cta.actionLink')
    if (isNonEmptyString(cta.actionLink) && cta.actionLink !== baseline.ctaLink) {
      fail(
        `home.cta.actionLink(${cta.actionLink}) 与 baseline.ctaLink(${baseline.ctaLink}) 不一致，咨询入口基线被改动`
      )
    }
  }

  // ---------- 5. 模板区块顺序 ----------
  const homeViewSource = await readText('src/views/HomeView.vue')
  if (!homeViewSource) {
    fail('src/views/HomeView.vue 不存在')
  } else {
    const sectionsInTemplate = [...homeViewSource.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1])
    // hero 区块在 HeroBanner 组件内，HomeView 内为其余区块
    const expectedInHomeView = expectedOrder.filter((id) => id !== 'hero')
    if (sectionsInTemplate.join('|') !== expectedInHomeView.join('|')) {
      fail(
        `HomeView.vue 模板区块顺序与基线不一致。\n` +
        `      期望：${expectedInHomeView.join(' > ')}\n` +
        `      实际：${sectionsInTemplate.join(' > ') || '(未找到 data-section 标记)'}`
      )
    }
    if (!homeViewSource.includes('@/config/site.config')) {
      fail('HomeView.vue 必须从 @/config/site.config 读取首页数据，不允许在组件内硬编码')
    }
  }

  const heroBannerSource = await readText('src/components/HeroBanner.vue')
  if (!heroBannerSource) {
    fail('src/components/HeroBanner.vue 不存在')
  } else {
    if (!heroBannerSource.includes('data-section="hero"')) {
      fail('HeroBanner.vue 根区块必须带有 data-section="hero"，以固定首页首个区块')
    }
    if (!heroBannerSource.includes('@/config/site.config')) {
      fail('HeroBanner.vue 必须从 @/config/site.config 读取主视觉配置，不允许硬编码')
    }
  }

  // ---------- 6. router 以 nav 为唯一来源 ----------
  const routerSource = await readText('src/router/index.js')
  if (!routerSource) {
    fail('src/router/index.js 不存在')
  } else {
    if (!routerSource.includes('site.config') || !routerSource.includes('nav')) {
      fail('src/router/index.js 必须从 @/config/site.config 导入 nav 生成路由，不允许另写一份路由表')
    }
    const importedViews = new Set(
      [...routerSource.matchAll(/views\/([A-Za-z0-9]+View)\.vue/g)].map((m) => m[1])
    )
    for (const item of nav) {
      if (item.view && !importedViews.has(item.view)) {
        fail(`router 未加载 nav 声明的视图：${item.view}.vue（${item.path} 将无法访问）`)
      }
    }
  }
  for (const item of nav) {
    if (item.view && !(await fileExists(`src/views/${item.view}.vue`))) {
      fail(`nav 声明的视图文件不存在：src/views/${item.view}.vue（${item.path} 链接失效）`)
    }
  }

  // ---------- 7. index.html 元数据一致性 ----------
  const indexHtml = await readText('index.html')
  if (!indexHtml) {
    fail('index.html 不存在')
  } else {
    const htmlTitle = indexHtml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim()
    if (htmlTitle !== site.htmlTitle) {
      fail(`index.html <title> 与 site.htmlTitle 不一致：\n      HTML：${htmlTitle}\n      配置：${site.htmlTitle}`)
    }
    const description = indexHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1]
    if (description !== site.description) {
      fail(`index.html description 与 site.description 不一致：\n      HTML：${description}\n      配置：${site.description}`)
    }
    const keywords = indexHtml.match(/<meta\s+name="keywords"\s+content="([^"]*)"/)?.[1]
    if (keywords !== site.keywords) {
      fail(`index.html keywords 与 site.keywords 不一致：\n      HTML：${keywords}\n      配置：${site.keywords}`)
    }
    const favicon = indexHtml.match(/<link\s+rel="icon"[^>]*href="([^"]+)"/)?.[1]
    if (!favicon) {
      fail('index.html 缺少 favicon 的 <link rel="icon"> 声明')
    } else if (favicon.startsWith('/') && !(await fileExists(`public${favicon}`))) {
      fail(`index.html favicon 链接失效，文件不存在：public${favicon}`)
    }
  }

  if (warnings.length === 0 && errors.length === 0) {
    // 通过时静默信息由调用方决定是否打印
  }

  return { ok: errors.length === 0, errors, warnings }
}

// CLI 入口
const isCli = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url
if (isCli) {
  const { ok, errors, warnings } = await validateSiteConfig()
  if (warnings.length > 0) {
    console.warn('⚠️  站点配置警告：')
    for (const warning of warnings) console.warn(`  - ${warning}`)
  }
  if (!ok) {
    console.error('\n❌ 站点配置校验失败：')
    for (const error of errors) console.error(`  ✗ ${error}`)
    console.error(`\n共 ${errors.length} 项错误，已终止。请修正 src/config 下的配置后重试。\n`)
    process.exit(1)
  }
  console.log('✅ 站点配置校验通过（区块顺序、链接、元数据、数据完整性均一致）')
}
