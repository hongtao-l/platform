<template>
  <div class="page-container">
    <!-- ===== Filter Bar ===== -->
    <div v-show="currentPage === 'strategy-list'" class="filter-bar">
      <el-select v-model="filterStatus" placeholder="全部状态" size="small" style="width:120px" clearable @change="applyFilter">
        <el-option label="草稿" value="draft" />
        <el-option label="进行中" value="active" />
        <el-option label="已暂停" value="paused" />
        <el-option label="已结束" value="ended" />
        <el-option label="已过期" value="expired" />
      </el-select>
      <el-select v-model="filterPosition" placeholder="全部位置" size="small" style="width:120px" clearable @change="applyFilter">
        <el-option label="Banner" value="slot_banner" />
        <el-option label="弹窗" value="slot_popup" />
        <el-option label="悬浮" value="slot_floating" />
      </el-select>
      <el-select v-model="filterRegion" placeholder="全部区域" size="small" style="width:120px" clearable @change="applyFilter">
        <el-option label="国内" value="国内" />
        <el-option label="海外" value="海外" />
      </el-select>
      <el-select v-model="filterApp" placeholder="全部APP" size="small" style="width:130px" clearable @change="applyFilter">
        <el-option label="牵心PRO" value="牵心PRO" />
        <el-option label="鹤梦之家" value="鹤梦之家" />
      </el-select>
      <el-input v-model="filterSearch" placeholder="搜索活动名称..." size="small" style="width:200px" clearable @input="applyFilter" />
    </div>

    <!-- ===== Page: Strategy List ===== -->
    <div v-show="currentPage === 'strategy-list'" class="ops-panel" style="padding:0">
      <div class="card">
        <div class="card-header">
          <span class="card-title">活动位策略列表</span>
          <el-button type="primary" size="small" @click="openAddStrategy">
            <el-icon><Plus /></el-icon>添加活动
          </el-button>
        </div>
        <el-table :data="filteredStrategies" stripe>
          <el-table-column label="活动名称" min-width="160">
            <template #default="{ row }">
              <div>
                <div class="strategy-name">{{ row.name }}</div>
                <div class="strategy-id">{{ row.id }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="投放位置" width="110">
            <template #default="{ row }">
              <span :class="['pos-tag', 'pos-' + row.position]">{{ positionLabels[row.position] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="活动位编码" width="130">
            <template #default="{ row }">
              <code class="code-tag">{{ posSpecs[row.position]?.code }}</code>
            </template>
          </el-table-column>
          <el-table-column label="活动周期" width="180">
            <template #default="{ row }">
              <div v-if="row.startTime">
                <div class="period-text">{{ formatDate(row.startTime) }}</div>
                <div class="period-sub">至 {{ formatDate(row.endTime) }}</div>
              </div>
              <span v-else class="cell-muted">待定</span>
            </template>
          </el-table-column>
          <el-table-column label="活动状态" width="100">
            <template #default="{ row }">
              <span :class="['status-tag', 'status-' + row.status]">{{ statusMap[row.status]?.label }}</span>
            </template>
          </el-table-column>
          <el-table-column label="套餐配置" width="100">
            <template #default="{ row }">
              <span class="clickable-cell" @click="enterPkgManage(row)">{{ row.pkgCount }} 个套餐</span>
            </template>
          </el-table-column>
          <el-table-column label="投放区域" width="100">
            <template #default="{ row }">
              <el-tag v-for="r in row.regions" :key="r" size="small" type="info" class="cell-tag">{{ r }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投放APP" width="110">
            <template #default="{ row }">
              <el-tag v-for="a in row.apps" :key="a" size="small" type="success" class="cell-tag">{{ a }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="投放用户分群" width="150">
            <template #default="{ row }">
              <el-tag v-for="g in row.groups" :key="g" size="small" type="primary" class="cell-tag cell-tag-block">{{ g }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="130">
            <template #default="{ row }">
              <span class="text-ellipsis" style="max-width:120px;display:inline-block">{{ row.remark || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row, $index }">
              <template v-if="row.status === 'draft'">
                <el-button size="small" text type="primary" @click="openEditStrategy(row)">编辑</el-button>
                <el-button size="small" text type="danger" @click="deleteStrategy(row)">删除</el-button>
                <el-button size="small" text type="success" @click="publishStrategy(row)">发布</el-button>
              </template>
              <template v-else-if="row.status === 'active'">
                <el-button size="small" text type="primary" @click="openDetailDrawer(row)">查看</el-button>
                <el-button size="small" text type="warning" @click="pauseStrategy(row)">暂停</el-button>
              </template>
              <template v-else-if="row.status === 'paused'">
                <el-button size="small" text type="primary" @click="openDetailDrawer(row)">查看</el-button>
                <el-button size="small" text type="success" @click="resumeStrategy(row)">恢复</el-button>
                <el-button size="small" text type="danger" @click="endStrategy(row)">结束</el-button>
              </template>
              <template v-else>
                <el-button size="small" text type="primary" @click="openDetailDrawer(row)">查看</el-button>
                <el-button size="small" text type="primary" @click="copyStrategy(row)">复制新建</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ===== Page: Package Management ===== -->
    <div v-show="currentPage === 'pkg-manage'" class="ops-panel" style="padding:0">
      <div class="pkg-manage-header">
        <div class="pkg-manage-left">
          <el-button @click="currentPage = 'strategy-list'">
            <el-icon><ArrowLeft /></el-icon>返回
          </el-button>
          <div>
            <div class="pkg-manage-title">{{ pkgManageName }}</div>
            <div class="pkg-manage-subtitle">
              套餐配置 · 当前已配置 <span class="pkg-count">{{ pkgManagePackages.length }}</span> 个套餐 · <span class="color-gray-400">拖拽可调整排序</span>
            </div>
          </div>
        </div>
        <div class="pkg-manage-actions">
          <el-button type="primary" size="small" @click="openAddPackages">
            <el-icon><Plus /></el-icon>添加套餐
          </el-button>
        </div>
      </div>

      <div class="card">
        <el-table :data="pkgManagePackages" stripe row-key="id" :row-class-name="getPkgRowClass" @row-dragend="onPkgDragEnd">
          <el-table-column width="50" align="center">
            <template #default="{ $index }">
              <span
                class="drag-handle"
                :class="{ 'drag-active': dragFromIdx === $index }"
                draggable="true"
                @dragstart="onPkgDragStart($event, $index)"
                @dragover.prevent="onPkgDragOver($event, $index)"
                @drop="onPkgDrop($event, $index)"
                @dragend="onPkgDragEnd"
              >
                <i class="drag-dot" v-for="n in 9" :key="n" />
              </span>
            </template>
          </el-table-column>
          <el-table-column label="套餐信息" min-width="200">
            <template #default="{ row }">
              <div class="pkg-info-cell">
                <div class="pkg-info-name">{{ row.name }}</div>
                <div class="pkg-info-id">{{ row.id }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="应用方向" width="100">
            <template #default="{ row }">{{ row.direction }}</template>
          </el-table-column>
          <el-table-column label="订阅类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.subType === '订阅制' ? 'success' : 'info'" size="small">{{ row.subType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="售价" width="140">
            <template #default="{ row }">
              <span class="price-cell">{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上架状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button size="small" text type="danger" @click="removePkgFromManage($index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ===== Drawer: Add Strategy (3-step) ===== -->
    <el-drawer v-model="addDrawerVisible" title="添加活动" size="720px">
      <div class="step-bar">
        <div class="step-item" :class="{ active: addStep >= 1, current: addStep === 1 }" @click="addStep = 1">
          <span class="step-num">
            <svg v-if="addStep > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>1</template>
          </span>
          <span class="step-label">基础信息</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: addStep >= 2 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: addStep >= 2, current: addStep === 2 }" @click="addStep = 2">
          <span class="step-num"><template>2</template></span>
          <span class="step-label">投放配置</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: addStep >= 3 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: addStep >= 3, current: addStep === 3 }" @click="addStep = 3">
          <span class="step-num"><template>3</template></span>
          <span class="step-label">活动内容</span>
        </div>
      </div>

      <!-- Step 1: 基础信息 -->
      <div v-show="addStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动名称" required>
            <el-input v-model="addForm.name" placeholder="请输入活动名称（最长50字符）" maxlength="50" />
          </el-form-item>
          <el-form-item label="活动周期" required>
            <div class="date-row">
              <el-date-picker v-model="addForm.startTime" type="datetime" placeholder="开始时间" style="flex:1" />
              <span class="date-sep">至</span>
              <el-date-picker v-model="addForm.endTime" type="datetime" placeholder="结束时间" style="flex:1" />
            </div>
            <div v-if="addForm.startTime && addForm.endTime && addForm.endTime <= addForm.startTime" class="form-error">结束时间必须晚于开始时间</div>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息（选填）" />
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 投放配置 -->
      <div v-show="addStep === 2" class="step-content">
        <el-form label-position="top">
          <el-form-item label="投放位置" required>
            <div class="position-grid">
              <div
                v-for="pos in positionOptions" :key="pos.value"
                :class="['pos-card', { selected: addForm.position === pos.value }]"
                @click="addForm.position = pos.value; addForm.popupFrequency = pos.value === 'slot_popup' ? 'once_daily' : ''"
              >
                <div class="pos-icon">{{ pos.icon }}</div>
                <div class="pos-name">{{ pos.label }}</div>
                <div class="pos-code">{{ pos.code }}</div>
                <div class="pos-spec">{{ pos.spec }}</div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="addForm.position === 'slot_popup'" label="弹窗频率">
            <div class="freq-radio">
              <span
                v-for="f in freqOptions" :key="f.value"
                :class="['freq-item', { active: addForm.popupFrequency === f.value }]"
                @click="addForm.popupFrequency = f.value"
              >{{ f.label }}</span>
            </div>
          </el-form-item>
          <el-form-item label="投放区域" required>
            <div class="checkbox-group">
              <label class="checkbox-item"><el-checkbox v-model="addForm.regions" label="国内" />国内</label>
              <label class="checkbox-item"><el-checkbox v-model="addForm.regions" label="海外" />海外</label>
            </div>
          </el-form-item>
          <el-form-item label="投放APP" required>
            <div class="checkbox-group">
              <label class="checkbox-item"><el-checkbox v-model="addForm.apps" label="牵心PRO" />牵心PRO <span class="checkbox-hint">QX_PRO_001</span></label>
              <label class="checkbox-item"><el-checkbox v-model="addForm.apps" label="鹤梦之家" />鹤梦之家 <span class="checkbox-hint">HM_HOME_001</span></label>
            </div>
          </el-form-item>
          <el-form-item label="投放用户分群" required>
            <div class="checkbox-group">
              <label v-for="g in userGroups" :key="g.name" class="checkbox-item">
                <el-checkbox v-model="addForm.groups" :label="g.name" />{{ g.name }}
                <span class="checkbox-hint">{{ g.code }}</span>
              </label>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3: 活动内容 -->
      <div v-show="addStep === 3" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动媒资" required>
            <el-upload
              class="upload-zone"
              drag
              :auto-upload="false"
              :limit="1"
              :on-change="onAddMediaChange"
              :file-list="addForm.mediaFileList"
              accept="image/*"
            >
              <div class="upload-content">
                <el-icon class="upload-icon-el"><PictureFilled /></el-icon>
                <div class="upload-text">点击或拖拽上传活动素材</div>
                <div class="upload-spec">规格要求：{{ posSpecs[addForm.position]?.spec }} px（{{ posSpecs[addForm.position]?.name }}位置）</div>
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="活动链接" required>
            <el-input v-model="addForm.activityUrl" placeholder="https://m.example.com/activity 或 carecam://..." />
            <div class="form-hint">支持 http/https 链接及 App 内部路由 scheme</div>
          </el-form-item>
          <el-form-item label="关联活动套餐（选填）">
            <div class="pkg-tags">
              <el-tag
                v-for="pkg in addForm.packages" :key="pkg.id"
                size="small" type="primary" closable class="pkg-tag-item"
                @close="removeAddPkg(pkg.id)"
              >{{ pkg.name }}</el-tag>
              <span v-if="!addForm.packages.length" class="cell-muted">暂无关联套餐</span>
            </div>
            <el-button size="small" style="margin-top:8px" @click="openAddPkgForStrategy">+ 选择套餐</el-button>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="addStep > 1" @click="addStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="addDrawerVisible = false">取消</el-button>
        <el-button v-if="addStep < 3" type="primary" @click="addStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmAddStrategy">提交</el-button>
      </template>
    </el-drawer>

    <!-- ===== Drawer: Edit Strategy (3-step) ===== -->
    <el-drawer v-model="editDrawerVisible" title="编辑活动" size="720px">
      <div class="step-bar">
        <div class="step-item" :class="{ active: editStep >= 1, current: editStep === 1 }" @click="editStep = 1">
          <span class="step-num">
            <svg v-if="editStep > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>1</template>
          </span>
          <span class="step-label">基础信息</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: editStep >= 2 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: editStep >= 2, current: editStep === 2 }" @click="editStep = 2">
          <span class="step-num"><template>2</template></span>
          <span class="step-label">投放配置</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: editStep >= 3 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: editStep >= 3, current: editStep === 3 }" @click="editStep = 3">
          <span class="step-num"><template>3</template></span>
          <span class="step-label">活动内容</span>
        </div>
      </div>

      <div v-show="editStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动名称" required>
            <el-input v-model="editForm.name" placeholder="请输入活动名称" maxlength="50" />
          </el-form-item>
          <el-form-item label="活动周期" required>
            <div class="date-row">
              <el-date-picker v-model="editForm.startTime" type="datetime" placeholder="开始时间" style="flex:1" />
              <span class="date-sep">至</span>
              <el-date-picker v-model="editForm.endTime" type="datetime" placeholder="结束时间" style="flex:1" />
            </div>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="editForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <div v-show="editStep === 2" class="step-content">
        <el-form label-position="top">
          <el-form-item label="投放位置" required>
            <div class="position-grid">
              <div
                v-for="pos in positionOptions" :key="pos.value"
                :class="['pos-card', { selected: editForm.position === pos.value }]"
                @click="editForm.position = pos.value"
              >
                <div class="pos-icon">{{ pos.icon }}</div>
                <div class="pos-name">{{ pos.label }}</div>
                <div class="pos-code">{{ pos.code }}</div>
                <div class="pos-spec">{{ pos.spec }}</div>
              </div>
            </div>
          </el-form-item>
          <el-form-item v-if="editForm.position === 'slot_popup'" label="弹窗频率">
            <div class="freq-radio">
              <span
                v-for="f in freqOptions" :key="f.value"
                :class="['freq-item', { active: editForm.popupFrequency === f.value }]"
                @click="editForm.popupFrequency = f.value"
              >{{ f.label }}</span>
            </div>
          </el-form-item>
          <el-form-item label="投放区域" required>
            <div class="checkbox-group">
              <label class="checkbox-item"><el-checkbox v-model="editForm.regions" label="国内" />国内</label>
              <label class="checkbox-item"><el-checkbox v-model="editForm.regions" label="海外" />海外</label>
            </div>
          </el-form-item>
          <el-form-item label="投放APP" required>
            <div class="checkbox-group">
              <label class="checkbox-item"><el-checkbox v-model="editForm.apps" label="牵心PRO" />牵心PRO</label>
              <label class="checkbox-item"><el-checkbox v-model="editForm.apps" label="鹤梦之家" />鹤梦之家</label>
            </div>
          </el-form-item>
          <el-form-item label="投放用户分群" required>
            <div class="checkbox-group">
              <label v-for="g in userGroups" :key="g.name" class="checkbox-item">
                <el-checkbox v-model="editForm.groups" :label="g.name" />{{ g.name }}
                <span class="checkbox-hint">{{ g.code }}</span>
              </label>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="editStep === 3" class="step-content">
        <el-form label-position="top">
          <el-form-item label="活动媒资">
            <el-upload
              class="upload-zone"
              drag
              :auto-upload="false"
              :limit="1"
              :on-change="onEditMediaChange"
              :file-list="editForm.mediaFileList"
              accept="image/*"
            >
              <div class="upload-content">
                <el-icon class="upload-icon-el"><PictureFilled /></el-icon>
                <div class="upload-text">点击更换活动素材</div>
                <div class="upload-spec">规格要求：{{ posSpecs[editForm.position]?.spec }} px</div>
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="活动链接" required>
            <el-input v-model="editForm.activityUrl" placeholder="https://m.example.com/activity" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button v-if="editStep > 1" @click="editStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="editDrawerVisible = false">取消</el-button>
        <el-button v-if="editStep < 3" type="primary" @click="editStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmEditStrategy">保存</el-button>
      </template>
    </el-drawer>

    <!-- ===== Drawer: Detail View ===== -->
    <el-drawer v-model="detailDrawerVisible" title="活动详情" size="520px">
      <div v-if="detailStrategy" class="review-body">
        <div class="review-section">
          <div class="review-label">活动名称</div>
          <div class="review-value">{{ detailStrategy.name }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">活动ID</div>
          <div class="review-value">{{ detailStrategy.id }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">活动状态</div>
          <div class="review-value"><span :class="['status-tag', 'status-' + detailStrategy.status]">{{ statusMap[detailStrategy.status]?.label }}</span></div>
        </div>
        <div class="review-section">
          <div class="review-label">活动周期</div>
          <div class="review-value">{{ detailStrategy.startTime ? formatDate(detailStrategy.startTime) + ' ~ ' + formatDate(detailStrategy.endTime) : '待定' }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">投放位置</div>
          <div class="review-value">{{ positionLabels[detailStrategy.position] }}（{{ posSpecs[detailStrategy.position]?.spec }}）<br /><code class="code-tag">{{ posSpecs[detailStrategy.position]?.code }}</code></div>
        </div>
        <div v-if="detailStrategy.position === 'slot_popup' && detailStrategy.popupFrequency" class="review-section">
          <div class="review-label">弹窗频率</div>
          <div class="review-value">{{ freqOptions.find(f => f.value === detailStrategy.popupFrequency)?.label || detailStrategy.popupFrequency }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">投放区域</div>
          <div class="review-value">{{ detailStrategy.regions.join('、') }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">投放APP</div>
          <div class="review-value">{{ detailStrategy.apps.join('、') }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">投放用户分群</div>
          <div class="review-value">{{ detailStrategy.groups.join('、') }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">活动链接</div>
          <div class="review-value">{{ detailStrategy.activityUrl || '未配置' }}</div>
        </div>
        <div class="review-section">
          <div class="review-label">关联套餐</div>
          <div class="review-value">{{ detailStrategy.pkgCount }} 个</div>
        </div>
        <div class="review-section">
          <div class="review-label">备注</div>
          <div class="review-value">{{ detailStrategy.remark || '无' }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDrawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>

    <!-- ===== Dialog: Add Packages (Transfer) ===== -->
    <el-dialog v-model="addPkgVisible" title="选择关联套餐" width="900px" top="5vh">
      <div class="transfer-container">
        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>可选套餐</span>
            <span class="transfer-selected-count">已选 <span class="count-num">{{ selectedPkgIds.length }}</span> 个</span>
          </div>
          <div class="transfer-panel-body">
            <label
              v-for="pkg in allPkgList" :key="pkg.id"
              :class="['transfer-pkg-item', { selected: selectedPkgIds.includes(pkg.id) }]"
            >
              <el-checkbox :model-value="selectedPkgIds.includes(pkg.id)" @change="togglePkgSelect(pkg.id)" />
              <div class="transfer-pkg-info">
                <div class="transfer-pkg-name">{{ pkg.name }}</div>
                <div class="transfer-pkg-meta">{{ pkg.id }} · {{ pkg.direction }} · <span class="transfer-pkg-cat">{{ pkg.category }}</span> · {{ pkg.price }}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="transfer-actions">
          <el-button size="small" :disabled="!selectedPkgIds.length" @click="addSelectedPkgs">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" @click="removeSelectedPkgs">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </div>

        <div class="transfer-panel">
          <div class="transfer-panel-header">
            <span>已选套餐</span>
          </div>
          <div class="transfer-panel-body">
            <template v-if="tempStrategyPkgs.length">
              <div v-for="pkg in tempStrategyPkgs" :key="pkg.id" class="transfer-tag">
                {{ pkg.name }}<span class="transfer-tag-close" @click="removeTempPkg(pkg.id)">×</span>
              </div>
            </template>
            <div v-else class="transfer-empty">暂未选择套餐</div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="addPkgVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddPackages">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Plus, ArrowLeft, ArrowRight, PictureFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

// ===== Page State =====
const currentPage = ref('strategy-list')
const pkgManageName = ref('')
const pkgManageIdx = ref(-1)

// ===== Position Data =====
const positionOptions = [
  { value: 'slot_banner', code: 'ACT_SLOT_BANNER', label: '首页Banner', icon: '🏞️', spec: '750 × 400' },
  { value: 'slot_popup', code: 'ACT_SLOT_POPUP', label: '启动弹窗', icon: '📢', spec: '600 × 800' },
  { value: 'slot_floating', code: 'ACT_SLOT_FLOATING', label: '悬浮按钮', icon: '🔘', spec: '120 × 120' }
]

const posSpecs = Object.fromEntries(positionOptions.map(p => [p.value, { name: p.label, spec: p.spec, code: p.code }]))

const positionLabels = {
  slot_banner: 'Banner', slot_popup: '弹窗', slot_floating: '悬浮'
}

const freqOptions = [
  { value: 'always', label: '每次启动' },
  { value: 'once_daily', label: '每天一次' },
  { value: 'once_weekly', label: '每周一次' }
]

const userGroups = [
  { name: '高价值用户', code: 'ug_high_value' },
  { name: '新注册用户', code: 'ug_new_reg' },
  { name: '活跃用户', code: 'ug_active' },
  { name: '沉默用户', code: 'ug_silent' },
  { name: '付费用户', code: 'ug_paid' }
]

const statusMap = {
  draft: { label: '草稿', color: '#909399' },
  active: { label: '进行中', color: '#67C23A' },
  paused: { label: '已暂停', color: '#F2C94C' },
  ended: { label: '已结束', color: '#4A5568' },
  expired: { label: '已过期', color: '#A0AEC0' }
}

// ===== Strategies =====
const strategies = ref([
  {
    id: 'AS001', name: '618大促Banner活动', status: 'active',
    startTime: '2026-06-01T00:00', endTime: '2026-06-18T23:59',
    position: 'slot_banner', regions: ['国内'], apps: ['牵心PRO'],
    groups: ['高价值用户', '活跃用户'], activityUrl: 'https://m.example.com/activity/618',
    popupFrequency: '', packages: [], pkgCount: 3,
    remark: '618大促首页Banner'
  },
  {
    id: 'AS002', name: '新用户专享弹窗', status: 'active',
    startTime: '2026-05-20T00:00', endTime: '2026-06-20T23:59',
    position: 'slot_popup', regions: ['国内', '海外'], apps: ['牵心PRO', '鹤梦之家'],
    groups: ['新注册用户'], activityUrl: 'https://m.example.com/new-user',
    popupFrequency: 'once_daily', packages: [], pkgCount: 2,
    remark: '新用户首次打开App展示'
  },
  {
    id: 'AS003', name: '五一悬浮活动', status: 'expired',
    startTime: '2026-04-28T00:00', endTime: '2026-05-05T23:59',
    position: 'slot_floating', regions: ['国内'], apps: ['牵心PRO'],
    groups: ['活跃用户', '付费用户'], activityUrl: 'https://m.example.com/mayday',
    popupFrequency: '', packages: [], pkgCount: 1,
    remark: '五一特惠'
  },
  {
    id: 'AS004', name: '双11预售弹窗', status: 'draft',
    startTime: '2026-11-01T00:00', endTime: '2026-11-11T23:59',
    position: 'slot_popup', regions: ['国内', '海外'], apps: ['牵心PRO', '鹤梦之家'],
    groups: ['高价值用户', '活跃用户', '付费用户'], activityUrl: 'https://m.example.com/double11',
    popupFrequency: 'always', packages: [], pkgCount: 4,
    remark: '双11大促预售'
  }
])

// ===== Filters =====
const filterStatus = ref('')
const filterPosition = ref('')
const filterRegion = ref('')
const filterApp = ref('')
const filterSearch = ref('')

const filteredStrategies = ref([])

const applyFilter = () => {
  let list = strategies.value

  // Auto-check expired
  const now = new Date().toISOString()
  list.forEach(s => {
    if (s.status === 'active' && s.endTime && s.endTime < now) {
      s.status = 'expired'
    }
  })

  if (filterStatus.value) list = list.filter(s => s.status === filterStatus.value)
  if (filterPosition.value) list = list.filter(s => s.position === filterPosition.value)
  if (filterRegion.value) list = list.filter(s => s.regions.includes(filterRegion.value))
  if (filterApp.value) list = list.filter(s => s.apps.includes(filterApp.value))
  if (filterSearch.value) {
    const kw = filterSearch.value.toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(kw))
  }
  filteredStrategies.value = list
}

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.replace('T', ' ').substring(0, 16)
}

// ===== Package Management State =====
const pkgManagePackages = ref([])

// All available packages pool (simulates backend data)
const allPkgsPool = [
  { id: 'PKG001', name: '事件录像7天', direction: '设备', subType: '订阅制', price: '¥6.90', enabled: true },
  { id: 'PKG002', name: '国内专享·极简云存', direction: '用户', subType: '订阅制', price: '¥59.00', enabled: true },
  { id: 'PKG003', name: 'Overseas-Pro', direction: '设备', subType: '订阅制', price: '$12.99', enabled: false },
  { id: 'PKG004', name: 'AI智能检测月卡', direction: '设备', subType: '订阅制', price: '¥19.90', enabled: true },
  { id: 'PKG005', name: '全家桶年度套餐', direction: '用户', subType: '非订阅', price: '¥199.00', enabled: true }
]

const enterPkgManage = (row) => {
  pkgManageName.value = row.name
  pkgManageIdx.value = row.id
  // Load strategy's packages (or default set for demo)
  pkgManagePackages.value = allPkgsPool.map(p => ({ ...p }))
  currentPage.value = 'pkg-manage'
}

const removePkgFromManage = (idx) => {
  pkgManagePackages.value.splice(idx, 1)
  syncStrategyPkgCount()
}

const syncStrategyPkgCount = () => {
  const s = strategies.value.find(s => s.id === pkgManageIdx.value)
  if (s) s.pkgCount = pkgManagePackages.value.length
}

// ===== Drag and Drop =====
const dragFromIdx = ref(-1)
const dragOverIdx = ref(-1)

const getPkgRowClass = ({ rowIndex }) => {
  if (rowIndex === dragFromIdx.value) return 'row-dragging'
  if (rowIndex === dragOverIdx.value) return 'row-drag-over'
  return ''
}

const onPkgDragStart = (e, idx) => {
  dragFromIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }
}

const onPkgDragOver = (e, idx) => {
  dragOverIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

const onPkgDrop = (e, idx) => {
  const list = pkgManagePackages.value
  const from = dragFromIdx.value
  if (from === idx || from === -1) {
    dragFromIdx.value = -1
    dragOverIdx.value = -1
    return
  }
  const item = list.splice(from, 1)[0]
  list.splice(idx, 0, item)
  dragFromIdx.value = -1
  dragOverIdx.value = -1
  syncStrategyPkgCount()
}

const onPkgDragEnd = () => {
  dragFromIdx.value = -1
  dragOverIdx.value = -1
}

// ===== Add Strategy =====
const addDrawerVisible = ref(false)
const addStep = ref(1)
const addForm = reactive({
  name: '', startTime: '', endTime: '', remark: '',
  position: 'slot_banner', regions: ['国内'], apps: ['牵心PRO'],
  groups: [], activityUrl: '', popupFrequency: '',
  packages: [], mediaFileList: []
})

const openAddStrategy = () => {
  addStep.value = 1
  addForm.name = ''
  addForm.startTime = ''
  addForm.endTime = ''
  addForm.remark = ''
  addForm.position = 'slot_banner'
  addForm.regions = ['国内']
  addForm.apps = ['牵心PRO']
  addForm.groups = []
  addForm.activityUrl = ''
  addForm.popupFrequency = ''
  addForm.packages = []
  addForm.mediaFileList = []
  addDrawerVisible.value = true
}

const onAddMediaChange = (file) => {
  addForm.mediaFileList = [file]
}

const removeAddPkg = (pkgId) => {
  addForm.packages = addForm.packages.filter(p => p.id !== pkgId)
}

const openAddPkgForStrategy = () => {
  tempStrategyPkgs.value = [...addForm.packages]
  openAddPackages()
}

const confirmAddStrategy = () => {
  if (!addForm.name.trim()) { addStep.value = 1; return }
  if (addForm.startTime && addForm.endTime && addForm.endTime <= addForm.startTime) { addStep.value = 1; return }
  if (!addForm.activityUrl.trim()) { addStep.value = 3; return }
  if (!addForm.regions.length) { addStep.value = 2; return }
  if (!addForm.apps.length) { addStep.value = 2; return }
  if (!addForm.groups.length) { addStep.value = 2; return }

  const id = 'AS' + String(strategies.value.length + 1).padStart(3, '0')
  strategies.value.push({
    id, name: addForm.name, status: 'draft',
    startTime: addForm.startTime, endTime: addForm.endTime,
    position: addForm.position, regions: [...addForm.regions],
    apps: [...addForm.apps], groups: [...addForm.groups],
    activityUrl: addForm.activityUrl,
    popupFrequency: addForm.position === 'slot_popup' ? addForm.popupFrequency : '',
    packages: [...addForm.packages], pkgCount: addForm.packages.length,
    remark: addForm.remark
  })
  addDrawerVisible.value = false
  applyFilter()
}

// ===== Edit Strategy =====
const editDrawerVisible = ref(false)
const editStep = ref(1)
const editingId = ref('')
const editForm = reactive({
  name: '', startTime: '', endTime: '', remark: '',
  position: 'slot_banner', regions: [], apps: [],
  groups: [], activityUrl: '', popupFrequency: '',
  mediaFileList: []
})

const openEditStrategy = (row) => {
  editStep.value = 1
  editingId.value = row.id
  editForm.name = row.name
  editForm.startTime = row.startTime
  editForm.endTime = row.endTime
  editForm.remark = row.remark
  editForm.position = row.position
  editForm.regions = [...row.regions]
  editForm.apps = [...row.apps]
  editForm.groups = [...row.groups]
  editForm.activityUrl = row.activityUrl
  editForm.popupFrequency = row.popupFrequency || ''
  editForm.mediaFileList = []
  editDrawerVisible.value = true
}

const onEditMediaChange = (file) => {
  editForm.mediaFileList = [file]
}

const confirmEditStrategy = () => {
  const s = strategies.value.find(s => s.id === editingId.value)
  if (!s) return
  s.name = editForm.name
  s.startTime = editForm.startTime
  s.endTime = editForm.endTime
  s.remark = editForm.remark
  s.position = editForm.position
  s.regions = [...editForm.regions]
  s.apps = [...editForm.apps]
  s.groups = [...editForm.groups]
  s.activityUrl = editForm.activityUrl
  s.popupFrequency = editForm.position === 'slot_popup' ? editForm.popupFrequency : ''
  editDrawerVisible.value = false
  applyFilter()
}

const deleteStrategy = (row) => {
  strategies.value = strategies.value.filter(s => s.id !== row.id)
  applyFilter()
}

// ===== Status Flow =====
const checkConflict = (strategy) => {
  return strategies.value.filter(s => {
    if (s.id === strategy.id) return false
    if (s.status !== 'active') return false
    if (s.position !== strategy.position) return false
    const hasRegion = s.regions.some(r => strategy.regions.includes(r))
    if (!hasRegion) return false
    const hasApp = s.apps.some(a => strategy.apps.includes(a))
    if (!hasApp) return false
    const hasGroup = s.groups.some(g => strategy.groups.includes(g))
    if (!hasGroup) return false
    return true
  })
}

const publishStrategy = async (row) => {
  const conflicts = checkConflict(row)
  if (conflicts.length > 0) {
    const names = conflicts.map(s => `「${s.name}(${s.id})」`).join('、')
    try {
      await ElMessageBox.confirm(
        `检测到与以下进行中活动存在投放冲突：${names}。同一用户在同一APP同一区域的同一位置不可同时存在两个进行中活动。确定仍要发布吗？`,
        '冲突预警',
        { confirmButtonText: '仍要发布', cancelButtonText: '取消', type: 'warning' }
      )
    } catch {
      return
    }
  }
  row.status = 'active'
  applyFilter()
}
const pauseStrategy = (row) => { row.status = 'paused'; applyFilter() }
const resumeStrategy = (row) => { row.status = 'active'; applyFilter() }
const endStrategy = (row) => { row.status = 'ended'; applyFilter() }
const copyStrategy = (row) => {
  const id = 'AS' + String(strategies.value.length + 1).padStart(3, '0')
  strategies.value.push({ ...row, id, name: row.name + '（副本）', status: 'draft' })
  applyFilter()
}

// ===== Detail Drawer =====
const detailDrawerVisible = ref(false)
const detailStrategy = ref(null)

const openDetailDrawer = (row) => {
  detailStrategy.value = row
  detailDrawerVisible.value = true
}

// ===== Package Transfer =====
const addPkgVisible = ref(false)
const selectedPkgIds = ref([])
const tempStrategyPkgs = ref([])

const allPkgList = [
  { id: 'PKG001', name: '事件录像7天', direction: '设备', category: '云存储套餐', price: '¥6.90' },
  { id: 'PKG002', name: '国内专享·极简云存', direction: '用户', category: '云存储套餐', price: '¥59.00' },
  { id: 'PKG003', name: 'Overseas-Pro', direction: '设备', category: '云存储套餐', price: '$12.99' },
  { id: 'PKG004', name: 'AI智能检测月卡', direction: '设备', category: 'AI智能服务', price: '¥19.90' },
  { id: 'PKG005', name: '全家桶年度套餐', direction: '用户', category: '综合套餐', price: '¥199.00' }
]

const openAddPackages = () => {
  selectedPkgIds.value = []
  tempStrategyPkgs.value = []
  addPkgVisible.value = true
}

const togglePkgSelect = (id) => {
  const idx = selectedPkgIds.value.indexOf(id)
  if (idx === -1) selectedPkgIds.value.push(id)
  else selectedPkgIds.value.splice(idx, 1)
}

const addSelectedPkgs = () => {
  for (const id of selectedPkgIds.value) {
    if (!tempStrategyPkgs.value.find(p => p.id === id)) {
      const pkg = allPkgList.find(p => p.id === id)
      if (pkg) tempStrategyPkgs.value.push({ ...pkg })
    }
  }
  selectedPkgIds.value = []
}

const removeSelectedPkgs = () => {
  tempStrategyPkgs.value = tempStrategyPkgs.value.filter(p => !selectedPkgIds.value.includes(p.id))
  selectedPkgIds.value = []
}

const removeTempPkg = (pkgId) => {
  tempStrategyPkgs.value = tempStrategyPkgs.value.filter(p => p.id !== pkgId)
}

const confirmAddPackages = () => {
  if (currentPage.value === 'pkg-manage') {
    for (const pkg of tempStrategyPkgs.value) {
      if (!pkgManagePackages.value.find(p => p.id === pkg.id)) {
        pkgManagePackages.value.push({ ...pkg, subType: '订阅制', enabled: true })
      }
    }
    syncStrategyPkgCount()
  } else {
    for (const pkg of tempStrategyPkgs.value) {
      if (!addForm.packages.find(p => p.id === pkg.id)) {
        addForm.packages.push({ ...pkg })
      }
    }
  }
  addPkgVisible.value = false
}

// ===== Auto-expire check =====
let expireTimer = null
onMounted(() => {
  applyFilter()
  expireTimer = setInterval(applyFilter, 60000)
})
onUnmounted(() => {
  clearInterval(expireTimer)
})
</script>

<style lang="scss" scoped>
// ===== Filter Bar =====
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  flex-wrap: wrap;
}

// ===== Strategy Table =====
.strategy-name { font-weight: 500; color: var(--text-primary); }
.strategy-id { font-size: 11px; color: var(--gray-400); margin-top: 2px; }

.period-text { font-size: var(--font-sm); }
.period-sub { font-size: 11px; color: var(--text-secondary); }

.cell-muted { font-size: var(--font-sm); color: var(--gray-400); }
.cell-tag { margin-right: 4px; }

.tag-line { margin-bottom: 2px; }

// ===== Status Tags =====
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-draft { background: #F1F5F9; color: #64748B; }
.status-active { background: #F0FDF4; color: #16A34A; }
.status-paused { background: #FFFBEB; color: #D97706; }
.status-ended { background: #F1F5F9; color: #4A5568; }
.status-expired { background: #F8FAFC; color: #94A3B8; }

// ===== Position Tags =====
.pos-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
}

.code-tag {
  font-size: 11px;
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-regular);
}
.pos-slot_banner { background: #2563EB; }
.pos-slot_popup { background: #EA580C; }
.pos-slot_floating { background: #16A34A; }

// ===== Position Cards =====
.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pos-card {
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;

  &:hover { border-color: var(--gray-400); }

  &.selected {
    border-color: var(--primary-color);
    background: var(--primary-light);
  }

  .pos-icon { font-size: 28px; margin-bottom: 6px; line-height: 1; }
  .pos-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
  .pos-code { font-size: 10px; color: var(--gray-400); font-family: monospace; margin-bottom: 2px; }
  .pos-spec { font-size: 11px; color: var(--gray-400); }

  &.selected {
    .pos-name { color: var(--primary-color); }
    .pos-code { color: var(--primary-color); opacity: 0.7; }
    .pos-spec { color: var(--primary-color); }
  }
}

// ===== Frequency Radio =====
.freq-radio { display: flex; gap: 8px; }

.freq-item {
  padding: 8px 16px;
  border: 1.5px solid var(--gray-200);
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-sm);
  color: var(--text-regular);
  transition: all .15s;

  &:hover { background: var(--bg-hover); }

  &.active {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-light);
  }
}

// ===== Date Row =====
.date-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.date-sep { color: var(--gray-400); font-size: var(--font-md); flex-shrink: 0; }

.form-error { color: var(--danger-color); font-size: var(--font-xs); margin-top: 4px; }

// ===== Upload Zone =====
.upload-zone {
  width: 100%;
}

.upload-content {
  padding: 16px;
  text-align: center;
}

.upload-icon-el {
  font-size: 32px;
  color: var(--gray-400);
  margin-bottom: 8px;
}

.upload-text { font-size: var(--font-sm); color: var(--text-secondary); }
.upload-spec { font-size: var(--font-xs); color: var(--gray-400); margin-top: 4px; }

// ===== Package Tags =====
.pkg-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pkg-tag-item { margin-bottom: 4px; }

// ===== Package Management =====
.pkg-manage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.pkg-manage-left { display: flex; align-items: center; gap: 12px; }
.pkg-manage-actions { display: flex; gap: 8px; }
.pkg-manage-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.pkg-manage-subtitle { font-size: var(--font-xs); color: var(--text-secondary); margin-top: 2px; }
.pkg-count { color: var(--primary-color); font-weight: 600; }

.pkg-info-cell {
  .pkg-info-name { font-weight: 500; color: var(--text-primary); }
  .pkg-info-id { font-size: var(--font-xs); color: var(--gray-400); margin-top: 2px; }
}

.price-cell { font-weight: 500; }

// ===== Drag Handle =====
.drag-handle {
  cursor: grab;
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 4px;
  border-radius: 4px;
  transition: all .15s;
  user-select: none;

  &:hover { background: var(--primary-light); }
  &.drag-active { cursor: grabbing; background: var(--primary-light); }
}

.drag-dot {
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 1px;
  background: var(--primary-color);
  font-style: normal;
}

// Drag row visual states
:deep(.row-dragging) {
  opacity: 0.5;
  background: var(--primary-light) !important;

  td { border-bottom: 2px dashed var(--primary-color) !important; }
}

:deep(.row-drag-over) {
  td {
    border-top: 3px solid var(--primary-color) !important;
  }
}

// ===== Review =====
.review-body { padding: 0; }

.review-section { margin-bottom: 14px; }

.review-label {
  font-size: var(--font-xs);
  color: var(--gray-400);
  margin-bottom: 4px;
}

.review-value {
  font-size: var(--font-md);
  color: var(--text-primary);
}

// ===== Transfer =====
.transfer-selected-count {
  font-weight: 400;
  color: var(--gray-400);

  .count-num { color: var(--primary-color); font-weight: 600; }
}

// ===== Utilities =====
.footer-spacer { flex: 1; }
.color-gray-400 { color: var(--gray-400); }
</style>
