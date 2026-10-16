<template>
  <div class="layout-container" :class="{ 'sb-collapsed': isCollapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }" @mouseleave="scheduleCloseFlyout">
      <!-- Logo -->
      <div class="sb-header">
        <div class="sb-logo">
          <LayoutGrid :size="22" :stroke-width="2" />
        </div>
        <span class="sb-logo-text">IoT 平台</span>
      </div>

      <!-- 菜单 -->
      <nav class="sb-nav">
        <div class="sb-group-label">导航</div>

        <template v-for="item in menuList" :key="item.path || item.title">
          <!-- 父级菜单 -->
          <div
            v-if="item.children"
            class="sb-group"
            @mouseenter="openFlyout(item.title)"
            @mouseleave="scheduleCloseFlyout"
          >
            <button
              class="sb-btn"
              :class="{ active: isChildActive(item.children) }"
              @click="handleParentClick(item)"
            >
              <component :is="item.icon" class="sb-icon" :size="16" />
              <span class="sb-label">{{ item.title }}</span>
              <ChevronDown
                class="sb-arrow"
                :class="{ open: expandedMenus[item.title] }"
                :size="14"
              />
            </button>

            <!-- 展开态：内联子菜单 -->
            <div class="sb-sub" :class="{ open: expandedMenus[item.title] }">
              <button
                v-for="child in item.children"
                :key="child.path"
                class="sb-sub-btn"
                :class="{ active: isActive(child.path) }"
                @click="handleMenuClick(child)"
              >
                {{ child.title }}
              </button>
            </div>

            <!-- 收起态：鼠标悬浮飞出多级菜单 -->
            <transition name="sb-fly">
              <div v-if="isCollapsed && flyoutKey === item.title" class="sb-flyout">
                <div class="sb-flyout-title">{{ item.title }}</div>
                <button
                  v-for="child in item.children"
                  :key="child.path"
                  class="sb-flyout-item"
                  :class="{ active: isActive(child.path) }"
                  @click="handleMenuClick(child)"
                >
                  <component :is="child.icon" class="sb-icon" :size="15" />
                  <span>{{ child.title }}</span>
                </button>
              </div>
            </transition>
          </div>

          <!-- 普通菜单项 -->
          <div
            v-else
            class="sb-group"
            @mouseenter="openFlyout(item.title)"
            @mouseleave="scheduleCloseFlyout"
          >
            <button
              class="sb-btn"
              :class="{ active: isActive(item.path) }"
              @click="handleMenuClick(item)"
            >
              <component :is="item.icon" class="sb-icon" :size="16" />
              <span class="sb-label">{{ item.title }}</span>
            </button>

            <transition name="sb-fly">
              <div v-if="isCollapsed && flyoutKey === item.title" class="sb-flyout">
                <button class="sb-flyout-item" @click="handleMenuClick(item)">
                  <component :is="item.icon" class="sb-icon" :size="16" />
                  <span>{{ item.title }}</span>
                </button>
              </div>
            </transition>
          </div>
        </template>
      </nav>
    </aside>

    <!-- 右侧主体 -->
    <div class="layout-right">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <button
            class="header-trigger"
            :title="isCollapsed ? '展开菜单' : '收起菜单'"
            @click="toggleCollapse"
          >
            <PanelLeft :size="18" />
          </button>
          <span class="header-sep"></span>
          <el-breadcrumb class="breadcrumb">
            <template #separator>
              <ChevronRight class="bc-sep" :size="14" />
            </template>
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentMenu">{{ currentMenu }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 帮助 / 文档 / 技术支持 -->
          <el-dropdown trigger="click" @command="handleHelpCommand">
            <button class="header-icon-btn" title="帮助与支持">
              <CircleHelp :size="18" />
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="help"><BookOpen class="dd-icon" :size="15" />使用帮助</el-dropdown-item>
                <el-dropdown-item command="docs"><FileText class="dd-icon" :size="15" />开发者文档</el-dropdown-item>
                <el-dropdown-item command="feedback"><LifeBuoy class="dd-icon" :size="15" />技术支持</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 语言切换 -->
          <el-dropdown trigger="click" @command="handleLangCommand">
            <button class="header-icon-btn" title="切换语言">
              <Languages :size="18" />
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh">简体中文</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 通知 -->
          <el-badge :value="3" :max="99" class="header-badge">
            <button class="header-icon-btn" title="通知">
              <Bell :size="18" />
            </button>
          </el-badge>

          <span class="header-sep"></span>

          <!-- 用户 -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <button class="user-btn">
              <el-avatar :size="28" :src="userInfo.avatar">
                <User :size="15" />
              </el-avatar>
              <span class="user-name">我的空间</span>
              <ChevronDown class="user-caret" :size="14" />
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile"><User class="dd-icon" :size="15" />个人中心</el-dropdown-item>
                <el-dropdown-item command="settings"><Settings class="dd-icon" :size="15" />账号设置</el-dropdown-item>
                <el-dropdown-item divided command="logout"><LogOut class="dd-icon" :size="15" />退出登录</el-dropdown-item>
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
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutGrid,
  LayoutDashboard,
  Boxes,
  FolderTree,
  Blocks,
  BrainCircuit,
  Zap,
  Package,
  Wrench,
  ClipboardCheck,
  Layers,
  SlidersHorizontal,
  Server,
  Bot,
  Cog,
  Brain,
  Activity,
  ShoppingCart,
  Sparkles,
  Gift,
  Users,
  FlaskConical,
  PanelLeft,
  CircleHelp,
  BookOpen,
  FileText,
  LifeBuoy,
  Languages,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  LogOut
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 折叠状态（默认收起为图标轨道）
const isCollapsed = ref(true)

// 收起态下悬浮飞出的菜单（存父级标题）
const flyoutKey = ref('')
let flyoutTimer = null

// 悬浮进入：立即飞出
const openFlyout = (title) => {
  if (!isCollapsed.value) return
  clearTimeout(flyoutTimer)
  flyoutKey.value = title
}

// 悬浮离开：留 120ms 缓冲，避免鼠标穿过间隙时闪断
const scheduleCloseFlyout = () => {
  if (!isCollapsed.value) return
  clearTimeout(flyoutTimer)
  flyoutTimer = setTimeout(() => { flyoutKey.value = '' }, 120)
}

// 展开侧边栏时清掉飞出层
watch(isCollapsed, (val) => {
  if (!val) {
    clearTimeout(flyoutTimer)
    flyoutKey.value = ''
  }
})

// 用户信息
const userInfo = ref({
  name: '管理员',
  avatar: ''
})

// 菜单列表
const menuList = ref([
  {
    title: '工作台',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: '物模型管理',
    icon: Boxes,
    children: [
      { title: 'IOT类目', path: '/thing-model/category', icon: FolderTree },
      { title: '能力库', path: '/thing-model/capability', icon: Blocks },
      { title: '算法库', path: '/thing-model/algorithm', icon: BrainCircuit },
      { title: '事件库', path: '/thing-model/event', icon: Zap }
    ]
  },
  {
    // 物模型管理（new）：按需求去掉算法库、事件库（对应页面未复制）
    title: '物模型管理（new）',
    icon: Boxes,
    children: [
      { title: 'IOT类目（new）', path: '/thing-model-new/category', icon: FolderTree },
      { title: '能力库（new）', path: '/thing-model-new/capability', icon: Blocks }
    ]
  },
  {
    title: '产品管理',
    icon: Package,
    children: [
      { title: '产品开发', path: '/product/development', icon: Wrench },
      { title: '产品审核', path: '/product/audit', icon: ClipboardCheck }
    ]
  },
  {
    title: '产品管理（new）',
    icon: Package,
    children: [
      { title: '产品开发（new）', path: '/product-new/development', icon: Wrench },
      { title: '产品审核（new）', path: '/product-new/audit', icon: ClipboardCheck }
    ]
  },
  {
    title: '套餐管理',
    icon: Layers,
    children: [
      { title: '套餐配置', path: '/pkg', icon: SlidersHorizontal },
      { title: '服务类型', path: '/pkg/service', icon: Server }
    ]
  },
  {
    title: '智能体管理',
    icon: Bot,
    children: [
      { title: '智能体配置', path: '/agent', icon: Cog },
      { title: '模型管理', path: '/agent/model', icon: Brain }
    ]
  },
  {
    title: '运营管理',
    icon: Activity,
    children: [
      { title: '商城位运营', path: '/ops/mall', icon: ShoppingCart },
      { title: '推荐位运营', path: '/ops/recommend', icon: Sparkles },
      { title: '活动位运营', path: '/ops/activity', icon: Gift },
      { title: '用户分群', path: '/ops/usergroup', icon: Users },
      { title: 'A/B Test', path: '/abtest', icon: FlaskConical }
    ]
  }
])

// 父级菜单展开状态
const isChildActive = (children) => children.some(c => route.path.startsWith(c.path))

const expandedMenus = reactive(
  Object.fromEntries(
    menuList.value
      .filter(m => m.children)
      .map(m => [m.title, isChildActive(m.children)])
  )
)

// 当前菜单名称
const currentMenu = computed(() => {
  let best = ''
  let bestLen = 0
  for (const m of menuList.value) {
    if (m.children) {
      for (const child of m.children) {
        if (route.path.startsWith(child.path) && child.path.length > bestLen) {
          best = child.title
          bestLen = child.path.length
        }
      }
    } else if (route.path.startsWith(m.path) && m.path.length > bestLen) {
      best = m.title
      bestLen = m.path.length
    }
  }
  return best
})

// 判断菜单是否激活（最长匹配，避免 /pkg 和 /pkg/service 同时高亮）
const isActive = (path) => {
  let best = ''
  for (const m of menuList.value) {
    const paths = m.children ? m.children.map(c => c.path) : [m.path]
    for (const p of paths) {
      if (route.path.startsWith(p) && p.length > best.length) {
        best = p
      }
    }
  }
  return path === best
}

// 切换父菜单展开/收起
const toggleParent = (title) => {
  expandedMenus[title] = !expandedMenus[title]
}

// 点击父级：收起态下先展开侧边栏并展开该分组
const handleParentClick = (item) => {
  if (isCollapsed.value) {
    isCollapsed.value = false
    expandedMenus[item.title] = true
  } else {
    toggleParent(item.title)
  }
}

// 点击菜单
const handleMenuClick = (item) => {
  router.push(item.path)
}

// 切换折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 帮助/文档/技术支持
const handleHelpCommand = (command) => {
  const map = { help: '使用帮助', docs: '开发者文档', feedback: '技术支持' }
  ElMessage.info(map[command] || command)
}

// 语言切换
const handleLangCommand = (command) => {
  ElMessage.success(command === 'zh' ? '已切换至简体中文' : '已切换至 English')
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
/* ============================================================
   主框架 · 参考 shadcn/ui Sidebar（collapsible="icon"）+ 浅色调
   色值取自 shadcn neutral 主题的 sidebar 变量，只作用于框架本身，
   不覆盖全局主题（主色仍是 #1890FF）
   ============================================================ */

.layout-container {
  /* shadcn 侧边栏变量（light） */
  --sb-bg: #FAFAFA;
  --sb-fg: #0A0A0A;
  --sb-muted: #737373;
  --sb-accent: #F5F5F5;
  --sb-accent-fg: #171717;
  --sb-border: #E5E5E5;
  --sb-width: 224px;
  --sb-width-icon: 56px;
  --sb-radius: 8px;
  /* 当前侧边栏实际宽度，供页内 position:fixed 元素定位（如底部悬浮操作条） */
  --sb-current: var(--sb-width);

  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-page);
  overflow-x: hidden;
}

/* 侧边栏收起时同步当前宽度 */
.layout-container.sb-collapsed {
  --sb-current: var(--sb-width-icon);
}

/* ---------------- 侧边栏 ---------------- */

.sidebar {
  position: relative;
  z-index: 100;
  width: var(--sb-width);
  min-width: var(--sb-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--sb-bg);
  border-right: 1px solid var(--sb-border);
  transition: width .2s ease, min-width .2s ease;
}

.sb-header {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  overflow: hidden;

  .sb-logo {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    /* 品牌色，取自 favicon.svg；想要黑白版改成 var(--sb-accent-fg) 即可 */
    color: #863BFF;

    svg { width: 22px; height: 22px; }
  }

  .sb-logo-text {
    font-size: 15px;
    font-weight: 600;
    color: var(--sb-fg);
    white-space: nowrap;
  }
}

.sb-nav {
  flex: 1;
  padding: 4px 12px 12px;
  overflow-y: auto;
  overflow-x: hidden;

  .sb-group-label {
    padding: 8px 8px 6px;
    font-size: 11px;
    font-weight: 500;
    color: var(--sb-muted);
    letter-spacing: .02em;
    white-space: nowrap;
  }
}

.sb-group {
  position: relative;
}

/* 菜单项按钮（shadcn SidebarMenuButton） */
.sb-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 36px;
  padding: 0 8px;
  margin-bottom: 2px;
  border: none;
  background: transparent;
  border-radius: var(--sb-radius);
  color: var(--sb-muted);
  font-size: 14px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color .15s, color .15s;

  &:hover {
    background-color: var(--sb-accent);
    color: var(--sb-accent-fg);
  }

  &.active {
    background-color: var(--sb-accent);
    color: var(--sb-accent-fg);
    font-weight: 500;
  }

  .sb-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .sb-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sb-arrow {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    transition: transform .2s ease;

    &.open { transform: rotate(180deg); }
  }
}

/* 展开态：内联子菜单 */
.sb-sub {
  max-height: 0;
  overflow: hidden;
  transition: max-height .2s ease;

  &.open { max-height: 400px; }
}

.sb-sub-btn {
  display: block;
  width: 100%;
  height: 32px;
  padding: 0 8px 0 34px;
  margin-bottom: 2px;
  border: none;
  background: transparent;
  border-radius: var(--sb-radius);
  color: var(--sb-muted);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color .15s, color .15s;

  &:hover {
    background-color: var(--sb-accent);
    color: var(--sb-accent-fg);
  }

  &.active {
    background-color: var(--sb-accent);
    color: var(--sb-accent-fg);
    font-weight: 500;
  }
}

/* ---------------- 收起态：图标轨道 ---------------- */

.sidebar.collapsed {
  width: var(--sb-width-icon);
  min-width: var(--sb-width-icon);

  .sb-header {
    justify-content: center;
    padding: 0;
  }

  .sb-logo-text,
  .sb-label,
  .sb-arrow,
  .sb-group-label,
  .sb-sub { display: none; }

  .sb-nav {
    padding: 4px 8px 12px;
    /* 飞出层要溢出到轨道右侧，这里不能裁切 */
    overflow: visible;
  }

  .sb-btn {
    width: 36px;
    height: 36px;
    margin: 0 auto 4px;
    padding: 0;
    gap: 0;
    justify-content: center;
  }
}

/* ---------------- 悬浮飞出多级菜单 ---------------- */

.sb-flyout {
  position: absolute;
  left: calc(100% + 8px);
  top: 0;
  z-index: 200;
  min-width: 176px;
  padding: 4px;
  background: #FFFFFF;
  border: 1px solid var(--sb-border);
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, .08), 0 2px 4px -2px rgba(0, 0, 0, .06);
}

.sb-flyout-title {
  padding: 6px 8px 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--sb-muted);
  white-space: nowrap;
}

.sb-flyout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  margin-bottom: 1px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--sb-fg);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color .15s;

  &:last-child { margin-bottom: 0; }

  &:hover { background-color: var(--sb-accent); }

  &.active {
    background-color: var(--sb-accent);
    font-weight: 500;
  }

  .sb-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    color: var(--sb-muted);
  }
}

.sb-fly-enter-active,
.sb-fly-leave-active {
  transition: opacity .12s ease, transform .12s ease;
}

.sb-fly-enter-from,
.sb-fly-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}

/* ---------------- 顶部导航 ---------------- */

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
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--sb-border);
  position: sticky;
  top: 0;
  z-index: 99;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  /* ghost 图标按钮：折叠触发 / 帮助 / 语言 / 通知 共用一套
     （对应 shadcn Button variant=ghost size=icon） */
  .header-trigger,
  .header-icon-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 6px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background-color .15s, color .15s;

    &:hover {
      background-color: var(--sb-accent);
      color: var(--text-primary);
    }

    &:active {
      background-color: var(--sb-border);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(161, 161, 161, .5);
    }
  }

  .header-sep {
    width: 1px;
    height: 16px;
    flex-shrink: 0;
    background-color: var(--sb-border);
  }

  /* 面包屑：链接弱化、当前页加重，分隔符换成 chevron
     全局 index.scss 给 .el-breadcrumb__inner 定了 !important，这里必须用 !important 盖回去 */
  .breadcrumb {
    display: flex;
    align-items: center;

    :deep(.el-breadcrumb__inner) {
      font-size: 13px;
      font-weight: 400;
      color: var(--text-secondary) !important;
    }

    :deep(.el-breadcrumb__inner.is-link:hover),
    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: var(--text-primary) !important;
      font-weight: 500;
    }

    :deep(.el-breadcrumb__separator) {
      margin: 0 6px;
      display: inline-flex;
      align-items: center;
      color: var(--text-placeholder) !important;
    }

    .bc-sep {
      width: 14px;
      height: 14px;
      display: block;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    /* 通知区与用户区之间的分隔线，两侧留出呼吸 */
    .header-sep { margin: 0 4px; }

    /* 通知角标：EP 默认把角标甩在按钮外面，这里收回到按钮内并加描边分隔 */
    .header-badge {
      display: inline-flex;
      line-height: 1;
      cursor: pointer;

      :deep(.el-badge__content) {
        top: 8px;
        right: 12px;
        height: 16px;
        line-height: 16px;
        padding: 0 5px;
        font-size: 11px;
        border: 1.5px solid var(--bg-card);
        background-color: var(--danger-color);
      }
    }

    /* 用户菜单 */
    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 32px;
      padding: 0 6px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-family: inherit;
      cursor: pointer;
      transition: background-color .15s;

      &:hover { background-color: var(--sb-accent); }
      &:active { background-color: var(--sb-border); }

      .user-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
      }

      .user-caret {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        color: var(--text-secondary);
      }
    }
  }
}

/* 下拉菜单项内图标（弹层被 teleport 到 body，选择器必须写在顶层） */
.dd-icon {
  width: 15px;
  height: 15px;
  margin-right: 8px;
  color: var(--text-secondary);
}

.main-content {
  flex: 1;
  background-color: var(--bg-page);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
