# 首页统一配置与校验

首页的品牌概览（主视觉文案与入口）、服务统计、合作伙伴以及各区块的标题/链接/顺序已固化到统一配置，不再散落在组件中。本地开发（`npm run dev`）与构建（`npm run build`）都会先执行配置校验，配置不合法时**明确失败**，不会带着坏配置启动或出包。

## 1. 配置文件

| 文件 | 职责 |
| --- | --- |
| `src/config/site.js` | 站点名称、`index.html` 标题、路由标题模板、描述、关键词 |
| `src/config/routes.js` | 全站路由路径与 `meta.title` 的唯一事实来源，router 与导航共用 |
| `src/config/products.js` | 产品入口 id 基线、首页卡片摘要、产品详情深链（tab + 锚点） |
| `src/config/home.js` | 首页全部内容：`HERO` 品牌概览、区块顺序基线、服务统计、合作伙伴、案例、CTA |

## 2. 区块顺序基线

`HOME_SECTION_ORDER` 固化首页渲染顺序，HeroBanner 固定在最前：

```
hero → features → products → stats → cases → partners → cta
```

`HomeView.vue` 严格按此顺序渲染（产物中可通过 `data-section` 属性核对）。校验器内置同一份基线，顺序被调换、插入或删除都会失败。

## 3. 校验规则与失败场景

校验器：`scripts/validate-home-config.js`；Vite 插件：`scripts/vite-plugin-home-config.js`。

以下情况一律失败（错误会一次全部列出）：

- **缺项**：必填字段（文案、标题、label、链接、图标、路由 `title` 等）缺失或为空字符串
- **数据为空**：服务统计、合作伙伴、案例、产品卖点等数组为空
- **重复入口**：路由路径重复、统计/伙伴/案例/产品 id 重复、伙伴名称重复、Hero 按钮 key 或链接重复
- **链接失效**：站内链接路径未在 `routes.js` 注册；产品深链的 `tab`/`#product-xxx` 与登记的产品 id 不一致
- **顺序不一致**：`HOME_SECTION_ORDER` 与基线不符，或缺少对应区块配置对象
- **元数据问题**：缺少首页路由、路由无 `title`、站点标题模板缺少 `%s`
- **坏图标**：图标名不是 `@element-plus/icons-vue` 已注册的组件
- **咨询入口漂移**：Hero 或底部 CTA 未保留指向 `/contact` 的免费咨询入口

运行方式：

```bash
npm run dev            # 校验失败则 dev server 启动失败
npm run build          # 校验失败则构建失败
npm run validate:home  # 手动 / CI 校验（退出码非 0 即失败）
npm run test:config    # 校验器自身的失败场景自测（30 个用例）
```

产品页 `ProductView.vue` 另有运行期守卫：统一配置中登记的产品 id 若在产品页缺失（首页深链会落到空锚点），进入产品页时直接抛错。

## 4. 展示基线保证（缩放 / 前进后退 / 首次进入）

- 所有内容为构建期静态导入的同步数据，首屏无异步请求，**首次进入**即为最终内容，不存在加载后跳变。
- 区块按数组顺序同步渲染，统计与伙伴不使用随机排序或懒加载；**浏览器前进/后退**（bfcache 恢复）与首次进入展示完全一致。
- 区块网格使用固定列数 + 媒体查询断点，不依赖 JS 测量窗口；**页面缩放**只触发与窄屏一致的响应式重排，区块顺序与内容不变。
- 主视觉 HeroBanner 的视觉样式、动画与“免费咨询”入口保持原样，仅把文案、链接、指标数字的**来源**换成配置。
