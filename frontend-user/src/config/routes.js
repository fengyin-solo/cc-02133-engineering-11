/**
 * 全站路由的唯一事实来源（路径 + 元数据）。
 * router、导航、页脚以及配置校验脚本都必须引用这里，
 * 避免路径或标题在多处重复声明后产生不一致。
 */
export const ROUTES = [
  { path: '/', name: 'Home', title: '首页' },
  { path: '/about', name: 'About', title: '关于我们' },
  { path: '/products', name: 'Products', title: '产品服务' },
  { path: '/cases', name: 'Cases', title: '案例展示' },
  { path: '/contact', name: 'Contact', title: '联系我们' }
]

/** 首页导航头部展示的入口顺序（与 ROUTES 中的定义保持同源） */
export const NAV_ITEMS = ROUTES

const ROUTE_PATH_SET = new Set(ROUTES.map((route) => route.path))

/** 判断一个站内链接（可带 query/hash）是否指向已注册路由 */
export function isKnownInternalPath(target) {
  if (typeof target !== 'string' || target.length === 0) return false
  const pathOnly = target.split(/[?#]/)[0]
  return ROUTE_PATH_SET.has(pathOnly)
}
