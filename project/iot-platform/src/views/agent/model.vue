<template>
  <div class="page-container">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-item">
        <label>厂商</label>
        <el-select v-model="filters.provider" placeholder="全部" size="default" style="width:160px" clearable>
          <el-option label="全部" value="" />
          <el-option label="阿里云" value="阿里云" />
          <el-option label="百度智能云" value="百度智能云" />
          <el-option label="智谱 AI" value="智谱 AI" />
          <el-option label="自定义" value="自定义" />
        </el-select>
      </div>
      <div class="filter-item">
        <label>状态</label>
        <el-select v-model="filters.status" placeholder="全部" size="default" style="width:120px" clearable>
          <el-option label="全部" value="" />
          <el-option label="已启用" value="enabled" />
          <el-option label="已停用" value="disabled" />
        </el-select>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-end">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <el-button @click="$router.push('/agent')">
          <el-icon><ArrowLeft /></el-icon>
          返回智能体管理
        </el-button>
        <el-button type="primary" @click="openModelDialog('add')">
          <el-icon><Plus /></el-icon>
          添加模型
        </el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="card">
      <el-table :data="filteredList" stripe>
        <el-table-column label="厂商名称" width="140">
          <template #default="{ row }">
            <span style="font-weight:500;color:var(--text-primary)">{{ row.provider }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模型标识" width="180">
          <template #default="{ row }">
            <span style="font-size:13px;color:var(--text-secondary)">{{ row.identifier }}</span>
          </template>
        </el-table-column>
        <el-table-column label="显示名称" min-width="180">
          <template #default="{ row }">
            <span>{{ row.label }}</span>
          </template>
        </el-table-column>
        <el-table-column label="API Key" width="180">
          <template #default="{ row }">
            <span class="key-masked">{{ maskKey(row.apiKey) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openModelDialog('edit', row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <span class="total-text">共 {{ filteredList.length }} 条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next"
          :total="filteredList.length"
          :page-size="10"
        />
      </div>
    </div>

    <!-- 添加/编辑模型弹窗 -->
    <el-dialog
      v-model="modelDialogVisible"
      :title="modelDialogMode === 'add' ? '添加模型' : '编辑模型'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <el-form-item label="厂商" required>
          <el-select v-model="modelForm.provider" style="width:100%" filterable allow-create>
            <el-option label="阿里云" value="阿里云" />
            <el-option label="百度智能云" value="百度智能云" />
            <el-option label="智谱 AI" value="智谱 AI" />
            <el-option label="OpenAI" value="OpenAI" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="modelForm.label" placeholder="例如：通义千问 Qwen-Max" />
        </el-form-item>
        <el-form-item label="模型标识" required>
          <el-input v-model="modelForm.identifier" placeholder="例如：qwen-max" />
        </el-form-item>
        <el-form-item label="API Key" required>
          <el-input v-model="modelForm.apiKey" type="password" show-password placeholder="请输入 API Key" />
        </el-form-item>
        <el-form-item label="Endpoint">
          <el-input v-model="modelForm.endpoint" placeholder="例如：https://dashscope.aliyuncs.com/compatible-mode/v1" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="modelForm.descr" placeholder="备注说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveModel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'

// ===== 筛选 =====
const filters = reactive({ provider: '', status: '' })

const handleQuery = () => {}
const handleReset = () => {
  filters.provider = ''
  filters.status = ''
}

// ===== 列表 =====
// TODO: 接入真实 API
const modelList = ref([
  { id: 1, provider: '阿里云', label: '通义千问 Qwen-Max', identifier: 'qwen-max', apiKey: 'sk-1234567890abcd', endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1', descr: '', enabled: true },
  { id: 2, provider: '百度智能云', label: '文心一言 ERNIE-4.0', identifier: 'ernie-4.0-8k', apiKey: 'sk-abcd1234567890', endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat', descr: '', enabled: true },
  { id: 3, provider: '智谱 AI', label: 'GLM-4', identifier: 'glm-4', apiKey: 'sk-5678abcdef9012', endpoint: 'https://open.bigmodel.cn/api/paas/v4', descr: '', enabled: false }
])

const filteredList = computed(() => {
  let list = modelList.value
  if (filters.provider) list = list.filter(m => m.provider === filters.provider)
  if (filters.status) list = list.filter(m => filters.status === 'enabled' ? m.enabled : !m.enabled)
  return list
})

const maskKey = (key) => {
  if (!key || key.length <= 4) return key || '—'
  return '****' + key.slice(-4)
}

const handleStatusChange = (row) => {
  ElMessage.success(row.enabled ? '已启用' : '已停用')
}

const handleDelete = (row) => {
  // TODO: 检查是否被智能体引用
  ElMessageBox.confirm('确定删除该模型？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = modelList.value.findIndex(m => m.id === row.id)
    if (idx >= 0) modelList.value.splice(idx, 1)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== 弹窗 =====
const modelDialogVisible = ref(false)
const modelDialogMode = ref('add')
const editingModelId = ref(null)

const defaultModelForm = () => ({
  provider: '', label: '', identifier: '', apiKey: '', endpoint: '', descr: ''
})
const modelForm = reactive(defaultModelForm())

const openModelDialog = (mode, row) => {
  modelDialogMode.value = mode
  if (mode === 'edit' && row) {
    editingModelId.value = row.id
    Object.assign(modelForm, {
      provider: row.provider, label: row.label, identifier: row.identifier,
      apiKey: row.apiKey, endpoint: row.endpoint || '', descr: row.descr || ''
    })
  } else {
    editingModelId.value = null
    Object.assign(modelForm, defaultModelForm())
  }
  modelDialogVisible.value = true
}

const saveModel = () => {
  if (!modelForm.provider.trim()) return ElMessage.warning('请选择厂商')
  if (!modelForm.label.trim()) return ElMessage.warning('请输入显示名称')
  if (!modelForm.identifier.trim()) return ElMessage.warning('请输入模型标识')
  if (!modelForm.apiKey.trim()) return ElMessage.warning('请输入 API Key')

  if (modelDialogMode.value === 'add') {
    modelList.value.push({
      id: Date.now(),
      ...modelForm,
      enabled: true
    })
    ElMessage.success('模型已添加')
  } else {
    const target = modelList.value.find(m => m.id === editingModelId.value)
    if (target) Object.assign(target, modelForm)
    ElMessage.success('模型已更新')
  }
  modelDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.filter-bar {
  background: var(--bg-card);
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }
}

.key-masked { font-family: monospace; font-size: 13px; color: var(--text-secondary); }

.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--border-lighter);
}

.total-text {
  font-size: 13px;
  color: var(--text-secondary);
  margin-right: 12px;
}
</style>
