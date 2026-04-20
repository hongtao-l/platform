<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </div>
        <span v-show="!isCollapsed" class="logo-text">IoT 平台</span>
      </div>

      <!-- 菜单 -->
      <nav class="sidebar-menu">
        <div
          v-for="item in menuList"
          :key="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @click="handleMenuClick(item)"
        >
          <el-icon class="menu-icon">
            <component :is="item.icon" />
          </el-icon>
          <span v-show="!isCollapsed" class="menu-text">{{ item.title }}</span>
        </div>
      </nav>

      <!-- 折叠按钮 -->
      <div class="sidebar-footer">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="18">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <span v-show="!isCollapsed" class="collapse-text">收起菜单</span>
        </div>
      </div>
    </aside>

    <!-- 右侧主体 -->
    <div class="layout-right" :class="{ collapsed: isCollapsed }">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentMenu">{{ currentMenu }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 通知图标 -->
          <el-badge :value="3" :max="99" class="header-badge">
            <el-icon :size="20" class="header-icon"><Bell /></el-icon>
          </el-badge>
          <!-- 用户头像 -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar">
                <el-icon :size="18"><User /></el-icon>
              </el-avatar>
              <span class="user-name">{{ userInfo.name }}</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  账号设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  Box,
  Grid,
  DataAnalysis,
  Setting,
  Fold,
  Expand,
  Bell,
  User,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 折叠状态
const isCollapsed = ref(false)

// 用户信息
const userInfo = ref({
  name: '管理员',
  avatar: '' // 可设置头像URL
})

// 菜单列表
const menuList = ref([
  {
    title: '工作台',
    path: '/dashboard',
    icon: House
  },
  {
    title: '产品管理',
    path: '/product',
    icon: Box
  },
  {
    title: '设备管理',
    path: '/device',
    icon: Grid
  },
  {
    title: '数据统计',
    path: '/statistics',
    icon: DataAnalysis
  },
  {
    title: '系统设置',
    path: '/settings',
    icon: Setting
  }
])

// 当前菜单名称
const currentMenu = computed(() => {
  const item = menuList.value.find(m => route.path.startsWith(m.path))
  return item?.title || ''
})

// 判断菜单是否激活
const isActive = (path) => {
  return route.path.startsWith(path)
}

// 点击菜单
const handleMenuClick = (item) => {
  router.push(item.path)
}

// 切换折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 用户下拉菜单操作
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心')
      break
    case 'settings':
      ElMessage.info('账号设置')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('已退出登录')
      }).catch(() => {})
      break
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page);
  overflow-x: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: var(--bg-card);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-right: 1px solid var(--border-lighter);
  flex-shrink: 0;

  &.collapsed {
    width: var(--sidebar-collapsed-width);
    min-width: var(--sidebar-collapsed-width);

    .sidebar-logo {
      justify-content: center;
      padding: 16px;
    }

    .logo-text {
      display: none;
    }

    .menu-item {
      justify-content: center;
      padding: 12px;
    }

    .menu-text {
      display: none;
    }

    .sidebar-footer {
      justify-content: center;
      padding: 16px 8px;
    }

    .collapse-text {
      display: none;
    }

    .collapse-btn {
      padding: 10px;
    }
  }
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-lighter);

  .logo-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    flex-shrink: 0;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-left: 12px;
    white-space: nowrap;
  }
}

.sidebar-menu {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
  overflow-x: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    margin: 4px 12px;
    border-radius: 8px;
    color: var(--text-regular);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--bg-hover);
      color: var(--primary-color);
    }

    &.active {
      background-color: var(--primary-bg);
      color: var(--primary-color);

      .menu-icon {
        color: var(--primary-color);
      }
    }

    .menu-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .menu-text {
      font-size: 14px;
      margin-left: 12px;
      white-space: nowrap;
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-lighter);
  display: flex;
  align-items: center;

  .collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--bg-elevated);
    border: 1px solid var(--border-lighter);

    &:hover {
      background-color: var(--primary-bg);
      color: var(--primary-color);
      border-color: var(--primary-color);
    }

    .collapse-text {
      font-size: 14px;
      margin-left: 8px;
      white-space: nowrap;
    }
  }
}

.layout-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.header {
  height: 56px;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 99;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;

    .header-badge {
      cursor: pointer;

      .header-icon {
        color: var(--text-secondary);
        transition: color 0.2s ease;

        &:hover {
          color: var(--primary-color);
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--bg-hover);
      }

      .user-name {
        font-size: 14px;
        color: var(--text-primary);
        margin-left: 8px;
        margin-right: 4px;
      }

      .arrow-icon {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 0;
  background-color: var(--bg-page);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
