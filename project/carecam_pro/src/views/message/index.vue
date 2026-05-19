<template>
  <div class="message-page">
    <!-- 搜索栏 -->
    <div class="search-wrap">
      <div class="search-box" @click="goToAiSearch">
        <van-icon name="search" size="17" color="#6B7280" />
        <input 
          type="text" 
          v-model="searchText" 
          placeholder="AI 搜索 - 描述发生了什么..."
          @click.stop="goToAiSearch"
        />
        <span class="ai-tag">AI</span>
      </div>
      
      <div class="filter-row">
        <div class="filter-trigger" @click="showDatePicker = true">
          <van-icon name="calendar-o" size="14" color="#6B7280" />
          <span>{{ dateLabel }}</span>
          <van-icon name="arrow-down" size="12" color="#6B7280" />
        </div>
        <div class="filter-trigger" @click="showFilterPanel = true">
          <van-icon name="filter-o" size="14" color="#6B7280" />
          <span>{{ selectedDevice }}</span>
          <van-icon name="arrow-down" size="12" color="#6B7280" />
        </div>
      </div>
    </div>
    
    <div class="msg-tabs-bar">
      <div class="msg-tabs-scroll" @wheel="onTabsWheel">
        <div class="msg-tabs">
          <span
            v-for="t in msgFilterTabs"
            :key="t.key"
            :class="['msg-tab', { active: activeMsgTab === t.key }]"
            @click="activeMsgTab = t.key"
          >{{ t.label }}</span>
        </div>
      </div>
      <span class="msg-focus" @click="handleFocusClick">+关注</span>
    </div>

    <div class="msg-list">
      <div
        v-for="msg in filteredMsgList"
        :key="msg.id"
        class="msg-item"
        @click="goToMessageDetail(msg)"
      >
        <div class="msg-thumb" :style="{ background: msg.bgGradient }"></div>
        <div class="msg-content">
          <div class="msg-type">{{ msg.type }}</div>
          <div class="msg-device">{{ msg.deviceName }}</div>
          <div class="msg-time">{{ msg.time }}</div>
          <span :class="['msg-tag', 'tag-' + msg.tagType]">{{ msg.tag }}</span>
        </div>
      </div>
    </div>
    
    <div class="bottom-actions">
      <button class="daily-btn" @click="goToDaily">
        <van-icon name="notes-o" size="16" color="#fff" />
        <span>消息太多？一键总结</span>
      </button>
    </div>
    
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker 
        v-model="selectedDate"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
    
    <van-popup v-model:show="showFilterPanel" position="bottom" round :style="{ height: 'auto' }">
      <div class="filter-panel">
        <div class="panel-header">
          <span>筛选设备</span>
          <van-icon name="cross" size="20" @click="showFilterPanel = false" />
        </div>
        
        <div class="filter-section">
          <div class="chips">
            <span 
              v-for="(device, index) in deviceOptions" 
              :key="index"
              :class="['chip', { active: selectedDevice === device }]"
              @click="selectedDevice = device; showFilterPanel = false"
            >{{ device }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { aiStatus, isDeviceActivated } from '@/store/devStatus'

const router = useRouter()
const searchText = ref('')
const showDatePicker = ref(false)
const selectedDate = ref(['2024', '04', '20'])
const dateLabel = ref('4月20日')
const showFilterPanel = ref(false)
const deviceOptions = ['Front Door', 'Backyard', 'Garage']
const selectedDevice = ref('Front Door')

const messages = ref([
  { id: 1, type: '奶奶出门散步', deviceName: 'Front Door', time: '今天 09:20', tag: '老人看护', tagType: 'elder', bgGradient: 'linear-gradient(135deg, #0d2e1a, #1a5c34)', isFocus: true },
  { id: 2, type: '猫咪在客厅跑酷', deviceName: 'Front Door', time: '今天 09:38', tag: '宠物活动', tagType: 'pet', bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)', isFocus: true },
  { id: 3, type: '门口有人经过', deviceName: 'Front Door', time: '今天 08:55', tag: '人员经过', tagType: 'person', bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)', isFocus: true },
  { id: 4, type: '声音告警', deviceName: 'Backyard', time: '昨天 22:14', tag: '声音', tagType: 'sound', bgGradient: 'linear-gradient(135deg, #0d2e1a, #1a5c34)', isFocus: false },
  { id: 5, type: '检测到车辆', deviceName: 'Front Door', time: '昨天 20:02', tag: '车辆', tagType: 'vehicle', bgGradient: 'linear-gradient(135deg, #0d1b3e, #1a3a6e)', isFocus: false }
])

const msgFilterTabs = computed(() => {
  if (isDeviceActivated(selectedDevice.value)) {
    return [
      { key: 'all', label: '全部' },
      { key: 'focus_elder', label: '老人看护' },
      { key: 'focus_pet', label: '宠物活动' },
      { key: 'focus_person', label: '人员经过' },
      { key: 'other', label: '其他' }
    ]
  }
  return [
    { key: 'all', label: '全部' },
    { key: 'motion', label: '运动侦测' },
    { key: 'person_detect', label: '人形侦测' }
  ]
})
const activeMsgTab = ref('all')

// 切换设备时重置标签选择
watch(selectedDevice, () => { activeMsgTab.value = 'all' })

const focusTagMap = { 'focus_elder': 'elder', 'focus_pet': 'pet', 'focus_person': 'person' }

const filteredMsgList = computed(() => {
  let list = messages.value
  if (searchText.value.trim()) {
    const kw = searchText.value.trim().toLowerCase()
    list = list.filter(m => m.type.includes(kw) || m.deviceName.toLowerCase().includes(kw) || m.tag.includes(kw))
  }
  list = list.filter(m => m.deviceName === selectedDevice.value)
  if (activeMsgTab.value === 'other') {
    list = list.filter(m => !m.isFocus)
  } else if (focusTagMap[activeMsgTab.value]) {
    list = list.filter(m => m.isFocus && m.tagType === focusTagMap[activeMsgTab.value])
  }
  return list
})

const onDateConfirm = ({ selectedValues }) => {
  dateLabel.value = selectedValues[1] + '月' + selectedValues[2] + '日'
  showDatePicker.value = false
}

// 标签栏鼠标滚轮横向滚动
const onTabsWheel = (e) => {
  e.preventDefault()
  e.currentTarget.scrollLeft += e.deltaY
}

// "+关注"按钮点击
const handleFocusClick = () => {
  if (isDeviceActivated(selectedDevice.value)) {
    router.push('/ai')
  } else {
    router.push('/ai?show=activate')
  }
}

// 消息点击跳转日报事件详情
const goToMessageDetail = (msg) => {
  const name = msg.type
  const msgs = [{
    time: msg.time,
    text: msg.type,
    device: msg.deviceName,
    bg: msg.bgGradient
  }]
  const listStr = encodeURIComponent(JSON.stringify(msgs))
  router.push('/ai/daily-event?name=' + encodeURIComponent(name) + '&list=' + listStr + '&index=0')
}

const goToAiSearch = () => { router.push('/ai/search') }
const goToDaily = () => { router.push('/ai/daily') }
</script>

<style lang="scss" scoped>
.message-page { min-height: 100%; background-color: $bg-page; display: flex; flex-direction: column; }
.search-wrap { background-color: $bg-color; padding: 12px 16px; border-bottom: 1px solid $border-color; flex-shrink: 0; }
.search-box { background-color: $bg-page; border-radius: $radius-md; padding: 9px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; input { flex: 1; border: none; outline: none; font-size: 14px; color: $text-primary; background-color: transparent; &::placeholder { color: $text-secondary; } } }
.ai-tag { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; background: linear-gradient(135deg, #1A73E8, #9C27B0); color: #fff; }
.filter-row { display: flex; gap: 8px; }
.filter-trigger { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: $radius-pill; border: 1.5px solid $border-color; background-color: $bg-page; cursor: pointer; span { font-size: 12px; font-weight: 500; color: $text-primary; white-space: nowrap; } }
.msg-tabs-bar { display: flex; align-items: center; background: $bg-color; border-bottom: 1px solid $border-color; }
.msg-tabs-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; flex: 1; &::-webkit-scrollbar { display: none; } }
.msg-tabs { display: flex; gap: 8px; padding: 10px 0 10px 16px; white-space: nowrap; }
.msg-tab { padding: 4px 14px; border-radius: 14px; font-size: 12px; font-weight: 500; color: $text-secondary; background: $bg-page; border: 1px solid $border-color; cursor: pointer; &.active { background: $primary-color; color: #fff; border-color: $primary-color; } }
.msg-focus { flex-shrink: 0; padding: 4px 14px; margin: 6px 12px 6px 8px; border-radius: 14px; font-size: 12px; font-weight: 600; color: $primary-color; background: $primary-bg; border: 1px solid $primary-color; cursor: pointer; white-space: nowrap; }
.msg-list { flex: 1; padding: 12px 16px 70px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.msg-item { background-color: $bg-card; border-radius: $radius-lg; padding: 12px; display: flex; gap: 12px; align-items: flex-start; box-shadow: $shadow-card; }
.msg-thumb { width: 72px; height: 54px; border-radius: 10px; flex-shrink: 0; }
.msg-content { flex: 1; }
.msg-type { font-size: 13px; font-weight: 600; color: $text-primary; }
.msg-device { font-size: 11px; color: $text-secondary; margin-top: 2px; }
.msg-time { font-size: 11px; color: $text-secondary; margin-top: 3px; }
.msg-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-top: 4px; &.tag-person { background-color: #DBEAFE; color: #1D4ED8; } &.tag-elder { background-color: #FEF3C7; color: #D97706; } &.tag-pet { background-color: #D1FAE5; color: #065F46; } &.tag-vehicle { background-color: #EDE9FE; color: #6D28D9; } &.tag-sound { background-color: #FCE4EC; color: #C62828; } }
.bottom-actions { position: fixed; bottom: 70px; left: 0; right: 0; z-index: 10; background-color: #fff; border-top: 1px solid $border-color; padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom, 8px)); flex-shrink: 0; }
.daily-btn { width: 100%; padding: 12px; border: none; border-radius: $radius-md; background: linear-gradient(135deg, #1A73E8, #9C27B0); color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
.filter-panel { padding: 16px; .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; span { font-size: 16px; font-weight: 700; color: $text-primary; } } .filter-section { .chips { display: flex; flex-wrap: wrap; gap: 8px; } .chip { padding: 8px 16px; border-radius: $radius-pill; font-size: 13px; font-weight: 500; border: 1.5px solid $border-color; color: $text-secondary; background-color: $bg-page; cursor: pointer; &.active { background-color: $primary-color; color: #fff; border-color: $primary-color; } } } }
</style>