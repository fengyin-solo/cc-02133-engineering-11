/**
 * 站点级元数据的唯一事实来源。
 * 路由守卫动态标题与 index.html 的静态标题必须保持同一基线。
 */
export const SITE = {
  name: '广州知运信息技术有限公司',
  /** index.html <title> 使用的完整标题 */
  documentTitle: '广州知运信息技术有限公司 - 智慧物流系统专家',
  /** 路由守卫拼接页面标题的模板，%s 会被各路由 meta.title 替换 */
  pageTitleTemplate: '%s - 广州知运信息技术有限公司',
  description: '广州知运信息技术有限公司 - 专注智慧物流系统解决方案',
  keywords: ['智慧物流', '物流系统', '仓储管理', '运输管理', '广州知运']
}
