<template>
  <div class="page-container" style="display:flex;flex-direction:column;height:calc(100vh - 56px);overflow:hidden">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <div class="top-left">
        <el-button @click="$router.push('/thing-model/algorithm')" :icon="ArrowLeft">返回</el-button>
        <div>
          <div class="top-title">算法：{{ algoName }}</div>
          <div class="top-sub">共 {{ linkedCaps.length }} 个关联能力</div>
        </div>
      </div>
      <div class="top-actions">
        <el-button type="primary" size="small" plain @click="openImportDialog">
          <el-icon><Plus /></el-icon>关联能力
        </el-button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="main-layout">
      <!-- 左栏：模块列表 -->
      <div class="module-sidebar">
        <div class="module-sidebar-header">
          <span class="module-sidebar-title">能力模块</span>
        </div>
        <div class="module-list">
          <div
            :class="['module-item-all', { active: currentModuleId === 'all' }]"
            @click="currentModuleId = 'all'"
          >
            全部
          </div>
          <div
            v-for="m in displayModules"
            :key="m.id"
            :class="['module-item', { active: currentModuleId === m.id }]"
            @click="currentModuleId = m.id"
          >
            <span class="module-name">{{ m.name }}</span>
            <span class="module-ident">{{ m.identifier }}</span>
          </div>
        </div>
      </div>

      <!-- 右栏：能力表格 -->
      <div class="capability-right">
        <div class="card" style="flex:1;display:flex;flex-direction:column">
          <el-table :data="filteredCapabilities" stripe>
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <span :class="['type-tag', typeTagCls(row.capType)]">{{ typeLabel(row.capType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力名称" min-width="120">
              <template #default="{ row }">
                <span class="cell-name">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力标识" width="170" align="center">
              <template #default="{ row }">
                <span class="cell-id">{{ row.identifier }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数据类型" width="100" align="center">
              <template #default="{ row }">
                <span class="cell-datatype">{{ dataTypeLabel(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数据定义" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="cell-def">{{ dataDefDetail(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="140" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="cell-desc">{{ row.descr }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属模块" width="130" align="center">
              <template #default="{ row }">
                <span class="cell-module">{{ row._moduleName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <div style="white-space:nowrap;display:flex;gap:4px">
                  <el-button size="small" text type="primary" @click="openEditCap(row)">编辑</el-button>
                  <el-button size="small" text type="danger" @click="handleRemoveCap(row)">移除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!linkedCaps.length" class="empty-state">该算法暂无关联能力</div>
        </div>
      </div>
    </div>

    <!-- 关联能力弹窗（穿梭框） -->
    <el-dialog
      v-model="importDialogVisible"
      title="关联能力"
      width="960px"
      :close-on-click-modal="false"
      top="3vh"
      class="alg-cap-dialog"
    >
      <div class="transfer-container">
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>可选能力</span>
            <span v-if="importCheckedIds.length" class="transfer-selected-count">已选 <span class="count-num">{{ importCheckedIds.length }}</span> 个</span>
          </div>
          <div class="transfer-panel-search">
            <el-input v-model="importSearchText" placeholder="搜索能力名称或标识" clearable size="small">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div class="transfer-panel-body">
            <div v-if="!importAvailableByModule.length" class="transfer-empty">暂无可导入的能力</div>
            <div
              v-for="mod in importAvailableByModule"
              :key="mod.id"
              :class="['transfer-category-item', { expanded: expandedLeftModules.includes(mod.id) }]"
            >
              <div class="transfer-cat-header" @click="toggleLeftModuleExpand(mod.id)">
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <el-checkbox
                  :model-value="isModuleAllChecked(mod)"
                  :indeterminate="isModuleIndeterminate(mod)"
                  @change="toggleModuleAllCheck(mod)"
                  @click.stop
                />
                <span class="transfer-cat-name">{{ mod.name }}</span>
                <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
              </div>
              <div class="transfer-cat-body">
                <label
                  v-for="cap in mod.caps"
                  :key="cap.id"
                  :class="['transfer-pkg-item', { selected: importCheckedIds.includes(cap.id), hidden: !isImportCapVisible(cap) }]"
                >
                  <el-checkbox :model-value="importCheckedIds.includes(cap.id)" @change="toggleImportCheck(cap.id)" />
                  <div class="transfer-pkg-info">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="transfer-actions">
          <el-button size="small" :disabled="!importCheckedIds.length" @click="transferToRight">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" :disabled="!importSelectedIds.length" @click="transferToLeft">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>

        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>待导入</span>
            <span class="transfer-count">{{ importSelectedIds.length }} 项</span>
          </div>
          <div class="transfer-panel-body">
            <div v-if="!importSelectedIds.length" class="transfer-empty">请从左侧勾选能力后点击 → 添加</div>
            <div
              v-for="mod in importSelectedByModule"
              :key="mod.id"
              :class="['transfer-category-item', { expanded: expandedModules.includes(mod.id) }]"
            >
              <div class="transfer-cat-header" @click="toggleModuleExpand(mod.id)">
                <el-icon class="transfer-cat-arrow"><ArrowRight /></el-icon>
                <span class="transfer-cat-name">{{ mod.name }}</span>
                <span class="transfer-cat-count">{{ mod.caps.length }} 个能力</span>
              </div>
              <div class="transfer-cat-body">
                <div
                  v-for="cap in mod.caps"
                  :key="cap.id"
                  class="transfer-pkg-item selected"
                >
                  <div class="transfer-pkg-info" style="flex:1">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                  <el-button size="small" text type="danger" @click="removeFromSelected(cap.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importSelectedIds.length" @click="handleImportConfirm">
          导入（{{ importSelectedIds.length }}）
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑能力参数弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑能力参数"
      width="860px"
      :close-on-click-modal="false"
      top="3vh"
      class="cap-dialog"
    >
      <el-form v-if="editCap" label-width="100px">
        <el-form-item label="能力类型">
          <div class="type-cards">
            <div :class="['type-card', { active: editCap.capType === 'prop' }]" style="pointer-events:none">属性</div>
            <div :class="['type-card', { active: editCap.capType === 'svc' }]" style="pointer-events:none">服务</div>
            <div :class="['type-card', { active: editCap.capType === 'evt' }]" style="pointer-events:none">事件</div>
          </div>
        </el-form-item>
        <el-form-item label="能力名称">
          <el-input :model-value="editCap.name" disabled />
        </el-form-item>
        <el-form-item label="标识符">
          <el-input :model-value="editCap.identifier" disabled />
        </el-form-item>

        <template v-if="editCap.capType === 'prop'">
          <el-form-item label="数据类型">
            <el-select :model-value="dataTypeLabel(editCap)" disabled style="width:100%" />
          </el-form-item>
          <el-form-item label="读写模式">
            <el-select v-model="editForm.accessMode" style="width:100%">
              <el-option label="读写 (Read/Write)" value="rw" />
              <el-option label="只读 (Read Only)" value="ro" />
            </el-select>
          </el-form-item>
        </template>

        <el-divider>数据定义</el-divider>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'enum'">
          <el-form-item label="枚举值定义" required>
            <div class="enum-list">
              <div v-for="(ev, i) in editForm.enumValues" :key="i" class="enum-row">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <el-button size="small" type="danger" :icon="Delete" circle @click="editForm.enumValues.splice(i, 1)" />
              </div>
            </div>
            <el-button size="small" style="margin-top:8px" @click="editForm.enumValues.push({ name: '', val: (editForm.enumValues.length) })">+ 添加枚举值</el-button>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="editForm.defaultVal" placeholder="请输入默认枚举值的 Value" />
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'int'">
          <el-form-item label="取值范围" required>
            <div class="range-row">
              <el-input-number v-model="editForm.min" :max="editForm.max - 1" style="flex:1" />
              <span style="color:var(--text-placeholder)">~</span>
              <el-input-number v-model="editForm.max" :min="editForm.min + 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="editForm.step" :min="1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="editForm.unit" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="editForm.defaultVal" :min="editForm.min" :max="editForm.max" style="width:200px" />
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="bool-labels">
              <div style="flex:1">
                <span class="form-hint">true 标签</span>
                <el-input v-model="editForm.trueLabel" />
              </div>
              <div style="flex:1">
                <span class="form-hint">false 标签</span>
                <el-input v-model="editForm.falseLabel" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="editForm.defaultVal">
              <el-radio value="1">{{ editForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ editForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）" required>
            <el-input-number v-model="editForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="editForm.defaultVal" placeholder="请输入默认值" />
          </el-form-item>
        </template>

        <!-- 数组型 -->
        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="editForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Struct (结构体)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数" required>
            <el-input-number v-model="editForm.arrayCount" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <template v-if="editForm.elementType === 'struct'">
            <el-form-item label="元素结构体字段">
              <div style="width:100%">
                <div class="param-list">
                  <div v-for="(f, i) in editForm.fields" :key="i" class="param-item">
                    <div class="param-info">
                      <span class="param-name">{{ f.name || '未命名' }}</span>
                      <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                    </div>
                    <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                    <el-button size="small" text type="danger" @click="editForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                  </div>
                  <div v-if="!editForm.fields.length" class="param-empty">暂无字段</div>
                </div>
                <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
              </div>
            </el-form-item>
          </template>
        </template>

        <!-- 结构体型 -->
        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'struct'">
          <el-form-item label="结构体字段">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(f, i) in editForm.fields" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ f.name || '未命名' }}</span>
                    <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="editForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!editForm.fields.length" class="param-empty">暂无字段</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'svc'">
          <el-form-item label="输入参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in editForm.inputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('input', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="editForm.inputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!editForm.inputParams.length" class="param-empty">暂无输入参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('input')">+ 添加参数</el-button>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in editForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="editForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!editForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'evt'">
          <el-form-item label="事件类型" required>
            <div class="type-cards">
              <div :class="['type-card', { active: editForm.eventType === 'info' }]" @click="editForm.eventType = 'info'">信息 (Info)</div>
              <div :class="['type-card', { active: editForm.eventType === 'alarm' }]" @click="editForm.eventType = 'alarm'">告警 (Alarm)</div>
              <div :class="['type-card', { active: editForm.eventType === 'fault' }]" @click="editForm.eventType = 'fault'">故障 (Fault)</div>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in editForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="editForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!editForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <el-divider />
        <el-form-item label="描述">
          <el-input v-model="editForm.descr" type="textarea" placeholder="请输入能力描述" rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditConfirm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 参数编辑弹窗 -->
    <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="600px" :close-on-click-modal="false" class="alg-cap-dialog">
      <el-form ref="paramFormRef" :model="paramForm" label-width="100px">
        <el-form-item label="参数名称" required>
          <el-input v-model="paramForm.name" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数标识" required>
          <el-input v-model="paramForm.identifier" placeholder="例如 result" />
        </el-form-item>
        <el-form-item label="数据类型" required>
          <el-select v-model="paramForm.dataType" style="width:100%">
            <el-option label="Int (数字)" value="int" />
            <el-option label="String (字符串)" value="string" />
            <el-option label="Boolean (布尔)" value="boolean" />
            <el-option label="Enum (枚举)" value="enum" />
            <el-option v-if="editingParamTarget !== 'field'" label="Array (数组)" value="array" />
          </el-select>
        </el-form-item>
        <el-divider>类型定义</el-divider>
        <template v-if="paramForm.dataType === 'int'">
          <el-form-item label="取值范围">
            <div class="range-row">
              <el-input-number v-model="paramForm.min" :max="paramForm.max - 1" style="flex:1" />
              <span style="color:var(--text-placeholder)">~</span>
              <el-input-number v-model="paramForm.max" :min="paramForm.min + 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="paramForm.step" :min="1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="paramForm.unit" style="width:150px" />
          </el-form-item>
        </template>
        <template v-if="paramForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）">
            <el-input-number v-model="paramForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
        </template>
        <template v-if="paramForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="bool-labels">
              <div style="flex:1">
                <span class="form-hint">true 标签</span>
                <el-input v-model="paramForm.trueLabel" placeholder="开启" />
              </div>
              <div style="flex:1">
                <span class="form-hint">false 标签</span>
                <el-input v-model="paramForm.falseLabel" placeholder="关闭" />
              </div>
            </div>
          </el-form-item>
        </template>
        <template v-if="paramForm.dataType === 'enum'">
          <el-form-item label="枚举值定义">
            <div class="enum-list">
              <div v-for="(ev, i) in paramForm.enumValues" :key="i" class="enum-row">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <el-button size="small" type="danger" :icon="Delete" circle @click="paramForm.enumValues.splice(i, 1)" />
              </div>
            </div>
            <el-button size="small" style="margin-top:8px" @click="paramForm.enumValues.push({ name: '', val: (paramForm.enumValues.length) })">+ 添加枚举值</el-button>
          </el-form-item>
        </template>

        <template v-if="paramForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="paramForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数">
            <el-input-number v-model="paramForm.arrayCount" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="paramForm.defaultVal" placeholder="请输入默认值（逗号分隔）" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="paramDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleParamConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, ArrowLeft, Search, ArrowRight, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { store, getAlgorithm, updateAlgorithm, updateCapability } from './data'

const route = useRoute()
const algoId = Number(route.params.id)

const algo = ref(null)
const algoName = computed(() => {
  if (!algo.value) return '未知算法'
  const name = (() => { try { return JSON.parse(algo.value.algorithmName || '{}') } catch { return {} } })()
  return name['1'] || algo.value.algorithmId || '未知算法'
})

// 已关联的能力（从算法 capabilities JSON 中解析）
const linkedCaps = computed(() => {
  if (!algo.value) return []
  const caps = (() => { try { return JSON.parse(algo.value.capabilities || '{}') } catch { return {} } })()
  const identifiers = Object.keys(caps).filter(k => !k.startsWith('__'))
  const allCaps = [...store.capabilities, ...store.customCapabilities]
  return allCaps.filter(c => identifiers.includes(c.identifier)).map(cap => {
    const mod = [...store.modules, ...store.customModules].find(m => m.id === cap.moduleId)
    return { ...cap, _moduleName: mod?.name || '—', _moduleId: cap.moduleId }
  })
})

// 模块侧栏
const displayModules = computed(() => {
  const moduleIds = new Set(linkedCaps.value.map(c => c.moduleId))
  return [...store.modules, ...store.customModules].filter(m => moduleIds.has(m.id))
})

const currentModuleId = ref('all')

const filteredCapabilities = computed(() => {
  if (currentModuleId.value === 'all') return linkedCaps.value
  return linkedCaps.value.filter(cap => cap.moduleId === currentModuleId.value)
})

// ===== 标签 =====
const typeTagMap = { prop: '属性', svc: '服务', evt: '事件' }
const typeTagClsMap = { prop: 'type-prop', svc: 'type-svc', evt: 'type-evt' }
function typeLabel(t) { return typeTagMap[t] || t }
function typeTagCls(t) { return typeTagClsMap[t] || '' }

function dataTypeLabel(cap) {
  if (cap.capType === 'prop') {
    const m = { enum: '枚举型', int: '数值型', boolean: '布尔型', string: '字符串', array: '数组型', struct: '结构体型' }
    return m[cap.dataDef.dataType] || ''
  }
  if (cap.capType === 'svc') return '服务'
  if (cap.capType === 'evt') return '事件'
  return ''
}

function dataDefDetail(cap) {
  if (cap.capType === 'prop') {
    const dd = cap.dataDef
    if (dd.dataType === 'enum') return dd.enumValues.map(ev => `${ev.name}(${ev.val})`).join(', ')
    if (dd.dataType === 'int') {
      let s = `${dd.min}~${dd.max}`
      if (dd.step && dd.step !== 1) s += `, 步长${dd.step}`
      if (dd.unit) s += ` ${dd.unit}`
      return s
    }
    if (dd.dataType === 'boolean') return `${dd.trueLabel || 'true'}/${dd.falseLabel || 'false'}`
    if (dd.dataType === 'string') return `最大${dd.limit || dd.maxLength || 64}字节`
    if (dd.dataType === 'array') {
      const et = { int: 'Int', string: 'String', struct: 'Struct' }[dd.elementType] || dd.elementType || '—'
      return `元素${et}, ${dd.maxLength || 100}个元素`
    }
    if (dd.dataType === 'struct') return `${(dd.fields || []).length} 个字段`
  }
  if (cap.capType === 'svc') {
    const dd = cap.dataDef
    return `入参${(dd.inputParams || []).length}个, 出参${(dd.outputParams || []).length}个`
  }
  if (cap.capType === 'evt') {
    const dd = cap.dataDef
    const et = dd.eventType === 'alarm' ? '告警' : dd.eventType === 'fault' ? '故障' : '信息'
    return `${et}事件, 出参${(dd.outputParams || []).length}个`
  }
  return ''
}

// ===== 关联能力 =====
const importDialogVisible = ref(false)
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])

function buildModuleGroups(capList) {
  const allMods = [...store.modules, ...store.customModules]
  const moduleMap = {}
  capList.forEach(cap => {
    const mod = allMods.find(m => m.id === cap.moduleId)
    if (mod) {
      if (!moduleMap[cap.moduleId]) moduleMap[cap.moduleId] = { mod, caps: [] }
      moduleMap[cap.moduleId].caps.push(cap)
    }
  })
  return allMods
    .filter(m => moduleMap[m.id]?.caps.length)
    .map(m => ({
      id: m.id,
      name: m.name + ' (' + m.identifier + ')',
      caps: moduleMap[m.id].caps
    }))
}

const importAvailableByModule = computed(() => {
  const linkedIds = new Set(linkedCaps.value.map(c => c.id))
  const excludedIds = new Set([...linkedIds, ...importSelectedIds.value])
  const allCaps = [...store.capabilities, ...store.customCapabilities]
  const available = allCaps.filter(c => !excludedIds.has(c.id))
  return buildModuleGroups(available)
})

function isImportCapVisible(cap) {
  if (!importSearchText.value) return true
  const kw = importSearchText.value.toLowerCase()
  return cap.name.toLowerCase().includes(kw) || cap.identifier.toLowerCase().includes(kw)
}

function toggleImportCheck(capId) {
  const idx = importCheckedIds.value.indexOf(capId)
  if (idx > -1) importCheckedIds.value.splice(idx, 1)
  else importCheckedIds.value.push(capId)
}

function toggleLeftModuleExpand(modId) {
  const idx = expandedLeftModules.value.indexOf(modId)
  if (idx > -1) expandedLeftModules.value.splice(idx, 1)
  else expandedLeftModules.value.push(modId)
}

function getVisibleCaps(mod) {
  if (!importSearchText.value) return mod.caps
  return mod.caps.filter(c => isImportCapVisible(c))
}

function isModuleAllChecked(mod) {
  const visible = getVisibleCaps(mod)
  return visible.length > 0 && visible.every(c => importCheckedIds.value.includes(c.id))
}

function isModuleIndeterminate(mod) {
  const visible = getVisibleCaps(mod)
  const checked = visible.filter(c => importCheckedIds.value.includes(c.id))
  return checked.length > 0 && checked.length < visible.length
}

function toggleModuleAllCheck(mod) {
  const visible = getVisibleCaps(mod)
  if (isModuleAllChecked(mod)) {
    visible.forEach(c => { importCheckedIds.value = importCheckedIds.value.filter(id => id !== c.id) })
  } else {
    visible.forEach(c => { if (!importCheckedIds.value.includes(c.id)) importCheckedIds.value.push(c.id) })
  }
}

function getCapById(id) {
  return [...store.capabilities, ...store.customCapabilities].find(c => c.id === id)
}

const importSelectedByModule = computed(() => {
  const caps = importSelectedIds.value.map(id => getCapById(id)).filter(Boolean)
  return buildModuleGroups(caps)
})

function toggleModuleExpand(modId) {
  const idx = expandedModules.value.indexOf(modId)
  if (idx > -1) expandedModules.value.splice(idx, 1)
  else expandedModules.value.push(modId)
}

function transferToRight() {
  const newModIds = new Set()
  importCheckedIds.value.forEach(id => {
    if (!importSelectedIds.value.includes(id)) {
      importSelectedIds.value.push(id)
      const cap = getCapById(id)
      if (cap) newModIds.add(cap.moduleId)
    }
  })
  newModIds.forEach(mid => {
    if (!expandedModules.value.includes(mid)) expandedModules.value.push(mid)
  })
  importCheckedIds.value = []
}

function transferToLeft() { importSelectedIds.value = [] }
function removeFromSelected(id) { importSelectedIds.value = importSelectedIds.value.filter(i => i !== id) }

function openImportDialog() {
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedModules.value = []
  expandedLeftModules.value = [...store.modules, ...store.customModules].map(m => m.id)
  importDialogVisible.value = true
}

function handleImportConfirm() {
  if (!algo.value) return
  const caps = (() => { try { return JSON.parse(algo.value.capabilities || '{}') } catch { return {} } })()
  importSelectedIds.value.forEach(capId => {
    const cap = getCapById(capId)
    if (cap && !caps[cap.identifier]) caps[cap.identifier] = true
  })
  const capIds = Object.keys(caps).filter(k => !k.startsWith('__'))
  updateAlgorithm({
    id: algo.value.id,
    capabilities: JSON.stringify(caps),
    capabilityIds: JSON.stringify(capIds)
  })
  // refresh local data
  algo.value.capabilities = JSON.stringify(caps)
  algo.value.capabilityIds = JSON.stringify(capIds)
  ElMessage.success(`已导入 ${importSelectedIds.value.length} 个能力`)
  importDialogVisible.value = false
}

// ===== 移除能力 =====
function handleRemoveCap(cap) {
  if (!algo.value) return
  ElMessageBox.confirm(
    `确定从该算法移除能力「${cap.name}」？能力本身不会被删除。`,
    '移除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    const caps = (() => { try { return JSON.parse(algo.value.capabilities || '{}') } catch { return {} } })()
    delete caps[cap.identifier]
    const capIds = Object.keys(caps).filter(k => !k.startsWith('__'))
    updateAlgorithm({
      id: algo.value.id,
      capabilities: JSON.stringify(caps),
      capabilityIds: JSON.stringify(capIds)
    })
    algo.value.capabilities = JSON.stringify(caps)
    algo.value.capabilityIds = JSON.stringify(capIds)
    ElMessage.success('已移除')
  }).catch(() => {})
}

// ===== 编辑能力参数（编辑池中能力 dataDef） =====
const editDialogVisible = ref(false)
const editCap = ref(null)
const editForm = reactive({
  dataType: '', enumValues: [], min: 0, max: 100, step: 1, unit: '',
  trueLabel: '', falseLabel: '', maxLength: 64,
  elementType: 'int', arrayCount: 100, fields: [],
  eventType: '', inputParams: [], outputParams: [],
  descr: '', accessMode: 'rw', defaultVal: ''
})

const paramDialogVisible = ref(false)
const paramFormRef = ref(null)
const editingParamTarget = ref('input')
const editingParamIdx = ref(-1)

const paramForm = reactive({
  name: '', identifier: '', dataType: 'boolean',
  min: 0, max: 100, step: 1, unit: '',
  maxLength: 64, elementType: 'int', arrayCount: 10, trueLabel: '是', falseLabel: '否',
  enumValues: [{ name: '', val: 0 }]
})

const paramTypeMap = { int: 'Int', string: 'String', boolean: 'Boolean', enum: 'Enum' }
function paramTypeLabel(t) { return paramTypeMap[t] || t }

const paramDialogTitle = computed(() => {
  if (editingParamTarget.value === 'field') return editingParamIdx.value >= 0 ? '编辑结构体字段' : '添加结构体字段'
  const prefix = editingParamTarget.value === 'input' ? '输入' : '输出'
  return editingParamIdx.value >= 0 ? `编辑${prefix}参数` : `添加${prefix}参数`
})

function openAddParam(target) {
  editingParamTarget.value = target; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditParam(target, idx) {
  editingParamTarget.value = target; editingParamIdx.value = idx
  const p = editForm[target + 'Params'][idx]
  paramForm.name = p.name; paramForm.identifier = p.identifier; paramForm.dataType = p.dataType || 'boolean'
  if (p.dataType === 'int') {
    paramForm.min = p.min || 0; paramForm.max = p.max || 100; paramForm.step = p.step || 1; paramForm.unit = p.unit || ''
  }
  paramForm.maxLength = p.maxLength || 64
  if (p.dataType === 'array') {
    paramForm.elementType = p.elementType || 'int'; paramForm.arrayCount = p.maxLength || 10
  } else {
    paramForm.elementType = 'int'; paramForm.arrayCount = 10
  }
  paramForm.trueLabel = p.trueLabel || '是'; paramForm.falseLabel = p.falseLabel || '否'
  paramForm.enumValues = p.enumValues ? JSON.parse(JSON.stringify(p.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}

function resetParamForm() {
  paramForm.name = ''; paramForm.identifier = ''; paramForm.dataType = 'boolean'
  paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
  paramForm.maxLength = 64; paramForm.elementType = 'int'; paramForm.arrayCount = 10
  paramForm.trueLabel = '是'; paramForm.falseLabel = '否'
  paramForm.enumValues = [{ name: '', val: 0 }]
}

function buildParam() {
  const p = { name: paramForm.name.trim(), identifier: paramForm.identifier.trim(), dataType: paramForm.dataType }
  if (paramForm.dataType === 'int') {
    p.min = paramForm.min; p.max = paramForm.max; p.step = paramForm.step; p.unit = paramForm.unit
  } else if (paramForm.dataType === 'string') {
    p.maxLength = paramForm.maxLength
  } else if (paramForm.dataType === 'boolean') {
    p.trueLabel = paramForm.trueLabel; p.falseLabel = paramForm.falseLabel
  } else if (paramForm.dataType === 'enum') {
    p.enumValues = paramForm.enumValues.filter(ev => ev.name.trim())
  } else if (paramForm.dataType === 'array') {
    p.elementType = paramForm.elementType; p.maxLength = paramForm.arrayCount
  }
  return p
}

function handleParamConfirm() {
  if (!paramForm.name.trim() || !paramForm.identifier.trim()) {
    ElMessage.warning('请填写完整参数信息'); return
  }
  const param = buildParam()
  if (editingParamTarget.value === 'field') {
    if (editingParamIdx.value >= 0) {
      editForm.fields[editingParamIdx.value] = param
    } else {
      editForm.fields.push(param)
    }
  } else {
    const key = editingParamTarget.value + 'Params'
    if (editingParamIdx.value >= 0) {
      editForm[key][editingParamIdx.value] = param
    } else {
      editForm[key].push(param)
    }
  }
  paramDialogVisible.value = false
}

function openAddStructField() {
  editingParamTarget.value = 'field'; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditStructField(idx) {
  editingParamTarget.value = 'field'; editingParamIdx.value = idx
  const f = editForm.fields[idx]
  paramForm.name = f.name; paramForm.identifier = f.identifier; paramForm.dataType = f.dataType || 'boolean'
  if (f.dataType === 'int') {
    paramForm.min = f.min || 0; paramForm.max = f.max || 100; paramForm.step = f.step || 1; paramForm.unit = f.unit || ''
  }
  paramForm.maxLength = f.maxLength || 64
  paramForm.elementType = 'int'; paramForm.arrayCount = 10
  paramForm.trueLabel = f.trueLabel || '是'; paramForm.falseLabel = f.falseLabel || '否'
  paramForm.enumValues = f.enumValues ? JSON.parse(JSON.stringify(f.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}

function openEditCap(cap) {
  editCap.value = cap
  const dd = cap.dataDef
  editForm.descr = cap.descr || ''
  if (cap.capType === 'prop') {
    editForm.dataType = dd.dataType
    editForm.accessMode = dd.accessMode || 'rw'
    editForm.defaultVal = dd.defaultVal || ''
    editForm.enumValues = dd.enumValues ? JSON.parse(JSON.stringify(dd.enumValues)) : [{ name: '', val: 0 }]
    editForm.min = dd.min || 0; editForm.max = dd.max || 100; editForm.step = dd.step || 1; editForm.unit = dd.unit || ''
    editForm.trueLabel = dd.trueLabel || '开启'; editForm.falseLabel = dd.falseLabel || '关闭'
    editForm.maxLength = dd.limit || 64
    editForm.elementType = dd.elementType || 'int'; editForm.arrayCount = dd.maxLength || 100
    editForm.fields = dd.fields ? JSON.parse(JSON.stringify(dd.fields)) : []
  } else if (cap.capType === 'svc') {
    editForm.inputParams = JSON.parse(JSON.stringify(dd.inputParams || []))
    editForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  } else {
    editForm.eventType = dd.eventType || 'alarm'
    editForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  }
  editDialogVisible.value = true
}

function handleEditConfirm() {
  const cap = editCap.value
  if (!cap) return
  const item = {
    moduleId: cap.moduleId,
    capType: cap.capType,
    name: cap.name,
    identifier: cap.identifier,
    descr: editForm.descr.trim(),
    dataDef: buildEditDataDef()
  }
  updateCapability(cap.id, item)
  ElMessage.success('参数已更新')
  editDialogVisible.value = false
}

function buildEditDataDef() {
  const cap = editCap.value
  if (cap.capType === 'prop') {
    const dd = { dataType: editForm.dataType, accessMode: editForm.accessMode, defaultVal: editForm.defaultVal }
    if (editForm.dataType === 'enum') {
      dd.enumValues = editForm.enumValues.filter(ev => ev.name.trim())
    } else if (editForm.dataType === 'int') {
      dd.min = editForm.min; dd.max = editForm.max; dd.step = editForm.step; dd.unit = editForm.unit
    } else if (editForm.dataType === 'boolean') {
      dd.trueLabel = editForm.trueLabel; dd.falseLabel = editForm.falseLabel
    } else if (editForm.dataType === 'string') {
      dd.limit = editForm.maxLength
    } else if (editForm.dataType === 'array') {
      dd.elementType = editForm.elementType; dd.maxLength = editForm.arrayCount
      if (editForm.elementType === 'struct') dd.fields = editForm.fields.filter(f => f.name.trim())
    } else if (editForm.dataType === 'struct') {
      dd.fields = editForm.fields.filter(f => f.name.trim())
    }
    return dd
  }
  if (cap.capType === 'svc') {
    return { dataType: 'service', inputParams: editForm.inputParams, outputParams: editForm.outputParams }
  }
  return { dataType: 'event', eventType: editForm.eventType, outputParams: editForm.outputParams }
}

// ===== 加载 =====
function loadAlgo() {
  const res = getAlgorithm(algoId)
  if (res.code === 0) algo.value = res.data
}

onMounted(() => { loadAlgo() })
</script>

<style lang="scss" scoped>
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 24px var(--spacing-md) 0; flex-shrink: 0;
}
.top-left { display: flex; align-items: center; gap: 12px; }
.top-actions { display: flex; gap: 8px; }
.top-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.top-sub { font-size: var(--font-xs); color: var(--text-secondary); margin-top: 2px; }

.main-layout { flex: 1; display: flex; overflow: hidden; padding-top: 12px; }

.module-sidebar {
  width: 260px; background: var(--bg-card);
  border-right: 1px solid var(--border-lighter);
  display: flex; flex-direction: column; flex-shrink: 0;
}
.module-sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border-lighter);
}
.module-sidebar-title { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.module-list { flex: 1; overflow-y: auto; padding: 8px; }

.module-item-all {
  padding: 10px 12px; font-size: 13px; font-weight: 500; color: var(--text-regular);
  cursor: pointer; border-radius: 8px; margin-bottom: 4px;
  &:hover { background: var(--bg-hover); }
  &.active { background: var(--primary-bg); color: var(--primary-color); }
}
.module-item {
  display: flex; align-items: center; padding: 10px 12px;
  border-radius: 8px; cursor: pointer; margin-bottom: 2px; transition: all .15s;
  &:hover { background: var(--bg-hover); }
  &.active { background: var(--primary-bg); }
  .module-name {
    flex: 1; font-size: 13px; color: var(--text-regular);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    .active & { color: var(--primary-color); font-weight: 500; }
  }
  .module-ident { font-size: 11px; color: var(--text-placeholder); margin-left: 8px; flex-shrink: 0; }
}

.capability-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0 24px 16px; }

.type-tag {
  display: inline-flex; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
  &.type-prop { background: #EFF6FF; color: #2563EB; }
  &.type-svc { background: #F0FDF4; color: #16A34A; }
  &.type-evt { background: #FFFBEB; color: #D97706; }
}

.cell-name { font-weight: 500; color: var(--text-primary); }
.cell-id { font-size: 13px; color: var(--text-secondary); font-family: monospace; }
.cell-datatype { font-size: 13px; color: var(--text-regular); }
.cell-def { font-size: 12px; color: var(--text-secondary); }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-module { font-size: 13px; color: var(--text-regular); }

.empty-state {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--text-placeholder); font-size: var(--font-md);
}

.transfer-container { height: 420px; }
.transfer-panel-search { padding: 8px 12px; border-bottom: 1px solid var(--border-lighter); flex-shrink: 0; }
.transfer-count { font-size: 12px; font-weight: 400; color: var(--text-secondary); }

.type-cards { display: flex; gap: 8px; }
.type-card {
  padding: 0 12px; border: 1px solid var(--border-light);
  border-radius: var(--el-border-radius-base); font-size: 12px; line-height: 26px;
  font-weight: 500; color: var(--text-secondary); background: var(--bg-body);
  &.active { border-color: var(--primary-color); background: var(--primary-bg); color: var(--primary-color); }
}

.enum-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.enum-row { display: flex; align-items: center; gap: 8px; }
.range-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.bool-labels { display: flex; gap: 12px; width: 100%; }
.param-list { width: 100%; }
.param-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border: 1px solid var(--border-light); border-radius: 6px; margin-bottom: 6px;
}
.param-info { flex: 1; min-width: 0; }
.param-name { font-size: 13px; color: var(--text-primary); }
.param-meta { font-size: 11px; color: var(--text-placeholder); margin-left: 8px; }
.param-empty { font-size: 12px; color: var(--text-placeholder); padding: 8px 0; }
.form-hint { display: block; font-size: 11px; color: var(--text-placeholder); margin-bottom: 4px; }
</style>

<style lang="scss">
.alg-cap-dialog .el-dialog__body { padding-top: 20px; }
.cap-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-dialog__header { padding-bottom: 12px; }
  .el-form-item { margin-bottom: 18px; }
  .el-divider { margin: 24px 0 20px; }
}
</style>
