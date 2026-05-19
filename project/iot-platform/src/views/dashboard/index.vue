<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card" v-for="item in statData" :key="item.title">
        <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
          <el-icon :size="24" :color="item.color">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entry card">
      <div class="card-header">
        <span class="card-title">快捷入口</span>
      </div>
      <div class="entry-list">
        <div
          class="entry-item"
          v-for="entry in quickEntries"
          :key="entry.title"
          @click="handleEntry(entry)"
        >
          <el-icon :size="32" :color="entry.color">
            <component :is="entry.icon" />
          </el-icon>
          <span class="entry-title">{{ entry.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Box,
  User,
  Setting,
  DataAnalysis,
  Grid
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const statData = ref([
  {
    title: '产品总数',
    value: '128',
    icon: Box,
    color: '#1890FF',
    bgColor: '#E6F7FF'
  },
  {
    title: '设备总数',
    value: '3,256',
    icon: Grid,
    color: '#52C41A',
    bgColor: '#F6FFED'
  },
  {
    title: '今日活跃',
    value: '1,892',
    icon: DataAnalysis,
    color: '#FAAD14',
    bgColor: '#FFFBE6'
  },
  {
    title: '用户总数',
    value: '5,678',
    icon: User,
    color: '#722ED1',
    bgColor: '#F9F0FF'
  }
])

// 快捷入口
const quickEntries = ref([
  {
    title: '产品管理',
    icon: Box,
    color: '#1890FF',
    path: '/product'
  }
])

// 点击快捷入口
const handleEntry = (entry) => {
  router.push(entry.path)
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--spacing-lg);
  width: 100%;
  box-sizing: border-box;

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);

    .stat-card {
      background: var(--bg-card);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      box-shadow: var(--shadow-sm);
      min-width: 0;

      .stat-icon {
        width: 56px;
        height: 56px;
        min-width: 56px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        flex: 1;
        min-width: 0;

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-title {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          margin-top: 4px;
        }
      }
    }
  }

  .quick-entry {
    .card-header {
      margin-bottom: var(--spacing-lg);

      .card-title {
        font-size: var(--font-lg);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .entry-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-lg);

      .entry-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition);

        &:hover {
          background: var(--bg-hover);
        }

        .entry-title {
          font-size: var(--font-md);
          color: var(--text-primary);
          margin-top: var(--spacing-sm);
        }
      }
    }
  }
}
</style>
