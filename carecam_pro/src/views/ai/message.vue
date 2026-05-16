<template>
  <div class="ai-msg-page">
    <div class="ai-header">
      <div class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="18" />
      </div>
      <h2>AI消息</h2>
      <div class="header-right" @click="showSetting = true">
        <van-icon name="setting-o" size="18" />
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="msg-tabs">
      <div v-for="(t, i) in tabs" :key="i" :class="['tab', { active: activeTab === i }]" @click="activeTab = i">{{ t }}</div>
    </div>

    <!-- 消息列表 -->
    <div class="msg-list" v-if="filteredList.length > 0">
      <div v-for="(group, gIdx) in groupedList" :key="gIdx">
        <div class="date-label">{{ group.date }}</div>
        <div v-for="msg in group.list" :key="msg.id" class="msg-card" @click="goToDetail(msg)">
          <div class="msg-thumb" :style="{ background: msg.bg }">
            <span class="thumb-icon">{{ msg.icon }}</span>
          </div>
          <div class="msg-body">
            <div class="msg-type">{{ msg.title }}</div>
            <div class="msg-desc">{{ msg.desc }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>
          <van-icon name="arrow" size="14" color="#9CA3AF" />
        </div>
      </div>
    </div>

    <!-- 空态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">🤖</div>
      <div class="empty-text">暂无AI消息</div>
      <div class="empty-sub">当有事件发生时将展示在这里</div>
    </div>

    <!-- 设置面板 -->
    <van-popup v-model:show="showSetting" position="bottom" round :style="{ height: '50%' }">
      <div class="setting-popup">
        <div class="popup-header">
          <h3>推送设置</h3>
          <van-icon name="cross" size="20" @click="showSetting = false" />
        </div>
        <div class="setting-list">
          <div class="setting-item">
            <span>紧急推送</span>
            <van-switch v-model="pushAlert" size="22" />
          </div>
          <div class="setting-item">
            <span>普通推送</span>
            <van-switch v-model="pushNormal" size="22" />
          </div>
          <div class="setting-divider"></div>
          <div class="setting-item"><span>👤 人员经过</span><van-switch v-model="pushPerson" size="22" /></div>
          <div class="setting-item"><span>🐱 宠物活动</span><van-switch v-model="pushPet" size="22" /></div>
          <div class="setting-item"><span>👴 老人看护</span><van-switch v-model="pushElder" size="22" /></div>
          <div class="setting-divider"></div>
          <div class="setting-item">
            <span>每日最多推送</span>
            <span class="setting-value">{{ maxPush }}条</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()
const goToDetail = (msg) => router.push({ path: '/ai/detail', query: { id: msg.id } })

const tabs = ['全部', '👤 人', '🐱 宠物', '👴 看护']
const activeTab = ref(0)
const showSetting = ref(false)

const pushAlert = ref(true)
const pushNormal = ref(true)
const pushPerson = ref(true)
const pushPet = ref(true)
const pushElder = ref(true)
const maxPush = ref(5)

const messages = ref([
  { id: 1, type: 'person', icon: '🧑', title: '门口有人经过', desc: '快递员在门口停留了35秒', time: '今天 14:32', bg: '#0d1b3e' },
  { id: 2, type: 'pet', icon: '🐱', title: '猫咪在客厅跑酷', desc: '从沙发跳到茶几，活力满满', time: '今天 10:15', bg: '#0d2e1a' },
  { id: 3, type: 'elderly', icon: '👴', title: '奶奶出门散步', desc: '奶奶从家里走出，状态正常', time: '今天 08:20', bg: '#1a1a3e' },
  { id: 4, type: 'person', icon: '🧑', title: '门口有人经过', desc: '陌生男子在门口短暂停留', time: '昨天 22:10', bg: '#0d1b3e' },
  { id: 5, type: 'elderly', icon: '👴', title: '奶奶回家', desc: '奶奶从外面回来，手里拎着菜', time: '昨天 18:30', bg: '#1a1a3e' },
  { id: 6, type: 'pet', icon: '🐱', title: '猫咪吃早饭', desc: '猫咪在厨房吃猫粮', time: '昨天 07:30', bg: '#0d2e1a' }
])

const typeMap = { '全部': 'all', '👤 人': 'person', '🐱 宠物': 'pet', '👴 看护': 'elderly' }

const filteredList = computed(() => {
  const type = typeMap[tabs[activeTab.value]]
  if (type === 'all') return messages.value
  return messages.value.filter(m => m.type === type)
})

const groupedList = computed(() => {
  const groups = []
  let current = null
  for (const msg of filteredList.value) {
    const dateLabel = msg.time.includes('今天') ? '今天' : msg.time.includes('昨天') ? '昨天' : '更早'
    if (!current || current.date !== dateLabel) {
      current = { date: dateLabel, list: [] }
      groups.push(current)
    }
    current.list.push(msg)
  }
  return groups
})
</script>

<style lang="scss" scoped>
.ai-msg-page {
  height: 100%;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

.ai-header {
  background: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color;
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  h2 { font-size: 18px; font-weight: 700; color: $text-primary; flex: 1; }
}

.back-btn, .header-right {
  width: 32px; height: 32px; border-radius: 50%; background: $bg-page;
  display: flex; align-items: center; justify-content: center; color: $text-secondary; flex-shrink: 0;
}

.msg-tabs {
  background: $bg-color; padding: 0 16px; display: flex; gap: 0;
  border-bottom: 2px solid $border-color; flex-shrink: 0;
  .tab {
    padding: 12px 14px; font-size: 13px; font-weight: 500; color: $text-secondary;
    border-bottom: 2px solid transparent; margin-bottom: -2px; transition: $transition;
    &.active { color: $primary-color; border-bottom-color: $primary-color; font-weight: 600; }
  }
}

.msg-list { flex: 1; padding: 12px 16px; overflow-y: auto; }
.date-label { font-size: 12px; font-weight: 600; color: $text-secondary; margin: 8px 0; }

.msg-card {
  background: $bg-card; border-radius: $radius-lg; padding: 12px; margin-bottom: 10px;
  display: flex; gap: 12px; align-items: center; box-shadow: $shadow-card;
  .msg-thumb {
    width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    .thumb-icon { font-size: 20px; }
  }
  .msg-body { flex: 1; }
  .msg-type { font-size: 13px; font-weight: 600; color: $text-primary; }
  .msg-desc { font-size: 12px; color: $text-secondary; margin-top: 2px; }
  .msg-time { font-size: 11px; color: $text-placeholder; margin-top: 4px; }
}

.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 60px;
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; font-weight: 600; color: $text-primary; }
  .empty-sub { font-size: 12px; color: $text-secondary; margin-top: 4px; }
}

.setting-popup { padding: 20px 16px 32px; }
.popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; h3 { font-size: 16px; font-weight: 700; color: $text-primary; } }

.setting-list { }
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; font-size: 14px; color: $text-primary; }
.setting-value { color: $text-secondary; font-size: 13px; }
.setting-divider { height: 1px; background: $border-color; margin: 4px 0; }
</style>
