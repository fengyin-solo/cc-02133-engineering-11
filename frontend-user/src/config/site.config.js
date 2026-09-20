/**
 * 站点统一配置（Single Source of Truth）
 *
 * 固化内容：
 *  - site：站点元数据（公司名、标题、描述、关键词），与 index.html、router 保持一致
 *  - nav：导航入口，NavHeader 与 router 共用，禁止两处各写一份
 *  - home：首页全部展示数据
 *      · hero             主视觉（品牌概览，含标题/描述/按钮/概览统计）
 *      · features         核心优势
 *      · featuredProducts 产品与服务（id 必须存在于 products.config.js）
 *      · stats            服务统计
 *      · cases            成功案例
 *      · partners         合作伙伴
 *      · cta              底部咨询入口
 *  - baseline：首页区块顺序与关键入口基线，校验器据此核对
 *
 * 校验：scripts/validate-site-config.mjs 会在 `npm run dev` 前、`npm run build` 前
 * 以及 Vite dev server / build 过程中执行。配置缺项、重复入口、链接失效、数据为空、
 * 区块顺序或元数据不一致都会明确失败（dev 报错遮罩，build 直接中断）。
 *
 * 数据在模块加载时冻结，运行时任何页面（首次进入 / 缩放 / 前进后退）读到的都是同一份基线。
 */

export const site = Object.freeze({
  name: '广州知运信息技术有限公司',
  shortName: '广州知运信息技术',
  // index.html <title> 必须与此完全一致
  htmlTitle: '广州知运信息技术有限公司 - 智慧物流系统专家',
  description: '广州知运信息技术有限公司 - 专注智慧物流系统解决方案',
  keywords: '智慧物流,物流系统,仓储管理,运输管理,广州知运'
})

/**
 * 全站导航 / 路由的唯一来源。
 * view 对应 src/views 下的文件名（XxxView.vue），由 router 动态加载，
 * title 即路由 meta.title，document.title 拼接规则保持不变。
 */
export const nav = Object.freeze([
  Object.freeze({ name: '首页', path: '/', view: 'HomeView', title: '首页' }),
  Object.freeze({ name: '关于我们', path: '/about', view: 'AboutView', title: '关于我们' }),
  Object.freeze({ name: '产品服务', path: '/products', view: 'ProductView', title: '产品服务' }),
  Object.freeze({ name: '案例展示', path: '/cases', view: 'CaseView', title: '案例展示' }),
  Object.freeze({ name: '联系我们', path: '/contact', view: 'ContactView', title: '联系我们' })
])

export const home = Object.freeze({
  // 主视觉：标题结构、按钮（了解产品 / 免费咨询）与原页面完全一致
  hero: Object.freeze({
    titleHighlight: '智慧物流',
    titleTail: '让供应链更高效',
    description:
      '广州知运信息技术有限公司专注于智慧物流系统解决方案，为企业提供仓储管理、运输调度、配送优化等一站式数字化服务',
    actions: Object.freeze([
      Object.freeze({ label: '了解产品', type: 'primary', link: '/products' }),
      Object.freeze({ label: '免费咨询', type: 'default', link: '/contact' })
    ]),
    // 主视觉底部概览统计，通过 statIds 引用 stats，保证两处数据同一来源
    statIds: Object.freeze(['customers', 'stability', 'efficiency'])
  }),

  features: Object.freeze({
    title: '为什么选择知运',
    subtitle: '我们致力于为企业提供最专业的智慧物流解决方案',
    items: Object.freeze([
      Object.freeze({
        id: 'smart-tech',
        icon: 'Cpu',
        title: '智能化技术',
        description: '基于AI和大数据的智能算法，实现物流全流程自动化决策'
      }),
      Object.freeze({
        id: 'full-chain',
        icon: 'Connection',
        title: '全链路整合',
        description: '打通仓储、运输、配送各环节，实现供应链一体化管理'
      }),
      Object.freeze({
        id: 'data-driven',
        icon: 'DataAnalysis',
        title: '数据驱动',
        description: '实时数据监控与分析，助力企业精准决策，降本增效'
      }),
      Object.freeze({
        id: 'professional-service',
        icon: 'Service',
        title: '专业服务',
        description: '资深行业专家团队，提供7x24小时技术支持与咨询服务'
      })
    ])
  }),

  featuredProducts: Object.freeze({
    title: '产品与服务',
    subtitle: '全方位的智慧物流系统，满足您的各种业务需求',
    // 首页卡片展示内容；id 必须在产品目录（products.config.js）中存在
    items: Object.freeze([
      Object.freeze({
        id: 'wms',
        icon: 'Box',
        title: '智慧仓储系统',
        description: '全面的仓库管理解决方案，实现库存精准管控',
        features: Object.freeze(['库位智能管理', '出入库自动化', '库存实时监控', '批次追溯管理'])
      }),
      Object.freeze({
        id: 'tms',
        icon: 'Van',
        title: '运输管理系统',
        description: '高效的运输调度平台，优化运输成本与时效',
        features: Object.freeze(['智能路径规划', '车辆实时追踪', '运费自动核算', '承运商管理'])
      }),
      Object.freeze({
        id: 'dms',
        icon: 'Location',
        title: '配送调度系统',
        description: '智能配送解决方案，提升末端配送效率',
        features: Object.freeze(['订单智能分配', '配送路线优化', '签收电子化', '配送员管理'])
      })
    ])
  }),

  // 服务统计：主视觉概览与中部数据带共用同一份数据
  stats: Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'customers', icon: 'User', value: '500+', label: '服务客户' }),
      Object.freeze({ id: 'orders', icon: 'Goods', value: '1亿+', label: '日处理订单' }),
      Object.freeze({ id: 'efficiency', icon: 'TrendCharts', value: '30%', label: '效率提升' }),
      Object.freeze({ id: 'stability', icon: 'Timer', value: '99.9%', label: '系统稳定性' })
    ])
  }),

  cases: Object.freeze({
    title: '成功案例',
    subtitle: '众多企业选择知运，实现物流数字化转型',
    moreText: '查看更多案例',
    moreLink: '/cases',
    items: Object.freeze([
      Object.freeze({
        id: 'ecommerce',
        title: '某大型电商平台',
        description: '通过部署知运智慧仓储系统，实现仓库作业效率提升40%，库存准确率达99.9%',
        tag: '电商物流',
        industry: '电子商务'
      }),
      Object.freeze({
        id: 'express',
        title: '某知名快递企业',
        description: '采用知运运输管理系统，优化运输路线，降低运输成本25%，时效提升20%',
        tag: '快递物流',
        industry: '快递行业'
      }),
      Object.freeze({
        id: 'retail',
        title: '某连锁零售集团',
        description: '使用知运配送调度系统，实现门店配送准时率提升至98%，客户满意度显著提高',
        tag: '零售配送',
        industry: '零售行业'
      })
    ])
  }),

  partners: Object.freeze({
    title: '合作伙伴',
    subtitle: '携手行业领先企业，共创智慧物流新未来',
    items: Object.freeze([
      Object.freeze({ id: 'p1', name: '顺丰速运' }),
      Object.freeze({ id: 'p2', name: '京东物流' }),
      Object.freeze({ id: 'p3', name: '菜鸟网络' }),
      Object.freeze({ id: 'p4', name: '德邦快递' }),
      Object.freeze({ id: 'p5', name: '三通一达' }),
      Object.freeze({ id: 'p6', name: '中远海运' }),
      Object.freeze({ id: 'p7', name: '招商物流' }),
      Object.freeze({ id: 'p8', name: '唯品会' })
    ])
  }),

  // 底部咨询入口：文案、链接与原页面完全一致
  cta: Object.freeze({
    title: '准备好开启智慧物流之旅了吗？',
    description: '立即联系我们，获取专属解决方案',
    actionText: '免费咨询',
    actionLink: '/contact'
  })
})

/**
 * 首页渲染基线（不可变）。
 * sectionOrder：区块在页面中自上而下的唯一顺序，区块通过 data-section 与之对应。
 * heroActions / ctaLink：锁定主视觉与咨询入口，防止入口被改动或失效。
 */
export const baseline = Object.freeze({
  sectionOrder: Object.freeze(['hero', 'features', 'products', 'stats', 'cases', 'partners', 'cta']),
  heroActions: Object.freeze([
    Object.freeze({ label: '了解产品', link: '/products' }),
    Object.freeze({ label: '免费咨询', link: '/contact' })
  ]),
  ctaLink: '/contact'
})

export default Object.freeze({ site, nav, home, baseline })
