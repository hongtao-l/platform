<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <div class="page-container flex-1 min-w-0 overflow-auto">
    <PageBackBar class="mb-3" title="产品详情" :subtitle="productName" back-label="返回审核" @back="goBack" />

    <div class="detail-content">
      <!-- 基本信息 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">基本信息</span>
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="产品名称">{{ product.name }}</el-descriptions-item>
          <el-descriptions-item label="产品ID">{{ product.productId }}</el-descriptions-item>
          <el-descriptions-item label="产品类目">{{ product.category }}</el-descriptions-item>
          <el-descriptions-item label="所属企业">{{ product.company }}</el-descriptions-item>
          <el-descriptions-item label="产品状态">
            <span :class="['status-tag', statusCls(product.status)]">{{ statusLabel(product.status) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="授权单价">¥{{ product.unitPrice?.toFixed(2) || '0.00' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 物模型配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">物模型配置</span>
        </div>
        <div class="config-row">
          <div class="config-info">
            <el-icon :size="20" color="#1A73E8"><SetUp /></el-icon>
            <span class="config-text">已配置 {{ thingModelCount }} 个子项</span>
          </div>
          <el-button type="primary" link @click="onViewThingModel">查看/修改</el-button>
        </div>
      </div>

      <!-- 平台服务 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">平台服务</span>
        </div>
        <div class="algo-service-section">
          <el-table :data="platformServices" stripe :span-method="platformSpanMethod">
            <el-table-column label="算法ID" width="110" align="center">
              <template #default="{ row }">
                <span :class="{ 'merged-cell': row._rowSpan > 1 }">{{ row.algoId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="算法名称" min-width="140">
              <template #default="{ row }">
                <span class="cell-name">{{ row.algoName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="能力配置" width="100" align="center">
              <template #default="{ row }">
                <el-button v-if="row.hasConfig && row._isFirstRow" size="small" text type="primary">查看</el-button>
                <span v-else-if="row._isFirstRow" class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="关联事件" width="100" align="center">
              <template #default="{ row }">
                <el-button v-if="row._isFirstRow" size="small" text type="primary">查看</el-button>
              </template>
            </el-table-column>
            <el-table-column label="服务名称" min-width="120">
              <template #default="{ row }">
                <span>{{ row.serviceName || row.algoName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务ID" width="120" align="center">
              <template #default="{ row }">
                <span :class="{ 'cell-service-id': true, 'text-muted': row.serviceId === '-' }">{{ row.serviceId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务开通方式" width="140" align="center">
              <template #default="{ row }">
                <span>{{ row.free ? '免开通' : 'APP购买开通' }}</span>
              </template>
            </el-table-column>
            <template #empty>
              <div class="empty-state">暂无数据</div>
            </template>
          </el-table>
        </div>
      </div>

      <!-- App配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">App配置</span>
        </div>
        <div class="config-row">
          <div class="config-info">
            <span class="config-text">安装指引：<em>{{ appConfig.installGuideStatus }}</em></span>
            <span class="config-divider">|</span>
            <span class="config-text">App使用范围：<em>{{ appConfig.scopeStatus }}</em></span>
          </div>
          <el-button type="primary" link @click="goToAppConfig">前往查看/修改</el-button>
        </div>
      </div>

      <!-- 语音助手配置 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">语音助手配置</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="唤醒词">{{ voiceConfig.wakeWord }}</el-descriptions-item>
          <el-descriptions-item label="支持语言">{{ voiceConfig.language }}</el-descriptions-item>
          <el-descriptions-item label="语音平台">{{ voiceConfig.platform }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-switch :model-value="voiceConfig.enabled" disabled size="small" />
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 固件版本历史 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">固件版本历史</span>
        </div>
        <el-table :data="firmwareVersions" stripe>
          <el-table-column label="版本号" prop="version" width="140" />
          <el-table-column label="发布日期" prop="releaseDate" width="120" />
          <el-table-column label="文件大小" prop="size" width="100" />
          <el-table-column label="更新内容" prop="changelog" min-width="200" show-overflow-tooltip />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <span :class="['status-tag', row.active ? 's-approved' : 's-pending']">
                {{ row.active ? '当前版本' : '历史版本' }}
              </span>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-state">暂无固件版本数据</div>
          </template>
        </el-table>
      </div>
    </div>

    <!-- 物模型配置 对话框 -->
    <el-dialog
      v-model="thingModelDialogVisible"
      title="设备配置"
      width="900px"
      top="5vh"
      :close-on-click-modal="false"
      destroy-on-close
     class="app-dialog">
          <div class="tm-config-section">
            <div class="cap-section">
                <div class="cap-section-header">
                  <span class="cap-section-title">标准能力</span>
                  <el-button size="small" type="primary">添加标准能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
            <div class="cap-section">
                <div class="cap-section-header">
                  <div>
                    <span class="cap-section-title">自定义能力</span>
                    <p class="cap-tip">您所定义的每一个功能，都与固件、APP控制台面板相关</p>
                  </div>
                  <el-button size="small" type="primary">添加自定义能力</el-button>
                </div>
                <el-table :data="[]" stripe>
                  <el-table-column label="类型" prop="type" width="80" />
                  <el-table-column label="能力名称" prop="name" min-width="140" />
                  <el-table-column label="能力标识" prop="code" width="160" />
                  <el-table-column label="数据类型" prop="dataType" width="100" />
                  <el-table-column label="数据定义" prop="dataDef" min-width="120" />
                  <el-table-column label="描述" prop="descr" min-width="140" />
                  <el-table-column label="所属模块" prop="module" width="100" />
                  <el-table-column label="操作" width="60" align="center">
                    <template #default><el-button size="small" text type="danger">删除</el-button></template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
          </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="onThingModelNext">
            {{ isLastThingModelTab ? '保存,完成' : '保存,下一步' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 关联事件 侧边抽屉 -->
    <el-drawer
      v-model="eventDrawerVisible"
      :title="'关联事件 - ' + (eventEditAlgo?.name || '')"
      direction="rtl"
      size="560px"
      :close-on-click-modal="false"
      class="event-link-drawer"
    >
      <template v-if="eventEditAlgo">
        <div class="algo-config-toolbar">
          <span class="algo-config-count">共 {{ eventOptions.length }} 个事件</span>
        </div>
        <el-table
          :data="eventOptions"
          stripe
        >
          <el-table-column label="事件ID" width="110">
            <template #default="{ row }">
              <code class="event-id-code">{{ row.id }}</code>
            </template>
          </el-table-column>
          <el-table-column label="事件名称" min-width="140">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="备注" min-width="160">
            <template #default="{ row }">{{ row.descr || '—' }}</template>
          </el-table-column>
          <el-table-column label="推送文案" min-width="160">
            <template #default="{ row }">{{ row._push?.['1'] || '—' }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-if="eventOptions.length === 0" description="暂无事件数据" :image-size="80" />
      </template>
      <template #footer>
        <el-button @click="eventDrawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>

    <!-- 算法能力配置 侧边抽屉 -->
    <el-drawer
      v-model="algoConfigDrawerVisible"
      :title="'能力配置 - ' + (algoConfigAlgo?.name || '')"
      direction="rtl"
      size="860px"
      :close-on-click-modal="false"
      class="algo-config-drawer"
    >
      <template v-if="algoConfigAlgo">
        <div class="algo-config-toolbar">
          <span class="algo-config-count">共 {{ allCapList.length }} 个能力</span>
        </div>
        <template v-if="allCapList.length">
          <div class="algo-cap-section">
            <div class="algo-cap-section-header">
              <span class="algo-cap-section-title">标准能力</span>
            </div>
            <el-table v-if="standardCapList.length" :data="standardCapList" stripe>
              <el-table-column label="类型" width="80" align="center">
                <template #default="{ row }">
                  <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="能力名称" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">{{ row.name }}</template>
              </el-table-column>
              <el-table-column label="标识" width="170" show-overflow-tooltip>
                <template #default="{ row }">{{ row.identifier }}</template>
              </el-table-column>
              <el-table-column label="数据定义" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
              </el-table-column>
            </el-table>
            <div v-else class="algo-config-empty">暂无标准能力</div>
          </div>
          <div class="algo-cap-section">
            <div class="algo-cap-section-header">
              <span class="algo-cap-section-title">自定义能力</span>
            </div>
            <el-table v-if="customCapList.length" :data="customCapList" stripe>
              <el-table-column label="类型" width="80" align="center">
                <template #default="{ row }">
                  <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="能力名称" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">{{ row.name }}</template>
              </el-table-column>
              <el-table-column label="标识" width="170" show-overflow-tooltip>
                <template #default="{ row }">{{ row.identifier }}</template>
              </el-table-column>
              <el-table-column label="数据定义" min-width="160" show-overflow-tooltip>
                <template #default="{ row }">{{ dataDefSummary(row.dataDef) }}</template>
              </el-table-column>
            </el-table>
            <div v-else class="algo-config-empty">暂无自定义能力</div>
          </div>
        </template>
        <div v-else class="algo-config-empty">暂无能力数据</div>
      </template>
      <template #footer>
        <el-button @click="algoConfigDrawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>

    <!-- 套餐绑定侧边弹窗 -->
    <el-drawer
      v-model="packageDrawerVisible"
      title="选择绑定套餐"
      direction="rtl"
      size="480px"
      :close-on-click-modal="false"
      class="package-bind-drawer"
    >
      <div class="package-list">
        <div
          v-for="pkg in packageOptions"
          :key="pkg.id"
          :class="['package-item', { active: packageDrawerRow?.boundPackage === pkg.id }]"
          @click="confirmPackageBinding(pkg.id)"
        >
          <div class="package-item-left">
            <span class="package-item-id">{{ pkg.id }}</span>
            <span class="package-item-name">{{ pkg.name }}</span>
          </div>
          <el-icon v-if="packageDrawerRow?.boundPackage === pkg.id" color="#1A73E8"><CircleCheck /></el-icon>
        </div>
      </div>
      <el-empty v-if="packageOptions.length === 0" description="暂无可用套餐" :image-size="80" />
    </el-drawer>

    <!-- 导入能力穿梭框 -->
    <el-dialog v-model="capDialogVisible" :title="capDialogTitle" width="960px" top="3vh" :close-on-click-modal="false" class="app-dialog">
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
                  :key="cap.identifier"
                  :class="['transfer-pkg-item', { selected: importCheckedIds.includes(cap.identifier), hidden: !isImportCapVisible(cap) }]"
                >
                  <el-checkbox :model-value="importCheckedIds.includes(cap.identifier)" @change="toggleImportCheck(cap.identifier)" />
                  <div class="transfer-pkg-info">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', cap.capType === 'prop' ? 'type-prop' : cap.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(cap.capType) }}</span>
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
          <el-button size="small" class="transfer-arrow-btn" :disabled="!importCheckedIds.length" @click="transferToRight">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" class="transfer-arrow-btn" :disabled="!importSelectedIds.length" @click="transferToLeft">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>

        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>待导入</span>
            <span class="transfer-count">{{ importSelectedIds.length }} 项</span>
          </div>
          <div class="transfer-panel-search-placeholder" />
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
                  :key="cap.identifier"
                  class="transfer-pkg-item selected"
                >
                  <div class="transfer-pkg-info" style="flex:1">
                    <div class="transfer-pkg-name">
                      <span :class="['type-tag', cap.capType === 'prop' ? 'type-prop' : cap.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(cap.capType) }}</span>
                      {{ cap.name }}
                    </div>
                    <div class="transfer-pkg-meta">{{ cap.identifier }}</div>
                  </div>
                  <el-button size="small" text type="danger" @click="removeFromSelected(cap.identifier)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="capDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!importSelectedIds.length" @click="handleImportConfirm">
          导入（{{ importSelectedIds.length }}）
        </el-button>
      </template>
    </el-dialog>

    <!-- 能力参数编辑/创建弹窗 -->
    <el-dialog v-model="algoCapEditVisible" :title="isAlgoCreateMode ? '创建自定义能力' : '编辑能力参数 - ' + (algoCapEditRef?.cap?.name || '')" width="860px" top="3vh" :close-on-click-modal="false" class="cap-dialog">
      <el-form v-if="isAlgoCreateMode || algoCapEditRef" label-width="100px">
        <el-form-item label="能力类型">
          <div class="type-cards">
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'prop' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && onAlgoCapTypeChange('prop')">属性</div>
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'svc' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && onAlgoCapTypeChange('svc')">服务</div>
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'evt' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && onAlgoCapTypeChange('evt')">事件</div>
          </div>
        </el-form-item>
        <el-form-item label="能力名称">
          <el-input v-if="isAlgoCreateMode" v-model="algoCapEditForm.name" placeholder="请输入能力名称" />
          <el-input v-else :model-value="algoCapEditRef?.cap?.name" disabled />
        </el-form-item>
        <el-form-item label="标识符">
          <el-input v-if="isAlgoCreateMode" v-model="algoCapEditForm.identifier" placeholder="请输入能力标识" />
          <el-input v-else :model-value="algoCapEditRef?.cap?.identifier" disabled />
        </el-form-item>

        <template v-if="(isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'prop'">
          <el-form-item label="数据类型">
            <el-select v-if="isAlgoCreateMode" v-model="algoCapEditForm.dataType" style="width:100%" @change="onAlgoDataTypeChange">
              <el-option label="枚举型 (enum)" value="enum" />
              <el-option label="数值型 (int)" value="int" />
              <el-option label="布尔型 (boolean)" value="boolean" />
              <el-option label="字符串 (string)" value="string" />
              <el-option label="数组型 (array)" value="array" />
              <el-option label="结构体型 (struct)" value="struct" />
            </el-select>
            <el-select v-else :model-value="dataTypeLabel(algoCapEditRef?.cap)" disabled style="width:100%" />
          </el-form-item>
          <el-form-item label="读写模式">
            <el-select v-if="isAlgoCreateMode" v-model="algoCapEditForm.accessMode" style="width:100%">
              <el-option label="读写 (Read/Write)" value="rw" />
              <el-option label="只读 (Read Only)" value="ro" />
            </el-select>
            <el-select v-else :model-value="algoCapEditForm.accessMode === 'ro' ? '只读 (Read Only)' : '读写 (Read/Write)'" disabled style="width:100%" />
          </el-form-item>
        </template>

        <el-form-item label="描述">
          <el-input v-model="algoCapEditForm.descr" type="textarea" placeholder="请输入能力描述" rows="2" />
        </el-form-item>

        <el-divider>数据定义</el-divider>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'enum'">
          <el-form-item label="枚举值定义" required>
            <div class="enum-list">
              <div v-for="(ev, i) in algoCapEditForm.enumValues" :key="i" class="enum-row">
                <el-input v-model="ev.name" placeholder="名称" style="flex:1" />
                <el-input-number v-model="ev.val" :min="0" style="width:100px" controls-position="right" />
                <el-button size="small" type="danger" :icon="Delete" circle @click="algoCapEditForm.enumValues.splice(i, 1)" />
              </div>
            </div>
            <el-button size="small" style="margin-top:8px" @click="algoCapEditForm.enumValues.push({ name: '', val: (algoCapEditForm.enumValues.length) })">+ 添加枚举值</el-button>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="algoCapEditForm.defaultVal" placeholder="请输入默认枚举值的 Value" />
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'int'">
          <el-form-item label="取值范围" required>
            <div class="range-row">
              <el-input-number v-model="algoCapEditForm.min" :max="algoCapEditForm.max - 1" style="flex:1" />
              <span style="color:var(--text-placeholder)">~</span>
              <el-input-number v-model="algoCapEditForm.max" :min="algoCapEditForm.min + 1" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="步长">
            <el-input-number v-model="algoCapEditForm.step" :min="1" style="width:150px" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="algoCapEditForm.unit" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="algoCapEditForm.defaultVal" :min="algoCapEditForm.min" :max="algoCapEditForm.max" style="width:200px" />
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'boolean'">
          <el-form-item label="布尔值标签">
            <div class="bool-labels">
              <div style="flex:1">
                <span class="form-hint">true 标签</span>
                <el-input v-model="algoCapEditForm.trueLabel" />
              </div>
              <div style="flex:1">
                <span class="form-hint">false 标签</span>
                <el-input v-model="algoCapEditForm.falseLabel" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="默认值">
            <el-radio-group v-model="algoCapEditForm.defaultVal">
              <el-radio value="1">{{ algoCapEditForm.trueLabel || '开启' }} (true)</el-radio>
              <el-radio value="0">{{ algoCapEditForm.falseLabel || '关闭' }} (false)</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'string'">
          <el-form-item label="最大长度（字节）" required>
            <el-input-number v-model="algoCapEditForm.maxLength" :min="1" :max="65535" style="width:150px" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="algoCapEditForm.defaultVal" placeholder="请输入默认值" />
          </el-form-item>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'array'">
          <el-form-item label="元素类型" required>
            <el-select v-model="algoCapEditForm.elementType" style="width:100%">
              <el-option label="Int (数字)" value="int" />
              <el-option label="String (字符串)" value="string" />
              <el-option label="Struct (结构体)" value="struct" />
            </el-select>
          </el-form-item>
          <el-form-item label="最大长度" required>
            <el-input-number v-model="algoCapEditForm.arrayMaxLength" :min="1" :max="1000" style="width:150px" />
          </el-form-item>
          <template v-if="algoCapEditForm.elementType === 'struct'">
            <el-form-item label="元素结构体字段">
              <div style="width:100%">
                <div class="param-list">
                  <div v-for="(f, i) in algoCapEditForm.fields" :key="i" class="param-item">
                    <div class="param-info">
                      <span class="param-name">{{ f.name || '未命名' }}</span>
                      <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                    </div>
                    <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                    <el-button size="small" text type="danger" @click="algoCapEditForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                  </div>
                  <div v-if="!algoCapEditForm.fields.length" class="param-empty">暂无字段</div>
                </div>
                <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
              </div>
            </el-form-item>
          </template>
        </template>

        <template v-if="editCapType === 'prop' && algoCapEditForm.dataType === 'struct'">
          <el-form-item label="结构体字段">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(f, i) in algoCapEditForm.fields" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ f.name || '未命名' }}</span>
                    <span class="param-meta">{{ f.identifier }} · {{ paramTypeLabel(f.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditStructField(i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.fields.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.fields.length" class="param-empty">暂无字段</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddStructField">+ 添加字段</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCapType === 'svc'">
          <el-form-item label="输入参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in algoCapEditForm.inputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('input', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.inputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.inputParams.length" class="param-empty">暂无输入参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('input')">+ 添加参数</el-button>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in algoCapEditForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

        <template v-if="editCapType === 'evt'">
          <el-form-item label="事件类型" required>
            <div class="type-cards">
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'info' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'info')">信息 (Info)</div>
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'alarm' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'alarm')">告警 (Alarm)</div>
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'fault' }]" :style="isAlgoCreateMode ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'fault')">故障 (Fault)</div>
            </div>
          </el-form-item>
          <el-form-item label="输出参数">
            <div style="width:100%">
              <div class="param-list">
                <div v-for="(p, i) in algoCapEditForm.outputParams" :key="i" class="param-item">
                  <div class="param-info">
                    <span class="param-name">{{ p.name || '未命名' }}</span>
                    <span class="param-meta">{{ p.identifier }} · {{ paramTypeLabel(p.dataType) }}</span>
                  </div>
                  <el-button size="small" text @click="openEditParam('output', i)"><el-icon><Edit /></el-icon></el-button>
                  <el-button size="small" text type="danger" @click="algoCapEditForm.outputParams.splice(i, 1)"><el-icon><Delete /></el-icon></el-button>
                </div>
                <div v-if="!algoCapEditForm.outputParams.length" class="param-empty">暂无输出参数</div>
              </div>
              <el-button size="small" style="margin-top:8px" @click="openAddParam('output')">+ 添加参数</el-button>
            </div>
          </el-form-item>
        </template>

      </el-form>

      <!-- 参数编辑子弹窗 -->
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
              <el-option label="Array (数组)" value="array" />
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
            <el-form-item label="最大长度">
              <el-input-number v-model="paramForm.arrayMaxLength" :min="1" :max="1000" style="width:150px" />
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

      <template #footer>
        <el-button @click="algoCapEditVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlgoCapEdit">{{ isAlgoCreateMode ? '创建' : '保存' }}</el-button>
      </template>
    </el-dialog>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SetUp, InfoFilled, QuestionFilled, Edit, Delete, ArrowRight, ArrowLeft, Search, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listAlgorithms, getAllAlgorithmServices, getAlgorithmEvents, allEvents } from '@/data/thing-model'
import PageBackBar from '@/components/layout/PageBackBar.vue'

const route = useRoute()
const router = useRouter()

const productId = computed(() => route.query.productId || '')
const productName = computed(() => route.query.name || '')

// ===== Mock product data =====
const product = reactive({
  name: productName,
  productId: productId,
  category: 'UITest_Edit_285367',
  company: '深圳市汇云通讯科技有限公司',
  status: 'approved',
  unitPrice: 0.00
})

// ===== 物模型 =====
const thingModelCount = ref(6)
const thingModelDialogVisible = ref(false)
const thingModelActiveTab = ref('capability')

// new：设备配置弹窗只保留「标准能力 / 自定义能力」，不再分 tab 分步
const thingModelTabs = ['capability']
const thingModelTabIndex = computed(() => thingModelTabs.indexOf(thingModelActiveTab.value))
const hasThingModelPrev = computed(() => thingModelTabIndex.value > 0)
const isLastThingModelTab = computed(() => thingModelTabIndex.value === thingModelTabs.length - 1)

function onThingModelNext() {
  ElMessage.success('物模型配置已保存')
  thingModelDialogVisible.value = false
}

// 设备能力
const deviceCaps = reactive({
  network: true, intercom: true, storage: true, battery: false,
  workMode: true, wakeup: false, ota: true, indicator: true,
  alarm: true, record: true, irLight: true
})
const deviceNetConf = reactive({
  wired: true, wifi: true, mobile: false, dualBand: 'no',
  ap: true, sound: true, smartlink: true, qrcode: true,
  lan: false, appScan: true, ble: false, hotspot: false,
  passwordEnabled: 'no'
})

// 屏显 / 喇叭
const displayConfig = reactive({ hasDisplay: 'no' })
const speakerConfig = reactive({ hasSpeaker: 'no' })

// 云端抓图
const cloudCaptureStorageDays = ref(1)
const cloudCaptureConfig = reactive({
  defaultOn: 'on',
  supportGif: 'no',
  gifEnabled: 'off',
  quality: 'small',
  storageMode: 'event',
  storageFormat: 'privateHeader',
  captureCount: 1,
  captureInterval: 30
})

function onViewThingModel() {
  thingModelActiveTab.value = 'capability'
  cloudCaptureStorageDays.value = 1
  thingModelDialogVisible.value = true
}

// ===== 算法服务 =====
const algoServices = ref([])

function loadAlgoServices() {
  const res = listAlgorithms({ pageSize: 200 })
  const rows = []
  ;(res.data?.list || []).forEach(a => {
    try { a._name = JSON.parse(a.algorithmName || '{}') } catch { a._name = {} }
    try { a._eventIds = JSON.parse(a.eventIds || '[]') } catch { a._eventIds = [] }
    const hasConfig = (() => { try { return JSON.parse(a.capabilityIds || '[]').length > 0 } catch { return false } })()
    const linkedEvents = getAlgorithmEvents(a.algorithmId)
    const services = getAllAlgorithmServices(a.algorithmId)
    if (services.length === 0) {
      rows.push({
        id: a.algorithmId,
        name: a._name?.['1'] || a.algorithmId,
        serviceId: a.serviceId || '-',
        serviceName: '—',
        descr: a.descr || '',
        supported: false,
        free: false,
        boundPackage: '',
        hasConfig,
        linkedEvents,
        _rowSpan: 1,
        _isFirstRow: true
      })
    } else {
      services.forEach((svc, si) => {
        rows.push({
          id: a.algorithmId,
          name: a._name?.['1'] || a.algorithmId,
          serviceId: svc.serviceId,
          serviceName: svc.name || '—',
          descr: a.descr || '',
          supported: false,
          free: false,
          boundPackage: '',
          hasConfig,
          linkedEvents,
          _rowSpan: services.length,
          _isFirstRow: si === 0
        })
      })
    }
  })
  algoServices.value = rows
}

function algoSpanMethod({ columnIndex, row }) {
  // 算法级列: 0=算法ID, 1=算法名称, 2=能力配置, 3=关联事件
  if (columnIndex <= 3) {
    if (row._isFirstRow) return { rowspan: row._rowSpan, colspan: 1 }
    return { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

// ===== 关联事件抽屉 =====
const eventDrawerVisible = ref(false)
const eventEditAlgo = ref(null)
const eventTableRef = ref(null)
const eventOptions = ref([])
const linkedEventIds = ref([])

function loadEventOptions() {
  const res = allEvents()
  eventOptions.value = (res.data?.list || []).map(e => {
    try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
    try { e._push = JSON.parse(e.pushCopy || '{}') } catch { e._push = {} }
    return { id: e.eventId, name: e._name?.['1'] || e.eventId, descr: e.eventRemark || '', _push: e._push, _dbId: e.id }
  })
}

function openEventDrawer(row) {
  eventEditAlgo.value = row
  loadEventOptions()
  linkedEventIds.value = [...(row.linkedEvents || [])]
  eventDrawerVisible.value = true
  nextTick(() => {
    const table = eventTableRef.value
    if (!table) return
    eventOptions.value.forEach(evt => {
      if (linkedEventIds.value.includes(evt.id)) {
        table.toggleRowSelection(evt, true)
      }
    })
  })
}

function onEventSelectionChange(rows) {
  linkedEventIds.value = rows.map(r => r.id)
}

function saveEventLink() {
  eventEditAlgo.value.linkedEvents = [...linkedEventIds.value]
  ElMessage.success('关联事件已保存')
  eventDrawerVisible.value = false
}

// ===== 算法能力配置抽屉 =====
const algoConfigDrawerVisible = ref(false)
const algoConfigAlgo = ref(null)
const standardCapList = ref([])
const customCapList = ref([])

const allCapList = computed(() => [...standardCapList.value, ...customCapList.value])

function capTypeLabel(type) {
  const map = { prop: '属性', svc: '服务', evt: '事件' }
  return map[type] || type
}

function dataTypeLabel(cap) {
  if (cap.capType === 'prop') {
    const m = { enum: '枚举型', int: '数值型', boolean: '布尔型', string: '字符串', array: '数组型', struct: '结构体型' }
    return m[cap.dataDef?.dataType] || ''
  }
  if (cap.capType === 'svc') return '服务'
  if (cap.capType === 'evt') return '事件'
  return ''
}

function openAlgoConfigDrawer(row) {
  algoConfigAlgo.value = row
  standardCapList.value = [
    { capType: 'prop', name: '灵敏度档位', identifier: 'sensitivity_level', dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '低', val: 0 }, { name: '中', val: 1 }, { name: '高', val: 2 }, { name: '自动', val: 3 }] } },
    { capType: 'svc', name: '重启设备', identifier: 'restart_device', dataDef: { inputParams: [], outputParams: [] } }
  ]
  customCapList.value = []
  algoConfigDrawerVisible.value = true
}

// ===== 能力编辑弹窗 =====
const algoCapEditVisible = ref(false)
const algoCapEditRef = ref(null)
const isAlgoCreateMode = ref(false)
const editCapType = computed(() => isAlgoCreateMode.value ? algoCapEditForm.capType : algoCapEditRef.value?.cap?.capType)

const algoCapEditForm = reactive({
  capType: 'prop', name: '', identifier: '',
  descr: '', accessMode: 'rw', defaultVal: '',
  dataType: 'int', enumValues: [], min: 0, max: 100, step: 1, unit: '',
  trueLabel: '开启', falseLabel: '关闭', maxLength: 64,
  elementType: 'int', arrayMaxLength: 100, fields: [],
  eventType: 'info', inputParams: [], outputParams: []
})

function resetAlgoCapForm() {
  algoCapEditForm.capType = 'prop'
  algoCapEditForm.name = ''
  algoCapEditForm.identifier = ''
  algoCapEditForm.descr = ''
  algoCapEditForm.accessMode = 'rw'
  algoCapEditForm.dataType = 'int'
  algoCapEditForm.defaultVal = ''
  algoCapEditForm.enumValues = [{ name: '', val: 0 }]
  algoCapEditForm.min = 0; algoCapEditForm.max = 100; algoCapEditForm.step = 1; algoCapEditForm.unit = ''
  algoCapEditForm.trueLabel = '开启'; algoCapEditForm.falseLabel = '关闭'; algoCapEditForm.maxLength = 64
  algoCapEditForm.elementType = 'int'; algoCapEditForm.arrayMaxLength = 100; algoCapEditForm.fields = []
  algoCapEditForm.eventType = 'info'; algoCapEditForm.inputParams = []; algoCapEditForm.outputParams = []
}

function getDefaultDataDef() {
  const f = algoCapEditForm
  if (f.capType === 'prop') {
    const base = { dataType: f.dataType, accessMode: f.accessMode }
    switch (f.dataType) {
      case 'enum': return { ...base, enumValues: [{ name: '', val: 0 }], defaultVal: '' }
      case 'int': return { ...base, min: 0, max: 100, step: 1, unit: '', defaultVal: 0 }
      case 'boolean': return { ...base, trueLabel: '开启', falseLabel: '关闭', defaultVal: '0' }
      case 'string': return { ...base, maxLength: 64, defaultVal: '' }
      case 'array': return { ...base, elementType: 'int', arrayMaxLength: 100, fields: [] }
      case 'struct': return { ...base, fields: [] }
      default: return base
    }
  }
  if (f.capType === 'svc') return { inputParams: [], outputParams: [] }
  if (f.capType === 'evt') return { eventType: 'info', outputParams: [] }
  return {}
}

function onAlgoCapTypeChange(type) {
  algoCapEditForm.capType = type
  Object.assign(algoCapEditForm, getDefaultDataDef())
}

function onAlgoDataTypeChange() {
  const def = getDefaultDataDef()
  Object.keys(def).forEach(k => { if (k !== 'dataType' && k !== 'accessMode') algoCapEditForm[k] = def[k] })
}

function openCustomCapCreate() {
  isAlgoCreateMode.value = true
  algoCapEditRef.value = null
  resetAlgoCapForm()
  algoCapEditVisible.value = true
}

function openAlgoCapEdit(item) {
  isAlgoCreateMode.value = false
  algoCapEditRef.value = item
  const cap = item.cap
  const dd = cap.dataDef || {}
  algoCapEditForm.capType = cap.capType
  algoCapEditForm.name = cap.name
  algoCapEditForm.identifier = cap.identifier
  algoCapEditForm.descr = cap.descr || ''
  if (cap.capType === 'prop') {
    algoCapEditForm.dataType = dd.dataType || ''
    algoCapEditForm.accessMode = dd.accessMode || 'rw'
    algoCapEditForm.defaultVal = dd.defaultVal ?? ''
    algoCapEditForm.enumValues = dd.enumValues ? JSON.parse(JSON.stringify(dd.enumValues)) : [{ name: '', val: 0 }]
    algoCapEditForm.min = dd.min ?? 0; algoCapEditForm.max = dd.max ?? 100; algoCapEditForm.step = dd.step ?? 1; algoCapEditForm.unit = dd.unit || ''
    algoCapEditForm.trueLabel = dd.trueLabel || '开启'; algoCapEditForm.falseLabel = dd.falseLabel || '关闭'
    algoCapEditForm.maxLength = dd.maxLength ?? 64
    algoCapEditForm.elementType = dd.elementType || 'int'; algoCapEditForm.arrayMaxLength = dd.arrayMaxLength ?? 100
    algoCapEditForm.fields = dd.fields ? JSON.parse(JSON.stringify(dd.fields)) : []
  } else if (cap.capType === 'svc') {
    algoCapEditForm.inputParams = JSON.parse(JSON.stringify(dd.inputParams || []))
    algoCapEditForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  } else {
    algoCapEditForm.eventType = dd.eventType || 'info'
    algoCapEditForm.outputParams = JSON.parse(JSON.stringify(dd.outputParams || []))
  }
  algoCapEditVisible.value = true
}

function buildDataDefFromForm() {
  const f = algoCapEditForm
  if (f.capType === 'prop') {
    const dd = { dataType: f.dataType, accessMode: f.accessMode, defaultVal: f.defaultVal }
    if (f.dataType === 'enum') dd.enumValues = f.enumValues.filter(ev => ev.name.trim())
    else if (f.dataType === 'int') { dd.min = f.min; dd.max = f.max; dd.step = f.step; dd.unit = f.unit }
    else if (f.dataType === 'boolean') { dd.trueLabel = f.trueLabel; dd.falseLabel = f.falseLabel }
    else if (f.dataType === 'string') dd.maxLength = f.maxLength
    else if (f.dataType === 'array') { dd.elementType = f.elementType; dd.arrayMaxLength = f.arrayMaxLength; if (f.elementType === 'struct') dd.fields = f.fields.filter(fi => fi.name.trim()) }
    else if (f.dataType === 'struct') dd.fields = f.fields.filter(fi => fi.name.trim())
    return dd
  }
  if (f.capType === 'svc') return { inputParams: f.inputParams, outputParams: f.outputParams }
  if (f.capType === 'evt') return { eventType: f.eventType, outputParams: f.outputParams }
  return {}
}

function saveAlgoCapEdit() {
  if (isAlgoCreateMode.value) {
    if (!algoCapEditForm.name.trim()) { ElMessage.warning('请输入能力名称'); return }
    if (!algoCapEditForm.identifier.trim()) { ElMessage.warning('请输入能力标识'); return }
    const cap = {
      capType: algoCapEditForm.capType,
      name: algoCapEditForm.name.trim(),
      identifier: algoCapEditForm.identifier.trim(),
      descr: algoCapEditForm.descr.trim(),
      dataDef: buildDataDefFromForm()
    }
    customCapList.value.push(cap)
    ElMessage.success('自定义能力已创建')
  } else {
    const cap = algoCapEditRef.value?.cap
    if (!cap) return
    cap.descr = algoCapEditForm.descr.trim()
    cap.dataDef = buildDataDefFromForm()
    ElMessage.success('参数已更新')
  }
  algoCapEditVisible.value = false
}

// ===== 参数编辑子弹窗 =====
const paramDialogVisible = ref(false)
const paramFormRef = ref(null)
const editingParamTarget = ref('output')
const editingParamIdx = ref(-1)

const paramForm = reactive({
  name: '', identifier: '', dataType: 'boolean',
  min: 0, max: 100, step: 1, unit: '',
  maxLength: 64, elementType: 'int', arrayMaxLength: 10, trueLabel: '是', falseLabel: '否',
  defaultVal: '',
  enumValues: [{ name: '', val: 0 }]
})

function paramTypeLabel(t) { const m = { int: 'Int', string: 'String', boolean: 'Boolean', enum: 'Enum', array: 'Array' }; return m[t] || t }

const paramDialogTitle = computed(() => {
  if (editingParamTarget.value === 'field') return editingParamIdx.value >= 0 ? '编辑结构体字段' : '添加结构体字段'
  const prefix = editingParamTarget.value === 'input' ? '输入' : '输出'
  return editingParamIdx.value >= 0 ? `编辑${prefix}参数` : `添加${prefix}参数`
})

function resetParamForm() {
  paramForm.name = ''; paramForm.identifier = ''; paramForm.dataType = 'boolean'
  paramForm.min = 0; paramForm.max = 100; paramForm.step = 1; paramForm.unit = ''
  paramForm.maxLength = 64; paramForm.elementType = 'int'; paramForm.arrayMaxLength = 10
  paramForm.trueLabel = '是'; paramForm.falseLabel = '否'; paramForm.defaultVal = ''
  paramForm.enumValues = [{ name: '', val: 0 }]
}

function openAddParam(target) {
  editingParamTarget.value = target; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditParam(target, idx) {
  editingParamTarget.value = target; editingParamIdx.value = idx
  const p = target === 'field' ? algoCapEditForm.fields[idx] : algoCapEditForm[target + 'Params'][idx]
  paramForm.name = p.name || ''; paramForm.identifier = p.identifier || ''; paramForm.dataType = p.dataType || 'boolean'
  if (p.dataType === 'int') {
    paramForm.min = p.min || 0; paramForm.max = p.max || 100; paramForm.step = p.step || 1; paramForm.unit = p.unit || ''
  }
  paramForm.maxLength = p.maxLength || 64
  if (p.dataType === 'array') {
    paramForm.elementType = p.elementType || 'int'; paramForm.arrayMaxLength = p.maxLength || 10
  } else {
    paramForm.elementType = 'int'; paramForm.arrayMaxLength = 10
  }
  paramForm.trueLabel = p.trueLabel || '是'; paramForm.falseLabel = p.falseLabel || '否'
  paramForm.defaultVal = p.defaultVal || ''
  paramForm.enumValues = p.enumValues ? JSON.parse(JSON.stringify(p.enumValues)) : [{ name: '', val: 0 }]
  paramDialogVisible.value = true
}

function openAddStructField() {
  editingParamTarget.value = 'field'; editingParamIdx.value = -1
  resetParamForm()
  paramDialogVisible.value = true
}

function openEditStructField(idx) {
  openEditParam('field', idx)
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
    p.elementType = paramForm.elementType; p.maxLength = paramForm.arrayMaxLength
  }
  return p
}

function handleParamConfirm() {
  if (!paramForm.name.trim() || !paramForm.identifier.trim()) {
    ElMessage.warning('请填写完整参数信息'); return
  }
  const param = buildParam()
  if (editingParamTarget.value === 'field') {
    if (!algoCapEditForm.fields) algoCapEditForm.fields = []
    if (editingParamIdx.value >= 0) {
      algoCapEditForm.fields[editingParamIdx.value] = param
    } else {
      algoCapEditForm.fields.push(param)
    }
  } else {
    const key = editingParamTarget.value + 'Params'
    if (editingParamIdx.value >= 0) {
      algoCapEditForm[key][editingParamIdx.value] = param
    } else {
      algoCapEditForm[key].push(param)
    }
  }
  paramDialogVisible.value = false
}

function dataDefSummary(def) {
  if (!def) return '—'
  if (def.dataType === 'enum' && def.enumValues) return '枚举: ' + def.enumValues.map(e => e.name).join(' / ')
  if (def.dataType === 'boolean') return '布尔型'
  if (def.dataType === 'int') return `整数 (${def.min || 0}~${def.max || 100}${def.unit ? ' ' + def.unit : ''})`
  if (def.inputParams !== undefined || def.outputParams !== undefined) {
    const parts = []
    if (def.inputParams?.length) parts.push(`入参×${def.inputParams.length}`)
    if (def.outputParams?.length) parts.push(`出参×${def.outputParams.length}`)
    return parts.length ? parts.join(' ') : '服务'
  }
  if (def.eventType) return `事件 (${def.eventType})`
  if (def.dataType === 'string') return `字符串 (最长${def.maxLength || 64})`
  if (def.dataType === 'array') return `数组<${def.elementType || 'int'}>`
  if (def.dataType === 'struct') return `结构体 (${def.fields?.length || 0} 字段)`
  return '—'
}

// ===== 能力模块 & 能力库 =====
const capModules = [
  { id: 'record', name: '录制模式模块', identifier: 'RecordModule' },
  { id: 'basic', name: '基础设置模块', identifier: 'BasicModule' },
  { id: 'intercom', name: '对讲模块', identifier: 'IntercomModule' },
  { id: 'system', name: '系统管理模块', identifier: 'SystemModule' },
  { id: 'event', name: '事件侦测模块', identifier: 'EventModule' },
  { id: 'ptz', name: '云台模块', identifier: 'PTZModule' },
  { id: 'ai', name: 'AI算法模块', identifier: 'AIModule' }
]

const libCapabilities = [
  { capType: 'prop', name: '录像开关', identifier: 'record_switch', descr: '控制设备录像功能的启用与关闭', dataDef: { dataType: 'boolean' }, moduleId: 'record', moduleName: '录制模式模块' },
  { capType: 'prop', name: '夜视模式', identifier: 'night_vision', descr: '夜视模式切换', dataDef: { dataType: 'enum', accessMode: 'rw', enumValues: [{ name: '自动', val: 0 }, { name: '强制', val: 1 }, { name: '关闭', val: 2 }] }, moduleId: 'basic', moduleName: '基础设置模块' },
  { capType: 'prop', name: '音量控制', identifier: 'volume', descr: '设备扬声器音量调节', dataDef: { dataType: 'int', accessMode: 'rw', min: 0, max: 100, unit: '%' }, moduleId: 'intercom', moduleName: '对讲模块' },
  { capType: 'svc', name: '远程重启', identifier: 'remote_reboot', descr: '远程控制设备重新启动', dataDef: { inputParams: [], outputParams: [{ name: '结果', identifier: 'result', dataType: 'boolean' }] }, moduleId: 'system', moduleName: '系统管理模块' },
  { capType: 'evt', name: '电量不足告警', identifier: 'low_battery', descr: '电量低于阈值时上报', dataDef: { eventType: 'alarm', outputParams: [{ name: '电量', identifier: 'battery', dataType: 'int', min: 0, max: 100, unit: '%' }] }, moduleId: 'event', moduleName: '事件侦测模块' },
  { capType: 'svc', name: '云台控制', identifier: 'ptz_control', descr: '控制设备云台旋转/倾斜', dataDef: { inputParams: [{ name: '方向', identifier: 'direction', dataType: 'enum', enumValues: [{ name: '上', val: 0 }, { name: '下', val: 1 }, { name: '左', val: 2 }, { name: '右', val: 3 }] }], outputParams: [] }, moduleId: 'ptz', moduleName: '云台模块' },
  { capType: 'prop', name: '人脸识别', identifier: 'face_detect', descr: '是否启用人脸检测与识别', dataDef: { dataType: 'boolean' }, moduleId: 'ai', moduleName: 'AI算法模块' },
  { capType: 'prop', name: '声音检测', identifier: 'sound_detect', descr: '检测异常声音并触发告警', dataDef: { dataType: 'boolean' }, moduleId: 'event', moduleName: '事件侦测模块' },
  { capType: 'svc', name: '固件升级', identifier: 'firmware_upgrade', descr: '远程触发设备固件OTA升级', dataDef: { inputParams: [{ name: '固件URL', identifier: 'firmware_url', dataType: 'string' }], outputParams: [{ name: '状态', identifier: 'status', dataType: 'enum', enumValues: [{ name: '成功', val: 0 }, { name: '失败', val: 1 }] }] }, moduleId: 'system', moduleName: '系统管理模块' },
  { capType: 'prop', name: '隐私模式', identifier: 'privacy_mode', descr: '隐私模式开关', dataDef: { dataType: 'boolean' }, moduleId: 'basic', moduleName: '基础设置模块' }
]

// ===== 自定义导入穿梭框 =====
const capDialogVisible = ref(false)
const capDialogTitle = ref('添加标准能力')
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])
const currentCapType = ref('standard')

function buildModuleGroups(capList) {
  const moduleMap = {}
  const orphanCaps = []
  capList.forEach(cap => {
    const mod = capModules.find(m => m.id === cap.moduleId)
    if (mod) {
      if (!moduleMap[cap.moduleId]) moduleMap[cap.moduleId] = { id: mod.id, name: mod.name + ' (' + mod.identifier + ')', caps: [] }
      moduleMap[cap.moduleId].caps.push(cap)
    } else {
      orphanCaps.push(cap)
    }
  })
  const groups = capModules
    .filter(m => moduleMap[m.id]?.caps.length)
    .map(m => ({ id: m.id, name: m.name + ' (' + m.identifier + ')', caps: moduleMap[m.id].caps }))
  if (orphanCaps.length) groups.push({ id: '_other', name: '其他', caps: orphanCaps })
  return groups
}

function getExistingIds() {
  return new Set(standardCapList.value.map(c => c.identifier))
}

const importAvailableByModule = computed(() => {
  const existingIds = getExistingIds()
  const excludedIds = new Set([...existingIds, ...importSelectedIds.value])
  const available = libCapabilities.filter(c => !excludedIds.has(c.identifier))
  return buildModuleGroups(available)
})

const importSelectedByModule = computed(() => {
  const caps = importSelectedIds.value.map(id => libCapabilities.find(c => c.identifier === id)).filter(Boolean)
  return buildModuleGroups(caps)
})

function isImportCapVisible(cap) {
  if (!importSearchText.value) return true
  const kw = importSearchText.value.toLowerCase()
  return cap.name.toLowerCase().includes(kw) || cap.identifier.toLowerCase().includes(kw)
}

function toggleImportCheck(id) {
  const idx = importCheckedIds.value.indexOf(id)
  if (idx > -1) importCheckedIds.value.splice(idx, 1)
  else importCheckedIds.value.push(id)
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
  return visible.length > 0 && visible.every(c => importCheckedIds.value.includes(c.identifier))
}

function isModuleIndeterminate(mod) {
  const visible = getVisibleCaps(mod)
  const checked = visible.filter(c => importCheckedIds.value.includes(c.identifier))
  return checked.length > 0 && checked.length < visible.length
}

function toggleModuleAllCheck(mod) {
  const visible = getVisibleCaps(mod)
  if (isModuleAllChecked(mod)) {
    visible.forEach(c => { importCheckedIds.value = importCheckedIds.value.filter(id => id !== c.identifier) })
  } else {
    visible.forEach(c => { if (!importCheckedIds.value.includes(c.identifier)) importCheckedIds.value.push(c.identifier) })
  }
}

function transferToRight() {
  importCheckedIds.value.forEach(id => {
    if (!importSelectedIds.value.includes(id)) importSelectedIds.value.push(id)
    const cap = libCapabilities.find(c => c.identifier === id)
    if (cap?.moduleId && !expandedModules.value.includes(cap.moduleId)) expandedModules.value.push(cap.moduleId)
  })
  importCheckedIds.value = []
}

function transferToLeft() {
  importSelectedIds.value = []
}

function removeFromSelected(id) {
  importSelectedIds.value = importSelectedIds.value.filter(i => i !== id)
}

function openCapabilityDialog(type) {
  currentCapType.value = type
  capDialogTitle.value = type === 'standard' ? '添加标准能力 — 导入能力' : '添加自定义能力 — 导入能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capModules.map(m => m.id)
  expandedModules.value = []
  capDialogVisible.value = true
}

function handleImportConfirm() {
  if (!importSelectedIds.value.length) { ElMessage.warning('请选择要添加的能力'); return }
  importSelectedIds.value.forEach(key => {
    const c = libCapabilities.find(c => c.identifier === key)
    if (!c) return
    standardCapList.value.push({
      id: Date.now() + Math.random(), capType: c.capType, name: c.name,
      identifier: c.identifier, descr: c.descr,
      dataDef: JSON.parse(JSON.stringify(c.dataDef)), moduleName: c.moduleName
    })
  })
  ElMessage.success(`已添加 ${importSelectedIds.value.length} 项能力`)
  capDialogVisible.value = false
}

function onAddStdCap() { openCapabilityDialog('standard') }
function onAddCustomCap() { openCustomCapCreate() }
function onEditStdCap(row, idx) { openAlgoCapEdit({ cap: row, source: 'standard', idx }) }
function onEditCustomCap(row, idx) { openAlgoCapEdit({ cap: row, source: 'custom', idx }) }

function saveAlgoConfig() {
  ElMessage.success('算法能力配置已保存')
  algoConfigDrawerVisible.value = false
}

// ===== 平台服务 =====
const packageOptions = [
  { id: '300031', name: '短信套餐（300031）' },
  { id: '300030', name: '去广告套餐（300030）' },
  { id: '300010', name: '事件云存（300010）' },
  { id: '300011', name: '全天云存（300011）' }
]

// ===== 平台服务（合并单元格）=====
const platformServices = ref([])

function loadPlatformServices() {
  const rows = []

  cloudRecordServices.value.forEach((svc, si) => {
    rows.push({
      algoId: '1010', algoName: '云存录像服务', descr: '云存录像服务',
      serviceId: svc.serviceId, serviceName: svc.name,
      supported: svc.supported, free: svc.free, boundPackage: svc.boundPackage || '',
      _rowSpan: cloudRecordServices.value.length, _isFirstRow: si === 0
    })
  })

  cloudSnapshotServices.value.forEach((svc, si) => {
    rows.push({
      algoId: 'snapshot', algoName: '云端抓图支持的服务', descr: '云端抓图支持的服务',
      serviceId: svc.serviceId, serviceName: svc.name,
      supported: svc.supported, free: svc.free, boundPackage: svc.boundPackage || '',
      _rowSpan: cloudSnapshotServices.value.length, _isFirstRow: si === 0
    })
  })

  oldAlgoList.value.forEach(item => {
    rows.push({
      algoId: item.id, algoName: item.name, descr: item.descr,
      serviceId: item.serviceId, serviceName: item.name,
      supported: item.supported, free: item.free, boundPackage: item.boundPackage || '',
      _rowSpan: 1, _isFirstRow: true
    })
  })

  platformServices.value = rows
}

function platformSpanMethod({ columnIndex, row }) {
  if (columnIndex <= 3) {
    if (row._isFirstRow) return { rowspan: row._rowSpan, colspan: 1 }
    return { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

const cloudRecordServices = ref([
  { serviceId: '300010', name: '事件云存', supported: true, free: false, boundPackage: '', descr: '事件录像：产生告警时触发录像' },
  { serviceId: '300011', name: '全天云存', supported: true, free: false, boundPackage: '', descr: '全天录像：全天24小时持续录像' }
])

const cloudSnapshotServices = ref([
  { serviceId: '300012', name: '鸟类检测', supported: false, free: true, boundPackage: '', descr: '云端抓图-鸟类识别与分类' },
  { serviceId: '300013', name: '松鼠检测', supported: false, free: true, boundPackage: '', descr: '云端抓图-松鼠识别与分类' }
])

const oldAlgoList = ref([
  { id: '1013', name: '全能AI', serviceId: '300051', descr: '集成多种AI算法服务', supported: true, free: false, boundPackage: '' },
  { id: '1093', name: '离线监控', serviceId: '300008', descr: '设备断电或离线时的状态监测', supported: true, free: false, boundPackage: '' },
  { id: '1096', name: '智能告警-儿童检测', serviceId: '300044', descr: '综合全天候的儿童看护识别', supported: false, free: true, boundPackage: '' },
  { id: '1098', name: '智能告警服务', serviceId: '300009', descr: '基于多维参数的综合告警策略', supported: false, free: true, boundPackage: '' },
  { id: '1103', name: '智能告警-老人看护', serviceId: '300039', descr: '针对老年用户的异常行为识别', supported: false, free: false, boundPackage: '' },
  { id: '1104', name: '智能告警-厨房监测', serviceId: '300040', descr: '全方位监测厨房油烟和火情', supported: false, free: true, boundPackage: '' },
  { id: '1105', name: '智能告警-家门检测', serviceId: '300041', descr: '门口逗留、门缝检测等安防预警', supported: false, free: false, boundPackage: '' },
  { id: '1106', name: '智能告警-宠物检测', serviceId: '300042', descr: '整合宠物的多项健康和活动指标', supported: true, free: false, boundPackage: '' },
  { id: '1016', name: '逗留提醒', serviceId: '300036', descr: '检测人员逗留并触发提醒', supported: false, free: true, boundPackage: '' },
  { id: '1061', name: '设备算法', serviceId: '-', descr: '设备端算法能力配置', supported: false, free: false, boundPackage: '' },
  { id: '2000', name: '短信套餐', serviceId: '300031', descr: '短信通知服务套餐', supported: false, free: false, boundPackage: '' },
  { id: '2001', name: '去广告套餐', serviceId: '300030', descr: '去除APP内广告展示', supported: false, free: false, boundPackage: '' }
])

function onFreeChange(row) {
  if (!row.free) row.boundPackage = ''
}

// ===== 套餐绑定侧边弹窗 =====
const packageDrawerVisible = ref(false)
const packageDrawerRow = ref(null)

function openPackageDrawer(row) {
  packageDrawerRow.value = row
  packageDrawerVisible.value = true
}

function confirmPackageBinding(pkgId) {
  if (packageDrawerRow.value) {
    packageDrawerRow.value.boundPackage = pkgId
  }
  packageDrawerVisible.value = false
}

// ===== App配置 =====
const appConfig = reactive({
  installGuideStatus: '已配置',
  scopeStatus: '不限范围'
})
function goToAppConfig() {
  router.push({ path: '/product-new/config', query: { id: productId.value, name: productName.value, step: '2' } })
}

// ===== 语音助手 =====
const voiceConfig = reactive({
  wakeWord: '你好小智',
  language: '中文普通话',
  platform: 'Alexa / Google Assistant',
  enabled: true
})

// ===== 固件版本 =====
const firmwareVersions = ref([
  { version: 'v2.5.1', releaseDate: '2026-06-10', size: '12.8 MB', changelog: '修复夜间模式白平衡异常；优化云存上传稳定性', active: true },
  { version: 'v2.5.0', releaseDate: '2026-05-20', size: '12.5 MB', changelog: '新增AI人形检测联动；优化P2P连接速度', active: false },
  { version: 'v2.4.0', releaseDate: '2026-04-15', size: '11.9 MB', changelog: '支持全彩夜视模式；修复设备唤醒延迟', active: false }
])

// ===== Helpers =====
const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
const statusClsMap = { pending: 's-pending', approved: 's-approved', rejected: 's-rejected' }
function statusLabel(s) { return statusMap[s] || s }
function statusCls(s) { return statusClsMap[s] || '' }

function goBack() {
  router.push('/product-new/audit')
}

onMounted(() => { loadAlgoServices(); loadPlatformServices() })
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 16px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}
.config-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.config-text {
  font-size: 14px;
  color: var(--text-regular);
  em {
    font-style: normal;
    font-weight: 500;
    color: var(--primary-color);
  }
}
.config-divider {
  color: var(--border-lighter);
}

.text-muted { color: var(--text-placeholder); }

.tip-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 0 0 16px;
  background: #F0F7FF;
  border: 1px solid #B3D8FF;
  border-radius: 6px;
  font-size: 13px;
  color: #2563EB;
  .el-icon { flex-shrink: 0; font-size: 16px; }
}

.cell-name { font-weight: 500; color: var(--text-primary); font-size: 13px; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-service-id { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.merged-cell { font-weight: 500; }
.header-tip-icon { margin-left: 4px; color: var(--text-placeholder); cursor: help; font-size: 14px; }

.status-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  &.s-pending { background: #FFF7ED; color: #EA580C; }
  &.s-approved { background: #F0FDF4; color: #16A34A; }
  &.s-rejected { background: #FEF2F2; color: #DC2626; }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-secondary);
  font-size: 13px;
}

// 物模型配置 dialog
.tm-config-section {
  padding-top: 8px;
}

.config-options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 8px;
}

.config-sub {
  padding: 12px 0;
  &-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  &-row {
    display: flex;
    align-items: center;
    gap: 8px 16px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
}

.config-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-right: 4px;
}

.capability-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.cap-section {
  margin-top: 16px;
  &-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  &-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.cap-tip {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-placeholder);
}

.cloud-alert {
  margin-bottom: 16px;
}

.cloud-form {
  :deep(.el-form-item) { margin-bottom: 20px; }
  :deep(.el-form-item__label) {
    color: var(--text-regular);
    font-weight: 400;
  }
}

.algo-service-section {
  padding: 0 4px;
}

.old-service-group {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
}
.old-service-title {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}
.old-service-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.aiiot-tag {
  display: inline-block; padding: 2px 8px; border-radius: 3px;
  font-size: 12px; color: #909399; background: #f4f4f5; border: 1px solid #e9e9eb;
}
.old-algo-table {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 算法能力配置 drawer
.algo-config-toolbar {
  display: flex; align-items: center; justify-content: flex-end;
  margin-bottom: 16px;
}
.algo-config-count { font-size: 13px; color: var(--text-secondary); }

.algo-cap-section {
  margin-bottom: 24px;
  &-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  }
  &-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
}
.algo-cap-tip { font-size: 12px; color: var(--text-placeholder); }
.algo-config-empty {
  padding: 24px 0; text-align: center; color: var(--text-secondary); font-size: 13px;
}

.event-id-code {
  font-size: var(--font-xs); background: var(--bg-elevated);
  padding: 2px 6px; border-radius: var(--radius-sm); color: var(--text-regular);
}

.type-tag {
  display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 11px; font-weight: 500;
  &.type-prop { background: #EBF4FF; color: #3B82F6; }
  &.type-svc { background: #F0FDF4; color: #16A34A; }
  &.type-evt { background: #FFF7ED; color: #EA580C; }
}

.type-cards { display: flex; gap: 8px; }
.type-card {
  padding: 0 12px; border: 1px solid var(--border-light);
  border-radius: var(--el-border-radius-base); font-size: 12px; line-height: 26px;
  font-weight: 500; color: var(--text-secondary); background: var(--bg-body);
  &.active { border-color: var(--primary-color); background: var(--primary-bg); color: var(--primary-color); }
}

// 数据定义表单
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

	.pkg-id-text {
	  font-size: var(--font-xs); background: var(--bg-elevated);
	  padding: 2px 8px; border-radius: var(--radius-sm); color: var(--text-regular);
	  font-family: monospace;
	}
</style>

<style lang="scss">
.algo-config-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.event-link-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.package-bind-drawer {
  .el-drawer__body { padding: 0; }
  .package-list { padding: 8px 0; }
  .package-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; cursor: pointer; transition: background .15s;
    &:hover { background: var(--bg-elevated); }
    &.active { background: var(--primary-bg); }
    &-left { display: flex; align-items: center; gap: 12px; }
    &-id { font-size: 13px; font-weight: 500; color: var(--text-primary); font-family: monospace; }
    &-name { font-size: 13px; color: var(--text-secondary); }
  }
}
.event-id-code { font-size: 12px; color: var(--text-secondary); background: #f5f7fa; padding: 1px 6px; border-radius: 3px; }
.alg-cap-dialog .el-dialog__body { padding-top: 20px; }
.custom-cap-dialog .el-dialog__body { padding-top: 20px; }
.cap-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-form-item { margin-bottom: 18px; }
  .el-divider { margin: 24px 0 20px; }
}
// 弹窗顶部留白（非 scoped，弹窗被 teleport 到 body）
.app-dialog .el-dialog__body { padding-top: 20px; }
</style>
