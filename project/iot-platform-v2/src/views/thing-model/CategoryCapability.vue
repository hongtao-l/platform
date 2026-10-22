<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">

    <!-- ===== Main ===== -->
    <main class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      <div class="px-4 pt-4">
        <PageBackBar class="mb-2" title="类目能力详情" :subtitle="categoryName" back-label="返回类目" @back="$router.push('/thing-model-new/category')" />
      </div>
      <div class="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2.5">
          <button class="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all" @click="openImportDialog">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" /></svg>
            <span>关联能力</span>
          </button>
          <div class="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-0.5 rounded-lg text-xs">
            <button
              class="px-2.5 py-1 rounded-md transition-all"
              :class="typeFilter === 'all' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'all'"
            >全部 ({{ linkedCapTree.length }})</button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="typeFilter === 'prop' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'prop'"
            ><span class="w-1.5 h-1.5 rounded-full bg-sky-500" /><span>属性 ({{ typeCounts.prop }})</span></button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="typeFilter === 'svc' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'svc'"
            ><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span>服务 ({{ typeCounts.svc }})</span></button>
            <button
              class="px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
              :class="typeFilter === 'evt' ? 'font-semibold text-slate-900 bg-white shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900'"
              @click="typeFilter = 'evt'"
            ><span class="w-1.5 h-1.5 rounded-full bg-amber-500" /><span>事件 ({{ typeCounts.evt }})</span></button>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="relative w-52 sm:w-64">
            <input v-model="searchText" class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all" placeholder="搜索名称 / Identifier..." />
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </div>
          <button class="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="重置" @click="resetFilters">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 m-4 mt-3 flex bg-white border border-slate-200 rounded-lg overflow-hidden">
        <!-- 模块筛选 -->
        <aside class="w-56 border-r border-slate-200 bg-slate-50 flex flex-col flex-shrink-0 select-none">
          <div class="p-3.5 border-b border-slate-200/80 bg-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-sky-600" />
                <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wide">模块</h2>
              </div>
              <span class="text-[10px] font-mono text-slate-400">{{ linkedCaps.length }}</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed mt-1.5 truncate">仅展示已绑定能力 · {{ displayModules.length }} 个模块</p>
          </div>

          <div class="p-2.5 border-b border-slate-200/70">
            <div class="relative">
              <input v-model="moduleSearch" class="w-full pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500" placeholder="搜索模块..." />
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
            <button
              class="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all"
              :class="currentModuleId === 'all' ? 'font-semibold text-slate-800 bg-white border border-slate-200/80 shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white'"
              @click="currentModuleId = 'all'"
            >
              <div class="flex items-center space-x-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="currentModuleId === 'all' ? 'bg-sky-500' : 'bg-slate-300'" />
                <span>全部模块</span>
              </div>
              <span class="text-[10px] font-mono" :class="currentModuleId === 'all' ? 'text-sky-700' : 'text-slate-400'">{{ linkedCaps.length }}</span>
            </button>
            <button
              v-for="m in filteredModules"
              :key="m.id"
              class="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all group"
              :class="currentModuleId === m.id ? 'font-semibold text-slate-800 bg-white border border-slate-200/80 shadow-2xs' : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-white'"
              @click="currentModuleId = m.id"
            >
              <div class="flex items-center space-x-1.5 truncate min-w-0">
                <span class="w-1 h-1 rounded-full flex-shrink-0" :class="currentModuleId === m.id ? 'bg-sky-500' : 'bg-slate-300 group-hover:bg-sky-500'" />
                <span class="truncate">{{ m.name }}</span>
              </div>
              <span class="text-[10px] font-mono text-slate-400 group-hover:text-slate-600">{{ moduleCounts[m.id] || 0 }}</span>
            </button>
            <div v-if="!filteredModules.length" class="px-2 py-4 text-[11px] text-slate-400 text-center">该类目暂无可展示模块</div>
          </div>
        </aside>

        <div class="flex-1 overflow-auto">
        <el-table :data="filteredCapTree" row-key="id" class="stitch-table">
          <el-table-column type="expand" width="44">
            <template #default="{ row }">
              <div class="param-panel">
                <el-table :data="row.params" size="small">
                  <el-table-column label="参数名称" min-width="140">
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
                  <el-table-column label="描述" min-width="140" show-overflow-tooltip>
                    <template #default="{ row: p }"><span class="cell-desc">{{ p.descr || '—' }}</span></template>
                  </el-table-column>
                  <el-table-column label="操作" width="130" align="right">
                    <template #default="{ row: p }">
                      <div class="row-actions">
                        <button class="link-action" @click="openEditCap(p)">编辑</button>
                        <button class="link-danger" @click="handleRemoveCap(p)">移除</button>
                      </div>
                    </template>
                  </el-table-column>
                  <template #empty><div class="param-empty">暂无参数</div></template>
                </el-table>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" width="90">
            <template #default="{ row }"><span :class="['type-tag', typeTagCls(row.capType)]">{{ typeLabel(row.capType) }}</span></template>
          </el-table-column>
          <el-table-column label="能力项名称" min-width="220">
            <template #default="{ row }"><span class="cell-item-name">{{ row.name }}</span></template>
          </el-table-column>
          <el-table-column label="能力项ID" min-width="200">
            <template #default="{ row }"><code class="cell-id">{{ row.identifier || '—' }}</code></template>
          </el-table-column>
          <el-table-column label="所属模块" min-width="170">
            <template #default="{ row }"><span class="cell-module">{{ row.moduleName || '—' }}</span></template>
          </el-table-column>
          <el-table-column label="参数数量" width="110" align="center">
            <template #default="{ row }"><span class="text-xs text-slate-500">{{ row.paramCount }} 个</span></template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="right">
            <template #default="{ row }">
              <div class="row-actions">
                <button class="link-danger" @click="handleRemoveCapItem(row)">移除</button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-box">
              <span>该类目暂无绑定能力</span>
              <button class="link-action" @click="openImportDialog">+ 关联能力</button>
            </div>
          </template>
        </el-table>
        </div>
      </div>

      <footer class="h-12 border-t border-slate-200 bg-white px-5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span>共 <strong class="font-semibold text-slate-700">{{ filteredCapTree.length }}</strong> 个能力项，<strong class="font-semibold text-slate-700">{{ linkedCaps.length }}</strong> 个参数</span>
        <span class="font-mono text-[11px] text-slate-400">类目 #{{ categoryId }}</span>
      </footer>
    </main>


    <!-- ===== Import dialog ===== -->
    <el-dialog v-model="importDialogVisible" title="关联能力" width="960px" :close-on-click-modal="false" top="3vh">
      <div class="flex items-center gap-2 mb-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">标准能力</span>
        <span class="text-[11px] text-slate-400">选择后将关联到「{{ categoryName }}」</span>
      </div>
      <div class="grid grid-cols-[1fr_48px_1fr] gap-3" style="height: 440px">
        <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div class="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span class="text-xs font-semibold text-slate-700">可选能力</span>
            <span v-if="importCheckedIds.length" class="text-[11px] text-slate-500">已选 <span class="font-mono font-semibold text-sky-700">{{ importCheckedIds.length }}</span> 个</span>
          </div>
          <div class="p-2 border-b border-slate-100 flex-shrink-0">
            <el-input v-model="importSearchText" placeholder="搜索能力名称或标识" clearable size="small" />
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <div v-if="!importAvailableByModule.length" class="text-[11px] text-slate-400 py-8 text-center">暂无可关联的能力</div>
            <div v-for="mod in importAvailableByModule" :key="mod.id" class="rounded-md border border-slate-200 overflow-hidden">
              <div class="flex items-center gap-2 px-2 py-1.5 bg-slate-50 cursor-pointer hover:bg-slate-100" @click="toggleLeftModuleExpand(mod.id)">
                <svg class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-90': expandedLeftModules.includes(mod.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                <el-checkbox :model-value="isModuleAllChecked(mod)" :indeterminate="isModuleIndeterminate(mod)" @change="toggleModuleAllCheck(mod)" @click.stop />
                <span class="text-xs font-medium text-slate-700 truncate">{{ mod.name }}</span>
                <span class="ml-auto text-[10px] font-mono text-slate-400">{{ mod.caps.length }} 个能力</span>
              </div>
              <div v-show="expandedLeftModules.includes(mod.id)" class="divide-y divide-slate-100">
                <label v-for="cap in mod.caps" :key="cap.id" class="flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-slate-50" :class="{ hidden: !isImportCapVisible(cap) }">
                  <el-checkbox :model-value="importCheckedIds.includes(cap.id)" @change="toggleImportCheck(cap.id)" />
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      <span class="text-xs font-medium text-slate-800">{{ cap.name }}</span>
                    </div>
                    <div class="font-mono text-[10px] text-slate-400 mt-0.5">{{ cap.identifier }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-2">
          <el-button size="small" :disabled="!importCheckedIds.length" @click="transferToRight">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </el-button>
          <el-button size="small" :disabled="!importSelectedIds.length" @click="transferToLeft">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
          </el-button>
        </div>

        <div class="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div class="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <span class="text-xs font-semibold text-slate-700">待关联</span>
            <span class="text-[11px] font-mono text-slate-500">{{ importSelectedIds.length }} 项</span>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <div v-if="!importSelectedIds.length" class="text-[11px] text-slate-400 py-8 text-center">请从左侧勾选能力后点击 → 添加</div>
            <div v-for="mod in importSelectedByModule" :key="mod.id" class="rounded-md border border-slate-200 overflow-hidden">
              <div class="flex items-center gap-2 px-2 py-1.5 bg-slate-50 cursor-pointer" @click="toggleModuleExpand(mod.id)">
                <svg class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-90': expandedModules.includes(mod.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                <span class="text-xs font-medium text-slate-700">{{ mod.name }}</span>
                <span class="ml-auto text-[10px] font-mono text-slate-400">{{ mod.caps.length }} 个能力</span>
              </div>
              <div v-show="expandedModules.includes(mod.id)" class="divide-y divide-slate-100">
                <div v-for="cap in mod.caps" :key="cap.id" class="flex items-start gap-2 px-3 py-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span :class="['type-tag', typeTagCls(cap.capType)]">{{ typeLabel(cap.capType) }}</span>
                      <span class="text-xs font-medium text-slate-800">{{ cap.name }}</span>
                    </div>
                    <div class="font-mono text-[10px] text-slate-400 mt-0.5">{{ cap.identifier }}</div>
                  </div>
                  <button class="link-danger" @click="removeFromSelected(cap.id)">移除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importSelectedIds.length" @click="handleImportConfirm">关联（{{ importSelectedIds.length }}）</el-button>
      </template>
    </el-dialog>

    <!-- ===== Edit capability params ===== -->
    <el-dialog v-model="editDialogVisible" title="编辑能力参数" width="860px" :close-on-click-modal="false" top="3vh">
      <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div class="flex items-center space-x-2">
          <h3 class="text-sm font-bold text-slate-900">{{ editCap?.name }}</h3>
        </div>
        <span class="font-mono text-[11px] text-slate-400">{{ editCap?.identifier }}</span>
      </div>

      <el-form v-if="editCap" label-width="110px">
        <el-form-item label="能力名称">
          <el-input :model-value="editCap.name" disabled />
        </el-form-item>
        <el-form-item label="标识符">
          <el-input :model-value="editCap.identifier" disabled class="!font-mono" />
        </el-form-item>
        <template v-if="editCap.capType === 'prop'">
          <el-form-item label="数据类型">
            <el-input :model-value="dataTypeLabel({ capType: 'prop', dataDef: editForm })" disabled />
          </el-form-item>
          <el-form-item label="读写模式">
            <el-select v-model="editForm.accessMode" style="width:100%">
              <el-option label="读写 (Read/Write)" value="rw" />
              <el-option label="只读 (Read Only)" value="ro" />
            </el-select>
          </el-form-item>
        </template>

        <div class="step-divider my-4"><span>数据定义</span></div>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'enum'">
          <el-form-item label="枚举值定义" required>
            <div class="w-full space-y-2">
              <div v-for="(ev, i) in editForm.enumValues" :key="i" class="flex items-center gap-2">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded" @click="editForm.enumValues.splice(i, 1)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                </button>
              </div>
              <button class="inline-flex items-center space-x-1 px-3 py-1 text-xs text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded" @click="editForm.enumValues.push({ name: '', val: editForm.enumValues.length })">
                <span class="text-sm font-bold leading-none">+</span><span>添加枚举值</span>
              </button>
            </div>
          </el-form-item>
          <el-form-item label="默认值"><el-input v-model="editForm.defaultVal" placeholder="请输入默认枚举值的 Value" /></el-form-item>
        </template>

        <template v-if="editCap.capType === 'prop' && ['int', 'double'].includes(editForm.dataType)">
          <el-form-item label="取值范围" required>
            <div class="flex items-center gap-2 w-full">
              <el-input-number v-model="editForm.min" :max="editForm.max - 1" :step="editForm.dataType === 'double' ? 0.1 : 1" style="flex:1" />
              <span class="text-slate-400 text-xs">~</span>
              <el-input-number v-model="editForm.max" :min="editForm.min + 1" :step="editForm.dataType === 'double' ? 0.1 : 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长"><el-input-number v-model="editForm.step" :min="editForm.dataType === 'double' ? 0.01 : 1" :step="editForm.dataType === 'double' ? 0.1 : 1" style="width:150px" /></el-form-item>
          <el-form-item label="单位"><el-input v-model="editForm.unit" style="width:150px" /></el-form-item>
          <el-form-item label="默认值"><el-input-number v-model="editForm.defaultVal" :min="editForm.min" :max="editForm.max" :step="editForm.dataType === 'double' ? 0.1 : 1" style="width:200px" /></el-form-item>
        </template>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="flex gap-3 w-full">
              <div class="flex-1"><span class="form-hint !mt-0 mb-1">true 标签</span><el-input v-model="editForm.trueLabel" /></div>
              <div class="flex-1"><span class="form-hint !mt-0 mb-1">false 标签</span><el-input v-model="editForm.falseLabel" /></div>
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
          <el-form-item label="最大长度（字节）" required><el-input-number v-model="editForm.maxLength" :min="1" :max="65535" style="width:150px" /></el-form-item>
          <el-form-item label="默认值"><el-input v-model="editForm.defaultVal" placeholder="请输入默认值" /></el-form-item>
        </template>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="editForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Struct (结构体)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="元素个数" required><el-input-number v-model="editForm.arrayCount" :min="1" :max="1000" style="width:150px" /></el-form-item>
          <template v-if="editForm.elementType === 'struct'">
            <el-form-item label="元素结构体字段">
              <div class="w-full">
                <div class="param-list">
                  <div v-for="(f, i) in editForm.fields" :key="i" class="param-item">
                    <div class="param-info"><span class="param-name">{{ f.name || '未命名' }}</span><span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span></div>
                    <button class="link-action" @click="openEditStructField(i)">编辑</button>
                    <button class="link-danger" @click="editForm.fields.splice(i, 1)">删除</button>
                  </div>
                  <div v-if="!editForm.fields.length" class="param-empty">暂无字段</div>
                </div>
                <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
              </div>
            </el-form-item>
          </template>
        </template>

        <template v-if="editCap.capType === 'prop' && editForm.dataType === 'struct'">
          <el-form-item label="结构体字段">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(f, i) in editForm.fields" :key="i" class="param-item">
                  <div class="param-info"><span class="param-name">{{ f.name || '未命名' }}</span><span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span></div>
                  <button class="link-action" @click="openEditStructField(i)">编辑</button>
                  <button class="link-danger" @click="editForm.fields.splice(i, 1)">删除</button>
                </div>
                <div v-if="!editForm.fields.length" class="param-empty">暂无字段</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'svc'">
          <el-form-item label="输入参数">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(p, i) in editForm.inputParams" :key="i" class="param-item">
                  <div class="param-info"><span class="param-name">{{ p.name || '未命名' }}</span><span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span></div>
                  <button class="link-action" @click="openEditParam('input', i)">编辑</button>
                  <button class="link-danger" @click="editForm.inputParams.splice(i, 1)">删除</button>
                </div>
                <div v-if="!editForm.inputParams.length" class="param-empty">暂无输入参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('input')">+ 添加参数</el-button>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(p, i) in editForm.outputParams" :key="i" class="param-item">
                  <div class="param-info"><span class="param-name">{{ p.name || '未命名' }}</span><span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span></div>
                  <button class="link-action" @click="openEditParam('output', i)">编辑</button>
                  <button class="link-danger" @click="editForm.outputParams.splice(i, 1)">删除</button>
                </div>
                <div v-if="!editForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCap.capType === 'evt'">
          <el-form-item label="事件类型" required>
            <div class="seg-control">
              <span class="seg-item !px-3" :class="{ active: editForm.eventType === 'info' }" @click="editForm.eventType = 'info'">信息 (Info)</span>
              <span class="seg-item !px-3" :class="{ active: editForm.eventType === 'alarm' }" @click="editForm.eventType = 'alarm'">告警 (Alarm)</span>
              <span class="seg-item !px-3" :class="{ active: editForm.eventType === 'fault' }" @click="editForm.eventType = 'fault'">故障 (Fault)</span>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div class="w-full">
              <div class="param-list">
                <div v-for="(p, i) in editForm.outputParams" :key="i" class="param-item">
                  <div class="param-info"><span class="param-name">{{ p.name || '未命名' }}</span><span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span></div>
                  <button class="link-action" @click="openEditParam('output', i)">编辑</button>
                  <button class="link-danger" @click="editForm.outputParams.splice(i, 1)">删除</button>
                </div>
                <div v-if="!editForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <div class="step-divider my-4"><span>描述</span></div>
        <el-form-item label="描述">
          <el-input v-model="editForm.descr" type="textarea" placeholder="请输入能力描述" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditConfirm">保存</el-button>
      </template>
    </el-dialog>

    <!-- ===== Sub parameter dialog ===== -->
    <el-dialog v-model="paramDialogVisible" :title="paramDialogTitle" width="620px" :close-on-click-modal="false">
      <el-form ref="paramFormRef" :model="paramForm" label-width="110px">
        <el-form-item label="参数名称" required><el-input v-model="paramForm.name" placeholder="请输入参数名称" /></el-form-item>
        <el-form-item label="参数标识" required><el-input v-model="paramForm.identifier" placeholder="例如 result" class="!font-mono" /></el-form-item>
        <el-form-item label="数据类型" required>
          <el-select v-model="paramForm.dataType" style="width:100%">
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
          <el-form-item label="单位"><el-input v-model="paramForm.unit" style="width:150px" /></el-form-item>
        </template>
        <template v-if="paramForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）"><el-input-number v-model="paramForm.maxLength" :min="1" :max="65535" style="width:150px" /></el-form-item>
        </template>
        <template v-if="paramForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="flex gap-3 w-full">
              <div class="flex-1"><span class="form-hint !mt-0 mb-1">true 标签</span><el-input v-model="paramForm.trueLabel" placeholder="开启" /></div>
              <div class="flex-1"><span class="form-hint !mt-0 mb-1">false 标签</span><el-input v-model="paramForm.falseLabel" placeholder="关闭" /></div>
            </div>
          </el-form-item>
        </template>
        <template v-if="paramForm.dataType === 'enum'">
          <el-form-item label="枚举值定义">
            <div class="w-full space-y-2">
              <div v-for="(ev, i) in paramForm.enumValues" :key="i" class="flex items-center gap-2">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded" @click="paramForm.enumValues.splice(i, 1)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                </button>
              </div>
              <button class="inline-flex items-center space-x-1 px-3 py-1 text-xs text-slate-600 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded" @click="paramForm.enumValues.push({ name: '', val: paramForm.enumValues.length })">
                <span class="text-sm font-bold leading-none">+</span><span>添加枚举值</span>
              </button>
            </div>
          </el-form-item>
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
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  store, getCategoryLinkedCapIds, linkCapToCategory, unlinkCapFromCategory, updateCapability
} from '@/data/thing-model'
import PageBackBar from '@/components/layout/PageBackBar.vue'

const route = useRoute()
const categoryId = Number(route.params.id)

const categoryName = computed(() => {
  const cat = store.categories.find(c => c.id === categoryId)
  return cat ? cat.name : '未知类目'
})

// ===== Linked data =====
const linkedCaps = computed(() => {
  const capIds = new Set(getCategoryLinkedCapIds(categoryId))
  return store.capabilities.filter(c => capIds.has(c.id))
})

const currentModuleId = ref('all')
const moduleSearch = ref('')
const searchText = ref('')
const typeFilter = ref('all')

const displayModules = computed(() => {
  const moduleIds = new Set(linkedCaps.value.map(c => c.moduleId))
  return store.modules.filter(m => moduleIds.has(m.id))
})
const moduleCounts = computed(() => {
  const map = {}
  linkedCaps.value.forEach(c => { map[c.moduleId] = (map[c.moduleId] || 0) + 1 })
  return map
})
const filteredModules = computed(() => {
  const kw = moduleSearch.value.trim().toLowerCase()
  if (!kw) return displayModules.value
  return displayModules.value.filter(m => m.name.toLowerCase().includes(kw) || m.identifier.toLowerCase().includes(kw))
})

const filteredCapabilities = computed(() => {
  let list = linkedCaps.value
  if (currentModuleId.value !== 'all') list = list.filter(cap => cap.moduleId === currentModuleId.value)
  return list.map(cap => {
    const mod = store.modules.find(m => m.id === cap.moduleId)
    return { ...cap, _moduleName: mod ? mod.name : '—', _moduleId: cap.moduleId }
  })
})

const linkedCapTree = computed(() => {
  const map = new Map()
  filteredCapabilities.value.forEach(c => {
    const key = c.capItemId ?? '_none'
    if (!map.has(key)) {
      const it = store.capItems.find(x => x.id === c.capItemId)
      map.set(key, {
        id: 'item_' + key,
        capType: it?.capType || c.capType || 'prop',
        name: it?.name || '未归属参数',
        identifier: it?.identifier || '—',
        moduleName: c._moduleName || '—',
        params: [],
        paramCount: 0
      })
    }
    const g = map.get(key)
    g.params.push(c)
    g.paramCount = g.params.length
  })
  return [...map.values()]
})

const filteredCapTree = computed(() => {
  let list = linkedCapTree.value
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
  const c = { prop: 0, svc: 0, evt: 0 }
  linkedCapTree.value.forEach(r => { if (c[r.capType] != null) c[r.capType]++ })
  return c
})
function resetFilters() {
  searchText.value = ''
  typeFilter.value = 'all'
  currentModuleId.value = 'all'
}

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
  if (cap.capType === 'svc') return `入参${(cap.dataDef.inputParams || []).length}个, 出参${(cap.dataDef.outputParams || []).length}个`
  if (cap.capType === 'evt') {
    const dd = cap.dataDef
    const et = dd.eventType === 'alarm' ? '告警' : dd.eventType === 'fault' ? '故障' : '信息'
    return `${et}事件, 出参${(dd.outputParams || []).length}个`
  }
  return ''
}

// ===== Import =====
const importDialogVisible = ref(false)
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])

function buildModuleGroups(capList) {
  const moduleMap = {}
  const orphanCaps = []
  capList.forEach(cap => {
    const mod = store.modules.find(m => m.id === cap.moduleId)
    if (mod) {
      if (!moduleMap[cap.moduleId]) moduleMap[cap.moduleId] = { mod, caps: [] }
      moduleMap[cap.moduleId].caps.push(cap)
    } else {
      orphanCaps.push(cap)
    }
  })
  const groups = store.modules
    .filter(m => moduleMap[m.id]?.caps.length)
    .map(m => ({ id: m.id, name: m.name + ' (' + m.identifier + ')', caps: moduleMap[m.id].caps }))
  if (orphanCaps.length) groups.push({ id: '_other', name: '其他', caps: orphanCaps })
  return groups
}

const importAvailableByModule = computed(() => {
  const linkedIds = new Set(getCategoryLinkedCapIds(categoryId))
  const excludedIds = new Set([...linkedIds, ...importSelectedIds.value])
  return buildModuleGroups(store.capabilities.filter(c => !excludedIds.has(c.id)))
})
const importSelectedByModule = computed(() => {
  const caps = importSelectedIds.value.map(id => store.capabilities.find(c => c.id === id)).filter(Boolean)
  return buildModuleGroups(caps)
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
function toggleModuleExpand(modId) {
  const idx = expandedModules.value.indexOf(modId)
  if (idx > -1) expandedModules.value.splice(idx, 1)
  else expandedModules.value.push(modId)
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
function transferToRight() {
  const newModIds = new Set()
  importCheckedIds.value.forEach(id => {
    if (!importSelectedIds.value.includes(id)) {
      importSelectedIds.value.push(id)
      const cap = store.capabilities.find(c => c.id === id)
      if (cap) newModIds.add(cap.moduleId)
    }
  })
  newModIds.forEach(mid => { if (!expandedModules.value.includes(mid)) expandedModules.value.push(mid) })
  importCheckedIds.value = []
}
function transferToLeft() { importSelectedIds.value = [] }
function removeFromSelected(id) { importSelectedIds.value = importSelectedIds.value.filter(i => i !== id) }

function openImportDialog() {
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedModules.value = []
  expandedLeftModules.value = store.modules.map(m => m.id)
  importDialogVisible.value = true
}
function handleImportConfirm() {
  importSelectedIds.value.forEach(capId => linkCapToCategory(categoryId, capId))
  ElMessage.success(`已关联 ${importSelectedIds.value.length} 个能力`)
  importDialogVisible.value = false
}

// ===== Edit params =====
const editDialogVisible = ref(false)
const editCap = ref(null)
const editForm = reactive({
  dataType: '', enumValues: [], min: 0, max: 100, step: 1, unit: '',
  trueLabel: '', falseLabel: '', maxLength: 64,
  elementType: 'int', arrayCount: 100, fields: [],
  eventType: '', inputParams: [], outputParams: [],
  descr: '', accessMode: 'rw', defaultVal: ''
})

function openEditCap(cap) {
  // 参数统一按属性内容编辑；旧的服务/事件参数转为属性默认配置
  editCap.value = { ...cap, capType: 'prop' }
  const dd = cap.dataDef || {}
  editForm.descr = cap.descr || ''
  const propTypes = ['enum', 'int', 'double', 'boolean', 'string', 'array', 'struct']
  if (cap.capType === 'prop' && propTypes.includes(dd.dataType)) {
    editForm.dataType = dd.dataType
    editForm.accessMode = dd.accessMode || 'rw'
    editForm.defaultVal = dd.defaultVal || ''
    editForm.enumValues = dd.enumValues ? JSON.parse(JSON.stringify(dd.enumValues)) : [{ name: '', val: 0 }]
    editForm.min = dd.min || 0; editForm.max = dd.max || 100; editForm.step = dd.step || 1; editForm.unit = dd.unit || ''
    editForm.trueLabel = dd.trueLabel || '开启'; editForm.falseLabel = dd.falseLabel || '关闭'
    editForm.maxLength = dd.limit || 64
    editForm.elementType = dd.elementType || 'int'; editForm.arrayCount = dd.maxLength || 100
    editForm.fields = dd.fields ? JSON.parse(JSON.stringify(dd.fields)) : []
  } else {
    editForm.dataType = 'enum'; editForm.accessMode = 'rw'; editForm.defaultVal = ''
    editForm.enumValues = [{ name: '', val: 0 }]
    editForm.min = 0; editForm.max = 100; editForm.step = 1; editForm.unit = ''
    editForm.trueLabel = '开启'; editForm.falseLabel = '关闭'
    editForm.maxLength = 64; editForm.elementType = 'int'; editForm.arrayCount = 100; editForm.fields = []
  }
  editDialogVisible.value = true
}
function buildEditDataDef() {
  const cap = editCap.value
  if (cap.capType === 'prop') {
    const dd = { dataType: editForm.dataType, accessMode: editForm.accessMode, defaultVal: editForm.defaultVal }
    if (editForm.dataType === 'enum') dd.enumValues = editForm.enumValues.filter(ev => ev.name.trim())
    else if (['int', 'double'].includes(editForm.dataType)) { dd.min = editForm.min; dd.max = editForm.max; dd.step = editForm.step; dd.unit = editForm.unit }
    else if (editForm.dataType === 'boolean') { dd.trueLabel = editForm.trueLabel; dd.falseLabel = editForm.falseLabel }
    else if (editForm.dataType === 'string') dd.limit = editForm.maxLength
    else if (editForm.dataType === 'array') {
      dd.elementType = editForm.elementType; dd.maxLength = editForm.arrayCount
      if (editForm.elementType === 'struct') dd.fields = editForm.fields.filter(f => f.name.trim())
    } else if (editForm.dataType === 'struct') dd.fields = editForm.fields.filter(f => f.name.trim())
    return dd
  }
  if (cap.capType === 'svc') return { dataType: 'service', inputParams: editForm.inputParams, outputParams: editForm.outputParams }
  return { dataType: 'event', eventType: editForm.eventType, outputParams: editForm.outputParams }
}
function handleEditConfirm() {
  const cap = editCap.value
  if (!cap) return
  updateCapability(cap.id, {
    moduleId: cap.moduleId,
    capItemId: cap.capItemId,
    capType: cap.capType,
    name: cap.name,
    identifier: cap.identifier,
    descr: editForm.descr.trim(),
    dataDef: buildEditDataDef()
  })
  ElMessage.success('参数已更新')
  editDialogVisible.value = false
}
function handleRemoveCap(cap) {
  ElMessageBox.confirm(
    `确定从该类目移除能力「${cap.name}」？能力本身不会被删除。`,
    '移除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    unlinkCapFromCategory(categoryId, cap.id)
    ElMessage.success('已移除')
  }).catch(() => {})
}

function handleRemoveCapItem(row) {
  ElMessageBox.confirm(
    `确定从该类目移除能力项「${row.name}」及其 ${row.paramCount} 个参数？`,
    '移除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    row.params.forEach(p => unlinkCapFromCategory(categoryId, p.id))
    ElMessage.success('已移除')
  }).catch(() => {})
}

// ===== Param dialog =====
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
const paramDialogTitle = computed(() => {
  if (editingParamTarget.value === 'field') return editingParamIdx.value >= 0 ? '编辑结构体字段' : '添加结构体字段'
  const prefix = editingParamTarget.value === 'input' ? '输入' : '输出'
  return editingParamIdx.value >= 0 ? `编辑${prefix}参数` : `添加${prefix}参数`
})
function resetParamForm() {
  Object.assign(paramForm, {
    name: '', identifier: '', dataType: 'boolean', defaultVal: '',
    min: 0, max: 100, step: 1, unit: '', maxLength: 64,
    elementType: 'int', arrayCount: 10, trueLabel: '是', falseLabel: '否',
    enumValues: [{ name: '', val: 0 }]
  })
}
function openAddParam(target) {
  editingParamTarget.value = target; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}
function openEditParam(target, idx) {
  editingParamTarget.value = target; editingParamIdx.value = idx
  const p = editForm[target + 'Params'][idx]
  paramForm.name = p.name; paramForm.identifier = p.identifier; paramForm.dataType = p.dataType || 'boolean'
  if (['int', 'double'].includes(p.dataType)) {
    paramForm.min = p.min || 0; paramForm.max = p.max || 100; paramForm.step = p.step || (p.dataType === 'double' ? 0.1 : 1); paramForm.unit = p.unit || ''
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
  const p = { name: paramForm.name.trim(), identifier: paramForm.identifier.trim(), dataType: paramForm.dataType }
  if (['int', 'double'].includes(paramForm.dataType)) { p.min = paramForm.min; p.max = paramForm.max; p.step = paramForm.step; p.unit = paramForm.unit }
  else if (paramForm.dataType === 'string') p.maxLength = paramForm.maxLength
  else if (paramForm.dataType === 'boolean') { p.trueLabel = paramForm.trueLabel; p.falseLabel = paramForm.falseLabel }
  else if (paramForm.dataType === 'enum') p.enumValues = paramForm.enumValues.filter(ev => ev.name.trim())
  else if (paramForm.dataType === 'array') { p.elementType = paramForm.elementType; p.maxLength = paramForm.arrayCount }
  return p
}
function handleParamConfirm() {
  if (!paramForm.name.trim() || !paramForm.identifier.trim()) {
    ElMessage.warning('请填写完整参数信息'); return
  }
  const param = buildParam()
  if (editingParamTarget.value === 'field') {
    if (editingParamIdx.value >= 0) editForm.fields[editingParamIdx.value] = param
    else editForm.fields.push(param)
  } else {
    const key = editingParamTarget.value + 'Params'
    if (editingParamIdx.value >= 0) editForm[key][editingParamIdx.value] = param
    else editForm[key].push(param)
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
.cell-name { font-size: 12px; font-weight: 500; color: #0f172a; }
.cell-item-name { font-size: 12px; font-weight: 600; color: #0f172a; }
.cell-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569; }
.cell-module, .cell-datatype { font-size: 12px; color: #475569; }
.cell-def { font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; }
.cell-desc { font-size: 12px; color: #64748b; }
.row-actions { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
.param-empty { padding: 22px 0; text-align: center; font-size: 12px; color: #94a3b8; }
.param-list { width: 100%; }
.param-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; background: #fff; }
.param-info { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.param-name { font-size: 12px; font-weight: 500; color: #0f172a; }
.param-meta { font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
.param-panel :deep(.el-table) { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff; }
.param-panel :deep(th.el-table__cell) { background: #f8fafc !important; }
</style>
