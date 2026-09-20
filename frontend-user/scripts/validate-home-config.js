/**
 * 首页统一配置校验器。
 *
 * 使用时机：
 *  - 本地开发：vite 插件在服务器启动前执行，配置不合法时 dev server 直接启动失败
 *  - 构建：vite 插件在 buildStart 执行，配置不合法时 build 失败
 *  - 手动/CI：`npm run validate:home`
 *
 * 失败场景（全部收集后一次性抛出，便于一次修完）：
 *  - 配置缺项（必填字段缺失或为空字符串）
 *  - 数据为空（统计、合作伙伴、案例等数组为空）
 *  - 重复入口（id 重复、hero 按钮 key/链接重复）
 *  - 链接失效（站内链接未注册路由、产品链接的 tab/锚点指向不存在的产品）
 *  - 区块顺序与基线不一致（sectionOrder 与模板区块集合/顺序不符）
 *  - 元数据缺失（路由 title 缺失、首页路由不存在）
 *  - 图标名称在 @element-plus/icons-vue 中不存在
 */
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** 区块顺序基线：与 HomeView 模板中 section 的渲染顺序必须完全一致 */
export const EXPECTED_SECTION_ORDER = ['features', 'products', 'stats', 'cases', 'partners', 'cta']

function isEmpty(value) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * @param {object} opts
 * @param {string} opts.projectRoot  frontend-user 目录绝对路径（用于解析 node_modules）
 * @param {object} [opts.overrides]  注入的配置（测试用），缺省则从 src/config 读取
 */
export async function validateHomeConfig({ projectRoot, overrides } = {}) {
  const errors = []
  const fail = (message) => errors.push(message)

  const configs = overrides || (await loadConfigs(projectRoot))
  const { routes, site, home, products, iconNames } = configs

  checkRoutesAndSite(routes, site, fail)
  checkProducts(products, routes, iconNames, fail)
  checkSectionOrder(home, fail)
  checkHero(home, routes, iconNames, fail)
  checkStats(home, iconNames, fail)
  checkFeatures(home, iconNames, fail)
  checkCases(home, routes, fail)
  checkPartners(home, iconNames, fail)
  checkCta(home, routes, fail)

  if (errors.length > 0) {
    const error = new Error(
      `首页配置校验失败（共 ${errors.length} 个问题）：\n` +
        errors.map((message) => `  ✗ ${message}`).join('\n')
    )
    error.validationErrors = errors
    throw error
  }

  return { valid: true }
}

async function loadConfigs(projectRoot) {
  const root = projectRoot || process.cwd()
  const configDir = pathToFileURL(`${root.replace(/\/$/, '')}/src/config/`)
  const [routesModule, siteModule, homeModule, productsModule] = await Promise.all([
    import(new URL('routes.js', configDir)),
    import(new URL('site.js', configDir)),
    import(new URL('home.js', configDir)),
    import(new URL('products.js', configDir))
  ])
  const iconsModule = await import(
    pathToFileURL(require.resolve('@element-plus/icons-vue/dist/index.js', { paths: [root] }))
  )
  return {
    routes: routesModule.ROUTES,
    site: siteModule.SITE,
    home: {
      HOME_SECTION_ORDER: homeModule.HOME_SECTION_ORDER,
      HERO: homeModule.HERO,
      FEATURES_SECTION: homeModule.FEATURES_SECTION,
      PRODUCTS_SECTION: homeModule.PRODUCTS_SECTION,
      STATS: homeModule.STATS,
      STATS_SECTION: homeModule.STATS_SECTION,
      CASES_SECTION: homeModule.CASES_SECTION,
      PARTNERS_SECTION: homeModule.PARTNERS_SECTION,
      CTA_SECTION: homeModule.CTA_SECTION
    },
    products: productsModule.PRODUCTS,
    iconNames: new Set(Object.keys(iconsModule))
  }
}

function checkRoutesAndSite(routes, site, fail) {
  if (!Array.isArray(routes) || routes.length === 0) {
    fail('路由配置 ROUTES 为空')
    return
  }

  const paths = new Set()
  for (const route of routes) {
    if (isEmpty(route.path)) fail('存在缺少 path 的路由配置')
    if (isEmpty(route.name)) fail(`路由 ${route.path || '(未知路径)'} 缺少 name`)
    if (isEmpty(route.title)) fail(`路由 ${route.path || '(未知路径)'} 缺少 meta.title 元数据`)
    if (paths.has(route.path)) fail(`路由路径重复入口：${route.path}`)
    paths.add(route.path)
  }

  if (!paths.has('/')) fail('路由基线缺少首页 "/"，首页元数据无法建立')

  for (const key of ['name', 'documentTitle', 'pageTitleTemplate', 'description']) {
    if (isEmpty(site?.[key])) fail(`站点元数据 site.${key} 缺失或为空`)
  }
  if (site?.pageTitleTemplate && !site.pageTitleTemplate.includes('%s')) {
    fail('site.pageTitleTemplate 必须包含 %s 占位符，否则无法拼接页面标题')
  }
}

function checkProducts(products, routes, iconNames, fail) {
  if (!Array.isArray(products) || products.length === 0) {
    fail('产品配置 PRODUCTS 为空，首页产品区块无数据')
    return
  }

  const ids = new Set()
  for (const product of products) {
    if (isEmpty(product.id)) fail('存在缺少 id 的产品配置')
    if (ids.has(product.id)) fail(`产品 id 重复入口：${product.id}`)
    ids.add(product.id)

    for (const key of ['icon', 'title', 'description']) {
      if (isEmpty(product[key])) fail(`产品 ${product.id || '(未知)'} 缺少 ${key}`)
    }
    if (!Array.isArray(product.features) || product.features.length === 0) {
      fail(`产品 ${product.id} 的 features 为空`)
    }
    assertIcon(product.icon, `产品 ${product.id} 的图标`, iconNames, fail)
    assertInternalLink(
      product.detailLink,
      routes,
      (target) => {
        const url = new URL(target, 'http://config.local')
        if (url.pathname !== '/products') return '产品详情链接必须指向 /products'
        const tab = url.searchParams.get('tab')
        const hash = url.hash.replace(/^#product-/, '')
        if (tab !== product.id) return `产品 ${product.id} 的 detailLink tab "${tab}" 与 id 不一致`
        if (hash !== product.id) return `产品 ${product.id} 的 detailLink 锚点 "${url.hash}" 与 id 不一致`
        return null
      },
      `产品 ${product.id} 的 detailLink`,
      fail
    )
  }
}

function checkSectionOrder(home, fail) {
  const order = home.HOME_SECTION_ORDER
  if (!Array.isArray(order) || order.length === 0) {
    fail('HOME_SECTION_ORDER 缺失或为空，区块顺序无基线')
    return
  }

  const expected = EXPECTED_SECTION_ORDER
  if (order.length !== expected.length || order.some((key, index) => key !== expected[index])) {
    fail(
      `首页区块顺序与基线不一致：\n      期望 ${JSON.stringify(expected)}\n      实际 ${JSON.stringify(order)}`
    )
  }

  for (const key of expected) {
    const section = home[`${sectionExportName(key)}`]
    if (!section) fail(`区块 "${key}" 缺少对应配置对象（期望导出 ${sectionExportName(key)}）`)
  }
}

function sectionExportName(key) {
  return {
    features: 'FEATURES_SECTION',
    products: 'PRODUCTS_SECTION',
    stats: 'STATS_SECTION',
    cases: 'CASES_SECTION',
    partners: 'PARTNERS_SECTION',
    cta: 'CTA_SECTION'
  }[key]
}

function checkHero(home, routes, iconNames, fail) {
  const hero = home.HERO
  if (!hero) {
    fail('HERO 品牌概览配置缺失')
    return
  }
  if (isEmpty(hero.title?.highlight)) fail('HERO.title.highlight 缺失或为空')
  if (isEmpty(hero.title?.rest)) fail('HERO.title.rest 缺失或为空')
  if (isEmpty(hero.description)) fail('HERO.description 缺失或为空')

  if (!Array.isArray(hero.actions) || hero.actions.length === 0) {
    fail('HERO.actions 缺失或为空，主视觉咨询入口将无法展示')
    return
  }

  const keys = new Set()
  const links = new Set()
  for (const action of hero.actions) {
    if (isEmpty(action.key)) fail('HERO.actions 中存在缺少 key 的入口')
    if (isEmpty(action.label)) fail(`HERO 入口 ${action.key || '(未知)'} 缺少 label`)
    if (isEmpty(action.link)) fail(`HERO 入口 ${action.key || '(未知)'} 缺少 link`)
    if (keys.has(action.key)) fail(`HERO 入口 key 重复：${action.key}`)
    if (links.has(action.link)) fail(`HERO 链接重复入口：${action.link}（${action.label}）`)
    keys.add(action.key)
    links.add(action.link)
    assertInternalLink(action.link, routes, null, `HERO 入口 ${action.key} 的链接`, fail)
  }

  if (!hero.actions.some((action) => action.link.split(/[?#]/)[0] === '/contact')) {
    fail('HERO.actions 必须保留指向 /contact 的免费咨询入口')
  }

  if (!Array.isArray(hero.statIds) || hero.statIds.length === 0) {
    fail('HERO.statIds 缺失或为空')
  } else {
    const statIds = new Set(home.STATS?.map((stat) => stat.id) || [])
    for (const statId of hero.statIds) {
      if (!statIds.has(statId)) fail(`HERO.statIds 引用了不存在的服务统计 id：${statId}`)
    }
    if (new Set(hero.statIds).size !== hero.statIds.length) {
      fail(`HERO.statIds 存在重复引用：${JSON.stringify(hero.statIds)}`)
    }
  }
}

function checkStats(home, iconNames, fail) {
  const stats = home.STATS
  if (!Array.isArray(stats) || stats.length === 0) {
    fail('服务统计 STATS 为空，数据区块将无内容')
    return
  }
  const ids = new Set()
  for (const stat of stats) {
    if (isEmpty(stat.id)) fail('服务统计中存在缺少 id 的条目')
    if (ids.has(stat.id)) fail(`服务统计 id 重复入口：${stat.id}`)
    ids.add(stat.id)
    for (const key of ['value', 'label']) {
      if (isEmpty(stat[key])) fail(`服务统计 ${stat.id || '(未知)'} 的 ${key} 缺失或为空`)
    }
    assertIcon(stat.icon, `服务统计 ${stat.id} 的图标`, iconNames, fail)
  }
}

function checkFeatures(home, iconNames, fail) {
  const section = home.FEATURES_SECTION
  if (isEmpty(section?.title)) fail('FEATURES_SECTION.title 缺失或为空')
  if (isEmpty(section?.subtitle)) fail('FEATURES_SECTION.subtitle 缺失或为空')
  if (!Array.isArray(section.items) || section.items.length === 0) {
    fail('FEATURES_SECTION.items 为空，核心优势区块无数据')
    return
  }
  const ids = new Set()
  for (const item of section.items) {
    if (isEmpty(item.id)) fail('核心优势中存在缺少 id 的条目')
    if (ids.has(item.id)) fail(`核心优势 id 重复入口：${item.id}`)
    ids.add(item.id)
    for (const key of ['title', 'description']) {
      if (isEmpty(item[key])) fail(`核心优势 ${item.id || '(未知)'} 的 ${key} 缺失或为空`)
    }
    assertIcon(item.icon, `核心优势 ${item.id} 的图标`, iconNames, fail)
  }

  if (isEmpty(home.PRODUCTS_SECTION?.title)) fail('PRODUCTS_SECTION.title 缺失或为空')
  if (isEmpty(home.PRODUCTS_SECTION?.subtitle)) fail('PRODUCTS_SECTION.subtitle 缺失或为空')
}

function checkCases(home, routes, fail) {
  const section = home.CASES_SECTION
  if (isEmpty(section?.title)) fail('CASES_SECTION.title 缺失或为空')
  if (isEmpty(section?.subtitle)) fail('CASES_SECTION.subtitle 缺失或为空')
  assertInternalLink(section.moreLink, routes, null, '案例区块 moreLink', fail)
  if (isEmpty(section.moreLinkText)) fail('CASES_SECTION.moreLinkText 缺失或为空')
  if (!Array.isArray(section.items) || section.items.length === 0) {
    fail('CASES_SECTION.items 为空，成功案例区块无数据')
    return
  }
  const ids = new Set()
  for (const item of section.items) {
    if (isEmpty(item.id)) fail('成功案例中存在缺少 id 的条目')
    if (ids.has(item.id)) fail(`成功案例 id 重复入口：${item.id}`)
    ids.add(item.id)
    for (const key of ['title', 'description', 'tag', 'industry']) {
      if (isEmpty(item[key])) fail(`成功案例 ${item.id || '(未知)'} 的 ${key} 缺失或为空`)
    }
  }
}

function checkPartners(home, iconNames, fail) {
  const section = home.PARTNERS_SECTION
  if (!section) {
    fail('PARTNERS_SECTION 配置对象缺失')
    return
  }
  if (isEmpty(section.title)) fail('PARTNERS_SECTION.title 缺失或为空')
  if (isEmpty(section.subtitle)) fail('PARTNERS_SECTION.subtitle 缺失或为空')
  assertIcon(section.icon, 'PARTNERS_SECTION.icon', iconNames, fail)
  if (!Array.isArray(section.items) || section.items.length === 0) {
    fail('PARTNERS_SECTION.items 为空，合作伙伴数据不允许为空')
    return
  }
  const ids = new Set()
  const names = new Set()
  for (const item of section.items) {
    if (isEmpty(item.id)) fail('合作伙伴中存在缺少 id 的条目')
    if (ids.has(item.id)) fail(`合作伙伴 id 重复入口：${item.id}`)
    ids.add(item.id)
    if (isEmpty(item.name)) fail(`合作伙伴 ${item.id || '(未知)'} 的 name 缺失或为空`)
    if (names.has(item.name)) fail(`合作伙伴名称重复入口：${item.name}`)
    names.add(item.name)
  }
}

function checkCta(home, routes, fail) {
  const cta = home.CTA_SECTION
  if (!cta) {
    fail('CTA_SECTION 缺失')
    return
  }
  for (const key of ['title', 'description', 'actionText']) {
    if (isEmpty(cta[key])) fail(`CTA_SECTION.${key} 缺失或为空`)
  }
  assertInternalLink(cta.link, routes, null, 'CTA_SECTION.link 咨询入口链接', fail)
  if (typeof cta.link === 'string' && cta.link.split(/[?#]/)[0] !== '/contact') {
    fail('CTA_SECTION.link 必须保留指向 /contact 的咨询入口')
  }
}

function assertIcon(icon, label, iconNames, fail) {
  if (isEmpty(icon)) {
    fail(`${label} 缺失`)
    return
  }
  if (iconNames && !iconNames.has(icon)) {
    fail(`${label} "${icon}" 不是 @element-plus/icons-vue 中存在的图标`)
  }
}

/**
 * 校验站内链接：必须非空、以 "/" 开头，且路径部分在路由表中已注册。
 * extraCheck 可追加业务规则（如产品链接 tab/锚点匹配）。
 */
function assertInternalLink(target, routes, extraCheck, label, fail) {
  if (isEmpty(target)) {
    fail(`${label} 缺失或为空`)
    return
  }
  if (typeof target !== 'string' || !target.startsWith('/')) {
    fail(`${label} "${target}" 必须是以 / 开头的站内路径`)
    return
  }
  const pathOnly = target.split(/[?#]/)[0]
  const known = new Set((routes || []).map((route) => route.path))
  if (!known.has(pathOnly)) {
    fail(`${label} 指向未注册路由：${target}`)
    return
  }
  if (extraCheck) {
    const reason = extraCheck(target)
    if (reason) fail(`${label} 失效：${reason}`)
  }
}
