<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            class="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
            @click="openAdd"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
            <span>添加事件</span>
          </button>
          <span class="text-xs text-slate-400">共 {{ filtered.length }} 个事件</span>
        </div>

        <div class="flex items-center space-x-2">
          <el-select
            v-model="categoryFilter"
            placeholder="全部分类"
            style="width:150px"
          >
            <el-option label="全部分类" value="" />
            <el-option v-for="c in store.eventCategories" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
          <div class="relative w-52 sm:w-64">
            <input
              v-model="keyword"
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all"
              placeholder="搜索 事件ID / 类型..."
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </div>
          <button
            class="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
            @click="openCategoryDialog"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
            <span>分类管理</span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto bg-white">
        <el-table :data="paged" row-key="id">
          <el-table-column label="事件ID" width="120">
            <template #default="{ row }"><code class="cell-id">{{ row.eventId }}</code></template>
          </el-table-column>
          <el-table-column label="事件类型" min-width="180">
            <template #default="{ row }">
              <span class="cell-name">{{ parseLang(row.eventName) || '—' }}</span>
              <span v-if="parseLang(row.eventName, '2')" class="ml-1 text-[10px] text-slate-400">{{ parseLang(row.eventName, '2') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分类" width="150">
            <template #default="{ row }">
              <span v-if="row.category" class="type-tag type-evt">{{ row.category }}</span>
              <span v-else class="text-slate-300">—</span>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="180">
            <template #default="{ row }"><span class="cell-desc">{{ parseLang(row.descr) || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="推送文案" min-width="180">
            <template #default="{ row }"><span class="cell-desc">{{ parseLang(row.pushCopy) || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="right" fixed="right">
            <template #default="{ row }">
              <button class="link-action" @click="openEdit(row)">编辑</button>
              <button class="link-danger ml-3" @click="handleDelete(row)">删除</button>
            </template>
          </el-table-column>
          <template #empty>
            <div class="py-10 text-xs text-slate-400">暂无事件，点击「添加事件」新建</div>
          </template>
        </el-table>
      </div>

      <!-- Footer -->
      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>显示第 <strong class="text-slate-700">{{ pageStart }} - {{ pageEnd }}</strong> 项，共 <strong class="text-slate-700">{{ filtered.length }}</strong> 项</span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="filtered.length"
          layout="sizes, prev, pager, next"
        />
      </footer>
    </main>

    <!-- 添加/编辑 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑事件' : '添加事件'" width="560px" :close-on-click-modal="false">
      <el-form label-width="96px">
        <el-form-item label="事件ID" required>
          <el-input v-model.number="form.eventId" placeholder="6 位事件类型ID，如 100001" />
        </el-form-item>
        <el-form-item label="事件类型" required>
          <LangField v-model="form.name" placeholder="请输入事件类型名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="form.category"
            filterable
            clearable
            placeholder="请选择分类（可先在「分类管理」中维护）"
            style="width:100%"
          >
            <el-option v-for="c in store.eventCategories" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <LangField v-model="form.descr" placeholder="请输入事件描述" />
        </el-form-item>
        <el-form-item label="推送文案">
          <LangField v-model="form.push" placeholder="用户收到的推送文案" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分类管理 -->
    <el-dialog v-model="categoryDialogVisible" title="事件分类管理" width="480px" :close-on-click-modal="false">
      <div class="mb-3 flex items-center gap-2">
        <el-input v-model="newCategoryName" placeholder="请输入新分类名称" @keyup.enter="handleAddCategory" />
        <el-button type="primary" @click="handleAddCategory">添加</el-button>
      </div>
      <el-table :data="store.eventCategories" row-key="id" size="small">
        <el-table-column label="分类名称" min-width="160">
          <template #default="{ row }">
            <el-input v-if="editingCategoryId === row.id" v-model="editingCategoryName" size="small" @keyup.enter="handleSaveCategory(row)" />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="事件数" width="80" align="center">
          <template #default="{ row }">{{ categoryUsage(row.name) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="right">
          <template #default="{ row }">
            <template v-if="editingCategoryId === row.id">
              <button class="link-action" @click="handleSaveCategory(row)">保存</button>
              <button class="link-danger ml-3" @click="editingCategoryId = null">取消</button>
            </template>
            <template v-else>
              <button class="link-action" @click="startEditCategory(row)">重命名</button>
              <button class="link-danger ml-3" @click="handleDeleteCategory(row)">删除</button>
            </template>
          </template>
        </el-table-column>
        <template #empty>
          <div class="py-6 text-xs text-slate-400">暂无分类</div>
        </template>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="categoryDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LangField from '@/components/LangField.vue'
import {
  store, addEvent, updateEvent, deleteEvent,
  addEventCategory, updateEventCategory, deleteEventCategory
} from '@/data/thing-model'

const keyword = ref('')
const categoryFilter = ref('')
const page = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const editingId = ref(null)
const form = reactive({ eventId: null, name: {}, category: '', descr: {}, push: {} })

function parseObj(raw) {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return { '1': String(raw) } }
}
function parseLang(raw, key = '1') {
  const o = parseObj(raw)
  return o[key] || ''
}
function toJson(obj) {
  return JSON.stringify(obj || {})
}

// ===== 分类管理 =====
const categoryDialogVisible = ref(false)
const newCategoryName = ref('')
const editingCategoryId = ref(null)
const editingCategoryName = ref('')

function openCategoryDialog() {
  newCategoryName.value = ''
  editingCategoryId.value = null
  categoryDialogVisible.value = true
}
function categoryUsage(name) {
  return store.events.filter(e => e.category === name).length
}
function handleAddCategory() {
  const res = addEventCategory(newCategoryName.value)
  if (res.code !== 0) { ElMessage.warning(res.message); return }
  newCategoryName.value = ''
  ElMessage.success('已添加')
}
function startEditCategory(row) {
  editingCategoryId.value = row.id
  editingCategoryName.value = row.name
}
function handleSaveCategory(row) {
  const res = updateEventCategory(row.id, editingCategoryName.value)
  if (res.code !== 0) { ElMessage.warning(res.message); return }
  editingCategoryId.value = null
  ElMessage.success('已保存')
}
function handleDeleteCategory(row) {
  const res = deleteEventCategory(row.id)
  if (res.code !== 0) { ElMessage.warning(res.message); return }
  ElMessage.success('已删除')
}

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const cat = categoryFilter.value
  return store.events.filter(e => {
    if (cat && e.category !== cat) return false
    if (!k) return true
    return String(e.eventId).includes(k) ||
      parseLang(e.eventName).toLowerCase().includes(k) ||
      (e.category || '').toLowerCase().includes(k)
  })
})
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const pageStart = computed(() => (filtered.value.length ? (page.value - 1) * pageSize.value + 1 : 0))
const pageEnd = computed(() => Math.min(page.value * pageSize.value, filtered.value.length))

function openAdd() {
  editingId.value = null
  form.eventId = null
  form.name = {}
  form.category = ''
  form.descr = {}
  form.push = {}
  dialogVisible.value = true
}
function openEdit(row) {
  editingId.value = row.id
  form.eventId = row.eventId
  form.name = parseObj(row.eventName)
  form.category = row.category || ''
  form.descr = parseObj(row.descr)
  form.push = parseObj(row.pushCopy)
  dialogVisible.value = true
}
function handleConfirm() {
  if (!form.eventId) { ElMessage.warning('请输入事件ID'); return }
  if (!form.name['1']) { ElMessage.warning('请输入事件类型名称'); return }
  const dup = store.events.some(e => e.eventId === form.eventId && e.id !== editingId.value)
  if (dup) { ElMessage.warning('事件ID已存在'); return }
  const payload = {
    eventId: form.eventId,
    eventName: toJson(form.name),
    category: form.category,
    descr: toJson(form.descr),
    pushCopy: toJson(form.push)
  }
  if (editingId.value) {
    updateEvent({ id: editingId.value, ...payload })
    ElMessage.success('编辑成功')
  } else {
    addEvent(payload)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}
function handleDelete(row) {
  ElMessageBox.confirm(`确定删除事件「${parseLang(row.eventName)}」？`, '删除确认', { type: 'warning' })
    .then(() => {
      deleteEvent(row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}
</script>
