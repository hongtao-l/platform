<template>
  <div class="algorithm-page">
    <el-tabs v-model="activeTab" type="border-card" class="algo-tabs">
      <!-- ========== 算法库 Tab ========== -->
      <el-tab-pane label="算法库" name="algorithm">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input v-model="algoSearch.keyword" placeholder="搜索 AlgorithmID / 名称"
              clearable style="width: 240px" @keyup.enter="handleAlgoSearch" />
            <el-button type="primary" @click="handleAlgoSearch">查询</el-button>
            <el-button @click="handleAlgoReset">重置</el-button>
          </div>
          <el-button type="primary" @click="handleAddAlgo">
            <el-icon><Plus /></el-icon>添加算法
          </el-button>
        </div>

        <div class="card table-card">
          <el-table :data="algoList" stripe v-loading="algoLoading">
            <el-table-column label="AlgorithmID" width="180">
              <template #default="{ row }">
                <code class="id-code">{{ row.algorithmId }}</code>
              </template>
            </el-table-column>
            <el-table-column label="图标" width="70" align="center">
              <template #default="{ row }">
                <span v-if="row.algorithmIcon" style="font-size:18px">{{ row.algorithmIcon }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="算法名称" min-width="140">
              <template #default="{ row }">
                <span class="name-text">{{ row._name?.['1'] || row.algorithmId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力标签" min-width="260">
              <template #default="{ row }">
                <div class="pill-list">
                  <el-tag v-for="(cap, i) in getCapLabels(row._caps).slice(0, 5)"
                    :key="i" size="small" class="pill-tag">{{ cap }}</el-tag>
                  <el-tag v-if="getCapLabels(row._caps).length > 5"
                    size="small" type="info" class="pill-tag pill-more">
                    +{{ getCapLabels(row._caps).length - 5 }}
                  </el-tag>
                  <span v-if="getCapLabels(row._caps).length === 0" class="text-muted">—</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="关联事件" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row._eventIds?.length" size="small" type="success">
                  {{ row._eventIds.length }} 个
                </el-tag>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="引用设备" width="100" align="center">
              <template #default="{ row }">
                <span class="count-text">{{ row.referencedCount ?? 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="handleEditAlgo(row)">编辑</el-button>
                <el-button size="small" text type="danger" @click="handleDeleteAlgo(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper" v-if="algoTotal > 0">
            <span class="total-text">共 {{ algoTotal }} 条记录</span>
            <el-pagination
              v-model:current-page="algoPage"
              v-model:page-size="algoPageSize"
              :page-sizes="[10, 20, 50]"
              :total="algoTotal"
              layout="sizes, prev, pager, next"
              @size-change="fetchAlgoList"
              @current-change="fetchAlgoList"
            />
          </div>

          <div v-if="!algoLoading && algoList.length === 0" class="empty-state">
            <el-empty description="暂无算法">
              <el-button type="primary" @click="handleAddAlgo">添加算法</el-button>
            </el-empty>
          </div>
        </div>
      </el-tab-pane>

      <!-- ========== 事件库 Tab ========== -->
      <el-tab-pane label="事件库" name="event">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input v-model="eventSearch.keyword" placeholder="搜索 EventID / 名称"
              clearable style="width: 240px" @keyup.enter="handleEventSearch" />
            <el-button type="primary" @click="handleEventSearch">查询</el-button>
            <el-button @click="handleEventReset">重置</el-button>
          </div>
          <el-button type="primary" @click="handleAddEvent">
            <el-icon><Plus /></el-icon>添加事件
          </el-button>
        </div>

        <div class="card table-card">
          <el-table :data="eventList" stripe v-loading="eventLoading">
            <el-table-column label="EventID" width="110">
              <template #default="{ row }">
                <code class="id-code">{{ row.eventId }}</code>
              </template>
            </el-table-column>
            <el-table-column label="事件名称" min-width="150">
              <template #default="{ row }">
                <span class="name-text">{{ row._name?.['1'] || row.eventId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="180">
              <template #default="{ row }">
                <span class="text-muted">{{ row.eventRemark || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="推送文案" min-width="200">
              <template #default="{ row }">
                <span class="text-muted">{{ row._push?.['1'] || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="引用算法数" width="110" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.referencedCount" size="small" type="success">
                  {{ row.referencedCount }} 个
                </el-tag>
                <span v-else class="text-muted">0</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="handleEditEvent(row)">编辑</el-button>
                <el-button size="small" text type="danger" @click="handleDeleteEvent(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper" v-if="eventTotal > 0">
            <span class="total-text">共 {{ eventTotal }} 条记录</span>
            <el-pagination
              v-model:current-page="eventPage"
              v-model:page-size="eventPageSize"
              :page-sizes="[10, 20, 50]"
              :total="eventTotal"
              layout="sizes, prev, pager, next"
              @size-change="fetchEventList"
              @current-change="fetchEventList"
            />
          </div>

          <div v-if="!eventLoading && eventList.length === 0" class="empty-state">
            <el-empty description="暂无事件">
              <el-button type="primary" @click="handleAddEvent">添加事件</el-button>
            </el-empty>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 算法编辑弹窗 -->
    <AlgorithmEdit v-model:visible="algoDialogVisible" :edit-id="algoEditId" @success="onAlgoSaved" />
    <!-- 事件编辑弹窗 -->
    <EventEdit v-model:visible="eventDialogVisible" :edit-id="eventEditId" @success="onEventSaved" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { algorithmApi } from '@/api/index.js'
import AlgorithmEdit from './AlgorithmEdit.vue'
import EventEdit from './EventEdit.vue'

const activeTab = ref('algorithm')

// ——— 算法库 ———
const algoSearch = reactive({ keyword: '' })
const algoList = ref([])
const algoLoading = ref(false)
const algoPage = ref(1)
const algoPageSize = ref(20)
const algoTotal = ref(0)
const algoDialogVisible = ref(false)
const algoEditId = ref(null)

// ——— 事件库 ———
const eventSearch = reactive({ keyword: '' })
const eventList = ref([])
const eventLoading = ref(false)
const eventPage = ref(1)
const eventPageSize = ref(20)
const eventTotal = ref(0)
const eventDialogVisible = ref(false)
const eventEditId = ref(null)

// ——— JSON 解析辅助 ———
function parseAlgoJson(item) {
  try { item._name = JSON.parse(item.algorithmName || '{}') } catch { item._name = {} }
  try { item._caps = JSON.parse(item.capabilities || '{}') } catch { item._caps = {} }
  try { item._eventIds = JSON.parse(item.eventIds || '[]') } catch { item._eventIds = [] }
  return item
}
function parseEventJson(item) {
  try { item._name = JSON.parse(item.eventName || '{}') } catch { item._name = {} }
  try { item._push = JSON.parse(item.pushCopy || '{}') } catch { item._push = {} }
  return item
}

function getCapLabels(caps) {
  if (!caps) return []
  const map = {
    Switch: '开关', Sensitivity: '灵敏度', Schedule: '定时侦测',
    DetectArea: '自定义区域', SoundAlarm: '声音告警', AlarmRepeatCnt: '告警循环次数',
    CustomAudio: '自定义音频', LightAlarm: '灯光告警'
  }
  const labels = []
  for (const k in map) { if (caps[k]) labels.push(map[k]) }
  if (caps.DetectType && typeof caps.DetectType === 'object' && Object.keys(caps.DetectType).length > 0) {
    labels.push('侦测类型')
  }
  return labels
}

// ——— 算法数据 ———
async function fetchAlgoList() {
  algoLoading.value = true
  try {
    const res = await algorithmApi.listAlgorithm({
      pageNum: algoPage.value,
      pageSize: algoPageSize.value,
      keyword: algoSearch.keyword || undefined
    })
    if (res.code === 0) {
      algoList.value = (res.data?.list || []).map(parseAlgoJson)
      algoTotal.value = res.data?.total || 0
    }
  } catch { /* ignore */ } finally { algoLoading.value = false }
}

function handleAlgoSearch() { algoPage.value = 1; fetchAlgoList() }
function handleAlgoReset() { algoSearch.keyword = ''; algoPage.value = 1; fetchAlgoList() }
function handleAddAlgo() { algoEditId.value = null; algoDialogVisible.value = true }
function handleEditAlgo(row) { algoEditId.value = row.id; algoDialogVisible.value = true }

async function handleDeleteAlgo(row) {
  try {
    await ElMessageBox.confirm(`确定删除算法「${row._name?.['1'] || row.algorithmId}」？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
  } catch { return }
  try {
    const res = await algorithmApi.deleteAlgorithm(row.id)
    if (res.code === 0) { ElMessage.success('删除成功'); fetchAlgoList() }
  } catch { /* ignore */ }
}

function onAlgoSaved() { algoDialogVisible.value = false; fetchAlgoList(); fetchEventList() }

// ——— 事件数据 ———
async function fetchEventList() {
  eventLoading.value = true
  try {
    const res = await algorithmApi.listEvent({
      pageNum: eventPage.value,
      pageSize: eventPageSize.value,
      keyword: eventSearch.keyword || undefined
    })
    if (res.code === 0) {
      eventList.value = (res.data?.list || []).map(parseEventJson)
      eventTotal.value = res.data?.total || 0
    }
  } catch { /* ignore */ } finally { eventLoading.value = false }
}

function handleEventSearch() { eventPage.value = 1; fetchEventList() }
function handleEventReset() { eventSearch.keyword = ''; eventPage.value = 1; fetchEventList() }
function handleAddEvent() { eventEditId.value = null; eventDialogVisible.value = true }
function handleEditEvent(row) { eventEditId.value = row.id; eventDialogVisible.value = true }

async function handleDeleteEvent(row) {
  try {
    await ElMessageBox.confirm(`确定删除事件「${row._name?.['1'] || row.eventId}」？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
  } catch { return }
  try {
    const res = await algorithmApi.deleteEvent(row.id)
    if (res.code === 0) { ElMessage.success('删除成功'); fetchEventList() }
  } catch { /* ignore */ }
}

function onEventSaved() { eventDialogVisible.value = false; fetchEventList(); fetchAlgoList() }

onMounted(() => { fetchAlgoList(); fetchEventList() })
</script>

<style lang="scss" scoped>
.algorithm-page {
  padding: var(--spacing-lg);
  width: 100%;
  box-sizing: border-box;

  .algo-tabs {
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .toolbar {
    display: flex; flex-wrap: wrap; justify-content: space-between;
    align-items: center; gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }
  .toolbar-left { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  .table-card {
    padding: var(--spacing-lg); overflow-x: auto;
    .id-code {
      font-size: var(--font-xs); background: var(--bg-elevated);
      padding: 2px 6px; border-radius: var(--radius-sm); color: var(--text-regular);
    }
    .name-text { font-weight: 500; color: var(--text-primary); }
    .text-muted { color: var(--text-secondary); }
    .count-text { font-weight: 500; }
    .pill-list { display: flex; gap: 4px; flex-wrap: wrap; }
    .pill-tag { margin: 0; }
    .pill-more { cursor: pointer; opacity: 0.7; }
    .empty-state { padding: 40px 0; }
  }

  .pagination-wrapper {
    display: flex; flex-wrap: wrap; align-items: center;
    justify-content: space-between; gap: var(--spacing-md);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-lighter); margin-top: var(--spacing-md);
    .total-text { font-size: var(--font-sm); color: var(--text-secondary); }
  }
}
</style>
