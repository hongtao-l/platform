<template>
  <div class="algorithm-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="search.keyword" placeholder="搜索 AlgorithmID / 名称"
          clearable style="width: 240px" @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加算法
      </el-button>
    </div>

    <div class="card table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column label="算法ID" width="180">
          <template #default="{ row }">
            <code class="id-code">{{ row.algorithmId }}</code>
          </template>
        </el-table-column>
        <el-table-column label="图标" width="70" align="center">
          <template #default="{ row }">
            <img v-if="row.algorithmIcon && isImageUrl(row.algorithmIcon)" :src="row.algorithmIcon" class="icon-cell" />
            <span v-else-if="row.algorithmIcon" style="font-size:18px">{{ row.algorithmIcon }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="算法名称" min-width="140">
          <template #default="{ row }">
            <span class="name-text">{{ row._name?.['1'] || row.algorithmId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="关联能力" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="getCapCount(row) > 0" size="small" type="primary"
              class="count-badge" @click="$router.push(`/thing-model/algorithm/${row.id}/capabilities`)">
              {{ getCapCount(row) }} 个
            </el-tag>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="180">
          <template #default="{ row }">
            <span>{{ row.descr || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

      <div v-if="!loading && list.length === 0" class="empty-state">
        <el-empty description="暂无算法">
          <el-button type="primary" @click="handleAdd">添加算法</el-button>
        </el-empty>
      </div>
    </div>

    <AlgorithmEdit v-model:visible="dialogVisible" :edit-id="editId" @success="onSaved" />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AlgorithmEdit from './AlgorithmEdit.vue'
import { listAlgorithms, deleteAlgorithm } from './data'

const search = reactive({ keyword: '' })
const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const dialogVisible = ref(false)
const editId = ref(null)

function parseItem(item) {
  try { item._name = JSON.parse(item.algorithmName || '{}') } catch { item._name = {} }
  try { item._caps = JSON.parse(item.capabilities || '{}') } catch { item._caps = {} }
  return item
}

function isImageUrl(val) { return /^(https?:|data:|\/)/i.test(val) }

function getCapCount(row) {
  const caps = row._caps || {}
  const keys = Object.keys(caps).filter(k => !k.startsWith('__'))
  return keys.length
}

async function fetchList() {
  loading.value = true
  try {
    const res = listAlgorithms({
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
    await ElMessageBox.confirm(`确定删除算法「${row._name?.['1'] || row.algorithmId}」？`, '确认删除', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
  } catch { return }
  try {
    const res = deleteAlgorithm(row.id)
    if (res.code === 0) { ElMessage.success('删除成功'); fetchList() }
  } catch { /* ignore */ }
}

function onSaved() { dialogVisible.value = false; fetchList() }

onMounted(() => { fetchList() })
</script>

<style lang="scss" scoped>
.algorithm-page {
  padding: var(--spacing-lg);
  width: 100%;
  box-sizing: border-box;
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
  .icon-cell { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; }
  .count-badge { cursor: pointer; }
  .empty-state { padding: 40px 0; }
}
.pagination-wrapper {
  display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-lighter); margin-top: var(--spacing-md);
  .total-text { font-size: var(--font-sm); color: var(--text-secondary); }
}

// 关联弹窗通用样式
.assoc-layout { display: flex; gap: 12px; }
.assoc-panel {
  flex: 1; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); overflow: hidden;
  display: flex; flex-direction: column; max-height: 360px;
}
.assoc-panel-header {
  display: flex; align-items: center;
  padding: 10px 12px; background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--font-xs); font-weight: 500; color: var(--text-secondary);
  flex-shrink: 0;
}
.assoc-panel-body { flex: 1; overflow-y: auto; }
.assoc-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; cursor: pointer; font-size: 13px; user-select: none;
  border-bottom: 1px solid var(--border-lighter);
  transition: background .15s;
  &:hover { background: var(--bg-hover); }
  &.selected { background: var(--primary-bg); }
}
.assoc-item-name { color: var(--text-regular); flex: 1; }
.assoc-item-id { font-weight: 500; color: var(--text-primary); min-width: 60px; font-size: 12px; }
.assoc-check { color: var(--primary-color); flex-shrink: 0; }
.assoc-empty { padding: 32px; text-align: center; color: var(--text-placeholder); font-size: 13px; }
</style>


