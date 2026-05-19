<template>
  <div class="product-page">
    <!-- 搜索区域 -->
    <div class="search-bar card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="搜索产品名称或ID"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="searchForm.type" placeholder="产品类型" clearable style="width: 140px">
            <el-option label="IPC" value="ipc" />
            <el-option label="门锁" value="lock" />
            <el-option label="传感器" value="sensor" />
            <el-option label="电工照明" value="lighting" />
          </el-select>
        </el-form-item>
        <el-form-item label="开发状态">
          <el-select v-model="searchForm.status" placeholder="开发状态" clearable style="width: 120px">
            <el-option label="开发中" value="developing" />
            <el-option label="已完成" value="completed" />
            <el-option label="未开始" value="not_started" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加产品
      </el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-container card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="产品ID" width="150">
          <template #default="{ row }">
            <span class="text-primary">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="产品名称" min-width="160" />
        <el-table-column prop="type" label="产品类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="functionCount" label="功能点" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.functionCount > 0" class="link-text" @click="handleViewFunc(row)">
              {{ row.functionCount }} 项
            </span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="开发状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="120">
          <template #default="{ row }">
            <span class="text-muted">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.status === 'completed' ? 'default' : 'primary'"
              size="small"
              @click="handleDev(row)"
            >
              {{ getDevButtonText(row.status) }}
            </el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <span class="total-text">共 {{ pagination.total }} 条记录</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 添加/编辑产品弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加产品' : '编辑产品'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="productForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="产品ID" prop="id" v-if="dialogType === 'add'">
          <el-input v-model="productForm.id" placeholder="如 IPC_PRO_001" />
          <div class="form-hint">建议使用大写字母+下划线格式</div>
        </el-form-item>
        <el-form-item label="产品ID" v-else>
          <el-input v-model="productForm.id" disabled />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品类型" prop="type" v-if="dialogType === 'add'">
          <el-select v-model="productForm.type" placeholder="请选择产品类型" style="width: 100%">
            <el-option label="IPC" value="ipc" />
            <el-option label="门锁" value="lock" />
            <el-option label="传感器" value="sensor" />
            <el-option label="电工照明" value="lighting" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品类型" v-else>
          <el-input :value="getTypeName(productForm.type)" disabled />
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
})

// 加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    id: 'IPC_PRO_001',
    name: 'IPC Pro 标准版',
    type: 'ipc',
    typeName: 'IPC',
    functionCount: 5,
    status: 'developing',
    statusName: '开发中',
    createTime: '2026-04-10',
    description: 'IPC Pro 标准版，支持夜视、白光灯、红外灯等能力'
  },
  {
    id: 'IPC_LITE_001',
    name: 'IPC Lite 简易版',
    type: 'ipc',
    typeName: 'IPC',
    functionCount: 3,
    status: 'completed',
    statusName: '已完成',
    createTime: '2026-04-12',
    description: 'IPC Lite 简易版'
  },
  {
    id: 'LOCK_001',
    name: '智能门锁标准版',
    type: 'lock',
    typeName: '门锁',
    functionCount: 0,
    status: 'not_started',
    statusName: '未开始',
    createTime: '2026-04-15',
    description: '智能门锁标准版'
  }
])

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add') // add | edit
const formRef = ref(null)

// 产品表单
const productForm = reactive({
  id: '',
  name: '',
  type: '',
  description: ''
})

// 表单验证规则
const formRules = {
  id: [
    { required: true, message: '请输入产品ID', trigger: 'blur' },
    { pattern: /^[A-Z_0-9]+$/, message: '产品ID只能包含大写字母、数字和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ]
}

// 获取类型标签样式
const getTypeTag = (type) => {
  const map = {
    ipc: '',
    lock: 'warning',
    sensor: 'success',
    lighting: 'info'
  }
  return map[type] || ''
}

// 获取状态标签样式
const getStatusTag = (status) => {
  const map = {
    developing: 'warning',
    completed: 'success',
    not_started: 'info'
  }
  return map[status] || ''
}

// 获取开发按钮文字
const getDevButtonText = (status) => {
  const map = {
    developing: '继续开发',
    completed: '查看配置',
    not_started: '开始开发'
  }
  return map[status] || '开始开发'
}

// 获取类型名称
const getTypeName = (type) => {
  const map = {
    ipc: 'IPC',
    lock: '门锁',
    sensor: '传感器',
    lighting: '电工照明'
  }
  return map[type] || type
}

// 查询
const handleSearch = () => {
  pagination.page = 1
  // TODO: 调用接口获取数据
  ElMessage.success('查询成功')
}

// 添加产品
const handleAdd = () => {
  dialogType.value = 'add'
  productForm.id = ''
  productForm.name = ''
  productForm.type = ''
  productForm.description = ''
  dialogVisible.value = true
}

// 编辑产品
const handleEdit = (row) => {
  dialogType.value = 'edit'
  productForm.id = row.id
  productForm.name = row.name
  productForm.type = row.type
  productForm.description = row.description
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '保存成功')
      dialogVisible.value = false
    }
  })
}

// 继续开发/查看配置
const handleDev = (row) => {
  router.push({
    path: '/product/config',
    query: { id: row.id, name: row.name }
  })
}

// 查看功能点
const handleViewFunc = (row) => {
  router.push({
    path: '/product/config',
    query: { id: row.id, name: row.name }
  })
}

// 删除产品
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除产品 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  handleSearch()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page
  // TODO: 调用接口获取数据
}
</script>

<style lang="scss" scoped>
.product-page {
  padding: var(--spacing-lg);
  width: 100%;
  box-sizing: border-box;

  .search-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    gap: var(--spacing-md);
  }

  .table-container {
    padding: var(--spacing-lg);
    overflow-x: auto;

    .text-primary {
      color: var(--text-primary);
      font-weight: 500;
    }

    .text-muted {
      color: var(--text-secondary);
    }

    .link-text {
      color: var(--primary-color);
      cursor: pointer;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .pagination-wrapper {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-lighter);
      margin-top: var(--spacing-md);

      .total-text {
        font-size: var(--font-sm);
        color: var(--text-secondary);
      }
    }
  }

  .form-hint {
    font-size: var(--font-xs);
    color: var(--text-secondary);
    margin-top: 4px;
  }
}
</style>
