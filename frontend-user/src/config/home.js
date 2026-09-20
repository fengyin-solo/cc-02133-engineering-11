/**
 * 首页配置的唯一事实来源：
 *  - 品牌概览（主视觉文案、咨询/产品入口链接、主视觉指标）
 *  - 服务统计（深色数据区块）
 *  - 合作伙伴
 * 同时固化首页各区块的标题文案、链接与区块顺序。
 *
 * 约束（由 scripts/validate-home-config.js 在 dev/build 时强制）：
 *  - 不允许缺项、空数组、重复 id / 重复链接入口
 *  - 所有站内链接必须指向 src/config/routes.js 中已注册的路由
 *  - 产品链接的 tab/锚点必须命中 src/config/products.js 中登记的 id
 *  - sectionOrder 必须与首页模板区块顺序基线完全一致
 *  - 图标名称必须是 @element-plus/icons-vue 中存在的组件
 */

/** 首页区块顺序基线：HomeView 模板必须严格按此顺序渲染（Hero 固定在最前） */
export const HOME_SECTION_ORDER = ['features', 'products', 'stats', 'cases', 'partners', 'cta']

/** 品牌概览（主视觉 HeroBanner） */
export const HERO = {
  title: {
    highlight: '智慧物流',
    rest: '让供应链更高效'
  },
  description:
    '广州知运信息技术有限公司专注于智慧物流系统解决方案，为企业提供仓储管理、运输调度、配送优化等一站式数字化服务',
  actions: [
    { key: 'learn-products', label: '了解产品', link: '/products', type: 'primary' },
    { key: 'free-consulting', label: '免费咨询', link: '/contact', type: 'default' }
  ],
  /** 主视觉指标，取值必须来自 STATS 中的 id */
  statIds: ['customers', 'stability', 'efficiency']
}

/** 核心优势区块 */
export const FEATURES_SECTION = {
  key: 'features',
  title: '为什么选择知运',
  subtitle: '我们致力于为企业提供最专业的智慧物流解决方案',
  items: [
    {
      id: 'smart-tech',
      icon: 'Cpu',
      title: '智能化技术',
      description: '基于AI和大数据的智能算法，实现物流全流程自动化决策'
    },
    {
      id: 'full-chain',
      icon: 'Connection',
      title: '全链路整合',
      description: '打通仓储、运输、配送各环节，实现供应链一体化管理'
    },
    {
      id: 'data-driven',
      icon: 'DataAnalysis',
      title: '数据驱动',
      description: '实时数据监控与分析，助力企业精准决策，降本增效'
    },
    {
      id: 'professional-service',
      icon: 'Service',
      title: '专业服务',
      description: '资深行业专家团队，提供7x24小时技术支持与咨询服务'
    }
  ]
}

/** 产品服务区块（卡片数据与产品页共用 PRODUCTS，区块只固化标题与入口） */
export const PRODUCTS_SECTION = {
  key: 'products',
  title: '产品与服务',
  subtitle: '全方位的智慧物流系统，满足您的各种业务需求'
}

/** 服务统计：主视觉与深色统计区块共用同一份数据，保证两处数字基线一致 */
export const STATS = [
  { id: 'customers', icon: 'User', value: '500+', label: '服务客户' },
  { id: 'daily-orders', icon: 'Goods', value: '1亿+', label: '日处理订单' },
  { id: 'efficiency', icon: 'TrendCharts', value: '30%', label: '效率提升' },
  { id: 'stability', icon: 'Timer', value: '99.9%', label: '系统稳定性' }
]

export const STATS_SECTION = {
  key: 'stats'
}

/** 成功案例区块 */
export const CASES_SECTION = {
  key: 'cases',
  title: '成功案例',
  subtitle: '众多企业选择知运，实现物流数字化转型',
  moreLink: '/cases',
  moreLinkText: '查看更多案例',
  items: [
    {
      id: 'ecommerce-platform',
      title: '某大型电商平台',
      description: '通过部署知运智慧仓储系统，实现仓库作业效率提升40%，库存准确率达99.9%',
      tag: '电商物流',
      industry: '电子商务'
    },
    {
      id: 'express-enterprise',
      title: '某知名快递企业',
      description: '采用知运运输管理系统，优化运输路线，降低运输成本25%，时效提升20%',
      tag: '快递物流',
      industry: '快递行业'
    },
    {
      id: 'retail-group',
      title: '某连锁零售集团',
      description: '使用知运配送调度系统，实现门店配送准时率提升至98%，客户满意度显著提高',
      tag: '零售配送',
      industry: '零售行业'
    }
  ]
}

/** 合作伙伴区块（替代原先 v-for="i in 8" 的占位渲染，数据固化、不允许为空） */
export const PARTNERS_SECTION = {
  key: 'partners',
  title: '合作伙伴',
  subtitle: '携手行业领先企业，共创智慧物流新未来',
  icon: 'OfficeBuilding',
  items: [
    { id: 'yunlian-logistics', name: '云联物流' },
    { id: 'zhuoyue-express', name: '卓越速运' },
    { id: 'huihai-ecommerce', name: '汇海电商' },
    { id: 'zhixin-retail', name: '智信零售' },
    { id: 'fenghuang-manufacturing', name: '丰衡制造' },
    { id: 'anleng-supply-chain', name: '安冷供应链' },
    { id: 'zhongyun-transport', name: '中运运输' },
    { id: 'yupei-distribution', name: '宇配送达' }
  ]
}

/** 底部咨询入口区块（视觉与入口保持不变，文案/链接固化） */
export const CTA_SECTION = {
  key: 'cta',
  title: '准备好开启智慧物流之旅了吗？',
  description: '立即联系我们，获取专属解决方案',
  actionText: '免费咨询',
  link: '/contact'
}
