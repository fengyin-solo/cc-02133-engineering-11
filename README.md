# 广州知运信息技术有限公司官网

## 1. How to Run

### 方式一：Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up --build -d

# 访问地址
http://localhost:8081
```

### 方式二：本地开发

```bash
# 进入前端目录
cd frontend-user

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 2. Services

| 服务 | 端口 | 说明 |
|------|------|------|
| 官网前端 | 8081 | Vue 3 静态页面 |

## 3. 测试账号

本项目为纯静态官网，无需登录账号。

## 4. 题目内容

> 在此空文件夹帮我创建一个Vue项目，它是我公司的官网，静态页面来的，公司名称是广州知运信息技术有限公司，首页的内容先帮我随意填充，公司目前经营的内容是智慧物流的系统

## 5. 项目结构

```
├── docs/                          # 项目文档
│   └── project_design.md          # 设计文档
├── frontend-user/                 # 前端项目
│   ├── public/                    # 静态资源
│   ├── src/
│   │   ├── assets/               # 资源文件
│   │   │   └── styles/           # 样式文件
│   │   ├── components/           # 公共组件
│   │   │   ├── NavHeader.vue     # 导航栏
│   │   │   ├── FooterSection.vue # 页脚
│   │   │   ├── HeroBanner.vue    # 首页横幅
│   │   │   ├── FeatureCard.vue   # 特性卡片
│   │   │   ├── ProductCard.vue   # 产品卡片
│   │   │   ├── CaseCard.vue      # 案例卡片
│   │   │   └── SectionTitle.vue  # 区块标题
│   │   ├── config/               # 统一配置（单一数据来源）
│   │   │   ├── site.config.js    # 站点元数据、导航、首页数据与区块基线
│   │   │   └── products.config.js # 产品目录（首页精选与产品页共用）
│   │   ├── router/               # 路由配置（由 site.config 的 nav 生成）
│   │   │   └── index.js
│   │   ├── views/                # 页面视图
│   │   │   ├── HomeView.vue      # 首页
│   │   │   ├── AboutView.vue     # 关于我们
│   │   │   ├── ProductView.vue   # 产品服务
│   │   │   ├── CaseView.vue      # 案例展示
│   │   │   └── ContactView.vue   # 联系我们
│   │   ├── App.vue               # 根组件
│   │   └── main.js               # 入口文件
│   ├── scripts/                  # 构建/开发校验脚本
│   │   ├── validate-site-config.mjs     # 站点配置校验器（CLI / 被插件复用）
│   │   └── vite-plugin-site-config.mjs  # Vite 插件（dev 遮罩报错 / build 中断）
│   ├── Dockerfile                # Docker构建文件
│   ├── nginx.conf                # Nginx配置
│   ├── package.json              # 依赖配置
│   └── vite.config.js            # Vite配置
├── docker-compose.yml            # Docker编排
├── .gitignore                    # Git忽略配置
└── README.md                     # 项目说明
```

## 7. 统一配置与一致性校验

首页的品牌概览（主视觉）、核心优势、精选产品、服务统计、成功案例、合作伙伴、
咨询入口，以及全站导航/路由和站点元数据，全部固化在
`frontend-user/src/config/site.config.js` 与 `products.config.js` 中，组件内不再硬编码业务数据。
配置对象在模块加载时冻结，首次进入、页面缩放、浏览器前进后退读到的都是同一基线；
主视觉内容与「免费咨询」入口由 `baseline` 锁定，不会被意外改动。

校验在本地开发与构建时自动执行（`predev` / `prebuild` 钩子 + Vite 插件双重生效）：

```bash
cd frontend-user
npm run validate-config   # 单独执行校验
npm run dev               # 先校验，dev server 中配置变更会实时复查（失败显示错误遮罩，修复后自动恢复）
npm run build             # 先校验，构建阶段再兜底复查，失败立即中断
```

以下情况会**明确失败**并给出具体原因：

- 配置缺项、字段为空、区块数据为空数组
- 导航或区块条目重复入口（重复 path / id / name）
- 内部链接在路由表中不存在、精选产品 id 在产品目录中不存在、引用了不存在的服务统计
- 配置引用了不存在的 Element Plus 图标
- 首页区块顺序与 `baseline.sectionOrder` 不一致（区块以 `data-section` 标记）
- 主视觉按钮、CTA 咨询入口与基线不一致
- `index.html` 的 title / description / keywords / favicon 与配置不一致
- 路由未以 `nav` 为唯一来源，或声明的视图文件不存在

## 6. 功能清单

### 页面功能

| 页面 | 功能点 |
|------|--------|
| 首页 | Hero横幅、公司简介、核心优势、产品亮点、合作伙伴 |
| 关于我们 | 公司介绍、发展历程、企业文化、团队风采 |
| 产品服务 | 智慧物流系统介绍、功能模块、技术优势 |
| 案例展示 | 成功案例列表、案例详情 |
| 联系我们 | 联系方式、公司地址、在线留言表单 |

### 技术特性

- ✅ Vue 3 Composition API
- ✅ Vue Router 路由管理
- ✅ Element Plus UI组件库
- ✅ SCSS 样式预处理
- ✅ 响应式布局适配
- ✅ Docker 容器化部署
