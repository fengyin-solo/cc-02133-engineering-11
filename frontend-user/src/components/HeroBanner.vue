<template>
  <section class="hero-banner">
    <div class="hero-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title animate-fadeInUp">
          <span class="highlight">{{ hero.title.highlight }}</span>
          <br />
          {{ hero.title.rest }}
        </h1>
        <p class="hero-desc animate-fadeInUp" style="animation-delay: 0.2s">
          {{ hero.description }}
        </p>
        <div class="hero-actions animate-fadeInUp" style="animation-delay: 0.4s">
          <el-button
            v-for="action in hero.actions"
            :key="action.key"
            :type="action.type === 'primary' ? 'primary' : ''"
            size="large"
            round
            @click="$router.push(action.link)"
          >
            {{ action.label }}
            <el-icon v-if="action.key === 'learn-products'" class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="hero-stats animate-fadeInUp" style="animation-delay: 0.6s">
          <div class="stat-item" v-for="stat in heroStats" :key="stat.id">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { HERO, STATS } from '@/config/home.js'

// 内容来源固化为统一配置：品牌概览文案、入口链接与主视觉指标均不在组件内硬编码
const hero = HERO

const heroStats = computed(() =>
  hero.statIds
    .map((id) => STATS.find((stat) => stat.id === id))
    .filter((stat) => Boolean(stat))
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.hero-banner {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: $spacing-xxl 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;

  &.shape-1 {
    width: 600px;
    height: 600px;
    background: $primary-color;
    top: -200px;
    right: -100px;
  }

  &.shape-2 {
    width: 400px;
    height: 400px;
    background: $success-color;
    bottom: -100px;
    left: -100px;
  }

  &.shape-3 {
    width: 300px;
    height: 300px;
    background: $warning-color;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.hero-content {
  max-width: 700px;
  color: #fff;
}

.hero-title {
  font-size: 52px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: $spacing-lg;

  .highlight {
    background: linear-gradient(90deg, $primary-color, $primary-light);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-desc {
  font-size: $font-size-lg;
  color: rgba(255, 255, 255, 0.75);
  line-height: $line-height-loose;
  margin-bottom: $spacing-xl;
}

.hero-actions {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-xxl;

  .el-button {
    padding: 12px 32px;
    font-size: $font-size-base;
  }
}

.hero-stats {
  display: flex;
  gap: $spacing-xxl;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: $spacing-xs;
}

.stat-label {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.65);
}

@media (max-width: $breakpoint-lg) {
  .hero-title {
    font-size: 40px;
  }

  .hero-stats {
    gap: $spacing-xl;
  }

  .stat-value {
    font-size: 28px;
  }
}

@media (max-width: $breakpoint-md) {
  .hero-banner {
    min-height: auto;
    padding: $spacing-xxl 0;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-desc {
    font-size: $font-size-base;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;

    .el-button {
      width: 100%;
      margin: 0;
      justify-content: center;
    }
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: $spacing-lg;
  }

  .stat-item {
    flex: 1;
    min-width: 100px;
  }
}
</style>
