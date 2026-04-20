<template>
  <div class="product-config-page">
    <!-- 面包屑导航 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/product' }">产品管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ productName }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 功能点列表 -->
    <div class="func-list card">
      <div class="card-header">
        <span class="card-title">已选功能点 ({{ funcList.length }}项)</span>
        <el-button type="primary" @click="handleAddFunc">
          <el-icon><Plus /></el-icon>
          添加功能
        </el-button>
      </div>

      <el-table :data="funcList" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="功能名称" min-width="140">
          <template #default="{ row }">
            <span class="text-primary">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="identifier" label="功能标识" min-width="140">
          <template #default="{ row }">
            <span class="text-muted">{{ row.identifier }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="数据类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.dataType === '枚举型' ? '' : 'success'" size="small">
              {{ row.dataType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditFunc(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteFunc(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 返回按钮 -->
    <div class="page-footer">
      <el-button @click="handleBack">返回列表</el-button>
    </div>

    <!-- 添加功能点弹窗 -->
    <el-dialog
      v-model="addFuncDialogVisible"
      title="添加标准功能点"
      width="720px"
      :close-on-click-modal="false"
    >
      <!-- 搜索框 -->
      <div class="search-input">
        <el-input
          v-model="funcSearchKeyword"
          placeholder="搜索功能点名称或标识"
          clearable
          @input="handleFuncSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 功能点列表 -->
      <div class="func-grid">
        <div
          v-for="func in filteredStandardFuncs"
          :key="func.identifier"
          class="func-card"
          :class="{
            selected: selectedFuncs.includes(func.identifier),
            disabled: existingFuncIds.includes(func.identifier)
          }"
          @click="toggleFuncSelect(func)"
        >
          <div class="func-checkbox">
            <el-icon v-if="selectedFuncs.includes(func.identifier) || existingFuncIds.includes(func.identifier)">
              <Check />
            </el-icon>
          </div>
          <div class="func-info">
            <div class="func-name">{{ func.name }}</div>
            <div class="func-meta">
              <span>标识: {{ func.identifier }}</span>
              <span>类型: {{ func.dataType }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 已选择提示 -->
      <div class="selected-tip">
        已选择: {{ selectedFuncs.length }} 个功能点
        <span v-if="selectedFuncs.length > 0">
          ({{ getSelectedFuncNames() }})
        </span>
      </div>

      <template #footer>
        <el-button @click="addFuncDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddFunc">确定添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑功能点抽屉 -->
    <el-drawer
      v-model="editDrawerVisible"
      :title="'编辑功能点 - ' + editingFunc?.name"
      size="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        label-position="top"
      >
        <el-form-item label="功能名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入功能名称" />
        </el-form-item>

        <el-form-item label="功能标识">
          <el-input v-model="editForm.identifier" disabled />
          <div class="form-hint">功能点唯一标识，不可修改</div>
        </el-form-item>

        <el-form-item label="数据类型">
          <el-input v-model="editForm.dataType" disabled />
          <div class="form-hint">根据标准功能定义，不可修改</div>
        </el-form-item>

        <!-- 枚举值配置 -->
        <template v-if="editForm.dataType === '枚举型'">
          <el-divider content-position="left">枚举值配置</el-divider>
          <div class="enum-list">
            <div
              v-for="(item, index) in editForm.enumValues"
              :key="index"
              class="enum-item"
            >
              <el-input v-model="item.value" disabled style="width: 60px" />
              <el-input v-model="item.label" placeholder="描述（APP显示）" style="flex: 1" />
              <div
                class="default-radio"
                :class="{ active: item.isDefault }"
                @click="setDefaultEnum(index)"
                title="设为默认"
              />
            </div>
          </div>
        </template>

        <el-divider content-position="left">备注</el-divider>
        <el-form-item>
          <el-input
            v-model="editForm.remark"
            type="textarea"
            :rows="3"
            placeholder="非必填，可记录功能点说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditFunc">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Search, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 产品名称
const productName = ref(route.query.name || '产品配置')

// 功能点列表
const funcList = ref([
  {
    id: 1,
    name: '夜视模式',
    identifier: 'night_vision',
    dataType: '枚举型',
    enumValues: [
      { value: 'auto', label: '自动模式', isDefault: true },
      { value: 'manual', label: '手动模式', isDefault: false },
      { value: 'off', label: '关闭', isDefault: false }
    ],
    remark: ''
  },
  {
    id: 2,
    name: '灯光模式',
    identifier: 'light_mode',
    dataType: '枚举型',
    enumValues: [
      { value: '0', label: '全彩模式', isDefault: false },
      { value: '1', label: '红外模式', isDefault: true },
      { value: '2', label: '智能模式', isDefault: false },
      { value: '3', label: '自定义模式', isDefault: false },
      { value: '4', label: '关闭', isDefault: false }
    ],
    remark: '支持全彩/红外/智能/自定义/关闭'
  },
  {
    id: 3,
    name: '白光灯',
    identifier: 'white_light',
    dataType: '布尔型',
    remark: ''
  },
  {
    id: 4,
    name: '移动侦测',
    identifier: 'motion_detect',
    dataType: '布尔型',
    remark: ''
  },
  {
    id: 5,
    name: '云存储',
    identifier: 'cloud_storage',
    dataType: '布尔型',
    remark: ''
  }
])

// 已存在的功能ID列表
const existingFuncIds = computed(() => funcList.value.map(f => f.identifier))

// 标准功能点库
const standardFuncs = ref([
  { name: '夜视模式', identifier: 'night_vision', dataType: '枚举型' },
  { name: '灯光模式', identifier: 'light_mode', dataType: '枚举型' },
  { name: '白光灯', identifier: 'white_light', dataType: '布尔型' },
  { name: '红外灯', identifier: 'infrared_light', dataType: '布尔型' },
  { name: '移动侦测', identifier: 'motion_detect', dataType: '布尔型' },
  { name: '云存储', identifier: 'cloud_storage', dataType: '布尔型' },
  { name: '双向语音', identifier: 'two_way_voice', dataType: '布尔型' },
  { name: '消息推送', identifier: 'msg_push', dataType: '布尔型' },
  { name: '人脸识别', identifier: 'face_recogn', dataType: '枚举型' },
  { name: '声音检测', identifier: 'sound_detect', dataType: '布尔型' }
])

// 添加功能点弹窗
const addFuncDialogVisible = ref(false)
const funcSearchKeyword = ref('')
const selectedFuncs = ref([])

// 过滤后的标准功能点
const filteredStandardFuncs = computed(() => {
  if (!funcSearchKeyword.value) return standardFuncs.value
  const keyword = funcSearchKeyword.value.toLowerCase()
  return standardFuncs.value.filter(func =>
    func.name.toLowerCase().includes(keyword) ||
    func.identifier.toLowerCase().includes(keyword)
  )
})

// 编辑功能点抽屉
const editDrawerVisible = ref(false)
const editingFunc = ref(null)
const editFormRef = ref(null)
const editForm = reactive({
  name: '',
  identifier: '',
  dataType: '',
  enumValues: [],
  remark: ''
})

// 返回列表
const handleBack = () => {
  router.push('/product')
}

// 打开添加功能点弹窗
const handleAddFunc = () => {
  selectedFuncs.value = []
  funcSearchKeyword.value = ''
  addFuncDialogVisible.value = true
}

// 搜索功能点
const handleFuncSearch = () => {
  // 搜索逻辑已通过 computed 实现
}

// 切换功能点选择
const toggleFuncSelect = (func) => {
  // 已存在的功能点不可选择
  if (existingFuncIds.value.includes(func.identifier)) return

  const index = selectedFuncs.value.indexOf(func.identifier)
  if (index > -1) {
    selectedFuncs.value.splice(index, 1)
  } else {
    selectedFuncs.value.push(func.identifier)
  }
}

// 获取已选择的功能点名称
const getSelectedFuncNames = () => {
  return selectedFuncs.value.map(id => {
    const func = standardFuncs.value.find(f => f.identifier === id)
    return func?.name
  }).filter(Boolean).join('、')
}

// 确认添加功能点
const confirmAddFunc = () => {
  if (selectedFuncs.value.length === 0) {
    ElMessage.warning('请选择要添加的功能点')
    return
  }

  selectedFuncs.value.forEach(identifier => {
    const func = standardFuncs.value.find(f => f.identifier === identifier)
    if (func) {
      funcList.value.push({
        id: Date.now() + Math.random(),
        name: func.name,
        identifier: func.identifier,
        dataType: func.dataType,
        enumValues: func.dataType === '枚举型' ? [] : undefined,
        remark: ''
      })
    }
  })

  ElMessage.success(`成功添加 ${selectedFuncs.value.length} 个功能点`)
  addFuncDialogVisible.value = false
}

// 编辑功能点
const handleEditFunc = (row) => {
  editingFunc.value = row
  editForm.name = row.name
  editForm.identifier = row.identifier
  editForm.dataType = row.dataType
  editForm.enumValues = row.enumValues ? JSON.parse(JSON.stringify(row.enumValues)) : []
  editForm.remark = row.remark || ''
  editDrawerVisible.value = true
}

// 设置默认枚举值
const setDefaultEnum = (index) => {
  editForm.enumValues.forEach((item, i) => {
    item.isDefault = i === index
  })
}

// 保存编辑
const saveEditFunc = () => {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入功能名称')
    return
  }

  const func = funcList.value.find(f => f.id === editingFunc.value.id)
  if (func) {
    func.name = editForm.name
    func.enumValues = editForm.enumValues
    func.remark = editForm.remark
  }

  ElMessage.success('保存成功')
  editDrawerVisible.value = false
}

// 删除功能点
const handleDeleteFunc = (row) => {
  ElMessageBox.confirm(`确定要删除功能点 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = funcList.value.findIndex(f => f.id === row.id)
    if (index > -1) {
      funcList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.product-config-page {
  padding: var(--spacing-lg);
  min-height: calc(100vh - 56px);

  .page-header {
    margin-bottom: var(--spacing-lg);
  }

  .func-list {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-lighter);

      .card-title {
        font-size: var(--font-lg);
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .text-primary {
      color: var(--text-primary);
      font-weight: 500;
    }

    .text-muted {
      color: var(--text-secondary);
    }
  }

  .page-footer {
    margin-top: var(--spacing-lg);
    text-align: right;
  }
}

// 添加功能点弹窗样式
.search-input {
  margin-bottom: var(--spacing-md);
}

.func-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-xs);

  .func-card {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(.disabled) {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
    }

    &.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }

    &.disabled {
      background: var(--bg-disabled);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .func-checkbox {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: white;
      font-size: 12px;
    }

    &.selected .func-checkbox,
    &.disabled .func-checkbox {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .func-info {
      flex: 1;

      .func-name {
        font-size: var(--font-md);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 4px;
      }

      .func-meta {
        font-size: var(--font-xs);
        color: var(--text-secondary);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    }
  }
}

.selected-tip {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--primary-color);
}

// 编辑抽屉样式
.form-hint {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: 4px;
}

.enum-list {
  .enum-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-page);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-sm);

    &:hover {
      background: var(--bg-hover);
    }

    .default-radio {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border-color);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;

      &.active {
        border-color: var(--primary-color);

        &::after {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--primary-color);
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
