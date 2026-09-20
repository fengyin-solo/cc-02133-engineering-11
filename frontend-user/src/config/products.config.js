/**
 * 产品目录（统一配置 / Single Source of Truth）
 *
 * 产品服务页（ProductView）与首页精选产品（site.config.js -> home.featuredProducts）
 * 均以此文件为唯一来源，禁止在组件内硬编码产品数据。
 *
 * 任何改动都会被 scripts/validate-site-config.mjs 校验：
 * - 字段缺项 / 为空 / 重复 id 会直接失败
 * - icon 必须是 @element-plus/icons-vue 中真实存在的图标名
 * 冻结对象，避免运行时被意外修改导致基线漂移。
 */

const products = [
  {
    id: 'wms',
    tag: '核心产品',
    shortTitle: '智慧仓储',
    title: '智慧仓储管理系统 (WMS)',
    description:
      '全面的仓库管理解决方案，通过智能算法优化库位分配、拣货路径，实现仓库作业效率最大化。支持多仓库、多货主管理，满足不同业务场景需求。',
    icon: 'Box',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    reverse: false,
    features: [
      { title: '智能库位管理', desc: 'AI算法自动分配最优库位，提升空间利用率' },
      { title: '高效拣货作业', desc: '智能路径规划，减少拣货行走距离40%' },
      { title: '实时库存监控', desc: '库存数据实时同步，准确率达99.9%' },
      { title: '批次追溯管理', desc: '全程追溯，满足质量管理要求' }
    ],
    technologies: [
      { icon: 'Cpu', title: 'AI库位引擎', description: '基于机器学习的库位动态分配算法，持续优化仓储空间' },
      { icon: 'Connection', title: 'IoT设备互联', description: '无缝对接AGV、扫码枪、电子标签等智能硬件' },
      { icon: 'Lock', title: '数据安全', description: '仓库数据加密存储，操作日志全程可审计' },
      { icon: 'Monitor', title: '智能监控', description: '仓库温湿度、设备状态实时监控与预警' }
    ],
    steps: [
      { title: '仓储诊断', description: '深入分析现有仓储流程与痛点' },
      { title: '方案定制', description: '量身打造WMS解决方案' },
      { title: '系统部署', description: '专业团队实施，支持灰度上线' },
      { title: '操作培训', description: '仓管人员全流程操作培训' },
      { title: '持续优化', description: '定期复盘，持续迭代优化' }
    ]
  },
  {
    id: 'tms',
    tag: '核心产品',
    shortTitle: '运输管理',
    title: '运输管理系统 (TMS)',
    description:
      '高效的运输调度平台，整合运力资源，优化运输路线，降低运输成本。支持多种运输方式，实现运输全程可视化追踪。',
    icon: 'Van',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    reverse: true,
    features: [
      { title: '智能路径规划', desc: '基于实时路况的最优路线推荐' },
      { title: '运力资源整合', desc: '对接多家承运商，灵活调度运力' },
      { title: '运费自动核算', desc: '多维度计费规则，自动生成账单' },
      { title: '全程可视追踪', desc: '实时定位，异常预警及时推送' }
    ],
    technologies: [
      { icon: 'Cpu', title: '路径优化引擎', description: '多约束条件下最优路径计算，降低运输成本' },
      { icon: 'Connection', title: '多承运商对接', description: '标准化API对接主流物流平台与承运商' },
      { icon: 'Lock', title: '安全传输', description: '运输数据加密传输，保障商业机密安全' },
      { icon: 'Monitor', title: '实时追踪', description: 'GPS+基站双模定位，运输全程可视化' }
    ],
    steps: [
      { title: '运输分析', description: '梳理运输链路与成本结构' },
      { title: '方案设计', description: '制定运输管理优化方案' },
      { title: '系统集成', description: '对接承运商与车辆设备' },
      { title: '调度培训', description: '调度团队系统操作培训' },
      { title: '运营支持', description: '持续监控运营指标，优化调度策略' }
    ]
  },
  {
    id: 'dms',
    tag: '核心产品',
    shortTitle: '配送调度',
    title: '配送调度系统 (DMS)',
    description:
      '智能配送解决方案，优化末端配送效率。通过智能派单、路线优化，提升配送时效，降低配送成本。',
    icon: 'Location',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    reverse: false,
    features: [
      { title: '智能订单分配', desc: '基于配送员位置、能力智能派单' },
      { title: '配送路线优化', desc: '多点配送路线最优规划' },
      { title: '电子签收', desc: '拍照、签名电子化，凭证可追溯' },
      { title: '配送员管理', desc: '绩效考核、工作量统计一目了然' }
    ],
    technologies: [
      { icon: 'Cpu', title: '智能派单引擎', description: '基于配送员实时位置与能力的最优派单算法' },
      { icon: 'Connection', title: '订单无缝对接', description: '对接电商、ERP等多渠道订单来源' },
      { icon: 'Lock', title: '签收安全', description: '电子签收数据加密存储，防篡改可追溯' },
      { icon: 'Monitor', title: '配送监控', description: '配送进度实时跟踪，异常订单自动预警' }
    ],
    steps: [
      { title: '配送诊断', description: '分析末端配送效率与瓶颈' },
      { title: '方案定制', description: '设计智能配送解决方案' },
      { title: '系统上线', description: '配送团队系统部署与调试' },
      { title: '骑手培训', description: '配送员APP操作与流程培训' },
      { title: '持续运营', description: '配送数据复盘，持续提升效率' }
    ]
  },
  {
    id: 'data',
    tag: '增值服务',
    shortTitle: '数据分析',
    title: '数据分析平台',
    description:
      '强大的数据分析能力，将物流数据转化为业务洞察。多维度报表、可视化大屏，助力管理决策。',
    icon: 'DataAnalysis',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    reverse: true,
    features: [
      { title: '多维度报表', desc: '运营、财务、绩效报表一键生成' },
      { title: '可视化大屏', desc: '实时数据大屏，运营状态一目了然' },
      { title: '智能预警', desc: '异常数据自动预警，及时发现问题' },
      { title: '趋势分析', desc: '历史数据分析，预测业务趋势' }
    ],
    technologies: [
      { icon: 'Cpu', title: '大数据引擎', description: '分布式计算架构，支持海量物流数据实时分析' },
      { icon: 'Connection', title: '数据集成', description: '打通WMS/TMS/DMS多系统数据孤岛' },
      { icon: 'Lock', title: '数据治理', description: '数据质量管控与权限分级管理' },
      { icon: 'Monitor', title: '实时计算', description: '流式计算引擎，秒级数据更新与告警' }
    ],
    steps: [
      { title: '数据盘点', description: '梳理数据资产与分析需求' },
      { title: '数仓搭建', description: '构建统一数据仓库与分析模型' },
      { title: '报表开发', description: '定制化报表与大屏开发' },
      { title: '分析培训', description: '管理层数据分析能力培训' },
      { title: '持续迭代', description: '按需新增分析维度与指标' }
    ]
  }
]

/** 按 id 取产品（找不到返回 undefined，由调用方/校验器保证存在） */
export const getProductById = (id) => products.find((product) => product.id === id)

export default Object.freeze(products)
