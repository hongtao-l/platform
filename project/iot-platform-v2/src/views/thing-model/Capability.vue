<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <!-- ===== Capability modules panel ===== -->
    <aside class="w-64 border-r border-slate-200 bg-slate-50 flex flex-col flex-shrink-0 select-none z-10">
      <div class="p-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-sky-600" />
          <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wide">模块</h2>
        </div>
        <button
          class="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/70 rounded-md transition-all shadow-2xs"
          @click="openAddModule"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" /></svg>
          <span>添加</span>
        </button>
      </div>

      <div class="px-3 pt-2.5 pb-1.5 bg-slate-50">
        <div class="relative">
          <input
            v-model="moduleSearch"
            class="w-full pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="搜索模块..."
          />
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
        <button
          class="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all"
          :class="currentModuleId === 'all' ? 'font-semibold text-slate-800 bg-white border border-slate-200/80 shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white'"
          @click="selectModule('all')"
        >
          <div class="flex items-center space-x-1.5 truncate">
            <span class="w-1.5 h-1.5 rounded-full" :class="currentModuleId === 'all' ? 'bg-sky-500' : 'bg-slate-300'" />
            <span class="truncate">全部模块</span>
          </div>
          <span class="text-[10px] font-mono font-medium" :class="currentModuleId === 'all' ? 'text-sky-700 bg-sky-50 px-1 rounded' : 'text-slate-400'">{{ store.capItems.length }}</span>
        </button>

        <button
          v-for="m in filteredModules"
          :key="m.id"
          class="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all group"
          :class="currentModuleId === m.id ? 'font-semibold text-slate-800 bg-white border border-slate-200/80 shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white'"
          @click="selectModule(m.id)"
        >
          <div class="flex items-center space-x-1.5 truncate min-w-0">
            <span class="w-1 h-1 rounded-full transition-colors flex-shrink-0" :class="currentModuleId === m.id ? 'bg-sky-500' : 'bg-slate-300 group-hover:bg-sky-500'" />
            <span class="truncate">{{ m.name }}</span>
            <span class="hidden group-hover:inline-flex items-center gap-0.5 flex-shrink-0">
              <span class="p-0.5 rounded text-slate-400 hover:text-sky-600" title="编辑模块" @click.stop="openEditModule(m)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
              </span>
              <span class="p-0.5 rounded text-slate-400 hover:text-rose-600" title="删除模块" @click.stop="handleDeleteModule(m)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
              </span>
            </span>
          </div>
          <span class="text-[10px] font-mono transition-colors" :class="currentModuleId === m.id ? 'text-sky-700 bg-sky-50 px-1 rounded' : 'text-slate-400 group-hover:text-slate-600'">{{ moduleCounts[m.id] || 0 }}</span>
        </button>

        <div v-if="!filteredModules.length" class="px-2 py-4 text-[11px] text-slate-400 text-center">暂无模块</div>
      </div>
    </aside>

    <!-- ===== Main workspace ===== -->
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            class="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all duration-150"
            @click="openAddCapItem"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
            <span>添加能力项</span>
          </button>

          <div class="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-0.5 rounded-lg text-xs">
            <button
              class="px-2.5 py-1 rounded-md transition-all"
              :class="typeFilter === 'all' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'all'"
            >全部 ({{ typeCounts.all }})</button>
            <button
              class="px-2.5 py-1 font-medium rounded-md transition-all flex items-center space-x-1"
              :class="typeFilter === 'prop' ? 'text-slate-900 bg-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'prop'"
            ><span class="w-1.5 h-1.5 rounded-full bg-sky-500" /><span>属性 ({{ typeCounts.prop }})</span></button>
            <button
              class="px-2.5 py-1 font-medium rounded-md transition-all flex items-center space-x-1"
              :class="typeFilter === 'svc' ? 'text-slate-900 bg-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'svc'"
            ><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span>服务 ({{ typeCounts.svc }})</span></button>
            <button
              class="px-2.5 py-1 font-medium rounded-md transition-all flex items-center space-x-1"
              :class="typeFilter === 'evt' ? 'text-slate-900 bg-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'evt'"
            ><span class="w-1.5 h-1.5 rounded-full bg-amber-500" /><span>事件 ({{ typeCounts.evt }})</span></button>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="relative w-52 sm:w-64">
            <input
              v-model="searchText"
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all"
              placeholder="搜索名称 / Identifier..."
            />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </div>
          <button class="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="刷新列表" @click="resetFilters">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-auto bg-white">
        <el-table :data="pagedTree" row-key="id" class="stitch-table" :row-class-name="rowClassName">
          <el-table-column type="expand" width="44">
            <template #default="{ row }">
              <div class="param-panel">
                <el-table :data="row.params" size="small">
                  <el-table-column label="参数名称" min-width="150">
                    <template #default="{ row: p }"><span class="cell-name">{{ p.name }}</span></template>
                  </el-table-column>
                  <el-table-column label="参数标识" width="180" align="center">
                    <template #default="{ row: p }"><span class="cell-id">{{ p.identifier || '—' }}</span></template>
                  </el-table-column>
                  <el-table-column label="数据类型" width="100" align="center">
                    <template #default="{ row: p }"><span class="cell-datatype">{{ dataTypeLabel(p) || '—' }}</span></template>
                  </el-table-column>
                  <el-table-column label="数据定义" min-width="190" show-overflow-tooltip>
                    <template #default="{ row: p }"><span class="cell-def">{{ dataDefDetail(p) || '—' }}</span></template>
                  </el-table-column>
                  <el-table-column label="描述" min-width="150" show-overflow-tooltip>
                    <template #default="{ row: p }"><span class="cell-desc">{{ p.descr || '—' }}</span></template>
                  </el-table-column>
                  <el-table-column label="操作" width="130" align="right">
                    <template #default="{ row: p }">
                      <div class="row-actions">
                        <button class="link-action" @click="openEditCapability(p)">编辑</button>
                        <button class="link-danger" @click="handleDeleteCapability(p)">删除</button>
                      </div>
                    </template>
                  </el-table-column>
                  <template #empty><div class="param-empty">暂无参数</div></template>
                </el-table>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" width="90" align="left">
            <template #default="{ row }"><span :class="['type-tag', typeTagCls(row.capType)]">{{ typeLabel(row.capType) }}</span></template>
          </el-table-column>
          <el-table-column label="能力项名称" min-width="220">
            <template #default="{ row }"><span class="cell-item-name">{{ row.name }}</span></template>
          </el-table-column>
          <el-table-column label="能力项ID" min-width="200">
            <template #default="{ row }"><code class="cell-id">{{ row.identifier || '—' }}</code></template>
          </el-table-column>
          <el-table-column label="所属模块" min-width="150">
            <template #default="{ row }"><span class="cell-module">{{ row.moduleName || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="更新时间" min-width="170">
            <template #default="{ row }"><span class="cell-time">{{ row.updateTime || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="right" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <button class="link-action" @click="openAddCapability(row)">添加参数</button>
                <button class="link-action" @click="openEditCapItem(row)">编辑</button>
                <button class="link-danger" @click="handleDeleteCapItem(row)">删除</button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-box">
              <span>暂无能力项</span>
              <button class="link-action" @click="openAddCapItem">+ 添加能力项</button>
            </div>
          </template>
        </el-table>
      </div>

      <!-- Footer -->
      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <div class="flex items-center space-x-2">
          <span>显示第 <strong class="font-semibold text-slate-700">{{ rangeStart }} - {{ rangeEnd }}</strong> 项，共 <strong class="font-semibold text-slate-700">{{ filteredTree.length }}</strong> 项能力定义</span>
          <span class="text-slate-300">|</span>
          <el-select v-model="pageSize" size="small" style="width: 96px">
            <el-option :value="20" label="20 条/页" />
            <el-option :value="50" label="50 条/页" />
            <el-option :value="100" label="100 条/页" />
          </el-select>
        </div>
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filteredTree.length"
          layout="prev, pager, next"
          size="small"
        />
      </footer>
    </main>

    <!-- ===== Module dialog ===== -->
    <el-dialog v-model="moduleDialogVisible" :title="moduleDialogTitle" width="480px" :close-on-click-modal="false">
      <el-form ref="moduleFormRef" :model="moduleForm" :rules="moduleRules" label-width="86px">
        <el-form-item label="模块名称" prop="name">
          <el-input v-model="moduleForm.name" placeholder="请输入模块名称" />
        </el-form-item>
        <el-form-item label="模块标识" prop="identifier">
          <el-input v-model="moduleForm.identifier" placeholder="例如 WorkModeModule" class="!font-mono" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线，全局唯一</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleModuleConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- ===== Capability item dialog ===== -->
    <el-dialog v-model="capItemDialogVisible" :title="capItemDialogTitle" width="520px" :close-on-click-modal="false">
      <el-form :model="capItemForm" label-width="96px">
        <el-form-item label="类型" required>
          <div class="seg-control">
            <span
              v-for="t in capTypeOptions"
              :key="t.value"
              class="seg-item"
              :class="{ active: capItemForm.capType === t.value }"
              @click="capItemForm.capType = t.value"
            >{{ t.label }}</span>
          </div>
        </el-form-item>
        <el-form-item label="能力项名称" required>
          <el-input v-model="capItemForm.name" placeholder="请输入能力项名称" />
        </el-form-item>
        <el-form-item label="能力项ID" required>
          <el-input v-model="capItemForm.identifier" placeholder="例如 WorkModeItem" class="!font-mono" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线，全局唯一</span>
        </el-form-item>
        <el-form-item label="所属模块">
          <el-select v-model="capItemForm.moduleId" clearable style="width:100%" placeholder="不选则不归属任何模块">
            <el-option v-for="m in store.modules" :key="m.id" :label="`${m.name} (${m.identifier})`" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editingCapItemId" label="参数">
          <div class="w-full">
            <div v-if="!draftParams.length" class="text-[11px] text-slate-400 py-1">暂未添加参数</div>
            <div v-for="(p, i) in draftParams" :key="i" class="draft-param">
              <span class="text-xs font-medium text-slate-800">{{ p.name }}</span>
              <span class="font-mono text-[11px] text-slate-400">{{ p.identifier }}</span>
              <button class="link-danger ml-auto" @click="draftParams.splice(i, 1)">删除</button>
            </div>
            <el-button size="small" style="margin-top:8px" @click="openDraftParam">+ 添加参数</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="capItemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCapItemConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- ===== Parameter definition dialog (full type editor) ===== -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="860px"
      :close-on-click-modal="false"
      top="3vh"
    >
      <el-form ref="capFormRef" label-width="110px">
        <el-form-item label="参数名称" required>
          <el-input v-model="capForm.name" placeholder="请输入参数名称（2-50字符）" maxlength="50" />
        </el-form-item>
        <el-form-item label="标识符" required>
          <el-input v-model="capForm.identifier" placeholder="例如 WorkMode" maxlength="40" class="!font-mono" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线，全局唯一</span>
        </el-form-item>

        <template v-if="capForm.capType === 'prop'">
          <el-form-item label="数据类型" required>
            <el-select v-model="capForm.dataType" style="width:100%" @change="onDataTypeChange">
              <el-option label="枚举型 (Enum)" value="enum" />
              <el-option label="数值型 (Int)" value="int" />
              <el-option label="浮点型 (Double)" value="double" />
              <el-option label="布尔型 (Boolean)" value="boolean" />
              <el-option label="字符串 (String)" value="string" />
              <el-option label="数组型 (Array)" value="array" />
              <el-option label="结构体型 (Struct)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="读写模式">
            <el-select v-model="capForm.accessMode" style="width:100%">
              <el-option label="读写 (Read/Write)" value="rw" />
              <el-option label="只读 (Read Only)" value="ro" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="描述">
          <el-input v-model="capForm.descr" type="textarea" placeholder="请输入能力描述" :rows="2" />
        </el-form-item>

        <div class="step-divider my-4"><span>数据定义</span></div>

        <!-- Enum -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'enum'">
          <el-form-item label="枚举值定义" required>
            <div class="w-full space-y-2">
              <div v-for="(ev, i) in capForm.enumValues" :key="i" class="flex items-center gap-2">
                <el-input v-model="ev.name" placeholder="名称（如：低功耗模式）" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors" @click="capForm.enumValues.splice(i, 1)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                </button>
              </div>
              <button class="inline-flex items-center space-x-1 px-3 py-1 text-xs text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded transition-all" @click="capForm.enumValues.push({ name: '', val: capForm.enumValues.length })">
                <span class="text-sm font-bold leading-none">+</span><span>添加枚举值</span>
              </button>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="capForm.defaultVal" placeholder="请输入默认枚举值的 Value" />
          </el-form-item>
        </template>

        <!-- Int / Double -->
        <template v-if="capForm.capType === 'prop' && ['int', 'double'].includes(capForm.dataType)">
          <el-form-item label="取值范围" required>
            <div class="flex items-center gap-2 w-full">
              <el-input-number v-model="capForm.min" :max="capForm.max - 1" :step="capForm.dataType === 'double' ? 0.1 : 1" placeholder="最小值" style="flex:1" />
              <span class="text-slate-400 text-xs">~</span>
              <el-input-number v-model="capForm.max" :min="capForm.min + 1" :step="capForm.dataType === 'double' ? 0.1 : 1" placeholder="最大值" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="capForm.step" :min="capForm.dataType === 'double' ? 0.01 : 1" :step="capForm.dataType === 'double' ? 0.1 : 1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="capForm.unit" placeholder="例如：%、°C、ms" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="capForm.defaultVal" :min="capForm.min" :max="capForm.max" :step="capForm.dataType === 'double' ? 0.1 : 1" style="width:200px" />
          </el-form-item>
        </template>

        <!-- Boolean -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="flex gap-3 w-full">
              <div class="flex-1">
                <span class="form-hint !mt-0 mb-1">true 标签</span>
                <el-input v-model="capForm.trueLabel" placeholder="开启" />
              </div>
              <div class="flex-1">
                <span class="form-hint !mt-0 mb-1">false 标签</span>
                <el-input v-model="capForm.falseLabel" placeholder="关闭" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="capForm.defaultVal">
              <el-radio value="1">{{ capForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ capForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- String -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）" required>
            <el-input-number v-model="capForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="capForm.defaultVal" placeholder="请输入默认值" />
          </el-form-item>
        </template>

        <!-- Array -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="capForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Struct (结构体)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数" required>
            <el-input-number v-model="capForm.arrayCount" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <template v-if="capForm.elementType === 'struct'">
            <el-form-item label="元素结构体字段">
              <div class="w-full">
                <div class="param-list">
                  <div v-for="(f, i) in capForm.fields" :key="i" class="param-item">
                    <div class="param-info">
                      <span class="param-name">{{ f.name || '未命名' }}</span>
                      <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                    </div>
                    <button class="link-action" @click="openEditStructField(i)">编辑</button>
                    <button class="link-danger" @click="capForm.fields.splice(i, 1)">删除</button>
                  </div>
                  <div v-if="!capForm.fields.length" class="param-empty">暂无字段</div>
                </div>
                <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
              </div>
            </el-form-item>
          </template>
        </template>

        <!-- Struct -->
        <template v-if="capForm.capType === 'prop' && capForm.dataType === 'struct'">
          <el-form-item label="结构体字段">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(f, i) in capForm.fields" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ f.name || '未命名' }}</span>
                    <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                  </div>
                  <button class="link-action" @click="openEditStructField(i)">编辑</button>
                  <button class="link-danger" @click="capForm.fields.splice(i, 1)">删除</button>
                </div>
                <div v-if="!capForm.fields.length" class="param-empty">暂无字段</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
            </div>
          </el-form-item>
        </template>

        <!-- Service -->
        <template v-if="capForm.capType === 'svc'">
          <el-form-item label="输入参数">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(p, i) in capForm.inputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <button class="link-action" @click="openEditParam('input', i)">编辑</button>
                  <button class="link-danger" @click="capForm.inputParams.splice(i, 1)">删除</button>
                </div>
                <div v-if="!capForm.inputParams.length" class="param-empty">暂无输入参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('input')">+ 添加参数</el-button>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(p, i) in capForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <button class="link-action" @click="openEditParam('output', i)">编辑</button>
                  <button class="link-danger" @click="capForm.outputParams.splice(i, 1)">删除</button>
                </div>
                <div v-if="!capForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <!-- Event -->
        <template v-if="capForm.capType === 'evt'">
          <el-form-item label="事件类型" required>
            <div class="seg-control">
              <span
                v-for="et in eventTypeOptions"
                :key="et.value"
                class="seg-item !px-3"
                :class="{ active: capForm.eventType === et.value }"
                @click="capForm.eventType = et.value"
              >{{ et.label }}</span>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(p, i) in capForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <button class="link-action" @click="openEditParam('output', i)">编辑</button>
                  <button class="link-danger" @click="capForm.outputParams.splice(i, 1)">删除</button>
                </div>
                <div v-if="!capForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCapabilityConfirm">提交</el-button>
      </template>
    </el-dialog>

    <!-- ===== Sub parameter dialog ===== -->
    <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="620px" :close-on-click-modal="false">
      <el-form ref="paramFormRef" :model="paramForm" label-width="110px">
        <el-form-item label="参数名称" required>
          <el-input v-model="paramForm.name" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数标识" required>
          <el-input v-model="paramForm.identifier" placeholder="例如 result" class="!font-mono" />
        </el-form-item>
        <el-form-item label="数据类型" required>
          <el-select v-model="paramForm.dataType" style="width:100%" @change="onParamDataTypeChange">
            <el-option label="Int (数字)" value="int" />
            <el-option label="Double (浮点数)" value="double" />
            <el-option label="String (字符串)" value="string" />
            <el-option label="Boolean (布尔)" value="boolean" />
            <el-option label="Enum (枚举)" value="enum" />
            <el-option v-if="editingParamTarget !== 'field'" label="Array (数组)" value="array" />
          </el-select>
        </el-form-item>

        <div class="step-divider my-4"><span>类型定义</span></div>

        <template v-if="['int', 'double'].includes(paramForm.dataType)">
          <el-form-item label="取值范围">
            <div class="flex items-center gap-2 w-full">
              <el-input-number v-model="paramForm.min" :max="paramForm.max - 1" :step="paramForm.dataType === 'double' ? 0.1 : 1" style="flex:1" />
              <span class="text-slate-400 text-xs">~</span>
              <el-input-number v-model="paramForm.max" :min="paramForm.min + 1" :step="paramForm.dataType === 'double' ? 0.1 : 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长"><el-input-number v-model="paramForm.step" :min="paramForm.dataType === 'double' ? 0.01 : 1" :step="paramForm.dataType === 'double' ? 0.1 : 1" style="width:150px" /></el-form-item>
          <el-form-item label="单位"><el-input v-model="paramForm.unit" placeholder="例如：%、°C、ms" style="width:150px" /></el-form-item>
          <el-form-item label="默认值"><el-input-number v-model="paramForm.defaultVal" :min="paramForm.min" :max="paramForm.max" :step="paramForm.dataType === 'double' ? 0.1 : 1" style="width:200px" /></el-form-item>
        </template>

        <template v-if="paramForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）">
            <el-input-number v-model="paramForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值"><el-input v-model="paramForm.defaultVal" placeholder="请输入默认值" /></el-form-item>
        </template>

        <template v-if="paramForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="flex gap-3 w-full">
              <div class="flex-1">
                <span class="form-hint !mt-0 mb-1">true 标签</span>
                <el-input v-model="paramForm.trueLabel" placeholder="开启" />
              </div>
              <div class="flex-1">
                <span class="form-hint !mt-0 mb-1">false 标签</span>
                <el-input v-model="paramForm.falseLabel" placeholder="关闭" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="paramForm.defaultVal">
              <el-radio value="1">{{ paramForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ paramForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <template v-if="paramForm.dataType === 'enum'">
          <el-form-item label="枚举值定义">
            <div class="w-full space-y-2">
              <div v-for="(ev, i) in paramForm.enumValues" :key="i" class="flex items-center gap-2">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors" @click="paramForm.enumValues.splice(i, 1)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                </button>
              </div>
              <button class="inline-flex items-center space-x-1 px-3 py-1 text-xs text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded transition-all" @click="paramForm.enumValues.push({ name: '', val: paramForm.enumValues.length })">
                <span class="text-sm font-bold leading-none">+</span><span>添加枚举值</span>
              </button>
            </div>
          </el-form-item>
          <el-form-item label="默认值"><el-input v-model="paramForm.defaultVal" placeholder="请输入默认枚举值的 Value" /></el-form-item>
        </template>

        <template v-if="paramForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="paramForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数"><el-input-number v-model="paramForm.arrayCount" :min="1" :max="1000" style="width:150px" /></el-form-item>
          <el-form-item label="默认值"><el-input v-model="paramForm.defaultVal" placeholder="请输入默认值（逗号分隔）" /></el-form-item>
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
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  store, addModule, updateModule, removeModule,
  addCapability, updateCapability, removeCapability,
  addCapItem, updateCapItem, removeCapItem,
  getCapItemsByModule, getCapsByCapItem,
  isModuleIdentifierUnique, isCapIdentifierUnique,
  isCustomModuleIdentifierUnique, isCustomCapIdentifierUnique
} from '@/data/thing-model'

const route = useRoute()

// ===== Filters =====
const currentModuleId = ref('all')
const moduleSearch = ref('')
const searchText = ref(route.query.search || '')
const typeFilter = ref('all')
const page = ref(1)
const pageSize = ref(20)

watch(() => route.query.search, (v) => { searchText.value = v || ''; page.value = 1 })
watch(searchText, () => { page.value = 1 })
watch(typeFilter, () => { page.value = 1 })
watch(currentModuleId, () => { page.value = 1 })

const moduleCounts = computed(() => {
  const map = {}
  store.capItems.forEach((i) => { map[i.moduleId] = (map[i.moduleId] || 0) + 1 })
  return map
})

const filteredModules = computed(() => {
  const kw = moduleSearch.value.trim().toLowerCase()
  if (!kw) return store.modules
  return store.modules.filter(m => m.name.toLowerCase().includes(kw) || m.identifier.toLowerCase().includes(kw))
})

function selectModule(id) {
  currentModuleId.value = id
}
function resetFilters() {
  searchText.value = ''
  typeFilter.value = 'all'
  page.value = 1
}

// ===== Tree =====
const capItemTree = computed(() => {
  const mods = store.modules
  return getCapItemsByModule(currentModuleId.value).map(item => {
    const mod = mods.find(m => m.id === item.moduleId)
    const moduleName = mod ? mod.name : '—'
    const params = getCapsByCapItem(item.id).map(cap => ({
      ...cap,
      _isParam: true,
      _moduleName: moduleName,
      _moduleId: cap.moduleId
    }))
    return {
      id: `item_${item.id}`,
      _isCapItem: true,
      _rawId: item.id,
      moduleId: item.moduleId,
      moduleName,
      capType: item.capType || 'prop',
      name: item.name,
      identifier: item.identifier,
      paramCount: params.length,
      updateTime: item.updateTime,
      params
    }
  })
})

const filteredTree = computed(() => {
  let list = capItemTree.value
  if (typeFilter.value !== 'all') list = list.filter(r => r.capType === typeFilter.value)
  const kw = searchText.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(r =>
      r.name.toLowerCase().includes(kw) ||
      (r.identifier || '').toLowerCase().includes(kw) ||
      r.params.some(p => p.name.toLowerCase().includes(kw) || (p.identifier || '').toLowerCase().includes(kw))
    )
  }
  return list
})

const typeCounts = computed(() => {
  const c = { all: capItemTree.value.length, prop: 0, svc: 0, evt: 0 }
  capItemTree.value.forEach(r => { if (c[r.capType] != null) c[r.capType]++ })
  return c
})

const pagedTree = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredTree.value.slice(start, start + pageSize.value)
})
const rangeStart = computed(() => (filteredTree.value.length ? (page.value - 1) * pageSize.value + 1 : 0))
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, filteredTree.value.length))

function rowClassName() { return '' }

// ===== Labels =====
const typeTagMap = { prop: '属性', svc: '服务', evt: '事件' }
const typeTagClsMap = { prop: 'type-prop', svc: 'type-svc', evt: 'type-evt' }
const paramTypeMap = { int: 'Int', double: 'Double', string: 'String', boolean: 'Boolean', enum: 'Enum' }
function typeLabel(t) { return typeTagMap[t] || t }
function typeTagCls(t) { return typeTagClsMap[t] || '' }
function paramTypeLabel(t) { return paramTypeMap[t] || t }

function dataTypeLabel(cap) {
  if (cap.capType === 'prop') {
    const m = { enum: '枚举型', int: '数值型', double: '浮点型', boolean: '布尔型', string: '字符串', array: '数组型', struct: '结构体型' }
    return m[cap.dataDef?.dataType] || ''
  }
  if (cap.capType === 'svc') return '服务'
  if (cap.capType === 'evt') return '事件'
  return ''
}

function dataDefDetail(cap) {
  if (cap.capType === 'prop') {
    const dd = cap.dataDef
    if (dd.dataType === 'enum') return (dd.enumValues || []).map(ev => `${ev.name}(${ev.val})`).join(', ')
    if (['int', 'double'].includes(dd.dataType)) {
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

// ===== Module CRUD =====
const moduleDialogVisible = ref(false)
const moduleFormRef = ref(null)
const editingModuleId = ref(null)
const moduleForm = reactive({ name: '', identifier: '' })
const moduleDialogTitle = computed(() => editingModuleId.value ? '编辑能力模块' : '添加能力模块')
const moduleRules = {
  name: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
  identifier: [
    { required: true, message: '请输入模块标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字母开头，仅允许字母、数字、下划线', trigger: 'blur' }
  ]
}

function openAddModule() {
  editingModuleId.value = null
  moduleForm.name = ''
  moduleForm.identifier = ''
  moduleDialogVisible.value = true
}
function openEditModule(mod) {
  editingModuleId.value = mod.id
  moduleForm.name = mod.name
  moduleForm.identifier = mod.identifier
  moduleDialogVisible.value = true
}
function handleModuleConfirm() {
  moduleFormRef.value?.validate((valid) => {
    if (!valid) return
    const unique = isModuleIdentifierUnique(moduleForm.identifier, editingModuleId.value || undefined)
      && isCustomModuleIdentifierUnique(moduleForm.identifier, editingModuleId.value || undefined)
    if (!unique) {
      ElMessage.warning('模块标识已存在，请更换')
      return
    }
    if (editingModuleId.value) {
      updateModule(editingModuleId.value, { ...moduleForm })
      ElMessage.success('编辑成功')
    } else {
      addModule({ ...moduleForm })
      ElMessage.success('添加成功')
    }
    moduleDialogVisible.value = false
  })
}
function handleDeleteModule(mod) {
  const capCount = store.capabilities.filter(c => c.moduleId === mod.id).length
  ElMessageBox.confirm(
    `确定删除模块「${mod.name}」？模块下的 ${capCount} 个能力将同步删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeModule(mod.id)
    if (currentModuleId.value === mod.id) currentModuleId.value = 'all'
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== Capability item CRUD =====
const capItemDialogVisible = ref(false)
const editingCapItemId = ref(null)
const capItemForm = reactive({ name: '', identifier: '', moduleId: null, capType: 'prop' })
const capItemDialogTitle = computed(() => editingCapItemId.value ? '编辑能力项' : '添加能力项')
const draftParams = ref([])
const inDraftMode = ref(false)

function openAddCapItem() {
  editingCapItemId.value = null
  draftParams.value = []
  capItemForm.name = ''
  capItemForm.identifier = ''
  capItemForm.capType = 'prop'
  capItemForm.moduleId = currentModuleId.value !== 'all' ? currentModuleId.value : (store.modules[0]?.id ?? null)
  capItemDialogVisible.value = true
}
function openEditCapItem(item) {
  editingCapItemId.value = item._rawId
  draftParams.value = []
  capItemForm.name = item.name
  capItemForm.identifier = item.identifier
  capItemForm.capType = item.capType || 'prop'
  capItemForm.moduleId = item.moduleId
  capItemDialogVisible.value = true
}
function handleCapItemConfirm() {
  if (!capItemForm.name || !capItemForm.name.trim()) { ElMessage.warning('请输入能力项名称'); return }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(capItemForm.identifier || '')) {
    ElMessage.warning('能力项ID不合法：字母开头，仅允许字母、数字、下划线'); return
  }
  const dup = store.capItems.some(x => x.identifier === capItemForm.identifier && x.id !== editingCapItemId.value)
  if (dup) { ElMessage.warning('能力项ID已存在，请更换'); return }
  if (editingCapItemId.value) {
    updateCapItem(editingCapItemId.value, { ...capItemForm })
    ElMessage.success('编辑成功')
  } else {
    const newItemId = addCapItem({ ...capItemForm })
    draftParams.value.forEach(dp => {
      addCapability({
        moduleId: capItemForm.moduleId,
        capItemId: newItemId,
        capType: dp.capType,
        name: dp.name,
        identifier: dp.identifier,
        descr: dp.descr,
        dataDef: JSON.parse(JSON.stringify(dp.dataDef))
      })
    })
    ElMessage.success(draftParams.value.length
      ? '添加成功（含 ' + draftParams.value.length + ' 个参数）'
      : '添加成功')
  }
  draftParams.value = []
  capItemDialogVisible.value = false
}
function handleDeleteCapItem(item) {
  ElMessageBox.confirm(
    `确定删除能力项「${item.name}」？其下的 ${item.paramCount} 个参数将一并删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    removeCapItem(item._rawId)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ===== Capability (parameter) dialog =====
const dialogVisible = ref(false)
const capFormRef = ref(null)
const editingCapId = ref(null)
const dialogTitle = computed(() => editingCapId.value ? '编辑参数' : '添加参数')
const capTypeOptions = [
  { label: '属性', value: 'prop' },
  { label: '服务', value: 'svc' },
  { label: '事件', value: 'evt' }
]
const eventTypeOptions = [
  { label: '信息 (Info)', value: 'info' },
  { label: '告警 (Alarm)', value: 'alarm' },
  { label: '故障 (Fault)', value: 'fault' }
]

const capForm = reactive({
  capItemId: null,
  moduleId: null,
  capType: 'prop',
  name: '',
  identifier: '',
  descr: '',
  dataType: 'enum',
  accessMode: 'rw',
  enumValues: [{ name: '', val: 0 }],
  defaultVal: '',
  min: 0, max: 100, step: 1, unit: '',
  trueLabel: '开启', falseLabel: '关闭',
  maxLength: 64,
  elementType: 'int', arrayCount: 100, fields: [],
  eventType: 'alarm',
  inputParams: [], outputParams: []
})

function resetCapForm() {
  Object.assign(capForm, {
    capItemId: null, moduleId: null, capType: 'prop', name: '', identifier: '', descr: '',
    dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '', val: 0 }], defaultVal: '',
    min: 0, max: 100, step: 1, unit: '', trueLabel: '开启', falseLabel: '关闭',
    maxLength: 64, elementType: 'int', arrayCount: 100, fields: [], eventType: 'alarm',
    inputParams: [], outputParams: []
  })
}
function onCapTypeChange(type) {
  if (capForm.name || capForm.identifier) {
    ElMessageBox.confirm('切换类型将清空当前数据定义，是否继续？', '提示', {
      confirmButtonText: '继续', cancelButtonText: '取消', type: 'warning'
    }).then(() => {
      capForm.capType = type
      resetDataDefForType()
    }).catch(() => {})
  } else {
    capForm.capType = type
    resetDataDefForType()
  }
}
function resetDataDefForType() {
  if (capForm.capType === 'prop') {
    capForm.dataType = 'enum'
    capForm.enumValues = [{ name: '', val: 0 }]; capForm.defaultVal = ''
    capForm.min = 0; capForm.max = 100; capForm.step = 1; capForm.unit = ''
    capForm.trueLabel = '开启'; capForm.falseLabel = '关闭'
    capForm.maxLength = 64; capForm.elementType = 'int'; capForm.arrayCount = 100; capForm.fields = []
  } else if (capForm.capType === 'svc') {
    capForm.inputParams = []; capForm.outputParams = []
  } else {
    capForm.eventType = 'alarm'; capForm.outputParams = []
  }
}
function onDataTypeChange() {
  capForm.defaultVal = ''
  if (capForm.dataType === 'double' && capForm.step === 1) capForm.step = 0.1
  if (capForm.dataType === 'int' && capForm.step < 1) capForm.step = 1
}

function openAddCapability(capItemRow) {
  editingCapId.value = null
  resetCapForm()
  inDraftMode.value = false
  if (capItemRow?._isCapItem) {
    capForm.capItemId = capItemRow._rawId
    capForm.moduleId = capItemRow.moduleId
    // 参数统一按属性内容配置，不再跟随能力项类型
    capForm.capType = 'prop'
    resetDataDefForType()
  }
  dialogVisible.value = true
}

function openDraftParam() {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(capItemForm.identifier || '')) {
    ElMessage.warning('请先填好能力项ID，再添加参数')
    return
  }
  editingCapId.value = null
  resetCapForm()
  inDraftMode.value = true
  // 参数统一按属性内容配置，不再跟随能力项类型
  capForm.capType = 'prop'
  resetDataDefForType()
  dialogVisible.value = true
}

function openEditCapability(cap) {
  inDraftMode.value = false
  editingCapId.value = cap.id
  capForm.capItemId = cap.capItemId ?? null
  capForm.moduleId = cap.moduleId ?? null
  const dd = cap.dataDef || {}
  // 参数统一按属性内容配置；旧的服务/事件参数在编辑时转为属性默认配置
  capForm.capType = 'prop'
  capForm.name = cap.name; capForm.identifier = cap.identifier; capForm.descr = cap.descr
  const propTypes = ['enum', 'int', 'double', 'boolean', 'string', 'array', 'struct']
  if (cap.capType === 'prop' && propTypes.includes(dd.dataType)) {
    capForm.dataType = dd.dataType; capForm.accessMode = dd.accessMode || 'rw'
    capForm.enumValues = dd.enumValues ? JSON.parse(JSON.stringify(dd.enumValues)) : [{ name: '', val: 0 }]
    capForm.defaultVal = dd.defaultVal || ''
    capForm.min = dd.min || 0; capForm.max = dd.max || 100; capForm.step = dd.step || 1; capForm.unit = dd.unit || ''
    capForm.trueLabel = dd.trueLabel || '开启'; capForm.falseLabel = dd.falseLabel || '关闭'
    capForm.maxLength = dd.limit || 64
    capForm.elementType = dd.elementType || 'int'; capForm.arrayCount = dd.maxLength || 100
    capForm.fields = dd.fields ? JSON.parse(JSON.stringify(dd.fields)) : []
  } else {
    capForm.dataType = 'enum'; capForm.accessMode = 'rw'
    capForm.enumValues = [{ name: '', val: 0 }]; capForm.defaultVal = ''
    capForm.min = 0; capForm.max = 100; capForm.step = 1; capForm.unit = ''
    capForm.trueLabel = '开启'; capForm.falseLabel = '关闭'
    capForm.maxLength = 64; capForm.elementType = 'int'; capForm.arrayCount = 100; capForm.fields = []
  }
  dialogVisible.value = true
}

function handleDeleteCapability(cap) {
  ElMessageBox.confirm(`确定删除能力「${cap.name}」？`, '删除确认', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    removeCapability(cap.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function capFormModuleId() {
  if (capForm.moduleId) return capForm.moduleId
  if (editingCapId.value) return store.capabilities.find(c => c.id === editingCapId.value)?.moduleId
  if (currentModuleId.value !== 'all') return currentModuleId.value
  return store.modules[0]?.id
}

function buildDataDef() {
  if (capForm.capType === 'prop') {
    const dd = { dataType: capForm.dataType, accessMode: capForm.accessMode, defaultVal: capForm.defaultVal }
    if (capForm.dataType === 'enum') {
      dd.enumValues = capForm.enumValues.filter(ev => ev.name.trim())
    } else if (['int', 'double'].includes(capForm.dataType)) {
      dd.min = capForm.min; dd.max = capForm.max; dd.step = capForm.step; dd.unit = capForm.unit
    } else if (capForm.dataType === 'boolean') {
      dd.trueLabel = capForm.trueLabel; dd.falseLabel = capForm.falseLabel
    } else if (capForm.dataType === 'string') {
      dd.limit = capForm.maxLength
    } else if (capForm.dataType === 'array') {
      dd.elementType = capForm.elementType; dd.maxLength = capForm.arrayCount
      if (capForm.elementType === 'struct') dd.fields = capForm.fields.filter(f => f.name.trim())
    } else if (capForm.dataType === 'struct') {
      dd.fields = capForm.fields.filter(f => f.name.trim())
    }
    return dd
  }
  if (capForm.capType === 'svc') {
    return { dataType: 'service', inputParams: capForm.inputParams, outputParams: capForm.outputParams }
  }
  return { dataType: 'event', eventType: capForm.eventType, outputParams: capForm.outputParams }
}

function handleCapabilityConfirm() {
  if (!capForm.name || !capForm.name.trim()) { ElMessage.warning('请输入参数名称'); return }
  if (!capForm.identifier || !capForm.identifier.trim()) { ElMessage.warning('请输入标识符'); return }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(capForm.identifier)) { ElMessage.warning('标识符格式不合法'); return }
  const capUnique = isCapIdentifierUnique(capForm.identifier, editingCapId.value || undefined)
    && isCustomCapIdentifierUnique(capForm.identifier, editingCapId.value || undefined)
  if (!capUnique) {
    ElMessage.warning('能力标识符已存在，请更换'); return
  }
  if (capForm.capType === 'prop') {
    if (capForm.dataType === 'enum' && capForm.enumValues.filter(ev => ev.name.trim()).length < 1) {
      ElMessage.warning('枚举值至少需要一个有效条目'); return
    }
    if (['int', 'double'].includes(capForm.dataType) && capForm.max <= capForm.min) {
      ElMessage.warning('最大值必须大于最小值'); return
    }
  }
  if (capForm.capType === 'evt' && !capForm.eventType) { ElMessage.warning('请选择事件类型'); return }

  if (inDraftMode.value) {
    if (draftParams.value.some(d => d.identifier === capForm.identifier.trim())) {
      ElMessage.warning('参数标识符重复，请更换'); return
    }
    draftParams.value.push({
      capType: capForm.capType,
      name: capForm.name.trim(),
      identifier: capForm.identifier.trim(),
      descr: capForm.descr.trim(),
      dataDef: buildDataDef()
    })
    inDraftMode.value = false
    dialogVisible.value = false
    return
  }

  if (!editingCapId.value && !capForm.capItemId) {
    ElMessage.warning('请从能力项的「添加参数」进入，参数必须归属于某个能力项'); return
  }
  const item = {
    moduleId: capFormModuleId(),
    capItemId: capForm.capItemId,
    capType: capForm.capType,
    name: capForm.name.trim(),
    identifier: capForm.identifier.trim(),
    descr: capForm.descr.trim(),
    dataDef: buildDataDef()
  }

  if (editingCapId.value) {
    updateCapability(editingCapId.value, item)
    ElMessage.success('编辑成功')
  } else {
    addCapability(item)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

// ===== Sub parameter dialog =====
const paramDialogVisible = ref(false)
const paramFormRef = ref(null)
const editingParamTarget = ref('input')
const editingParamIdx = ref(-1)
const paramForm = reactive({
  name: '', identifier: '', dataType: 'boolean', defaultVal: '',
  min: 0, max: 100, step: 1, unit: '', maxLength: 64,
  elementType: 'int', arrayCount: 10, trueLabel: '是', falseLabel: '否',
  enumValues: [{ name: '', val: 0 }]
})

function resetParamForm() {
  Object.assign(paramForm, {
    name: '', identifier: '', dataType: 'boolean', defaultVal: '',
    min: 0, max: 100, step: 1, unit: '', maxLength: 64,
    elementType: 'int', arrayCount: 10, trueLabel: '是', falseLabel: '否',
    enumValues: [{ name: '', val: 0 }]
  })
}
function onParamDataTypeChange() {
  paramForm.defaultVal = ''
  if (paramForm.dataType === 'double' && paramForm.step === 1) paramForm.step = 0.1
  if (paramForm.dataType === 'int' && paramForm.step < 1) paramForm.step = 1
}

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
  const p = capForm[target + 'Params'][idx]
  paramForm.name = p.name; paramForm.identifier = p.identifier; paramForm.dataType = p.dataType || 'boolean'
  paramForm.defaultVal = p.defaultVal || ''
  if (['int', 'double'].includes(p.dataType)) {
    paramForm.min = p.min || 0; paramForm.max = p.max || 100; paramForm.step = p.step || (p.dataType === 'double' ? 0.1 : 1); paramForm.unit = p.unit || ''
  } else {
    paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
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

function buildParam() {
  const p = {
    name: paramForm.name.trim(),
    identifier: paramForm.identifier.trim(),
    dataType: paramForm.dataType,
    defaultVal: paramForm.defaultVal
  }
  if (['int', 'double'].includes(paramForm.dataType)) {
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
    if (editingParamIdx.value >= 0) capForm.fields[editingParamIdx.value] = param
    else capForm.fields.push(param)
  } else {
    const key = editingParamTarget.value + 'Params'
    if (editingParamIdx.value >= 0) capForm[key][editingParamIdx.value] = param
    else capForm[key].push(param)
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
  const f = capForm.fields[idx]
  paramForm.name = f.name; paramForm.identifier = f.identifier; paramForm.dataType = f.dataType || 'boolean'
  paramForm.defaultVal = f.defaultVal || ''
  if (['int', 'double'].includes(f.dataType)) {
    paramForm.min = f.min || 0; paramForm.max = f.max || 100; paramForm.step = f.step || (f.dataType === 'double' ? 0.1 : 1); paramForm.unit = f.unit || ''
  }
  paramForm.maxLength = f.maxLength || 64
  paramForm.elementType = 'int'; paramForm.arrayCount = 10
  paramForm.trueLabel = f.trueLabel || '是'; paramForm.falseLabel = f.falseLabel || '否'
  paramForm.enumValues = f.enumValues ? JSON.parse(JSON.stringify(f.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}

</script>

<style scoped>
.stitch-table :deep(.el-table__expanded-cell) {
  padding: 10px 16px 12px 50px !important;
  background: #f8fafc;
}
.param-panel :deep(.el-table) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.param-panel :deep(th.el-table__cell) {
  background: #f8fafc !important;
}
.cell-name { font-size: 12px; font-weight: 500; color: #0f172a; }
.cell-item-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.cell-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569; }
.cell-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; }
.cell-module, .cell-datatype { font-size: 12px; color: #475569; }
.cell-def { font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; }
.cell-desc { font-size: 12px; color: #64748b; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
.param-empty { padding: 22px 0; text-align: center; font-size: 12px; color: #94a3b8; }
.draft-param {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px; margin-bottom: 6px;
  border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc;
}
.param-list { width: 100%; }
.param-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; background: #fff;
}
.param-info { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.param-name { font-size: 12px; font-weight: 500; color: #0f172a; }
.param-meta { font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
</style>
