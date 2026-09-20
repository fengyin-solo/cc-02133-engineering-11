/**
 * 产品入口 ID 的唯一事实来源。
 * 首页产品卡片、产品详情页的 tab/锚点以及合作伙伴以外的跨页链接，
 * 都只能使用这里登记过的 id；校验脚本会据此判断链接是否失效。
 *
 * 产品详情（标题、卖点、技术优势等）仍维护在 ProductView.vue 中，
 * 这里只固化“入口标识 + 首页卡片摘要”，避免首页与详情页各写一份 id。
 */
export const PRODUCTS = [
  {
    id: 'wms',
    icon: 'Box',
    title: '智慧仓储系统',
    description: '全面的仓库管理解决方案，实现库存精准管控',
    features: ['库位智能管理', '出入库自动化', '库存实时监控', '批次追溯管理'],
    /** 首页“了解详情”跳转目标（产品页 tab + 锚点） */
    detailLink: '/products?tab=wms#product-wms'
  },
  {
    id: 'tms',
    icon: 'Van',
    title: '运输管理系统',
    description: '高效的运输调度平台，优化运输成本与时效',
    features: ['智能路径规划', '车辆实时追踪', '运费自动核算', '承运商管理'],
    detailLink: '/products?tab=tms#product-tms'
  },
  {
    id: 'dms',
    icon: 'Location',
    title: '配送调度系统',
    description: '智能配送解决方案，提升末端配送效率',
    features: ['订单智能分配', '配送路线优化', '签收电子化', '配送员管理'],
    detailLink: '/products?tab=dms#product-dms'
  }
]

export const PRODUCT_IDS = PRODUCTS.map((product) => product.id)
