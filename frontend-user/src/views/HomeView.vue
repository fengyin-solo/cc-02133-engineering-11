<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <HeroBanner />

    <!-- 核心优势 -->
    <section class="section section-gray" data-section="features">
      <div class="container">
        <SectionTitle
          :title="features.title"
          :subtitle="features.subtitle"
        />
        <div class="row">
          <div class="col col-3" v-for="feature in features.items" :key="feature.id">
            <FeatureCard
              :icon="feature.icon"
              :title="feature.title"
              :description="feature.description"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 产品服务 -->
    <section class="section section-light" data-section="products">
      <div class="container">
        <SectionTitle
          :title="featuredProducts.title"
          :subtitle="featuredProducts.subtitle"
        />
        <div class="row">
          <div class="col col-4" v-for="product in featuredProducts.items" :key="product.id">
            <ProductCard
              :icon="product.icon"
              :product-id="product.id"
              :title="product.title"
              :description="product.description"
              :features="product.features"
              @detail="handleProductDetail"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 数据展示 -->
    <section class="section section-dark stats-section" data-section="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in stats.items" :key="stat.id">
            <div class="stat-icon">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 成功案例 -->
    <section class="section section-gray" data-section="cases">
      <div class="container">
        <SectionTitle
          :title="cases.title"
          :subtitle="cases.subtitle"
        />
        <div class="row">
          <div class="col col-4" v-for="caseItem in cases.items" :key="caseItem.id">
            <CaseCard
              :title="caseItem.title"
              :description="caseItem.description"
              :tag="caseItem.tag"
              :industry="caseItem.industry"
              @click="$router.push(cases.moreLink)"
            />
          </div>
        </div>
        <div class="text-center" style="margin-top: 32px;">
          <el-button type="primary" size="large" @click="$router.push(cases.moreLink)">
            {{ cases.moreText }}
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <!-- 合作伙伴 -->
    <section class="section section-light" data-section="partners">
      <div class="container">
        <SectionTitle
          :title="partners.title"
          :subtitle="partners.subtitle"
        />
        <div class="partners-grid">
          <div class="partner-item" v-for="partner in partners.items" :key="partner.id">
            <div class="partner-logo">
              <el-icon :size="32"><OfficeBuilding /></el-icon>
              <span>{{ partner.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section" data-section="cta">
      <div class="container text-center">
        <h2 class="cta-title">{{ cta.title }}</h2>
        <p class="cta-desc">{{ cta.description }}</p>
        <el-button type="primary" size="large" round @click="$router.push(cta.actionLink)">
          {{ cta.actionText }}
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroBanner from '@/components/HeroBanner.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import ProductCard from '@/components/ProductCard.vue'
import CaseCard from '@/components/CaseCard.vue'
import { useRouter } from 'vue-router'
import { home } from '@/config/site.config'

const router = useRouter()

// 首页全部区块数据来自统一配置，组件内不再硬编码业务数据
const { features, featuredProducts, stats, cases, partners, cta } = home

const handleProductDetail = (productId) => {
  if (productId) {
    router.push({ path: '/products', query: { tab: productId }, hash: `#product-${productId}` })
  } else {
    router.push('/products')
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.stats-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-xl;
}

.stat-card {
  text-align: center;
  padding: $spacing-xl;
  background: rgba(255, 255, 255, 0.05);
  border-radius: $radius-lg;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 64px;
  height: 64px;
  background: rgba($primary-color, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-md;
  color: $primary-color;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: $spacing-xs;
}

.stat-label {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.65);
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
}

.partner-item {
  background: $bg-color;
  border-radius: $radius-md;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.partner-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  color: $text-secondary;

  span {
    font-size: $font-size-sm;
  }
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
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .partners-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $breakpoint-md) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .stat-card {
    padding: $spacing-md;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .partners-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .partner-item {
    padding: $spacing-md;
  }

  .cta-title {
    font-size: $font-size-xl;
  }

  .cta-desc {
    font-size: $font-size-base;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .partners-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
