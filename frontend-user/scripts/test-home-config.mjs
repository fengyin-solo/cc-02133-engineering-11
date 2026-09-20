/**
 * 首页配置校验器的失败场景自测（零依赖，node scripts/test-home-config.mjs）。
 * 验证：配置缺项、重复入口、链接失效、数据为空等情况必须明确失败；
 * 合法配置必须通过。
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { validateHomeConfig, EXPECTED_SECTION_ORDER } from './validate-home-config.js'

const require = createRequire(import.meta.url)
const icons = await import(
  require.resolve('@element-plus/icons-vue/dist/index.js', { paths: [process.cwd()] })
)
const iconNames = new Set(Object.keys(icons))

const routes = [
  { path: '/', name: 'Home', title: '首页' },
  { path: '/about', name: 'About', title: '关于我们' },
  { path: '/products', name: 'Products', title: '产品服务' },
  { path: '/cases', name: 'Cases', title: '案例展示' },
  { path: '/contact', name: 'Contact', title: '联系我们' }
]

const site = {
  name: '广州知运信息技术有限公司',
  documentTitle: '广州知运信息技术有限公司 - 智慧物流系统专家',
  pageTitleTemplate: '%s - 广州知运信息技术有限公司',
  description: '广州知运信息技术有限公司 - 专注智慧物流系统解决方案'
}

const products = [
  {
    id: 'wms',
    icon: 'Box',
    title: '智慧仓储系统',
    description: '全面的仓库管理解决方案',
    features: ['库位智能管理'],
    detailLink: '/products?tab=wms#product-wms'
  }
]

const validHome = () => ({
  HOME_SECTION_ORDER: [...EXPECTED_SECTION_ORDER],
  HERO: {
    title: { highlight: '智慧物流', rest: '让供应链更高效' },
    description: '专注于智慧物流系统解决方案',
    actions: [
      { key: 'learn-products', label: '了解产品', link: '/products', type: 'primary' },
      { key: 'free-consulting', label: '免费咨询', link: '/contact', type: 'default' }
    ],
    statIds: ['customers', 'stability']
  },
  FEATURES_SECTION: {
    key: 'features',
    title: '为什么选择知运',
    subtitle: '副标题',
    items: [
      { id: 'f1', icon: 'Cpu', title: '智能化技术', description: '描述一' },
      { id: 'f2', icon: 'Service', title: '专业服务', description: '描述二' }
    ]
  },
  PRODUCTS_SECTION: { key: 'products', title: '产品与服务', subtitle: '副标题' },
  STATS: [
    { id: 'customers', icon: 'User', value: '500+', label: '服务客户' },
    { id: 'stability', icon: 'Timer', value: '99.9%', label: '系统稳定性' }
  ],
  STATS_SECTION: { key: 'stats' },
  CASES_SECTION: {
    key: 'cases',
    title: '成功案例',
    subtitle: '副标题',
    moreLink: '/cases',
    moreLinkText: '查看更多案例',
    items: [
      { id: 'c1', title: '案例一', description: '描述', tag: '电商', industry: '电商' }
    ]
  },
  PARTNERS_SECTION: {
    key: 'partners',
    title: '合作伙伴',
    subtitle: '副标题',
    icon: 'OfficeBuilding',
    items: [
      { id: 'p1', name: '伙伴一' },
      { id: 'p2', name: '伙伴二' }
    ]
  },
  CTA_SECTION: {
    key: 'cta',
    title: '标题',
    description: '描述',
    actionText: '免费咨询',
    link: '/contact'
  }
})

const baseOverrides = () => ({ routes, site, products, iconNames, home: validHome() })

/** 断言该校验必须失败，且错误信息包含 expectedSnippet 之一 */
async function expectFailure(name, mutate, expectedSnippets) {
  const overrides = baseOverrides()
  mutate(overrides)
  try {
    await validateHomeConfig({ overrides })
  } catch (error) {
    for (const snippet of [].concat(expectedSnippets)) {
      assert.ok(
        error.message.includes(snippet),
        `[${name}] 期望错误信息包含 "${snippet}"，实际为：\n${error.message}`
      )
    }
    console.log(`  ✓ ${name} → 明确失败`)
    return
  }
  throw new assert.AssertionError({ message: `[${name}] 期望校验失败，但实际通过了` })
}

async function expectSuccess(name, mutate) {
  const overrides = baseOverrides()
  if (mutate) mutate(overrides)
  await validateHomeConfig({ overrides })
  console.log(`  ✓ ${name} → 通过`)
}

let failed = 0
async function run(name, fn) {
  try {
    await fn()
  } catch (error) {
    failed += 1
    console.error(`  ✗ ${name}`)
    console.error(`    ${error.message}`)
  }
}

console.log('首页配置校验器失败场景测试：\n')

await run('合法基线通过', () => expectSuccess('合法基线'))
await run('带 query/hash 的合法产品链接通过', () =>
  expectSuccess('产品深链', (o) => {
    o.products[0].detailLink = '/products?tab=wms#product-wms'
  })
)

await run('区块顺序与基线不一致时失败', () =>
  expectFailure(
    '区块顺序调换',
    (o) => o.home.HOME_SECTION_ORDER.reverse(),
    ['区块顺序与基线不一致']
  )
)
await run('区块缺失时失败', () =>
  expectFailure(
    '缺少 partners 区块',
    (o) => {
      o.home.HOME_SECTION_ORDER = o.home.HOME_SECTION_ORDER.filter((key) => key !== 'partners')
    },
    ['区块顺序与基线不一致']
  )
)
await run('区块配置对象缺失时失败', () =>
  expectFailure(
    '缺少 PARTNERS_SECTION 对象',
    (o) => delete o.home.PARTNERS_SECTION,
    ['PARTNERS_SECTION']
  )
)
await run('CTA 区块配置缺失时失败', () =>
  expectFailure('缺少 CTA_SECTION', (o) => delete o.home.CTA_SECTION, ['CTA_SECTION'])
)

await run('品牌概览缺项时失败', () =>
  expectFailure('HERO 标题为空', (o) => (o.home.HERO.title.highlight = '   '), ['highlight'])
)
await run('咨询入口丢失时失败', () =>
  expectFailure(
    'HERO 无 /contact 入口',
    (o) => (o.home.HERO.actions = o.home.HERO.actions.filter((a) => a.link !== '/contact')),
    ['免费咨询入口']
  )
)
await run('HERO 入口 key 重复时失败', () =>
  expectFailure(
    'HERO key 重复',
    (o) => (o.home.HERO.actions[1].key = 'learn-products'),
    ['key 重复']
  )
)
await run('HERO 链接重复入口时失败', () =>
  expectFailure(
    'HERO 链接重复',
    (o) => (o.home.HERO.actions[1].link = '/products'),
    ['链接重复入口']
  )
)
await run('HERO 链接指向未注册路由时失败', () =>
  expectFailure('HERO 死链', (o) => (o.home.HERO.actions[0].link = '/not-exist'), ['未注册路由'])
)
await run('HERO statIds 引用不存在统计时失败', () =>
  expectFailure('坏统计引用', (o) => o.home.HERO.statIds.push('ghost'), ['不存在的服务统计 id'])
)

await run('服务统计为空时失败', () =>
  expectFailure('STATS 空数组', (o) => (o.home.STATS = []), ['STATS 为空'])
)
await run('服务统计 value 为空时失败', () =>
  expectFailure('统计 value 空', (o) => (o.home.STATS[0].value = ''), ['value'])
)
await run('服务统计 id 重复时失败', () =>
  expectFailure(
    'STATS id 重复',
    (o) => (o.home.STATS[1].id = 'customers'),
    ['id 重复入口']
  )
)
await run('统计图标不存在时失败', () =>
  expectFailure('坏图标', (o) => (o.home.STATS[0].icon = 'NotAnIcon'), ['NotAnIcon', 'icons-vue'])
)

await run('合作伙伴数据为空时失败', () =>
  expectFailure('伙伴为空', (o) => (o.home.PARTNERS_SECTION.items = []), ['合作伙伴数据不允许为空'])
)
await run('合作伙伴 id 重复时失败', () =>
  expectFailure('伙伴 id 重复', (o) => (o.home.PARTNERS_SECTION.items[1].id = 'p1'), ['id 重复入口'])
)
await run('合作伙伴名称重复时失败', () =>
  expectFailure('伙伴名称重复', (o) => (o.home.PARTNERS_SECTION.items[1].name = '伙伴一'), ['名称重复入口'])
)

await run('案例 moreLink 死链时失败', () =>
  expectFailure('案例链接失效', (o) => (o.home.CASES_SECTION.moreLink = '/cases-xyz'), ['未注册路由'])
)
await run('案例数据为空时失败', () =>
  expectFailure('案例为空', (o) => (o.home.CASES_SECTION.items = []), ['CASES_SECTION.items 为空'])
)
await run('案例字段缺项时失败', () =>
  expectFailure('案例缺 tag', (o) => (o.home.CASES_SECTION.items[0].tag = ''), ['tag'])
)

await run('CTA 咨询链接偏离 /contact 时失败', () =>
  expectFailure('CTA 链接错误', (o) => (o.home.CTA_SECTION.link = '/products'), ['/contact'])
)

await run('产品 detailLink 指向未注册路由时失败', () =>
  expectFailure(
    '产品链接死链',
    (o) => (o.products[0].detailLink = '/product?tab=wms#product-wms'),
    ['未注册路由']
  )
)
await run('产品 detailLink 的 tab 与 id 不一致时失败', () =>
  expectFailure(
    '产品 tab 错位',
    (o) => (o.products[0].detailLink = '/products?tab=tms#product-wms'),
    ['tab']
  )
)
await run('产品 detailLink 的锚点与 id 不一致时失败', () =>
  expectFailure(
    '产品锚点错位',
    (o) => (o.products[0].detailLink = '/products?tab=wms#product-tms'),
    ['锚点']
  )
)
await run('产品 features 为空时失败', () =>
  expectFailure('产品卖点为空', (o) => (o.products[0].features = []), ['features 为空'])
)

await run('路由缺少 title 元数据时失败', () =>
  expectFailure(
    '路由 title 缺失',
    (o) => delete o.routes[1].title,
    ['meta.title']
  )
)
await run('路由路径重复时失败', () =>
  expectFailure(
    '路由重复入口',
    (o) => (o.routes[1].path = '/'),
    ['路由路径重复入口']
  )
)
await run('缺少首页路由时失败', () =>
  expectFailure(
    '无首页路由',
    (o) => (o.routes = o.routes.filter((route) => route.path !== '/')),
    ['首页']
  )
)
await run('站点标题模板缺占位符时失败', () =>
  expectFailure(
    '标题模板错误',
    (o) => (o.site.pageTitleTemplate = '广州知运'),
    ['%s']
  )
)

if (failed > 0) {
  console.error(`\n${failed} 个测试失败`)
  process.exit(1)
}
console.log('\n全部测试通过 ✓')
