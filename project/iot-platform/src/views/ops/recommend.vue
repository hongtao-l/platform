<template>
  <div class="page-container" style="display:flex;flex-direction:column;padding:0">
    <!-- Top Tabs -->
    <div class="ops-tabs">
      <div
        v-for="tab in opsTabs"
        :key="tab.key"
        :class="['ops-tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >{{ tab.label }}</div>
    </div>

    <!-- Panel Content -->
    <div class="ops-layout">
      <!-- Left Sidebar -->
      <div class="ops-left">
        <div class="ops-left-label">应用 / 推荐位</div>
        <div v-for="app in apps" :key="app.id" class="ops-tree-app">
          <div class="ops-tree-header" :class="{ collapsed: app.collapsed }" @click="app.collapsed = !app.collapsed">
            <el-icon class="arrow"><ArrowDown /></el-icon>
            <span>{{ app.name }}</span>
          </div>
          <div v-show="!app.collapsed" class="ops-tree-app-id">{{ app.code }}</div>
          <div v-show="!app.collapsed" class="ops-tree-slots">
            <div
              v-for="slot in app.slots"
              :key="slot.code"
              :class="['ops-tree-slot', { active: activeSlot === slot.code && activeApp === app.id }]"
              @click="selectSlot(app.id, slot)"
            >
              {{ slot.name }}
              <span class="slot-code">{{ slot.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content -->
      <div class="ops-right">
        <!-- Funnel Tab -->
        <div v-show="activeTab === 'funnel'">
          <div class="ops-panel-title">{{ currentSlotName }} · 漏斗列表</div>
          <div class="card">
            <div class="card-header">
              <span class="card-title">漏斗列表</span>
              <el-button type="primary" size="small" @click="openFunnelDrawer('add')">
                <el-icon><Plus /></el-icon>添加漏斗
              </el-button>
            </div>
            <el-table :data="funnels" stripe>
              <el-table-column label="漏斗名称" min-width="200">
                <template #default="{ row }">
                  <span class="text-medium">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="140" />
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="openFunnelDrawer('edit', row)">编辑</el-button>
                  <el-button size="small" text type="danger">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- Strategy Tab -->
        <div v-show="activeTab === 'strategy'">
          <div class="ops-panel-title">{{ currentSlotName }} · 推荐位策略</div>
          <div class="card">
            <div class="card-header">
              <span class="card-title">策略列表</span>
              <el-button type="primary" size="small" @click="openStrategyDrawer('add')">
                <el-icon><Plus /></el-icon>添加策略
              </el-button>
            </div>
            <el-table :data="strategies" stripe :row-class-name="strategyRowClass">
              <el-table-column label="策略名称" min-width="160">
                <template #default="{ row }">
                  <div>
                    <div class="text-medium">{{ row.name }}</div>
                    <div v-if="row.isDefault" class="default-strategy-hint">未命中策略的用户展示此策略</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="投放区域" width="120">
                <template #default="{ row }">
                  <el-tag v-for="r in row.regions" :key="r" size="small" type="info" class="cell-tag">{{ r }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="投放用户分群" width="180">
                <template #default="{ row }">
                  <span v-if="row.isDefault" class="cell-muted">—</span>
                  <el-tag v-for="g in row.groups" :key="g" size="small" class="cell-tag cell-tag-block">{{ g }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="漏斗配置" min-width="200">
                <template #default="{ row }">
                  <div class="funnel-config-list">
                    <div v-for="(f, fi) in row.funnels" :key="fi">{{ f.condition }} → {{ f.funnel }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="冷却期" width="90">
                <template #default="{ row }">
                  <span v-if="row.cooldownDays" class="cell-muted">{{ row.cooldownDays }} 天</span>
                  <span v-else class="cell-muted">—</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" width="140" />
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="openStrategyDrawer('edit', row)">编辑</el-button>
                  <el-button v-if="!row.isDefault" size="small" text type="danger">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Drawer: Add/Edit Funnel ===== -->
    <el-drawer v-model="funnelDrawerVisible" :title="funnelDrawerTitle" size="560px">
      <el-form :model="funnelForm" label-position="top">
        <el-form-item label="漏斗名称" required>
          <el-input v-model="funnelForm.name" placeholder="请输入漏斗名称" />
        </el-form-item>
        <div class="section-label">漏斗配置（固定4个漏斗位）</div>
        <div v-for="i in 4" :key="i" class="funnel-slot-block">
          <div class="funnel-slot-label">漏斗位 #{{ i }}</div>
          <div class="funnel-pkg-select" @click="openPkgSelect(i)">
            <span v-if="!funnelForm.slots[i-1]" class="funnel-pkg-placeholder">请选择套餐</span>
            <span v-else class="funnel-pkg-value">{{ funnelForm.slots[i-1].code }} · {{ funnelForm.slots[i-1].name }}</span>
            <el-icon class="funnel-pkg-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="funnelDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFunnel">确定</el-button>
      </template>
    </el-drawer>

    <!-- ===== Drawer: Package Selector (sub-drawer) ===== -->
    <el-drawer v-model="pkgSelectVisible" title="选择套餐" size="640px" :z-index="9999">
      <div class="pkg-select-filter">
        <el-select v-model="pkgFilter.category" placeholder="全部分类" size="small" class="filter-select" clearable>
          <el-option label="云存储套餐" value="cloud" />
          <el-option label="AI智能服务" value="ai" />
          <el-option label="综合套餐" value="bundle" />
        </el-select>
        <el-select v-model="pkgFilter.region" placeholder="投放区域" size="small" class="filter-select" clearable>
          <el-option label="国内" value="domestic" />
          <el-option label="海外" value="overseas" />
        </el-select>
        <el-select v-model="pkgFilter.app" placeholder="投放APP" size="small" class="filter-select-md" clearable>
          <el-option label="牵心PRO" value="qxpro" />
          <el-option label="鹤梦之家" value="hmhome" />
        </el-select>
        <el-select v-model="pkgFilter.slot" placeholder="投放运营位" size="small" class="filter-select-md" clearable>
          <el-option label="商城位" value="mall" />
          <el-option label="推荐位" value="recommend" />
        </el-select>
        <el-input v-model="pkgFilter.keyword" placeholder="搜索套餐名称或ID" size="small" class="filter-input" clearable />
      </div>
      <div class="pkg-select-hint">从套餐配置模块的套餐列表中选择（单选）</div>
      <div class="pkg-select-list">
        <div
          v-for="pkg in filteredPkgList"
          :key="pkg.code"
          :class="['pkg-select-item', { selected: pkgSelectSlot === pkg.code }]"
          @click="selectPkg(pkg)"
        >
          <div class="pkg-radio"><span class="pkg-radio-dot" v-show="pkgSelectSlot === pkg.code"></span></div>
          <div class="pkg-info">
            <div class="pkg-name">{{ pkg.name }}</div>
            <div class="pkg-meta">
              <span class="pkg-meta-tag">{{ pkg.code }}</span>
              <span class="pkg-meta-tag">{{ pkg.category }}</span>
              <span class="pkg-price-text">{{ pkg.price }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="pkgSelectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPkgSelect">确定</el-button>
      </template>
    </el-drawer>

    <!-- ===== Drawer: Add/Edit Strategy (3-step wizard) ===== -->
    <el-drawer v-model="strategyDrawerVisible" :title="strategyDrawerTitle" size="720px">
      <div class="step-bar">
        <div class="step-item" :class="{ active: strategyStep >= 1, current: strategyStep === 1 }" @click="strategyStep = 1">
          <span class="step-num">
            <svg v-if="strategyStep > 1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>1</template>
          </span>
          <span class="step-label">{{ stepLabels[0] }}</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: strategyStep >= 2 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: strategyStep >= 2, current: strategyStep === 2 }" @click="strategyStep = 2">
          <span class="step-num">
            <svg v-if="strategyStep > 2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            <template v-else>2</template>
          </span>
          <span class="step-label">{{ stepLabels[1] }}</span>
        </div>
        <div class="step-line"><div class="step-line-fill" :style="{ width: strategyStep >= 3 ? '100%' : '0' }"></div></div>
        <div class="step-item" :class="{ active: strategyStep >= 3, current: strategyStep === 3 }" @click="strategyStep = 3">
          <span class="step-num"><template>3</template></span>
          <span class="step-label">{{ stepLabels[2] }}</span>
        </div>
      </div>

      <div v-show="strategyStep === 1" class="step-content">
        <el-form label-position="top">
          <el-form-item label="策略名称" required>
            <el-input v-model="strategyForm.name" placeholder="请输入策略名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="strategyForm.remark" type="textarea" :rows="4" placeholder="请输入备注信息" />
          </el-form-item>
        </el-form>
      </div>

      <div v-show="strategyStep === 2" class="step-content">
        <div class="form-hint">
          如需变更漏斗，请至 <span class="form-hint-link" @click="switchToFunnel">【推荐位套餐漏斗】</span> 中配置
        </div>
        <div v-for="(cond, ci) in strategyForm.conditions" :key="ci" class="cond-block">
          <div class="cond-label">{{ cond.label }}</div>
          <el-form-item label="选择漏斗">
            <el-select v-model="cond.funnel" placeholder="请选择漏斗" class="w-full" @change="(val) => onFunnelChange(ci, val)">
              <el-option v-for="f in funnels" :key="f.name" :label="f.name" :value="f.name" />
            </el-select>
          </el-form-item>

          <!-- Funnel package details with per-layer template -->
          <div v-if="cond.funnel" class="funnel-detail">
            <div v-if="getFunnelSlots(cond.funnel).length" class="funnel-detail-list">
              <div v-for="(slot, si) in getFunnelSlots(cond.funnel)" :key="si" class="funnel-detail-layer">
                <div class="funnel-detail-row">
                  <span class="funnel-detail-num">#{{ si + 1 }}</span>
                  <span class="funnel-detail-code">{{ slot.code }}</span>
                  <span class="funnel-detail-dot">·</span>
                  <span class="funnel-detail-name">{{ slot.name }}</span>
                  <span class="funnel-detail-price">{{ slot.price }}</span>
                </div>
                <!-- Per-layer template selector -->
                <div class="layer-template-row" @click="toggleLayerTemplate(ci, si)">
                  <span class="template-arrow">{{ isLayerExpanded(ci, si) ? '▾' : '▸' }}</span>
                  <span class="template-current-name">{{ getTemplateName(cond.templateIds[si]) }}</span>
                </div>
                <!-- Template card panel for this layer -->
                <div v-if="isLayerExpanded(ci, si)" class="template-panel">
                  <div class="template-card-list" @wheel.prevent="onTemplateWheel">
                    <div
                      v-for="tpl in templates"
                      :key="tpl.id"
                      :class="['template-card', { selected: cond.templateIds[si] === tpl.id }]"
                      @click="selectLayerTemplate(ci, si, tpl.id)"
                    >
                      <div class="template-card-img" :style="{ backgroundImage: `url(${tpl.image})` }"></div>
                      <div class="template-card-name">{{ tpl.name }}</div>
                      <div v-if="cond.templateIds[si] === tpl.id" class="template-card-check">✓</div>
                    </div>
                  </div>
                  <el-button size="small" text type="primary" class="template-manage-btn" @click.stop="openTemplateDialog">管理模板</el-button>
                </div>
              </div>
            </div>
            <div v-else class="funnel-detail-empty">该漏斗暂无套餐配置</div>
          </div>
        </div>

        <el-form label-position="top" style="margin-top:12px">
          <el-form-item label="弹窗间隔（H）">
            <el-input-number v-model="strategyForm.popupInterval" :min="0" placeholder="如：2" style="width:200px" />
            <span class="form-hint" style="margin-left:8px">每 N 小时弹出 1 次</span>
          </el-form-item>

          <el-form-item label="冷却期（天）">
            <el-input-number v-model="strategyForm.cooldownDays" :min="1" placeholder="如：3" style="width:200px" />
            <span class="form-hint" style="margin-left:8px">每轮漏斗展示完毕后静默 N 天</span>
          </el-form-item>
        </el-form>
      </div>

      <div v-show="strategyStep === 3" class="step-content">
        <el-form-item label="投放区域" required>
          <div class="checkbox-group">
            <label v-for="r in regionOptions" :key="r" class="checkbox-item">
              <el-checkbox v-model="strategyForm.regions" :value="r" :disabled="isDefaultEdit" />{{ r }}
            </label>
          </div>
        </el-form-item>
        <el-form-item label="投放用户分群" required>
          <div class="checkbox-group">
            <label v-for="g in userGroupOptions" :key="g.name" class="checkbox-item">
              <el-checkbox v-model="strategyForm.groups" :value="g.name" :disabled="isDefaultEdit" />
              {{ g.name }}
              <span class="checkbox-hint">{{ g.code }}</span>
            </label>
          </div>
        </el-form-item>
      </div>

      <template #footer>
        <el-button v-if="strategyStep > 1" @click="strategyStep--">上一步</el-button>
        <span class="footer-spacer"></span>
        <el-button @click="strategyDrawerVisible = false">取消</el-button>
        <el-button v-if="strategyStep < 3" type="primary" @click="strategyStep++">下一步</el-button>
        <el-button v-else type="primary" @click="confirmStrategy">提交</el-button>
      </template>
    </el-drawer>

    <!-- ===== Dialog: Template Management ===== -->
    <el-dialog v-model="templateDialogVisible" title="管理模板" width="640px" :z-index="9999" class="tpl-mgmt-dialog">
      <div class="tpl-mgmt-toolbar">
        <el-button type="primary" size="small" @click="openTemplateEdit('add')">
          <el-icon><Plus /></el-icon>添加模板
        </el-button>
        <span class="tpl-mgmt-hint">每个漏斗层级可选用不同模板</span>
      </div>
      <el-table :data="templates" stripe class="tpl-mgmt-table">
        <el-table-column prop="id" label="模板ID" width="140" />
        <el-table-column label="预览" width="110">
          <template #default="{ row }">
            <div class="tpl-table-img" :style="{ backgroundImage: `url(${row.image})` }" @click="previewTemplateImage(row)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openTemplateEdit('edit', row)">编辑</el-button>
            <el-button size="small" text type="danger" @click="deleteTemplate(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="templateDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ===== Dialog: Template Image Preview ===== -->
    <el-dialog v-model="tplImagePreviewVisible" title="模板预览" width="700px" :z-index="29999" class="tpl-preview-dialog">
      <div class="tpl-image-preview-wrapper">
        <img :src="tplImagePreviewUrl" class="tpl-image-preview-img" />
      </div>
    </el-dialog>

    <!-- ===== Dialog: Add/Edit Template ===== -->
    <el-dialog v-model="templateEditVisible" :title="templateEditTitle" width="500px" :z-index="19999" :close-on-click-modal="false" class="tpl-edit-dialog">
      <el-form :model="templateEditForm" label-position="top">
        <el-form-item label="模板ID" required>
          <el-input v-model="templateEditForm.id" placeholder="例如：tpl_chunjie" maxlength="30" :disabled="editingTemplateId !== null" />
        </el-form-item>
        <el-form-item label="模板名称" required>
          <el-input v-model="templateEditForm.name" placeholder="例如：春节红包" maxlength="20" />
        </el-form-item>
        <el-form-item label="模板图片">
          <el-upload
            ref="tplUploadRef"
            :auto-upload="false"
            :limit="1"
            accept="image/png,image/jpeg,image/webp"
            :on-change="onTemplateFileChange"
            :on-exceed="() => {}"
            :file-list="templateEditForm.fileList"
            list-type="picture"
          >
            <el-button size="small" type="primary">上传图片</el-button>
            <template #tip>
              <div style="font-size:var(--font-xs);color:var(--gray-400);margin-top:4px">支持 PNG/JPG/WEBP，大小不超过 2MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateEditVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTemplateEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('funnel')
const opsTabs = [
  { key: 'funnel', label: '推荐位套餐漏斗' },
  { key: 'strategy', label: '推荐位策略' }
]

const stepLabels = ['基础信息', '漏斗配置', '投放配置']

// ===== Template preset SVG images =====
const tplMinimalSvg = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" fill="#F8FAFC"/><rect x="12" y="12" width="136" height="68" rx="8" fill="#E2E8F0"/><text x="80" y="50" text-anchor="middle" fill="#94A3B8" font-size="12" font-family="sans-serif">套餐图片</text><text x="20" y="98" fill="#334155" font-size="13" font-family="sans-serif" font-weight="500">套餐名称</text><text x="20" y="114" fill="#64748B" font-size="11" font-family="sans-serif">¥ 价格</text><rect x="120" y="90" width="28" height="20" rx="10" fill="#4F46E5"/><text x="134" y="104" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">购买</text></svg>`)

const tplAtmosphereSvg = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#EC4899"/></linearGradient></defs><rect width="160" height="120" fill="url(#g)"/><circle cx="100" cy="30" r="16" fill="white" opacity="0.15"/><circle cx="40" cy="90" r="24" fill="white" opacity="0.1"/><rect x="12" y="52" width="136" height="56" rx="10" fill="white" opacity="0.95"/><text x="20" y="74" fill="#334155" font-size="13" font-family="sans-serif" font-weight="600">🎉 限时优惠</text><text x="20" y="92" fill="#F97316" font-size="14" font-family="sans-serif" font-weight="700">¥ 19.90</text><text x="90" y="92" fill="#94A3B8" font-size="10" font-family="sans-serif" text-decoration="line-through">¥39.90</text><rect x="120" y="78" width="28" height="20" rx="10" fill="#F97316"/><text x="134" y="92" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">抢购</text></svg>`)

const tplDynamicSvg = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><defs><linearGradient id="d" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#312E81"/></linearGradient></defs><rect width="160" height="120" fill="url(#d)"/><polygon points="20,100 50,20 80,50 110,10 140,80" fill="none" stroke="#818CF8" stroke-width="2" opacity="0.6"/><circle cx="110" cy="10" r="4" fill="#C084FC"/><circle cx="50" cy="20" r="3" fill="#60A5FA"/><rect x="12" y="60" width="136" height="48" rx="10" fill="#1F2937" opacity="0.95" stroke="#374151" stroke-width="1"/><text x="20" y="80" fill="#F9FAFB" font-size="13" font-family="sans-serif" font-weight="600">⚡ 爆款新品</text><text x="20" y="98" fill="#818CF8" font-size="14" font-family="sans-serif" font-weight="700">¥ 29.90</text><rect x="120" y="76" width="28" height="20" rx="10" fill="#6366F1"/><text x="134" y="90" text-anchor="middle" fill="white" font-size="10" font-family="sans-serif">立即</text></svg>`)

const tplLuxurySvg = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><defs><linearGradient id="l" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#171717"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs><rect width="160" height="120" fill="url(#l)"/><rect x="4" y="4" width="152" height="112" rx="6" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.5"/><rect x="16" y="16" width="128" height="2" rx="1" fill="#D4AF37" opacity="0.3"/><text x="80" y="52" text-anchor="middle" fill="#D4AF37" font-size="20" font-family="serif">✦</text><text x="80" y="74" text-anchor="middle" fill="#F5F5F5" font-size="13" font-family="sans-serif" font-weight="500">尊享套餐</text><text x="80" y="94" text-anchor="middle" fill="#D4AF37" font-size="14" font-family="sans-serif" font-weight="700">¥ 199.00</text><rect x="56" y="104" width="48" height="12" rx="6" fill="#D4AF37" opacity="0.2"/><text x="80" y="113" text-anchor="middle" fill="#D4AF37" font-size="9" font-family="sans-serif">立即查看</text></svg>`)

// ===== Template data =====
const templates = ref([
  { id: 'tpl_minimal', name: '简约', image: tplMinimalSvg, createdAt: '2026-06-01' },
  { id: 'tpl_atmosphere', name: '氛围', image: tplAtmosphereSvg, createdAt: '2026-06-01' },
  { id: 'tpl_dynamic', name: '动态', image: tplDynamicSvg, createdAt: '2026-06-01' },
  { id: 'tpl_luxury', name: '奢华', image: tplLuxurySvg, createdAt: '2026-06-01' }
])

function getTemplateName(id) {
  if (!id) return '未选择'
  const t = templates.value.find(t => t.id === id)
  return t ? t.name : '未选择'
}

function getTemplateImage(id) {
  const t = templates.value.find(t => t.id === id)
  return t ? t.image : ''
}

// Template management dialog
const templateDialogVisible = ref(false)

function openTemplateDialog() {
  templateDialogVisible.value = true
}

// Template image preview
const tplImagePreviewVisible = ref(false)
const tplImagePreviewUrl = ref('')

function previewTemplateImage(row) {
  tplImagePreviewUrl.value = row.image
  tplImagePreviewVisible.value = true
}

// Template add/edit dialog
const templateEditVisible = ref(false)
const templateEditTitle = ref('添加模板')
const editingTemplateId = ref(null)
const templateEditForm = reactive({ id: '', name: '', fileList: [], imageData: '' })
const tplUploadRef = ref(null)
let pendingTplFile = null

function onTemplateFileChange(file) {
  if (file.raw && file.raw.size > 2 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 2MB')
    return
  }
  pendingTplFile = file.raw
}

function openTemplateEdit(mode, row) {
  if (mode === 'edit' && row) {
    templateEditTitle.value = '编辑模板'
    editingTemplateId.value = row.id
    templateEditForm.id = row.id
    templateEditForm.name = row.name
    templateEditForm.imageData = ''
    templateEditForm.fileList = []
    pendingTplFile = null
  } else {
    templateEditTitle.value = '添加模板'
    editingTemplateId.value = null
    templateEditForm.id = ''
    templateEditForm.name = ''
    templateEditForm.imageData = ''
    templateEditForm.fileList = []
    pendingTplFile = null
  }
  templateEditVisible.value = true
}

function confirmTemplateEdit() {
  if (!templateEditForm.id.trim()) {
    ElMessage.warning('请输入模板ID')
    return
  }
  if (!templateEditForm.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }

  if (editingTemplateId.value) {
    // Edit existing — ID unchanged
    const tpl = templates.value.find(t => t.id === editingTemplateId.value)
    if (tpl) {
      tpl.name = templateEditForm.name
      if (pendingTplFile) {
        const reader = new FileReader()
        reader.onload = (e) => { tpl.image = e.target.result }
        reader.readAsDataURL(pendingTplFile)
      }
    }
  } else {
    // Add new — validate ID uniqueness
    if (templates.value.some(t => t.id === templateEditForm.id)) {
      ElMessage.warning('模板ID已存在，请换一个')
      return
    }
    if (!pendingTplFile) {
      ElMessage.warning('请上传模板图片')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      templates.value.push({
        id: templateEditForm.id,
        name: templateEditForm.name,
        image: e.target.result,
        createdAt: new Date().toISOString().substring(0, 10)
      })
    }
    reader.readAsDataURL(pendingTplFile)
  }
  templateEditVisible.value = false
}

function deleteTemplate(row) {
  const refs = strategies.value.filter(s => s.funnels?.some(f => f.templateId === row.id))
  if (refs.length) {
    ElMessageBox.confirm(
      `该模板被 ${refs.length} 个策略（${refs.map(s => s.name).join('、')}）引用，确定删除？`,
      '确认删除',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    ).then(() => {
      templates.value = templates.value.filter(t => t.id !== row.id)
      resetOrphanTemplateIds(row.id)
    }).catch(() => {})
  } else {
    templates.value = templates.value.filter(t => t.id !== row.id)
    resetOrphanTemplateIds(row.id)
  }
}

function resetOrphanTemplateIds(deletedId) {
  strategies.value.forEach(s => {
    s.funnels?.forEach(f => {
      if (f.templateIds) {
        f.templateIds = f.templateIds.map(id => id === deletedId ? '' : id)
      }
    })
  })
  strategyForm.conditions.forEach(c => {
    c.templateIds = c.templateIds.map(id => id === deletedId ? '' : id)
  })
}


// App tree
const apps = ref([
  {
    id: 'qxpro', name: '牵心PRO', code: 'QX_PRO_001', collapsed: false,
    slots: [
      { name: '首页推荐位', code: 'rec_slot_home' },
      { name: '活动推荐位', code: 'rec_slot_activity' }
    ]
  },
  {
    id: 'hmhome', name: '鹤梦之家', code: 'HM_HOME_001', collapsed: true,
    slots: [
      { name: '首页推荐位', code: 'rec_slot_home' }
    ]
  }
])

const activeApp = ref('qxpro')
const activeSlot = ref('rec_slot_home')
const currentSlotName = ref('首页推荐位')

const selectSlot = (appId, slot) => {
  activeApp.value = appId
  activeSlot.value = slot.code
  currentSlotName.value = slot.name
}

// ===== Funnels =====
const funnels = ref([
  {
    name: '首页基础漏斗', createdAt: '2026-03-22',
    slots: [
      { code: 'REC_001', name: '7天事件云存储基础版', price: '¥6.90 / $0.95' },
      { code: 'REC_003', name: 'AI智能检测月卡', price: '¥9.90 / $1.49' },
      { code: 'REC_004', name: '全家桶年度套餐', price: '¥199.00 / $29.99' },
      { code: 'REC_006', name: '国内专享·极简云存', price: '¥59.00' }
    ]
  },
  {
    name: '升级推荐漏斗', createdAt: '2026-03-25',
    slots: [
      { code: 'REC_002', name: '30天全时云存储Pro版', price: '¥19.90 / $2.99' },
      { code: 'REC_005', name: 'Overseas-Pro云存储', price: '$12.99' },
      { code: 'REC_004', name: '全家桶年度套餐', price: '¥199.00 / $29.99' },
      { code: 'REC_003', name: 'AI智能检测月卡', price: '¥9.90 / $1.49' }
    ]
  }
])

function getFunnelSlots(funnelName) {
  const f = funnels.value.find(f => f.name === funnelName)
  return f?.slots || []
}

const funnelDrawerVisible = ref(false)
const funnelDrawerTitle = ref('添加漏斗')
const isFunnelEdit = ref(false)
const funnelForm = reactive({ name: '', slots: [] })

const openFunnelDrawer = (mode, row) => {
  if (mode === 'edit' && row) {
    funnelDrawerTitle.value = '编辑漏斗'
    isFunnelEdit.value = true
    funnelForm.name = row.name
    funnelForm.slots = row.slots ? [...row.slots] : []
  } else {
    funnelDrawerTitle.value = '添加漏斗'
    isFunnelEdit.value = false
    funnelForm.name = ''
    funnelForm.slots = []
  }
  funnelDrawerVisible.value = true
}

const confirmFunnel = () => {
  if (isFunnelEdit.value) {
    const f = funnels.value.find(f => f.name === funnelForm.name)
    if (f) f.slots = [...funnelForm.slots]
  } else {
    funnels.value.push({ name: funnelForm.name, createdAt: new Date().toISOString().substring(0, 10), slots: [...funnelForm.slots] })
  }
  funnelDrawerVisible.value = false
}

// Package selector
const pkgSelectVisible = ref(false)
const currentFunnelSlot = ref(0)
const pkgFilter = reactive({ category: '', region: '', app: '', slot: '', keyword: '' })
const pkgSelectSlot = ref('')

const allPkgList = [
  { code: 'REC_001', name: '7天事件云存储基础版', price: '¥6.90 / $0.95', category: '云存储套餐', type: 'cloud', region: 'domestic', app: 'qxpro', slot: 'recommend' },
  { code: 'REC_002', name: '30天全时云存储Pro版', price: '¥19.90 / $2.99', category: '云存储套餐', type: 'cloud', region: 'all', app: 'all', slot: 'mall' },
  { code: 'REC_003', name: 'AI智能检测月卡', price: '¥9.90 / $1.49', category: 'AI智能服务', type: 'ai', region: 'domestic', app: 'qxpro', slot: 'recommend' },
  { code: 'REC_004', name: '全家桶年度套餐', price: '¥199.00 / $29.99', category: '综合套餐', type: 'bundle', region: 'all', app: 'all', slot: 'all' },
  { code: 'REC_005', name: 'Overseas-Pro云存储', price: '$12.99', category: '云存储套餐', type: 'cloud', region: 'overseas', app: 'hmhome', slot: 'mall' },
  { code: 'REC_006', name: '国内专享·极简云存', price: '¥59.00', category: '云存储套餐', type: 'cloud', region: 'domestic', app: 'qxpro', slot: 'mall' }
]

const filteredPkgList = computed(() => {
  return allPkgList.filter(p => {
    if (pkgFilter.category && p.type !== pkgFilter.category) return false
    if (pkgFilter.region && p.region !== 'all' && p.region !== pkgFilter.region) return false
    if (pkgFilter.app && p.app !== 'all' && p.app !== pkgFilter.app) return false
    if (pkgFilter.slot && p.slot !== 'all' && p.slot !== pkgFilter.slot) return false
    if (pkgFilter.keyword) {
      const kw = pkgFilter.keyword.toLowerCase()
      if (!p.name.toLowerCase().includes(kw) && !p.code.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

const openPkgSelect = (slotNum) => {
  currentFunnelSlot.value = slotNum
  pkgSelectSlot.value = funnelForm.slots[slotNum - 1]?.code || ''
  pkgFilter.category = ''
  pkgFilter.region = ''
  pkgFilter.app = ''
  pkgFilter.slot = ''
  pkgFilter.keyword = ''
  pkgSelectVisible.value = true
}

const selectPkg = (pkg) => {
  pkgSelectSlot.value = pkg.code
}

const confirmPkgSelect = () => {
  const pkg = allPkgList.find(p => p.code === pkgSelectSlot.value)
  if (!pkg) return
  funnelForm.slots[currentFunnelSlot.value - 1] = pkg
  pkgSelectVisible.value = false
}

// ===== Strategies =====
const strategies = ref([
  {
    name: '国内默认策略', isDefault: true, regions: ['国内'], groups: [],
    funnels: [
      { condition: '条件一', funnel: '首页基础漏斗', templateIds: ['', '', '', ''] },
      { condition: '条件二', funnel: '首页基础漏斗', templateIds: ['', '', '', ''] },
      { condition: '条件三', funnel: '首页基础漏斗', templateIds: ['', '', '', ''] }
    ],
    cooldownDays: undefined,
    remark: '国内默认策略，兜底展示'
  },
  {
    name: '海外默认策略', isDefault: true, regions: ['海外'], groups: [],
    funnels: [
      { condition: '条件一', funnel: '首页基础漏斗', templateIds: ['', '', '', ''] },
      { condition: '条件二', funnel: '首页基础漏斗', templateIds: ['', '', '', ''] },
      { condition: '条件三', funnel: '首页基础漏斗', templateIds: ['', '', '', ''] }
    ],
    cooldownDays: undefined,
    remark: '海外默认策略，兜底展示'
  },
  {
    name: '首页推广策略', isDefault: false, regions: ['国内'],
    groups: ['高价值推荐用户', '活跃推荐用户'],
    funnels: [
      { condition: '条件一', funnel: '首页基础漏斗', templateIds: ['tpl_minimal', 'tpl_atmosphere', 'tpl_dynamic', 'tpl_luxury'] },
      { condition: '条件二', funnel: '升级推荐漏斗', templateIds: ['tpl_dynamic', 'tpl_minimal', 'tpl_atmosphere', 'tpl_luxury'] },
      { condition: '条件三', funnel: '首页基础漏斗', templateIds: ['tpl_atmosphere', 'tpl_dynamic', 'tpl_luxury', 'tpl_minimal'] }
    ],
    cooldownDays: 3,
    remark: '首页推广专用'
  }
])

const strategyRowClass = ({ row }) => row.isDefault ? 'default-row' : ''

const strategyDrawerVisible = ref(false)
const strategyDrawerTitle = ref('添加推荐位策略')
const strategyStep = ref(1)
const isDefaultEdit = ref(false)

// Template panel accordion state — tracks which (condition, layer) is expanded
const expandedLayer = ref(null) // { ci: number, si: number } | null

function isLayerExpanded(ci, si) {
  return expandedLayer.value?.ci === ci && expandedLayer.value?.si === si
}

function toggleLayerTemplate(ci, si) {
  if (isLayerExpanded(ci, si)) {
    expandedLayer.value = null
  } else {
    expandedLayer.value = { ci, si }
  }
}

function onFunnelChange(ci, funnelName) {
  const slots = getFunnelSlots(funnelName)
  strategyForm.conditions[ci].templateIds = Array(slots.length).fill('')
}

function selectLayerTemplate(ci, si, templateId) {
  strategyForm.conditions[ci].templateIds[si] = templateId
}

function onTemplateWheel(e) {
  e.currentTarget.scrollLeft += e.deltaY
}

const strategyForm = reactive({
  name: '', remark: '', popupInterval: 2, cooldownDays: undefined,
  regions: [], groups: [],
  conditions: [
    { label: '条件一：未购买云存储', funnel: '', templateIds: [] },
    { label: '条件二：已购买云存储，3 ≤ 循环时长 ＜ 7', funnel: '', templateIds: [] },
    { label: '条件三：已购买云存储，7 ≤ 循环时长 ＜ 15', funnel: '', templateIds: [] }
  ]
})

const regionOptions = ['国内', '海外']
const userGroupOptions = [
  { name: '高价值推荐用户', code: 'ug_rec_high_value' },
  { name: '活跃推荐用户', code: 'ug_rec_active' },
  { name: '沉默推荐用户', code: 'ug_rec_silent' }
]

const openStrategyDrawer = (mode, row) => {
  strategyStep.value = 1
  expandedLayer.value = null
  if (mode === 'edit' && row) {
    strategyDrawerTitle.value = row.isDefault ? '编辑默认策略' : '编辑推荐位策略'
    isDefaultEdit.value = row.isDefault
    strategyForm.name = row.name
    strategyForm.remark = row.remark === '—' ? '' : row.remark
    strategyForm.regions = [...row.regions]
    strategyForm.groups = [...row.groups]
    strategyForm.cooldownDays = row.cooldownDays
    strategyForm.conditions.forEach((c, i) => {
      c.funnel = row.funnels[i]?.funnel || ''
      const tids = row.funnels[i]?.templateIds
      c.templateIds = (tids && tids.length) ? [...tids] : []
    })
    strategyForm.popupInterval = row.popupInterval || 2
  } else {
    strategyDrawerTitle.value = '添加推荐位策略'
    isDefaultEdit.value = false
    strategyForm.name = ''
    strategyForm.remark = ''
    strategyForm.regions = ['国内']
    strategyForm.groups = []
    strategyForm.cooldownDays = undefined
    strategyForm.conditions.forEach(c => { c.funnel = ''; c.templateIds = [] })
    strategyForm.popupInterval = 2
  }
  strategyDrawerVisible.value = true
}

const confirmStrategy = () => {
  strategyDrawerVisible.value = false
}

const switchToFunnel = () => {
  strategyDrawerVisible.value = false
  activeTab.value = 'funnel'
}
</script>

<style lang="scss" scoped>
// ===== Sidebar Tree =====
.ops-left-label {
  padding: 0 12px 8px;
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--gray-400);
  text-transform: uppercase;
}

.ops-tree-app { padding: 0 12px; margin-bottom: 2px; }

.ops-tree-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
  transition: background .15s;

  &:hover { background: var(--gray-50); }

  .arrow { transition: transform .2s; color: var(--gray-400); }
  &.collapsed .arrow { transform: rotate(-90deg); }
}

.ops-tree-app-id {
  font-size: 10px;
  color: var(--gray-400);
  margin-left: 32px;
  margin-bottom: 4px;
}

.ops-tree-slots { padding-left: 16px; }

.ops-tree-slot {
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  transition: all .15s;
  margin-bottom: 1px;

  &:hover { background: var(--gray-50); color: var(--text-primary); }
  &.active { background: var(--primary-light); color: var(--primary-color); font-weight: 500; }

  .slot-code { font-size: 10px; color: var(--gray-400); margin-top: 1px; }
  &.active .slot-code { color: var(--primary-color); }
}

// ===== Panel Content =====
.ops-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

// ===== Table Cells =====
.text-medium { font-weight: 500; color: var(--text-primary); }
.cell-tag { margin-right: 4px; }
.cell-tag-block { margin-bottom: 2px; }
.cell-muted { font-size: var(--font-sm); color: var(--gray-400); }
.default-strategy-hint { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
.funnel-config-list { font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.6; }

// ===== Funnel Drawer =====
.section-label {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--spacing-md) 0 8px;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.funnel-pkg-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

// ===== Package Selector =====
.pkg-select-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.pkg-select-hint {
  font-size: var(--font-xs);
  color: var(--gray-400);
  margin-bottom: 12px;
}

.pkg-info { flex: 1; min-width: 0; }
.pkg-name { font-size: var(--font-md); font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
.pkg-meta { display: flex; align-items: center; gap: 12px; font-size: var(--font-xs); }
.pkg-meta-tag { color: var(--gray-400); background: var(--gray-100); padding: 2px 6px; border-radius: 4px; }
.pkg-price-text { color: var(--primary-color); font-weight: 500; }

// ===== Strategy Form =====
.form-hint {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.form-hint-link {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
}

// ===== Funnel Detail =====
.funnel-detail {
  background: var(--gray-50);
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: -8px;
  margin-bottom: 12px;
}

.funnel-detail-layer {
  padding: 6px 0;
  border-bottom: 1px solid var(--gray-100);

  &:last-child { border-bottom: none; }
}

.funnel-detail-list {
  display: flex;
  flex-direction: column;
}

.funnel-detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.funnel-detail-num {
  color: var(--gray-400);
  font-weight: 500;
  min-width: 18px;
}

.funnel-detail-code {
  background: var(--gray-200);
  padding: 0 4px;
  border-radius: 3px;
  font-size: 11px;
  color: var(--gray-500);
}

.funnel-detail-dot { color: var(--gray-400); }

.funnel-detail-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.funnel-detail-price {
  font-weight: 500;
  color: var(--primary-color);
  flex-shrink: 0;
}

.funnel-detail-empty {
  font-size: 12px;
  color: var(--gray-400);
  text-align: center;
  padding: 4px 0;
}

// ===== Template Selector (per-layer) =====
.layer-template-row {
  display: flex;
  align-items: center;
  padding: 4px 0 4px 8px;
  cursor: pointer;
  user-select: none;
  gap: 4px;

  &:hover .template-current-name { color: var(--primary-color); }
}

.template-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  flex: 1;

  &:hover .template-current-name { color: var(--primary-color); }
}

.template-arrow {
  font-size: 12px;
  color: var(--gray-400);
  width: 14px;
}

.template-current-name {
  font-size: var(--font-md);
  font-weight: 500;
  color: var(--text-primary);
  transition: color .15s;
}

.template-manage-btn {
  font-size: var(--font-xs);
}

// ===== Template Card Panel =====
.template-panel {
  padding: 8px 0 4px 8px;
}

.template-card-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 2px; }
}

.template-card {
  min-width: 160px;
  width: 160px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: all .15s;
  position: relative;
  flex-shrink: 0;

  &:hover { border-color: var(--primary-color); }

  &.selected {
    border-color: var(--primary-color);
    border-width: 2px;
    padding: 9px;
  }
}

.template-card-img {
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  background-color: var(--gray-100);
}

.template-card-name {
  font-size: 13px;
  color: var(--text-primary);
  text-align: center;
  margin-top: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-manage-btn {
  margin-top: 8px;
}

.template-card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-more {
  display: flex;
  align-items: center;
  justify-content: center;

  .template-card-img { display: none; }
}

.template-more-text {
  font-size: 12px;
  color: var(--primary-color);
  padding: 8px 0;
}

// ===== Template Table Image =====
.tpl-table-img {
  width: 88px;
  height: 66px;
  border-radius: 4px;
  background-size: cover;
  background-position: center;
  background-color: var(--gray-100);
  cursor: pointer;

  &:hover { opacity: .8; }
}

.tpl-image-preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tpl-image-preview-img {
  width: 100%;
  border-radius: 8px;
}

// ===== Cond Block =====
.cond-block {
  margin-bottom: var(--spacing-md);
}

.cond-label {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}

// ===== Funnel Slot Block =====
.funnel-slot-block {
  margin-bottom: var(--spacing-md);
}

.funnel-slot-label {
  font-size: var(--font-xs);
  color: var(--gray-400);
  margin-bottom: 4px;
}

.funnel-pkg-select {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color .15s;
  background: var(--gray-50);

  &:hover { border-color: var(--primary-color); }
}

.funnel-pkg-placeholder {
  font-size: var(--font-md);
  color: var(--gray-400);
}

.funnel-pkg-value {
  font-size: var(--font-md);
  font-weight: 500;
  color: var(--text-primary);
}

.funnel-pkg-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

// ===== Template Management Dialog =====
.tpl-mgmt-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tpl-mgmt-hint {
  font-size: var(--font-xs);
  color: var(--gray-400);
}

.tpl-mgmt-table {
  // table within dialog already has good defaults
}

// ===== Utilities =====
.w-full { width: 100%; }
.footer-spacer { flex: 1; }
.filter-select { width: 120px; }
.filter-select-md { width: 140px; }
.filter-input { flex: 1; min-width: 180px; }
</style>

<style lang="scss">
.tpl-mgmt-dialog .el-dialog__body {
  padding-top: 20px;
}

.tpl-edit-dialog .el-dialog__body {
  padding-top: 20px;
}

.tpl-preview-dialog .el-dialog__body {
  padding-top: 20px;
}
</style>
