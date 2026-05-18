<template>
  <div class="page-container">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-item">
        <label>套餐名称</label>
        <el-input v-model="filters.keyword" placeholder="搜索套餐名称" size="default" style="width:180px" clearable />
      </div>
      <div class="filter-item">
        <label>应用方向</label>
        <el-select v-model="filters.direction" placeholder="全部" size="default" style="width:150px" clearable>
          <el-option label="全部" value="" />
          <el-option label="设备" value="device" />
          <el-option label="用户" value="user" />
        </el-select>
      </div>
      <div class="filter-item">
        <label>投放区域</label>
        <el-select v-model="filters.region" placeholder="全部" size="default" style="width:150px" clearable>
          <el-option label="全部" value="" />
          <el-option label="全球通用" value="global" />
          <el-option label="国内" value="cn" />
          <el-option label="海外" value="overseas" />
        </el-select>
      </div>
      <div class="filter-item">
        <label>选择投放应用</label>
        <el-select v-model="filters.app" placeholder="全部" size="default" style="width:180px" clearable>
          <el-option label="全部" value="" />
          <el-option label="牵心PRO" value="qxpro" />
          <el-option label="鹤梦之家" value="hmhome" />
        </el-select>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-end">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <el-button type="primary" @click="openDrawer('add')">
          <el-icon><Plus /></el-icon>
          创建套餐
        </el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="card">
      <el-table :data="pkgList" stripe>
        <el-table-column label="套餐信息" min-width="220">
          <template #default="{ row }">
            <div>
              <span style="font-weight:500;color:var(--text-primary)">{{ row.name }}</span>
            </div>
            <div style="font-size:12px;color:var(--text-placeholder);margin-top:2px">
              {{ row.code }}
              <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-left:4px">{{ tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="应用方向" width="80">
          <template #default="{ row }">
            <span>{{ row.direction === 'device' ? '设备' : '用户' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="投放区域" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="regionType(row.region)">{{ regionLabel(row.region) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="投放应用" width="130">
          <template #default="{ row }">
            <span style="font-size:13px">{{ row.apps.map(a => a.name + '(' + a.count + ')').join('\n') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="投放运营位" width="140">
          <template #default="{ row }">
            <el-tag v-for="slot in row.slots" :key="slot" size="small" :type="slot === '商城位' ? 'info' : 'warning'" style="margin-right:4px">
              {{ slot }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订阅类型" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="subTypeTag(row.subType)">{{ subTypeLabel(row.subType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="平台总成本" width="120">
          <template #default="{ row }">
            <span style="font-weight:500">{{ row.cost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="售价" width="130">
          <template #default="{ row }">
            <span style="font-weight:500">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="110">
          <template #default="{ row }">
            <span style="font-size:13px;color:var(--text-secondary)">{{ row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openDrawer('edit', row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;align-items:center;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border-lighter)">
        <span style="font-size:13px;color:var(--text-secondary);margin-right:12px">共 {{ pkgList.length }} 条</span>
        <el-pagination
          small
          background
          layout="prev, pager, next"
          :total="pkgList.length"
          :page-size="10"
        />
      </div>
    </div>

    <!-- 配置抽屉 -->
    <PkgConfig
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :data="editingPkg"
      :pkg-tag-options="tagList.map(t => t.name)"
      :desc-tag-options="descTagList.map(t => t.name)"
      :category-options="categoryList.map(c => c.name)"
      @save="handleSave"
      @open-tag-modal="openTagModal"
      @open-category-modal="categoryModalVisible = true"
    />

    <!-- 标签管理弹窗 -->
    <el-dialog
      v-model="tagModalVisible"
      :title="tagModalTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <el-input v-model="newTagName" placeholder="请输入标签名称" style="flex:1" />
        <el-button type="primary" @click="addTag">添加</el-button>
      </div>
      <el-table :data="tagList" stripe max-height="300">
        <el-table-column label="标签名称" prop="name" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button size="small" text type="danger" @click="removeTag(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 分类管理弹窗 -->
    <el-dialog
      v-model="categoryModalVisible"
      title="套餐分类管理"
      width="500px"
      :close-on-click-modal="false"
    >
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
        <el-button type="primary" size="small" @click="openAddCategory">添加分类</el-button>
      </div>
      <el-table :data="categoryList" stripe>
        <el-table-column label="分类名称">
          <template #default="{ row }">
            <span style="font-weight:500;color:var(--text-primary)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="editCategory(row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="removeCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加/编辑分类弹窗 -->
    <el-dialog
      v-model="categoryFormVisible"
      :title="categoryFormMode === 'add' ? '添加分类' : '编辑分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PkgConfig from './config.vue'

// ===== 筛选 =====
const filters = reactive({
  keyword: '',
  direction: '',
  region: '',
  app: ''
})

const handleQuery = () => {
  // TODO: call API
}

const handleReset = () => {
  filters.keyword = ''
  filters.direction = ''
  filters.region = ''
  filters.app = ''
}

// ===== 列表数据 =====
const pkgList = ref([
  {
    id: 1,
    name: '事件录像7天',
    code: 'PKG20220001',
    direction: 'device',
    region: 'global',
    apps: [{ name: '牵心PRO', count: 2 }, { name: '鹤梦之家', count: 1 }],
    slots: ['商城位', '推荐位'],
    subType: 'sub',
    cost: '¥2.50 / $0.35',
    price: '¥6.90 / $0.95',
    tags: ['热门推荐', '销量第一'],
    createdAt: '2026-01-17'
  },
  {
    id: 2,
    name: '国内专享·极简云存',
    code: 'PKG20220015',
    direction: 'user',
    region: 'cn',
    apps: [{ name: '牵心PRO', count: 1 }, { name: '鹤梦之家', count: 1 }],
    slots: ['商城位'],
    subType: 'sub',
    cost: '¥15.00 / $2.20',
    price: '¥59.00 / $8.50',
    tags: ['专订'],
    createdAt: '2026-03-20'
  },
  {
    id: 3,
    name: 'Overseas-Pro',
    code: 'PKG20220011',
    direction: 'device',
    region: 'overseas',
    apps: [{ name: '牵心PRO', count: 2 }],
    slots: ['推荐位'],
    subType: 'sub',
    cost: '$3.50',
    price: '$12.99',
    tags: [],
    createdAt: '2026-03-21'
  },
  {
    id: 4,
    name: 'AI智能检测体验',
    code: 'PKG20220018',
    direction: 'user',
    region: 'global',
    apps: [{ name: '牵心PRO', count: 1 }, { name: '鹤梦之家', count: 1 }],
    slots: ['商城位', '推荐位'],
    subType: 'free',
    cost: '¥0.00 / $0.00',
    price: '免费',
    tags: ['免费试用'],
    createdAt: '2026-04-10'
  }
])

const regionType = (r) => ({ global: '', cn: 'success', overseas: 'info' }[r] || '')
const regionLabel = (r) => ({ global: '全球通用', cn: '国内', overseas: '海外' }[r] || r)
const subTypeTag = (t) => ({ sub: 'success', nonSub: 'warning', free: 'info' }[t] || '')
const subTypeLabel = (t) => ({ sub: '订阅制', nonSub: '非订阅', free: '免费' }[t] || t)

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该套餐？此操作不可撤销。', '删除套餐', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = pkgList.value.findIndex(e => e.id === row.id)
    if (idx >= 0) pkgList.value.splice(idx, 1)
    ElMessage.success('套餐已删除')
  }).catch(() => {})
}

// ===== 配置抽屉 =====
const drawerVisible = ref(false)
const drawerMode = ref('add')
const editingPkg = ref(null)

const openDrawer = (mode, row) => {
  drawerMode.value = mode
  editingPkg.value = mode === 'edit' ? row : null
  drawerVisible.value = true
}

const handleSave = (data) => {
  if (drawerMode.value === 'add') {
    pkgList.value.unshift({
      id: Date.now(),
      code: 'PKG' + Date.now().toString().slice(-8),
      ...data,
      createdAt: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('套餐已创建')
  } else {
    const idx = pkgList.value.findIndex(e => e.id === editingPkg.value.id)
    if (idx >= 0) Object.assign(pkgList.value[idx], data)
    ElMessage.success('套餐已更新')
  }
  drawerVisible.value = false
}

// ===== 标签管理 =====
const tagModalVisible = ref(false)
const tagModalTitle = ref('管理套餐标签')
const tagModalType = ref('pkg')
const newTagName = ref('')
const tagList = ref([
  { name: '免费试用' }, { name: '限时优惠' }, { name: '新用户特惠' },
  { name: '热门推荐' }, { name: '销量第一' }, { name: '专订' }
])
const descTagList = ref([
  { name: '7天循环事件录制' }, { name: '7天消息回溯' },
  { name: '15天循环事件录制' }, { name: 'AI智能检测' }
])

const openTagModal = (type) => {
  tagModalType.value = type
  tagModalTitle.value = type === 'pkg' ? '管理套餐标签' : '管理描述标签'
  newTagName.value = ''
  tagModalVisible.value = true
}
const addTag = () => {
  const name = newTagName.value.trim()
  if (!name) return ElMessage.warning('请输入标签名称')
  const list = tagModalType.value === 'pkg' ? tagList : descTagList
  if (list.value.find(t => t.name === name)) return ElMessage.warning('标签已存在')
  list.value.push({ name })
  newTagName.value = ''
  ElMessage.success('标签已添加')
}
const removeTag = (row) => {
  const list = tagModalType.value === 'pkg' ? tagList : descTagList
  const idx = list.value.findIndex(t => t.name === row.name)
  if (idx >= 0) list.value.splice(idx, 1)
}

// ===== 分类管理 =====
const categoryModalVisible = ref(false)
const categoryFormVisible = ref(false)
const categoryFormMode = ref('add')
const editingCategory = ref(null)
const categoryForm = reactive({ name: '' })
const categoryList = ref([
  { name: '云存储套餐' }, { name: 'AI智能服务' }, { name: '综合套餐' }
])

const openAddCategory = () => {
  categoryFormMode.value = 'add'
  categoryForm.name = ''
  editingCategory.value = null
  categoryFormVisible.value = true
}
const editCategory = (row) => {
  categoryFormMode.value = 'edit'
  categoryForm.name = row.name
  editingCategory.value = row
  categoryFormVisible.value = true
}
const saveCategory = () => {
  if (!categoryForm.name.trim()) return ElMessage.warning('请输入分类名称')
  if (categoryFormMode.value === 'add') {
    categoryList.value.push({ name: categoryForm.name })
    ElMessage.success('分类已添加')
  } else {
    if (editingCategory.value) editingCategory.value.name = categoryForm.name
    ElMessage.success('分类已更新')
  }
  categoryFormVisible.value = false
}
const removeCategory = (row) => {
  ElMessageBox.confirm('确定删除该分类？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = categoryList.value.findIndex(c => c.name === row.name)
    if (idx >= 0) categoryList.value.splice(idx, 1)
    ElMessage.success('分类已删除')
  }).catch(() => {})
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
</style>
