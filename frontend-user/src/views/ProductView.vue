<template>
  <div class="product-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">产品服务</h1>
        <p class="page-subtitle">全方位智慧物流解决方案，助力企业数字化转型</p>
        <div class="product-tabs">
          <button
            v-for="product in products"
            :key="product.id"
            class="tab-btn"
            :class="{ active: activeTab === product.id }"
            @click="switchTab(product.id)"
          >
            <el-icon :size="18"><component :is="product.icon" /></el-icon>
            {{ product.shortTitle }}
          </button>
        </div>
      </div>
    </section>
    
    <!-- 产品列表 -->
    <section class="section section-light">
      <div class="container">
        <div
          v-for="product in products"
          :key="product.id"
          :id="`product-${product.id}`"
          class="product-detail"
          :class="{ 'product-highlight': activeTab === product.id }"
        >
          <div class="product-content" :class="{ 'order-2': product.reverse }">
            <div class="product-tag">{{ product.tag }}</div>
            <h2 class="product-title">{{ product.title }}</h2>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-features">
              <div class="feature-item" v-for="feature in product.features" :key="feature.title">
                <el-icon :size="20"><Check /></el-icon>
                <div>
                  <h4>{{ feature.title }}</h4>
                  <p>{{ feature.desc }}</p>
                </div>
              </div>
            </div>
            <el-button type="primary" size="large" @click="$router.push('/contact')">
              获取方案
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="product-image">
            <div class="image-placeholder" :style="{ background: product.gradient }">
              <el-icon :size="80">
                <component :is="product.icon" />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 技术优势 -->
    <section class="section section-gray">
      <div class="container">
        <SectionTitle 
          title="技术优势" 
          subtitle="领先的技术架构，保障系统稳定高效运行"
        />
        <div class="tech-grid">
          <div class="tech-card" v-for="tech in activeTechnologies" :key="tech.title">
            <div class="tech-icon">
              <el-icon :size="32">
                <component :is="tech.icon" />
              </el-icon>
            </div>
            <h3>{{ tech.title }}</h3>
            <p>{{ tech.description }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 服务流程 -->
    <section class="section section-light">
      <div class="container">
        <SectionTitle 
          title="服务流程" 
          subtitle="专业规范的服务流程，确保项目顺利交付"
        />
        <div class="process-steps">
          <div class="step-item" v-for="(step, index) in activeSteps" :key="step.title">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
            <div class="step-arrow" v-if="index < activeSteps.length - 1">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA -->
    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="cta-title">需要定制化解决方案？</h2>
        <p class="cta-desc">我们的专家团队将为您提供一对一咨询服务</p>
        <el-button type="primary" size="large" round @click="$router.push('/contact')">
          立即咨询
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionTitle from '@/components/SectionTitle.vue'
import products from '@/config/products.config'

const route = useRoute()
const router = useRouter()

// 产品目录由统一配置提供（src/config/products.config.js）


const activeTab = ref('wms')

const activeProduct = computed(() => {
  return products.find(p => p.id === activeTab.value) || products[0]
})

const activeTechnologies = computed(() => {
  return activeProduct.value.technologies
})

const activeSteps = computed(() => {
  return activeProduct.value.steps
})

const scrollToProduct = (productId) => {
  nextTick(() => {
    const el = document.getElementById(`product-${productId}`)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  })
}

const switchTab = (productId) => {
  activeTab.value = productId
  router.replace({ query: { tab: productId }, hash: `#product-${productId}` })
  scrollToProduct(productId)
}

onMounted(() => {
  const tabFromQuery = route.query.tab
  const hashFromUrl = route.hash ? route.hash.replace('#product-', '') : ''
  const initialTab = tabFromQuery || hashFromUrl
  if (initialTab && products.some(p => p.id === initialTab)) {
    activeTab.value = initialTab
    scrollToProduct(initialTab)
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab && products.some(p => p.id === newTab) && newTab !== activeTab.value) {
    activeTab.value = newTab
    scrollToProduct(newTab)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: $spacing-xxl 0;
  text-align: center;
  color: #fff;
}

.page-title {
  font-size: $font-size-xxxl;
  font-weight: 700;
  margin-bottom: $spacing-sm;
}

.page-subtitle {
  font-size: $font-size-lg;
  opacity: 0.75;
  margin-bottom: $spacing-xl;
}

.product-tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: $radius-lg;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: $font-size-base;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: $primary-color;
    border-color: $primary-color;
    color: #fff;
  }
}

.product-detail {
  display: flex;
  gap: $spacing-xxl;
  align-items: center;
  padding: $spacing-xxl 0;
  border-bottom: 1px solid $border-light;
  transition: background 0.3s;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-highlight {
  background: rgba($primary-color, 0.03);
  border-radius: $radius-lg;
  padding: $spacing-xxl;
  margin: 0 (-$spacing-xl);
}

.product-content {
  flex: 1;
  
  &.order-2 {
    order: 2;
  }
}

.product-tag {
  display: inline-block;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;
  margin-bottom: $spacing-md;
}

.product-title {
  font-size: $font-size-xxl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.product-desc {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: $line-height-loose;
  margin-bottom: $spacing-lg;
}

.product-features {
  margin-bottom: $spacing-xl;
}

.feature-item {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  
  .el-icon {
    color: $success-color;
    margin-top: 4px;
  }
  
  h4 {
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: 2px;
  }
  
  p {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.product-image {
  flex: 0 0 450px;
}

.image-placeholder {
  width: 100%;
  height: 350px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
}

.tech-card {
  background: $bg-white;
  padding: $spacing-xl;
  border-radius: $radius-lg;
  text-align: center;
  box-shadow: $shadow-md;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-lg;
  }
}

.tech-icon {
  width: 64px;
  height: 64px;
  background: rgba($primary-color, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-md;
  color: $primary-color;
}

.tech-card h3 {
  font-size: $font-size-lg;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.tech-card p {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.process-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.step-item {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-number {
  width: 48px;
  height: 48px;
  background: $primary-color;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-lg;
  font-weight: 700;
  margin: 0 auto $spacing-md;
}

.step-content {
  h4 {
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  p {
    font-size: $font-size-sm;
    color: $text-secondary;
    padding: 0 $spacing-sm;
  }
}

.step-arrow {
  position: absolute;
  right: -10px;
  top: 20px;
  color: $border-color;
}

.cta-section {
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: #fff;
}

.cta-title {
  font-size: $font-size-xxl;
  font-weight: 700;
  margin-bottom: $spacing-md;
}

.cta-desc {
  font-size: $font-size-lg;
  opacity: 0.85;
  margin-bottom: $spacing-xl;
}

@media (max-width: $breakpoint-lg) {
  .product-detail {
    flex-direction: column;
  }
  
  .product-content.order-2 {
    order: 0;
  }
  
  .product-image {
    flex: none;
    width: 100%;
  }
  
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .process-steps {
    flex-wrap: wrap;
    gap: $spacing-lg;
  }
  
  .step-item {
    flex: 0 0 calc(33.333% - 16px);
  }
  
  .step-arrow {
    display: none;
  }

  .product-highlight {
    margin: 0;
  }
}

@media (max-width: $breakpoint-md) {
  .page-title {
    font-size: $font-size-xxl;
  }
  
  .product-title {
    font-size: $font-size-xl;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
  
  .step-item {
    flex: 0 0 100%;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: $font-size-sm;
  }
}
</style>
