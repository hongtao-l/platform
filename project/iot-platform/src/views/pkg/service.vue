<template>
  <div class="page-container">
    <div class="service-layout">
      <!-- 左侧面板：服务分类 -->
      <div class="category-panel">
        <div class="category-header">
          <span class="category-title">服务分类</span>
          <el-button size="small" @click="openCategoryDialog('add')">新建分类</el-button>
        </div>
        <div class="category-list">
          <div
            v-for="cat in categoryList"
            :key="cat.id"
            class="category-item"
            :class="{ active: activeCategory === cat.id }"
            @click="activeCategory = cat.id"
          >
            <el-icon class="category-icon"><Folder /></el-icon>
            <span class="category-name">{{ cat.name }}</span>
            <el-tag size="small" class="category-count">{{ cat.count }}</el-tag>
            <el-button
              size="small"
              text
              class="category-edit-btn"
              @click.stop="openCategoryDialog('edit', cat)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧主区域：服务管理 -->
      <div class="service-main">
        <div class="service-toolbar">
          <el-button disabled>批量移动</el-button>
          <el-button type="primary" @click="openServiceDialog('add')">
            <el-icon><Plus /></el-icon>
            新增服务
          </el-button>
        </div>

        <div class="card">
          <el-table
            ref="tableRef"
            :data="filteredServiceList"
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="服务名称" min-width="160">
              <template #default="{ row }">
                <span style="font-weight:500;color:var(--text-primary)">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务ID" width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.serviceId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属分类" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ categoryName(row.categoryId) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后更新" width="160">
              <template #default="{ row }">
                <span style="font-size:13px;color:var(--text-secondary)">{{ row.updatedAt }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button size="small" text type="primary" @click="openServiceDialog('edit', row)">修改</el-button>
                <el-button size="small" text type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-footer">
            <span class="total-text">共 {{ filteredServiceList.length }} 条</span>
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :total="filteredServiceList.length"
              :page-size="10"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑分类弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryDialogMode === 'add' ? '新建分类' : '编辑分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="* 分类名称" required>
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="categoryForm.sort" :min="0" style="width:200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建/修改服务类型侧边弹窗 -->
    <el-drawer
      v-model="serviceDialogVisible"
      :title="serviceDialogMode === 'add' ? '创建服务类型' : '修改服务类型'"
      size="800px"
      :close-on-click-modal="false"
      @closed="handleServiceDialogClosed"
    >
      <div class="service-drawer-body">
        <!-- 基础字段 -->
        <el-form label-width="90px" class="service-basic-form">
          <el-form-item label="* 服务名称" required>
            <el-input v-model="serviceForm.name" placeholder="例如：全天云存" />
          </el-form-item>
          <el-form-item label="* 服务ID" required>
            <el-input
              v-model="serviceForm.serviceId"
              placeholder="例如：300010"
              :disabled="serviceDialogMode === 'edit'"
            />
          </el-form-item>
          <el-form-item label="所属分类">
            <el-select v-model="serviceForm.categoryId" style="width:100%">
              <el-option
                v-for="cat in categoryList"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 配置选项卡 -->
        <el-tabs v-model="activeConfigTab" class="config-tabs">
          <!-- 物模型配置 -->
          <el-tab-pane label="物模型配置" name="thingModel">
            <div class="transfer-container">
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  <el-checkbox
                    v-model="tmSourceCheckAll"
                    :indeterminate="tmSourceIndeterminate"
                    @change="handleTmSourceCheckAll"
                  >
                    可选物模型 {{ tmSourceCheckedCount }}/{{ tmSource.length }}
                  </el-checkbox>
                </div>
                <div class="transfer-search">
                  <el-input v-model="tmSourceKeyword" placeholder="请输入搜索内容" size="small" clearable>
                    <template #prefix><el-icon><Search /></el-icon></template>
                  </el-input>
                </div>
                <div class="transfer-list">
                  <el-checkbox-group v-model="tmSourceChecked">
                    <div
                      v-for="item in filteredTmSource"
                      :key="item.id"
                      class="transfer-item"
                    >
                      <el-checkbox :value="item.id" :label="item.id">
                        {{ item.id }} - {{ item.name }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </div>
              <div class="transfer-actions">
                <el-button :disabled="tmSourceChecked.length === 0" @click="addThingModels">
                  添加 <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button :disabled="tmTargetChecked.length === 0" @click="removeThingModels">
                  <el-icon><ArrowLeft /></el-icon> 移除
                </el-button>
              </div>
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  <el-checkbox
                    v-model="tmTargetCheckAll"
                    :indeterminate="tmTargetIndeterminate"
                    @change="handleTmTargetCheckAll"
                  >
                    已选物模型 {{ tmTargetCheckedCount }}/{{ tmTarget.length }}
                  </el-checkbox>
                </div>
                <div class="transfer-search">
                  <el-input v-model="tmTargetKeyword" placeholder="请输入搜索内容" size="small" clearable>
                    <template #prefix><el-icon><Search /></el-icon></template>
                  </el-input>
                </div>
                <div class="transfer-list">
                  <el-checkbox-group v-model="tmTargetChecked">
                    <div
                      v-for="item in filteredTmTarget"
                      :key="item.id"
                      class="transfer-item"
                    >
                      <el-checkbox :value="item.id" :label="item.id">
                        {{ item.id }} - {{ item.name }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <div v-if="tmTarget.length === 0" class="transfer-empty">无数据</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 算法配置 -->
          <el-tab-pane label="算法配置" name="algorithm">
            <div class="transfer-container">
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  <el-checkbox
                    v-model="algSourceCheckAll"
                    :indeterminate="algSourceIndeterminate"
                    @change="handleAlgSourceCheckAll"
                  >
                    可选算法 {{ algSourceCheckedCount }}/{{ algSource.length }}
                  </el-checkbox>
                </div>
                <div class="transfer-search">
                  <el-input v-model="algSourceKeyword" placeholder="请输入搜索内容" size="small" clearable>
                    <template #prefix><el-icon><Search /></el-icon></template>
                  </el-input>
                </div>
                <div class="transfer-list">
                  <el-checkbox-group v-model="algSourceChecked">
                    <div
                      v-for="item in filteredAlgSource"
                      :key="item.id"
                      class="transfer-item"
                    >
                      <el-checkbox :value="item.id" :label="item.id">
                        {{ item.algorithmId }} - {{ parseI18nName(item.algorithmName) }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </div>
              <div class="transfer-actions">
                <el-button :disabled="algSourceChecked.length === 0" @click="addAlgorithms">
                  添加 <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button :disabled="algTargetChecked.length === 0" @click="removeAlgorithms">
                  <el-icon><ArrowLeft /></el-icon> 移除
                </el-button>
              </div>
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  <el-checkbox
                    v-model="algTargetCheckAll"
                    :indeterminate="algTargetIndeterminate"
                    @change="handleAlgTargetCheckAll"
                  >
                    已选算法 {{ algTargetCheckedCount }}/{{ algTarget.length }}
                  </el-checkbox>
                </div>
                <div class="transfer-search">
                  <el-input v-model="algTargetKeyword" placeholder="请输入搜索内容" size="small" clearable>
                    <template #prefix><el-icon><Search /></el-icon></template>
                  </el-input>
                </div>
                <div class="transfer-list">
                  <el-checkbox-group v-model="algTargetChecked">
                    <div
                      v-for="item in filteredAlgTarget"
                      :key="item.id"
                      class="transfer-item"
                    >
                      <el-checkbox :value="item.id" :label="item.id">
                        {{ item.algorithmId }} - {{ parseI18nName(item.algorithmName) }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <div v-if="algTarget.length === 0" class="transfer-empty">无数据</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 事件配置 -->
          <el-tab-pane label="事件配置" name="event">
            <div class="transfer-container">
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  <el-checkbox
                    v-model="evtSourceCheckAll"
                    :indeterminate="evtSourceIndeterminate"
                    @change="handleEvtSourceCheckAll"
                  >
                    可选事件 {{ evtSourceCheckedCount }}/{{ evtSource.length }}
                  </el-checkbox>
                </div>
                <div class="transfer-search">
                  <el-input v-model="evtSourceKeyword" placeholder="请输入搜索内容" size="small" clearable>
                    <template #prefix><el-icon><Search /></el-icon></template>
                  </el-input>
                </div>
                <div class="transfer-list">
                  <el-checkbox-group v-model="evtSourceChecked">
                    <div
                      v-for="item in filteredEvtSource"
                      :key="item.id"
                      class="transfer-item"
                    >
                      <el-checkbox :value="item.id" :label="item.id">
                        {{ item.eventId }} - {{ parseI18nName(item.eventName) }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </div>
              <div class="transfer-actions">
                <el-button :disabled="evtSourceChecked.length === 0" @click="addEvents">
                  添加 <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button :disabled="evtTargetChecked.length === 0" @click="removeEvents">
                  <el-icon><ArrowLeft /></el-icon> 移除
                </el-button>
              </div>
              <div class="transfer-panel">
                <div class="transfer-panel-header">
                  <el-checkbox
                    v-model="evtTargetCheckAll"
                    :indeterminate="evtTargetIndeterminate"
                    @change="handleEvtTargetCheckAll"
                  >
                    已选事件 {{ evtTargetCheckedCount }}/{{ evtTarget.length }}
                  </el-checkbox>
                </div>
                <div class="transfer-search">
                  <el-input v-model="evtTargetKeyword" placeholder="请输入搜索内容" size="small" clearable>
                    <template #prefix><el-icon><Search /></el-icon></template>
                  </el-input>
                </div>
                <div class="transfer-list">
                  <el-checkbox-group v-model="evtTargetChecked">
                    <div
                      v-for="item in filteredEvtTarget"
                      :key="item.id"
                      class="transfer-item"
                    >
                      <el-checkbox :value="item.id" :label="item.id">
                        {{ item.eventId }} - {{ parseI18nName(item.eventName) }}
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                  <div v-if="evtTarget.length === 0" class="transfer-empty">无数据</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 算法参数详情配置（仅修改模式） -->
        <div v-if="serviceDialogMode === 'edit' && tmTarget.length > 0" class="algorithm-section">
          <div class="section-divider">
            <span>算法参数详情配置</span>
          </div>
          <div
            v-for="tm in tmTarget"
            :key="tm.id"
            class="algorithm-block"
          >
            <div class="algorithm-block-header">
              <span class="algorithm-tm-id">{{ tm.id }}</span>
              <span class="algorithm-tm-name">{{ tm.name }}</span>
            </div>
            <el-table :data="getAlgorithmEvents(tm.id)" size="small" class="algorithm-table">
              <el-table-column label="#" width="50" align="center">
                <template #default="{ $index }">{{ $index + 1 }}</template>
              </el-table-column>
              <el-table-column label="事件类型">
                <template #default="{ row }">
                  <el-input v-model="row.eventType" size="small" placeholder="请输入事件类型" />
                </template>
              </el-table-column>
              <el-table-column label="是否开启" width="100" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button size="small" text type="danger" @click="removeAlgorithmEvent(tm.id, $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button size="small" text type="primary" style="margin-top:8px" @click="addAlgorithmEvent(tm.id)">
              <el-icon><Plus /></el-icon> 添加事件
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="serviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveService">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder, Edit, Search, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import { listAlgorithms, listEvents } from '@/views/iot/thing-model/data'

function parseI18nName(jsonStr) {
  try { return JSON.parse(jsonStr || '{}')['1'] || '' } catch { return '' }
}

// ===== 分类管理 =====
const activeCategory = ref(1)
const categoryList = ref([
  { id: 1, name: '未分类', count: 46, sort: 0 },
  { id: 2, name: '云存储', count: 3, sort: 1 },
  { id: 3, name: 'AI服务', count: 3, sort: 2 }
])

const categoryDialogVisible = ref(false)
const categoryDialogMode = ref('add')
const editingCategory = ref(null)
const categoryForm = reactive({ name: '', sort: 0 })

const categoryName = (id) => {
  const cat = categoryList.value.find(c => c.id === id)
  return cat ? cat.name : '未分类'
}

const openCategoryDialog = (mode, cat) => {
  categoryDialogMode.value = mode
  if (mode === 'edit' && cat) {
    editingCategory.value = cat
    categoryForm.name = cat.name
    categoryForm.sort = cat.sort
  } else {
    editingCategory.value = null
    categoryForm.name = ''
    categoryForm.sort = 0
  }
  categoryDialogVisible.value = true
}

const saveCategory = () => {
  if (!categoryForm.name.trim()) return ElMessage.warning('请输入分类名称')
  if (categoryDialogMode.value === 'add') {
    const newCat = {
      id: Date.now(),
      name: categoryForm.name,
      count: 0,
      sort: categoryForm.sort
    }
    categoryList.value.push(newCat)
    ElMessage.success('分类已创建')
  } else {
    if (editingCategory.value) {
      editingCategory.value.name = categoryForm.name
      editingCategory.value.sort = categoryForm.sort
    }
    ElMessage.success('分类已更新')
  }
  categoryDialogVisible.value = false
}

// ===== 服务列表 =====
const tableRef = ref(null)
const selectedRows = ref([])

const serviceList = ref([
  { id: 1, name: '智能告警', serviceId: '110600', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 2, name: '低电检测服务', serviceId: '300028', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 3, name: '火焰检测', serviceId: '300022', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 4, name: '跌倒检测', serviceId: '300020', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 5, name: '宠物喂食器', serviceId: '300049', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 6, name: 'GPS定位', serviceId: '300050', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 7, name: '低功耗PIR检测', serviceId: '300048', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 8, name: '非机动车检测', serviceId: '300047', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 9, name: '鱼缸侦测', serviceId: '300046', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 10, name: '客流统计', serviceId: '300045', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 11, name: '儿童检测', serviceId: '300044', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 12, name: '离岗侦测', serviceId: '300043', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 13, name: '包裹侦测', serviceId: '300025', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 14, name: '哭声侦测', serviceId: '300023', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 15, name: '智能报警-家门监测', serviceId: '300041', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 16, name: '智能报警-厨房安全', serviceId: '300040', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 17, name: '智能报警-宠物监测', serviceId: '300042', categoryId: 1, updatedAt: '2026/6/17 17:54:52' },
  { id: 18, name: '智能报警-老人看护', serviceId: '300039', categoryId: 1, updatedAt: '2026/6/17 17:54:52' }
])

const filteredServiceList = computed(() => {
  // TODO: 接入真实 API，按分类筛选
  return serviceList.value
})

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该服务吗？删除后不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = serviceList.value.findIndex(s => s.id === row.id)
    if (idx >= 0) serviceList.value.splice(idx, 1)
    ElMessage.success('服务已删除')
  }).catch(() => {})
}

// ===== 服务弹窗 =====
const serviceDialogVisible = ref(false)
const serviceDialogMode = ref('add')
const editingService = ref(null)
const serviceForm = reactive({
  name: '',
  serviceId: '',
  categoryId: 1
})

// 所有可选物模型
const allThingModels = ref([
  { id: 1013, name: '事件记录' }, { id: 1010, name: '云存录像' },
  { id: 1063, name: '语音助手' }, { id: 1000, name: '人形/运动检测' },
  { id: 1086, name: '非机动车检测' }, { id: 1003, name: 'PIR红外检测' },
  { id: 1088, name: '车牌识别' }, { id: 1090, name: '客流统计' },
  { id: 1093, name: '离线监控' }, { id: 1096, name: '智能告警-儿童检测' },
  { id: 1098, name: '智能告警服务' }, { id: 1100, name: '时光相册' },
  { id: 1103, name: '智能告警-老人看护' }, { id: 1104, name: '智能告警-厨房监测' },
  { id: 1105, name: '智能告警-家门检测' }, { id: 1106, name: '智能告警-宠物检测' },
  { id: 1108, name: 'GPS信息处理' }, { id: 1109, name: '包裹侦测' },
  { id: 1111, name: '鱼类检测' }, { id: 1112, name: '人脸检测' },
  { id: 1114, name: '宠物喂食' }, { id: 1082, name: '烟火侦测' },
  { id: 1004, name: '声音检测' }, { id: 1016, name: '逗留提醒' },
  { id: 1018, name: '人物(人脸)识别' }, { id: 1021, name: '低电检测' },
  { id: 1024, name: '跌倒检测' }, { id: 1025, name: '火焰检测' },
  { id: 1028, name: '哭声检测' }, { id: 1029, name: '宠物检测' },
  { id: 1037, name: '呼叫服务' }, { id: 1070, name: '离岗侦测' },
  { id: 1079, name: '区域闯入' }, { id: 1080, name: '区域离开' },
  { id: 1083, name: '车辆侦测' }, { id: 1061, name: '设备算法' },
  { id: 1011, name: '云端抓图' }, { id: 2000, name: '短信套餐' },
  { id: 2001, name: '去广告套餐' }, { id: 3000, name: '鸟类检测' },
  { id: 3001, name: '松鼠检测' }
])

// 可选/已选物模型状态
const activeConfigTab = ref('thingModel')
const tmSource = ref([])
const tmTarget = ref([])
const tmSourceChecked = ref([])
const tmTargetChecked = ref([])
const tmSourceKeyword = ref('')
const tmTargetKeyword = ref('')

const tmSourceCheckedCount = computed(() => tmSourceChecked.value.length)
const tmTargetCheckedCount = computed(() => tmTargetChecked.value.length)

const tmSourceCheckAll = computed({
  get: () => tmSource.value.length > 0 && tmSourceChecked.value.length === tmSource.value.length,
  set: () => {}
})
const tmSourceIndeterminate = computed(() =>
  tmSourceChecked.value.length > 0 && tmSourceChecked.value.length < tmSource.value.length
)
const tmTargetCheckAll = computed({
  get: () => tmTarget.value.length > 0 && tmTargetChecked.value.length === tmTarget.value.length,
  set: () => {}
})
const tmTargetIndeterminate = computed(() =>
  tmTargetChecked.value.length > 0 && tmTargetChecked.value.length < tmTarget.value.length
)

const filteredTmSource = computed(() => {
  if (!tmSourceKeyword.value) return tmSource.value
  const kw = tmSourceKeyword.value.toLowerCase()
  return tmSource.value.filter(t => t.name.includes(kw) || String(t.id).includes(kw))
})

const filteredTmTarget = computed(() => {
  if (!tmTargetKeyword.value) return tmTarget.value
  const kw = tmTargetKeyword.value.toLowerCase()
  return tmTarget.value.filter(t => t.name.includes(kw) || String(t.id).includes(kw))
})

const handleTmSourceCheckAll = (val) => {
  tmSourceChecked.value = val ? tmSource.value.map(t => t.id) : []
}

const handleTmTargetCheckAll = (val) => {
  tmTargetChecked.value = val ? tmTarget.value.map(t => t.id) : []
}

const addThingModels = () => {
  const toMove = tmSource.value.filter(t => tmSourceChecked.value.includes(t.id))
  tmTarget.value.push(...toMove)
  tmSource.value = tmSource.value.filter(t => !tmSourceChecked.value.includes(t.id))
  tmSourceChecked.value = []
}

const removeThingModels = () => {
  const toMove = tmTarget.value.filter(t => tmTargetChecked.value.includes(t.id))
  tmSource.value.push(...toMove)
  tmTarget.value = tmTarget.value.filter(t => !tmTargetChecked.value.includes(t.id))
  tmTargetChecked.value = []
}

// ===== 算法穿梭框 =====
const algSource = ref([])
const algTarget = ref([])
const algSourceChecked = ref([])
const algTargetChecked = ref([])
const algSourceKeyword = ref('')
const algTargetKeyword = ref('')

const algSourceCheckedCount = computed(() => algSourceChecked.value.length)
const algTargetCheckedCount = computed(() => algTargetChecked.value.length)

const algSourceCheckAll = computed({
  get: () => algSource.value.length > 0 && algSourceChecked.value.length === algSource.value.length,
  set: () => {}
})
const algSourceIndeterminate = computed(() =>
  algSourceChecked.value.length > 0 && algSourceChecked.value.length < algSource.value.length
)
const algTargetCheckAll = computed({
  get: () => algTarget.value.length > 0 && algTargetChecked.value.length === algTarget.value.length,
  set: () => {}
})
const algTargetIndeterminate = computed(() =>
  algTargetChecked.value.length > 0 && algTargetChecked.value.length < algTarget.value.length
)

const filteredAlgSource = computed(() => {
  if (!algSourceKeyword.value) return algSource.value
  const kw = algSourceKeyword.value.toLowerCase()
  return algSource.value.filter(a => {
    const name = parseI18nName(a.algorithmName)
    return name.toLowerCase().includes(kw) || a.algorithmId.toLowerCase().includes(kw)
  })
})
const filteredAlgTarget = computed(() => {
  if (!algTargetKeyword.value) return algTarget.value
  const kw = algTargetKeyword.value.toLowerCase()
  return algTarget.value.filter(a => {
    const name = parseI18nName(a.algorithmName)
    return name.toLowerCase().includes(kw) || a.algorithmId.toLowerCase().includes(kw)
  })
})

const handleAlgSourceCheckAll = (val) => {
  algSourceChecked.value = val ? algSource.value.map(a => a.id) : []
}
const handleAlgTargetCheckAll = (val) => {
  algTargetChecked.value = val ? algTarget.value.map(a => a.id) : []
}
const addAlgorithms = () => {
  const toMove = algSource.value.filter(a => algSourceChecked.value.includes(a.id))
  algTarget.value.push(...toMove)
  algSource.value = algSource.value.filter(a => !algSourceChecked.value.includes(a.id))
  algSourceChecked.value = []
}
const removeAlgorithms = () => {
  const toMove = algTarget.value.filter(a => algTargetChecked.value.includes(a.id))
  algSource.value.push(...toMove)
  algTarget.value = algTarget.value.filter(a => !algTargetChecked.value.includes(a.id))
  algTargetChecked.value = []
}

// ===== 事件穿梭框 =====
const evtSource = ref([])
const evtTarget = ref([])
const evtSourceChecked = ref([])
const evtTargetChecked = ref([])
const evtSourceKeyword = ref('')
const evtTargetKeyword = ref('')

const evtSourceCheckedCount = computed(() => evtSourceChecked.value.length)
const evtTargetCheckedCount = computed(() => evtTargetChecked.value.length)

const evtSourceCheckAll = computed({
  get: () => evtSource.value.length > 0 && evtSourceChecked.value.length === evtSource.value.length,
  set: () => {}
})
const evtSourceIndeterminate = computed(() =>
  evtSourceChecked.value.length > 0 && evtSourceChecked.value.length < evtSource.value.length
)
const evtTargetCheckAll = computed({
  get: () => evtTarget.value.length > 0 && evtTargetChecked.value.length === evtTarget.value.length,
  set: () => {}
})
const evtTargetIndeterminate = computed(() =>
  evtTargetChecked.value.length > 0 && evtTargetChecked.value.length < evtTarget.value.length
)

const filteredEvtSource = computed(() => {
  if (!evtSourceKeyword.value) return evtSource.value
  const kw = evtSourceKeyword.value.toLowerCase()
  return evtSource.value.filter(e => {
    const name = parseI18nName(e.eventName)
    return name.toLowerCase().includes(kw) || String(e.eventId).includes(kw)
  })
})
const filteredEvtTarget = computed(() => {
  if (!evtTargetKeyword.value) return evtTarget.value
  const kw = evtTargetKeyword.value.toLowerCase()
  return evtTarget.value.filter(e => {
    const name = parseI18nName(e.eventName)
    return name.toLowerCase().includes(kw) || String(e.eventId).includes(kw)
  })
})

const handleEvtSourceCheckAll = (val) => {
  evtSourceChecked.value = val ? evtSource.value.map(e => e.id) : []
}
const handleEvtTargetCheckAll = (val) => {
  evtTargetChecked.value = val ? evtTarget.value.map(e => e.id) : []
}
const addEvents = () => {
  const toMove = evtSource.value.filter(e => evtSourceChecked.value.includes(e.id))
  evtTarget.value.push(...toMove)
  evtSource.value = evtSource.value.filter(e => !evtSourceChecked.value.includes(e.id))
  evtSourceChecked.value = []
}
const removeEvents = () => {
  const toMove = evtTarget.value.filter(e => evtTargetChecked.value.includes(e.id))
  evtSource.value.push(...toMove)
  evtTarget.value = evtTarget.value.filter(e => !evtTargetChecked.value.includes(e.id))
  evtTargetChecked.value = []
}

// 算法参数事件
const algorithmEvents = ref({})

const getAlgorithmEvents = (tmId) => {
  if (!algorithmEvents.value[tmId]) {
    algorithmEvents.value[tmId] = []
  }
  return algorithmEvents.value[tmId]
}

const addAlgorithmEvent = (tmId) => {
  if (!algorithmEvents.value[tmId]) {
    algorithmEvents.value[tmId] = []
  }
  algorithmEvents.value[tmId].push({ eventType: '', enabled: true })
}

const removeAlgorithmEvent = (tmId, index) => {
  if (algorithmEvents.value[tmId]) {
    algorithmEvents.value[tmId].splice(index, 1)
  }
}

const openServiceDialog = (mode, row) => {
  serviceDialogMode.value = mode
  activeConfigTab.value = 'thingModel'

  if (mode === 'add') {
    editingService.value = null
    serviceForm.name = ''
    serviceForm.serviceId = ''
    serviceForm.categoryId = activeCategory.value
    // 物模型
    tmSource.value = [...allThingModels.value]
    tmTarget.value = []
    // 算法
    const algRes = listAlgorithms({ page: 1, pageSize: 50 })
    algSource.value = algRes.data.list || []
    algTarget.value = []
    // 事件
    const evtRes = listEvents({ page: 1, pageSize: 50 })
    evtSource.value = evtRes.data.list || []
    evtTarget.value = []
  } else {
    editingService.value = row
    serviceForm.name = row.name
    serviceForm.serviceId = row.serviceId
    serviceForm.categoryId = row.categoryId
    // 物模型
    tmTarget.value = allThingModels.value.filter(t => [1106].includes(t.id))
    tmSource.value = allThingModels.value.filter(t => ![1106].includes(t.id))
    // 算法
    const algRes = listAlgorithms({ page: 1, pageSize: 50 })
    const allAlgs = algRes.data.list || []
    algTarget.value = allAlgs.filter(a => ['A001'].includes(a.algorithmId))
    algSource.value = allAlgs.filter(a => !['A001'].includes(a.algorithmId))
    // 事件
    const evtRes = listEvents({ page: 1, pageSize: 50 })
    const allEvts = evtRes.data.list || []
    evtTarget.value = allEvts.filter(e => ['1001', '1002'].includes(String(e.eventId)))
    evtSource.value = allEvts.filter(e => !['1001', '1002'].includes(String(e.eventId)))
    // 算法事件
    algorithmEvents.value = {}
    algorithmEvents.value[1106] = [
      { eventType: '智能告警-宠物检测', enabled: true }
    ]
  }
  tmSourceChecked.value = []
  tmTargetChecked.value = []
  tmSourceKeyword.value = ''
  tmTargetKeyword.value = ''
  algSourceChecked.value = []
  algTargetChecked.value = []
  algSourceKeyword.value = ''
  algTargetKeyword.value = ''
  evtSourceChecked.value = []
  evtTargetChecked.value = []
  evtSourceKeyword.value = ''
  evtTargetKeyword.value = ''
  serviceDialogVisible.value = true
}

const handleServiceDialogClosed = () => {
  activeConfigTab.value = 'thingModel'
  algorithmEvents.value = {}
}

const saveService = () => {
  if (!serviceForm.name.trim()) return ElMessage.warning('请输入服务名称')
  if (!serviceForm.serviceId.trim()) return ElMessage.warning('请输入服务ID')

  if (serviceDialogMode.value === 'add') {
    const newService = {
      id: Date.now(),
      name: serviceForm.name,
      serviceId: serviceForm.serviceId,
      categoryId: serviceForm.categoryId,
      updatedAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    serviceList.value.unshift(newService)
    ElMessage.success('服务已创建')
  } else {
    if (editingService.value) {
      editingService.value.name = serviceForm.name
      editingService.value.categoryId = serviceForm.categoryId
      editingService.value.updatedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    ElMessage.success('服务已更新')
  }
  serviceDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.service-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

// ===== 左侧分类面板 =====
.category-panel {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-lighter);
}

.category-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.category-list {
  padding: 4px 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background: var(--fill-light);
  }

  &.active {
    background: var(--fill-light);
  }

  .category-icon {
    color: var(--text-secondary);
    font-size: 16px;
    flex-shrink: 0;
  }

  .category-name {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
  }

  .category-count {
    flex-shrink: 0;
  }

  .category-edit-btn {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;
    color: var(--text-secondary);
  }

  &:hover .category-edit-btn {
    opacity: 1;
  }
}

// ===== 右侧服务管理 =====
.service-main {
  flex: 1;
  min-width: 0;
}

.service-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

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

// ===== 服务弹窗 =====
.service-drawer-body {
  padding-top: 20px;
}

.service-basic-form {
  .el-form-item {
    margin-bottom: 16px;
  }
}

.section-divider {
  display: flex;
  align-items: center;
  margin: 20px 0 12px;
  color: var(--text-secondary);
  font-size: 13px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-lighter);
  }

  span {
    padding: 0 12px;
    white-space: nowrap;
  }
}

.config-tabs {
  margin-top: 8px;
}

.transfer-container {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.transfer-panel {
  flex: 1;
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.transfer-panel-header {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-lighter);
  font-size: 13px;
}

.transfer-search {
  padding: 8px;
}

.transfer-list {
  flex: 1;
  max-height: 260px;
  overflow-y: auto;
  padding: 4px 8px 8px;
}

.transfer-item {
  padding: 3px 0;
  font-size: 13px;
}

.transfer-empty {
  text-align: center;
  color: var(--text-placeholder);
  padding: 40px 0;
  font-size: 13px;
}

.transfer-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
}

// ===== 算法参数区域 =====
.algorithm-block {
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.algorithm-block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;

  .algorithm-tm-id {
    font-weight: 600;
    color: var(--primary-color);
  }

  .algorithm-tm-name {
    color: var(--text-primary);
  }
}

.algorithm-table {
  margin-bottom: 0;
}
</style>

<style lang="scss">
/* 服务弹窗内 el-form-item 间距 */
.service-drawer-body .el-form-item {
  margin-bottom: 16px;
}

.service-drawer-body .el-form-item__label {
  font-size: 13px;
}

/* 配置选项卡 */
.config-tabs .el-tabs__header {
  margin-bottom: 12px;
}

.config-tabs .el-tabs__content {
  overflow: visible;
}
</style>
