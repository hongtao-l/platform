<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <span class="card-title">设备类目</span>
        <el-button type="primary" size="small" @click="openAdd">
          <el-icon><Plus /></el-icon>添加类目
        </el-button>
      </div>
      <el-table v-if="store.categories.length" :data="store.categories" stripe>
        <el-table-column label="类目名称" min-width="140">
          <template #default="{ row }">
            <span class="cell-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标识符" width="180" align="center">
          <template #default="{ row }">
            <span class="cell-id">{{ row.identifier }}</span>
          </template>
        </el-table-column>
        <el-table-column label="能力模块" width="100" align="center">
          <template #default="{ row }">
            {{ row.modules.length }} 个
          </template>
        </el-table-column>
        <el-table-column label="标准能力" width="100" align="center">
          <template #default="{ row }">
            {{ getCapCount(row) }} 个
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cell-desc">{{ row.descr }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div style="white-space:nowrap">
              <el-button size="small" text type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-state">暂无设备类目，请点击上方按钮添加</div>
    </div>

    <!-- 添加/编辑类目弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类目名称（最多40字符）" maxlength="40" />
        </el-form-item>
        <el-form-item label="标识符" prop="identifier">
          <el-input v-model="form.identifier" placeholder="例如 ipc_camera" maxlength="40" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线</span>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.descr" type="textarea" placeholder="请输入描述（最多200字符）" maxlength="200" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { store, addCategory, updateCategory, removeCategory, getCategoryStats, isIdentifierUnique } from './data'

const dialogVisible = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const form = reactive({ name: '', identifier: '', descr: '' })

const dialogTitle = computed(() => editingId.value ? '编辑类目' : '添加类目')

const identRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/

const rules = {
  name: [{ required: true, message: '请输入类目名称', trigger: 'blur' }],
  identifier: [
    { required: true, message: '请输入标识符', trigger: 'blur' },
    { pattern: identRegex, message: '字母开头，仅允许字母、数字、下划线', trigger: 'blur' }
  ]
}

function getCapCount(row) {
  let n = 0
  row.modules.forEach(m => { n += m.capabilities.length })
  return n
}

function openAdd() {
  editingId.value = null
  form.name = ''
  form.identifier = ''
  form.descr = ''
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.name = row.name
  form.identifier = row.identifier
  form.descr = row.descr
  dialogVisible.value = true
}

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (!isIdentifierUnique(form.identifier, editingId.value || undefined)) {
      ElMessage.warning('标识符已存在，请更换')
      return
    }
    if (editingId.value) {
      updateCategory(editingId.value, { ...form })
      ElMessage.success('编辑成功')
    } else {
      addCategory({ ...form })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  })
}

function handleDelete(row) {
  const stats = getCategoryStats(row.id)
  ElMessageBox.confirm(
    `确定删除类目「${row.name}」？将同步删除其下 ${stats.moduleCount} 个能力模块和 ${stats.capabilityCount} 个标准能力。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeCategory(row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.cell-name { font-weight: 500; color: var(--text-primary); }
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
</style>
