<template>
  <div class="event-panel">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="search.keyword" placeholder="搜索 EventID / 名称"
          clearable style="width: 240px" @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加事件
      </el-button>
    </div>

    <!-- 表格 -->
    <div class="card">
    <el-table :data="list" stripe v-loading="loading">
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
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <span class="total-text">共 {{ total }} 条记录</span>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <!-- 空态 -->
    <div v-if="!loading && list.length === 0" class="empty-state">
      <el-empty description="暂无事件">
        <el-button type="primary" @click="handleAdd">添加事件</el-button>
      </el-empty>
    </div>
    </div>

    <!-- 事件编辑弹窗 -->
    <EventEdit v-model:visible="dialogVisible" :edit-id="editId" @success="onSaved" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EventEdit from '@/views/algorithm/EventEdit.vue'
import { listEvents, deleteEvent } from './data'

const search = reactive({ keyword: '' })
const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const dialogVisible = ref(false)
const editId = ref(null)

function parseItem(item) {
  try { item._name = JSON.parse(item.eventName || '{}') } catch { item._name = {} }
  try { item._push = JSON.parse(item.pushCopy || '{}') } catch { item._push = {} }
  return item
}

async function fetchList() {
  loading.value = true
  try {
    const res = listEvents({
      page: page.value,
      pageSize: pageSize.value,
      keyword: search.keyword || undefined
    })
    if (res.code === 0) {
      list.value = (res.data?.list || []).map(parseItem)
      total.value = res.data?.total || 0
    }
  } catch { /* ignore */ } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchList() }
function handleReset() { search.keyword = ''; page.value = 1; fetchList() }
function handleAdd() { editId.value = null; dialogVisible.value = true }
function handleEdit(row) { editId.value = row.id; dialogVisible.value = true }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除事件「${row._name?.['1'] || row.eventId}」？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
  } catch { return }
  try {
    const res = deleteEvent(row.id)
    if (res.code === 0) { ElMessage.success('删除成功'); fetchList() }
  } catch { /* ignore */ }
}

function onSaved() { dialogVisible.value = false; fetchList() }

onMounted(() => { fetchList() })
</script>

<style lang="scss" scoped>
.event-panel { padding: var(--spacing-lg) 0 0 0; }
.event-panel :deep(.card) { padding: var(--spacing-lg); }
.toolbar {
  display: flex; flex-wrap: wrap; justify-content: space-between;
  align-items: center; gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}
.toolbar-left { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.id-code {
  font-size: var(--font-xs); background: var(--bg-elevated);
  padding: 2px 6px; border-radius: var(--radius-sm); color: var(--text-regular);
}
.name-text { font-weight: 500; color: var(--text-primary); }
.text-muted { color: var(--text-secondary); }
.empty-state { padding: 40px 0; }
.pagination-wrapper {
  display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-lighter); margin-top: var(--spacing-md);
  .total-text { font-size: var(--font-sm); color: var(--text-secondary); }
}
</style>
