<template>
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <div class="page-container config-page flex-1 min-w-0 overflow-auto flex flex-col">
    <!-- 页面头部 -->
    <div class="w-full p-4 pb-16 space-y-4 flex-1">
      <PageBackBar title="开发产品" back-label="返回列表" @back="handleBack" />

      <!-- 产品信息卡片 -->
      <div class="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
              </svg>
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h2 class="text-lg font-bold text-slate-900 truncate">{{ productName }}</h2>
                <button class="text-xs text-sky-600 hover:text-sky-700 font-medium inline-flex items-center space-x-1 hover:underline" @click="handleEditProduct">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                  <span>编辑产品</span>
                </button>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />开发中
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">{{ productDescription }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2 text-xs flex-shrink-0">
            <span class="text-slate-400">固件 SDK 版本:</span>
            <span class="font-mono font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700">v2.4.1-rc</span>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-50/70 p-3 rounded border border-slate-100">
            <div class="text-[11px] font-medium text-slate-400">产品 ID (Product ID)</div>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="font-mono text-xs font-semibold text-slate-800 truncate">{{ productId }}</span>
              <button class="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0" title="复制 ID" @click="copyProductId">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="13" rx="2" ry="2" stroke-width="2" width="13" x="9" y="9" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" /></svg>
              </button>
            </div>
          </div>
          <div class="bg-slate-50/70 p-3 rounded border border-slate-100">
            <div class="text-[11px] font-medium text-slate-400">产品型号 (Product Model)</div>
            <div class="mt-1 font-mono text-xs font-semibold text-slate-800 truncate" title="TEST-MODEL-388537">TEST-MODEL-388537</div>
          </div>
          <div class="bg-slate-50/70 p-3 rounded border border-slate-100">
            <div class="text-[11px] font-medium text-slate-400">产品类目 (Category)</div>
            <div class="mt-1 text-xs font-semibold text-slate-800 truncate">{{ productCategoryDisplay }}</div>
          </div>
          <div class="bg-slate-50/70 p-3 rounded border border-slate-100">
            <div class="text-[11px] font-medium text-slate-400">通信协议 / 联网方式</div>
            <div class="mt-1 text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Wi-Fi + BLE 双模协议</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤条 -->
      <nav class="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <ol class="flex items-center w-full">
          <li class="flex items-center space-x-3 flex-shrink-0 cursor-pointer" @click="currentStep = 0">
            <span class="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white font-mono text-xs font-bold" :class="currentStep === 0 ? 'border-sky-600 text-sky-600' : (currentStep > 0 ? 'border-sky-500 text-sky-500' : 'border-slate-200 text-slate-400')">1</span>
            <div class="text-xs">
              <span class="block" :class="currentStep === 0 ? 'font-semibold text-sky-700' : 'font-medium text-slate-600'">功能定义与配置</span>
              <span class="text-[10px] text-slate-400 font-normal">物模型能力配置 ({{ standardCapTree.length }}项就绪)</span>
            </div>
          </li>
          <div aria-hidden="true" class="stepper-connector mx-4" />
          <li class="flex items-center space-x-3 flex-shrink-0 cursor-pointer" @click="currentStep = 2">
            <span class="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white font-mono text-xs font-bold" :class="currentStep === 2 ? 'border-sky-600 text-sky-600' : (currentStep > 2 ? 'border-sky-500 text-sky-500' : 'border-slate-200 text-slate-400')">2</span>
            <div class="text-xs">
              <span class="block" :class="currentStep === 2 ? 'font-semibold text-sky-700' : 'font-medium text-slate-600'">APP 控制面板配置</span>
              <span class="text-[10px] text-slate-400 font-normal">UI模版、多语言设定</span>
            </div>
          </li>
          <div aria-hidden="true" class="stepper-connector mx-4" />
          <li class="flex items-center space-x-3 flex-shrink-0 cursor-pointer" @click="currentStep = 3">
            <span class="flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white font-mono text-xs font-bold" :class="currentStep === 3 ? 'border-sky-600 text-sky-600' : 'border-slate-200 text-slate-400'">3</span>
            <div class="text-xs">
              <span class="block" :class="currentStep === 3 ? 'font-semibold text-sky-700' : 'font-medium text-slate-600'">平台服务 &amp; 发布</span>
              <span class="text-[10px] text-slate-400 font-normal">数据流转规则与固件联调</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- ===== 步骤0: 功能定义与配置 ===== -->
      <template v-if="currentStep === 0">
        <div class="device-cap-layout">
          <div class="device-cap-main space-y-5">
            <!-- 平台标准能力项 -->
            <section class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold text-sm text-slate-900">平台标准能力项</h3>
                  <el-tooltip content="由行业标准物模型库推荐的通用能力，可保证各类主流客户端及生态的即插即用互通性。" placement="top">
                    <el-icon class="text-slate-400 cursor-help"><QuestionFilled /></el-icon>
                  </el-tooltip>
                  <span class="text-xs text-slate-400 font-mono">({{ standardCapTree.length }})</span>
                </div>
                <div class="flex items-center space-x-2.5">
                  <button class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors" @click="tslDialogVisible = true">
                    <el-icon><Document /></el-icon><span>查看 TSL (Schema)</span>
                  </button>
                  <button class="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition-colors" @click="openCapabilityDialog('standard')">
                    <el-icon><Plus /></el-icon><span>添加平台能力项</span>
                  </button>
                </div>
              </div>

              <div class="mx-5 my-3 p-3 bg-sky-50/70 border border-sky-100 rounded-md flex items-center justify-between text-xs text-sky-900">
                <div class="flex items-center space-x-2">
                  <el-icon class="text-sky-600 flex-shrink-0"><InfoFilled /></el-icon>
                  <span>平台与自定义能力项共同定义设备物模型，并将直接编译生成硬件固件头文件和手机 APP 控制面板，请根据模组真实管脚能力慎重配置。</span>
                </div>
                <button class="font-medium text-sky-700 hover:underline flex-shrink-0 ml-3" @click="showPhoneDemo = !showPhoneDemo">{{ showPhoneDemo ? '收起物模型示例' : '查看物模型示例' }}</button>
              </div>

              <div v-if="standardCapTree.length" class="overflow-x-auto">
                <el-table ref="standardTableRef" :data="standardCapTree" row-key="id" class="config-table">
                  <el-table-column type="expand" width="44">
                    <template #default="{ row }">
                      <div class="param-panel">
                        <el-table :data="row.params" size="small">
                          <el-table-column label="类型" width="80" align="center">
                            <template #default="{ row: p }">
                              <span :class="['type-tag', p.capType === 'prop' ? 'type-prop' : p.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(p.capType) }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column label="参数名称" min-width="140" prop="name" />
                          <el-table-column label="参数标识" width="180" prop="identifier" />
                          <el-table-column label="数据类型" width="100" prop="dataType" />
                          <el-table-column label="数据定义" min-width="180">
                            <template #default="{ row: p }">{{ dataDefSummary(p.dataDef) }}</template>
                          </el-table-column>
                          <el-table-column label="描述" min-width="140" prop="descr" />
                          <el-table-column label="操作" width="130" align="right">
                            <template #default="{ row: p }">
                              <div class="row-actions">
                                <button class="link-action" @click="editStandardCapParam(p)">编辑</button>
                                <button class="link-danger" @click="removeStandardCapParam(p)">删除</button>
                              </div>
                            </template>
                          </el-table-column>
                          <template #empty><div class="param-empty">暂无参数</div></template>
                        </el-table>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="能力类型" width="100" align="left">
                    <template #default="{ row }">
                      <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="能力项名称" min-width="200">
                    <template #default="{ row }"><span class="cell-item-name">{{ row.name }}</span></template>
                  </el-table-column>
                  <el-table-column label="能力项 ID (Identifier)" min-width="220">
                    <template #default="{ row }"><code class="cell-id">{{ row.identifier }}</code></template>
                  </el-table-column>
                  <el-table-column label="参数数量" width="120" align="center">
                    <template #default="{ row }">
                      <span class="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">{{ row.paramCount }} 个参数</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="更新时间" width="160">
                    <template #default="{ row }"><span class="cell-time">{{ row.updateTime || '—' }}</span></template>
                  </el-table-column>
                  <el-table-column label="操作" width="140" align="right">
                    <template #default="{ row }">
                      <div class="row-actions">
                        <button class="link-action" @click="toggleStandardRow(row)">配置</button>
                        <span class="text-slate-200">|</span>
                        <button class="link-danger" @click="removeStandardCapItem(row)">移除</button>
                      </div>
                    </template>
                  </el-table-column>
                  <template #empty><div class="empty-state">暂无数据</div></template>
                </el-table>
              </div>
              <div v-else class="empty-state">暂无数据</div>
            </section>

            <!-- 自定义能力项 -->
            <section class="bg-white rounded-lg border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="font-semibold text-sm text-slate-900">自定义能力项</h3>
                    <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-mono">{{ customCapTree.length }}</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1">您自定义的每一个功能（属性、服务、事件），都将直接同步生成固件数据结构与 APP 控制面板组件</p>
                </div>
                <button class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition-colors self-start sm:self-auto" @click="openAddCustomCapItem">
                  <el-icon><Plus /></el-icon><span>添加自定义能力项</span>
                </button>
              </div>

              <div v-if="customCapTree.length" class="overflow-x-auto">
                <el-table ref="customTableRef" :data="customCapTree" row-key="id" class="config-table">
                  <el-table-column type="expand" width="44">
                    <template #default="{ row }">
                      <div class="param-panel">
                        <el-table :data="row.params" size="small">
                          <el-table-column label="类型" width="80" align="center">
                            <template #default="{ row: p }">
                              <span :class="['type-tag', p.capType === 'prop' ? 'type-prop' : p.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(p.capType) }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column label="参数名称" min-width="140" prop="name" />
                          <el-table-column label="参数标识" width="180" prop="identifier" />
                          <el-table-column label="数据类型" width="100" prop="dataType" />
                          <el-table-column label="数据定义" min-width="180">
                            <template #default="{ row: p }">{{ dataDefSummary(p.dataDef) }}</template>
                          </el-table-column>
                          <el-table-column label="描述" min-width="140" prop="descr" />
                          <el-table-column label="操作" width="130" align="right">
                            <template #default="{ row: p }">
                              <div class="row-actions">
                                <button class="link-action" @click="editCustomCapParam(p)">编辑</button>
                                <button class="link-danger" @click="removeCustomCapParam(p)">删除</button>
                              </div>
                            </template>
                          </el-table-column>
                          <template #empty><div class="param-empty">暂无参数</div></template>
                        </el-table>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="能力类型" width="100">
                    <template #default="{ row }">
                      <span :class="['type-tag', row.capType === 'prop' ? 'type-prop' : row.capType === 'svc' ? 'type-svc' : 'type-evt']">{{ capTypeLabel(row.capType) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="能力项名称" min-width="200">
                    <template #default="{ row }"><span class="cell-item-name">{{ row.name }}</span></template>
                  </el-table-column>
                  <el-table-column label="能力项 ID (Identifier)" min-width="220">
                    <template #default="{ row }"><code class="cell-id">{{ row.identifier }}</code></template>
                  </el-table-column>
                  <el-table-column label="参数数量" width="120" align="center">
                    <template #default="{ row }">
                      <span class="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">{{ row.paramCount }} 个参数</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180" align="right">
                    <template #default="{ row }">
                      <div class="row-actions">
                        <button class="link-action" @click="openCustomCapCreate(row)">添加参数</button>
                        <span class="text-slate-200">|</span>
                        <button class="link-danger" @click="removeCustomCapItem(row)">移除</button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div v-else class="border-2 border-dashed border-slate-200 rounded-lg p-8 sm:p-12 text-center bg-slate-50/50">
                <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 stroke-slate-500" fill="none" viewBox="0 0 24 24">
                    <rect height="16" rx="2" stroke-width="1.8" width="16" x="4" y="4" /><rect height="6" stroke-width="1.8" width="6" x="9" y="9" />
                    <line stroke-linecap="round" stroke-width="1.8" x1="9" x2="9" y1="1" y2="4" /><line stroke-linecap="round" stroke-width="1.8" x1="15" x2="15" y1="1" y2="4" />
                    <line stroke-linecap="round" stroke-width="1.8" x1="9" x2="9" y1="20" y2="23" /><line stroke-linecap="round" stroke-width="1.8" x1="15" x2="15" y1="20" y2="23" />
                    <line stroke-linecap="round" stroke-width="1.8" x1="20" x2="23" y1="9" y2="9" /><line stroke-linecap="round" stroke-width="1.8" x1="20" x2="23" y1="14" y2="14" />
                    <line stroke-linecap="round" stroke-width="1.8" x1="1" x2="4" y1="9" y2="9" /><line stroke-linecap="round" stroke-width="1.8" x1="1" x2="4" y1="14" y2="14" />
                  </svg>
                </div>
                <h4 class="text-xs font-semibold text-slate-800">暂无自定义能力项</h4>
                <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">{{ customEmptyDesc }}</p>
                <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button class="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all" @click="openCapabilityDialog('custom')">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    <span>从能力模板库导入</span>
                  </button>
                  <button class="inline-flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors" @click="openAddCustomCapItem">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>
                    <span>立即新建自定义属性</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- APP 控制面板预览（右侧展开） -->
          <transition name="panel-slide">
            <div v-if="showPhoneDemo" class="device-cap-side">
              <AppPhonePreview />
            </div>
          </transition>
        </div>
      </template>

    <!-- ===== 步骤2: APP配置 ===== -->
    <template v-if="currentStep === 2">
      <div class="step-content-card">
        <div class="app-config-form">
          <div class="app-config-item">
            <span class="app-config-label">分辨率显示模式</span>
            <div class="app-config-col">
              <el-radio-group v-model="appConfig.resolutionDisplayMode">
                <el-radio value="friendly">通俗标识</el-radio>
                <el-radio value="pixel">像素规格</el-radio>
              </el-radio-group>
              <span class="app-config-desc">{{ resolutionDisplayDesc }}</span>
            </div>
          </div>

          <!-- 插值设置 -->
          <div class="app-config-item">
            <span class="app-config-label">插值设置</span>
            <div class="app-config-col" style="gap:10px">
              <div class="app-config-inline">
                <span class="app-config-sub" style="margin-left:0">图片插值:</span>
                <el-radio-group v-model="appConfig.imageInterp" :disabled="appConfig.videoInterp">
                  <el-radio :value="true">开启</el-radio>
                  <el-radio :value="false">关闭</el-radio>
                </el-radio-group>
                <span class="app-config-sub">尺寸:</span>
                <el-input v-model="appConfig.imageHeight" placeholder="高度" style="width:90px" :disabled="!appConfig.imageInterp" />
                <span class="app-config-hint">×</span>
                <el-input v-model="appConfig.imageWidth" placeholder="宽度" style="width:90px" :disabled="!appConfig.imageInterp" />
                <span class="app-config-hint">px</span>
              </div>
              <div class="app-config-inline">
                <span class="app-config-sub" style="margin-left:0">视频插值:</span>
                <el-radio-group v-model="appConfig.videoInterp">
                  <el-radio :value="true">开启</el-radio>
                  <el-radio :value="false">关闭</el-radio>
                </el-radio-group>
                <span v-if="appConfig.videoInterp" class="app-config-warn">
                  <el-icon><WarningFilled /></el-icon>视频插值开启时，图片插值将强制同步开启且不可关闭
                </span>
              </div>
            </div>
          </div>

          <div class="app-config-item">
            <span class="app-config-label">App 安全策略</span>
            <div class="app-config-col" style="gap:10px">
              <div class="app-config-inline">
                <span class="app-config-sublabel">视频播放时长限制</span>
                <el-radio-group v-model="appConfig.videoLimit">
                  <el-radio value="limited">开启限制</el-radio>
                  <el-radio value="unlimited">无限制</el-radio>
                </el-radio-group>
                <el-input-number
                  v-model="appConfig.videoLimitSeconds"
                  :min="0" size="small" placeholder="时长"
                  style="width:140px"
                  :disabled="appConfig.videoLimit !== 'limited'"
                />
                <span class="app-config-hint">秒</span>
              </div>
              <!-- 只有「开启限制」才需要配置预警 -->
              <template v-if="appConfig.videoLimit === 'limited'">
                <div class="app-config-inline">
                  <span class="app-config-sublabel">预警开关</span>
                  <el-radio-group v-model="appConfig.warningSwitch">
                    <el-radio :value="true">开启</el-radio>
                    <el-radio :value="false">关闭</el-radio>
                  </el-radio-group>
                </div>
                <span class="app-config-desc" style="padding-left:128px">开启后，App 在持续播放一定时间后会弹窗询问用户是否继续，防止无效流量消耗。</span>
                <!-- 预警开关打开后才需要填预警时长 -->
                <div v-if="appConfig.warningSwitch" class="app-config-inline">
                  <span class="app-config-sublabel"><span style="color:#F56C6C">*</span> 预警时长</span>
                  <el-input-number v-model="appConfig.warningSeconds" :min="0" size="small" style="width:140px" />
                  <span class="app-config-desc">播放剩余 {{ appConfig.warningSeconds }} 秒时触发预警</span>
                </div>
              </template>
            </div>
          </div>

          <div class="app-config-item">
            <span class="app-config-label">假三目设置</span>
            <div class="app-config-col">
              <div class="app-config-inline">
                <el-radio-group v-model="appConfig.fakeTriple">
                  <el-radio value="on">开启</el-radio>
                  <el-radio value="off">关闭</el-radio>
                </el-radio-group>
                <template v-if="appConfig.fakeTriple === 'on'">
                  <span class="app-config-sub">原始流ID: 第</span>
                  <el-input-number v-model="appConfig.fakeTripleStreamId" :min="1" size="small" style="width:100px" />
                  <span class="app-config-sub" style="margin-left:0">个camera</span>
                  <span class="app-config-sub">截取百分比:</span>
                  <el-input-number v-model="appConfig.fakeTriplePercent" :min="1" :max="100" size="small" style="width:100px" />
                  <span class="app-config-hint">%</span>
                </template>
              </div>
              <span class="app-config-desc">用于多目产品在 App 端的混合流展示与裁剪逻辑配置。</span>
            </div>
          </div>

          <div class="app-config-item">
            <span class="app-config-label">灯控开关显示</span>
            <div class="app-config-col">
              <div class="app-config-inline">
                <el-radio-group v-model="appConfig.lightSwitch">
                  <el-radio value="hide">不显示</el-radio>
                  <el-radio value="show">显示</el-radio>
                </el-radio-group>
                <span class="app-config-sub">灯光控制时长:</span>
                <el-input-number v-model="appConfig.lightDuration" :min="0" :max="86400" :step="100" size="small" style="width:150px" />
              </div>
              <span class="app-config-desc">App首页是否显示灯控开关；灯光控制时长取值 0~86400 秒，默认 43200</span>
            </div>
          </div>

          <div class="app-config-item">
            <span class="app-config-label">低电量保护策略</span>
            <div class="app-config-panel" style="flex:1">
              <div class="app-config-inline">
                <span class="app-config-sub" style="margin-left:0">启用</span>
                <el-switch v-model="appConfig.lowBatteryEnabled" size="small" />
              </div>
              <div v-if="appConfig.lowBatteryEnabled" style="margin-top:12px">
                <div class="app-config-inline">
                  <span class="app-config-sub" style="margin-left:0">低电量阈值</span>
                  <el-input-number v-model="appConfig.lowBatteryThreshold" :min="1" :max="100" size="small" style="width:110px" />
                  <span class="app-config-hint">%</span>
                </div>
                <div class="app-config-desc" style="margin-top:6px">低于此电量将禁用所选功能</div>
                <div class="app-config-sub" style="margin:12px 0 8px 0">禁用功能</div>
                <el-checkbox-group v-model="appConfig.disabledFeatures">
                  <el-checkbox value="ptz">PTZ控制</el-checkbox>
                  <el-checkbox value="talk">语音对讲</el-checkbox>
                  <el-checkbox value="sos">一键呼叫</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>

        </div>
      </div>

    </template>

    <!-- ===== 步骤3: 平台服务 ===== -->
    <template v-if="currentStep === 3">
      <div class="step-content-card">
        <div class="algo-service-section">
          <el-table :data="platformServices" stripe>
            <el-table-column label="服务ID" width="120" align="center">
              <template #default="{ row }">
                <span :class="{ 'cell-service-id': true, 'text-muted': row.serviceId === '-' }">{{ row.serviceId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="服务名称" min-width="120">
              <template #default="{ row }">
                <span>{{ row.serviceName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="100">
              <template #default="{ row }">
                <span class="text-muted">{{ row.descr || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="是否支持" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.supported" size="small" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

    </template>
    </div>

    <!-- 底部操作条 -->
    <footer class="sticky bottom-0 z-20 h-16 bg-white border-t border-slate-200 px-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] flex-shrink-0">
      <div class="flex items-center space-x-2 text-xs text-slate-500">
        <span class="w-2 h-2 rounded-full bg-emerald-500" />
        <span>已自动保存至云端草稿</span>
        <span class="font-mono text-slate-400">{{ savedAt }}</span>
      </div>
      <div class="flex items-center space-x-3">
        <button class="px-4 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors" @click="handleBack">取消并退出</button>
        <button class="inline-flex items-center space-x-1.5 px-5 py-2 rounded-md text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 shadow-sm transition-all" @click="handleFooterNext">
          <el-icon><Check /></el-icon>
          <span>{{ footerNextLabel }}</span>
        </button>
      </div>
    </footer>

    <!-- 自定义能力项弹窗 -->
    <el-dialog v-model="customCapItemDialogVisible" title="添加能力项" width="480px" :close-on-click-modal="false" class="app-dialog">
      <el-form :model="customCapItemForm" label-width="110px">
        <el-form-item label="类型" required>
          <el-radio-group v-model="customCapItemForm.capType">
            <el-radio-button value="prop">属性</el-radio-button>
            <el-radio-button value="svc">服务</el-radio-button>
            <el-radio-button value="evt">事件</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="能力项名称" required>
          <el-input v-model="customCapItemForm.name" placeholder="请输入能力项名称" />
        </el-form-item>
        <el-form-item label="能力项ID" required>
          <el-input v-model="customCapItemForm.identifier" placeholder="例如 MySettingItem" />
          <span class="form-hint">字母开头，仅允许字母、数字、下划线</span>
        </el-form-item>
        <!-- 建能力项时可直接把参数一起定义好 -->
        <el-form-item label="参数">
          <div style="width:100%">
            <div v-if="!customDraftParams.length" class="draft-empty">暂未添加参数</div>
            <div v-for="(p, i) in customDraftParams" :key="i" class="draft-param">
              <span :class="['type-tag', 'type-' + p.capType]">{{ capTypeLabel(p.capType) }}</span>
              <span class="draft-name">{{ p.name }}</span>
              <span class="draft-id">{{ p.identifier }}</span>
              <el-button size="small" text type="danger" @click="customDraftParams.splice(i, 1)">删除</el-button>
            </div>
            <el-button size="small" style="margin-top:8px" @click="openDraftCustomParam">+ 添加参数</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="customCapItemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCustomCapItemConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- ===== TSL（下发给设备的物模型 JSON）===== -->
    <el-dialog
      v-model="tslDialogVisible"
      title="查看 TSL"
      width="760px"
      top="6vh"
      :close-on-click-modal="false"
      class="tsl-dialog"
    >
      <div class="tsl-meta">
        <span>产品：<em>{{ productName }}</em></span>
        <span class="tsl-meta-sep">|</span>
        <span>类目：<em>{{ productCategory || '—' }}</em></span>
        <span class="tsl-meta-sep">|</span>
        <span>属性：<em>{{ tslPropCount }}</em> 个</span>
        <span class="tsl-meta-sep">|</span>
        <span>服务/事件：<em>{{ tslOtherCount }}</em> 个</span>
      </div>
      <div class="tip-bar" style="margin-bottom:12px">
        <el-icon><InfoFilled /></el-icon>
        <span>一级键为模块标识符，二级键为能力标识符。属性给出默认值；服务给出指令出参、事件给出上报参数，供设备端实现。</span>
      </div>
      <div class="json-viewer" style="max-height:52vh;overflow:auto">
        <pre>{{ tslJson }}</pre>
      </div>
      <template #footer>
        <el-button @click="tslDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyTsl">
          <el-icon><CopyDocument /></el-icon>复制 JSON
        </el-button>
      </template>
    </el-dialog>

    <!-- ===== 弹窗 ===== -->

    <!-- 能力穿梭框弹窗（按模块选择） -->
    <el-dialog v-model="capDialogVisible" :title="capDialogTitle" width="960px" top="3vh" :close-on-click-modal="false" class="app-dialog">
      <div class="transfer-container cap-transfer-container">
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
                      <span class="pkg-param-count">{{ cap.paramCount }} 个参数</span>
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
                      <span class="pkg-param-count">{{ cap.paramCount }} 个参数</span>
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


    <!-- 算法配置抽屉 -->
    <el-drawer v-model="algoConfigVisible" :title="'能力配置 - ' + (editingAlgo?._name?.['1'] || editingAlgo?.algorithmId)" size="860px" :close-on-click-modal="false" @closed="algoCapScope = null" class="algo-config-drawer">
      <div class="algo-config-toolbar">
        <span class="algo-config-count">共 {{ allCapList.length }} 个能力</span>
      </div>
      <template v-if="allCapList.length">
        <div class="algo-cap-section">
          <div class="algo-cap-section-header">
            <span class="algo-cap-section-title">标准能力</span>
            <el-button size="small" @click="openCapabilityDialog('standard')">+ 标准能力</el-button>
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
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'standard', idx: $index })">编辑</el-button>
                <el-button size="small" text type="danger" @click="standardCapList.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="algo-config-empty">暂无标准能力</div>
        </div>
        <div class="algo-cap-section">
          <div class="algo-cap-section-header">
            <span class="algo-cap-section-title">自定义能力</span>
            <el-button size="small" @click="openCustomCapCreate">+ 自定义能力</el-button>
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
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row, $index }">
                <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'custom', idx: $index })">编辑</el-button>
                <el-button size="small" text type="danger" @click="customCapList.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="algo-config-empty">暂无自定义能力</div>
        </div>
      </template>
      <div v-else class="algo-config-empty">暂未添加能力，请点击上方按钮添加</div>
      <template #footer>
        <el-button @click="algoConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAlgoConfig">确定</el-button>
      </template>
    </el-drawer>

    <!-- PIR侦测 能力配置侧边弹窗 -->
    <el-drawer v-model="pirConfigVisible" title="能力配置 - PIR侦测" size="860px" :close-on-click-modal="false" @closed="algoCapScope = null" class="algo-config-drawer">
      <div class="algo-config-toolbar">
        <span class="algo-config-count">固定配置项</span>
      </div>
      <div class="pir-config-section">
        <div class="tip-bar" style="margin-bottom:16px">
          <el-icon><InfoFilled /></el-icon>
          <span>以下为PIR侦测算法的固定配置项，请根据实际需求设置</span>
        </div>
        <el-form label-width="120px" label-position="right">
          <template v-for="item in pirConfigItems" :key="item.key">
            <el-form-item :label="item.label">
              <div>
                <div class="pir-item-row">
                  <span class="pir-item-label">是否支持</span>
                  <el-radio-group v-model="pirConfigForm[item.key].supported" size="small">
                    <el-radio label="1">支持</el-radio>
                    <el-radio label="0">不支持</el-radio>
                  </el-radio-group>
                </div>
                <div v-if="pirConfigForm[item.key].supported === '1'" class="pir-item-row" style="margin-top:8px">
                  <span class="pir-item-label">默认值</span>
                  <el-select v-if="item.key === 'sensitivity'" v-model="pirConfigForm[item.key].defaultVal" size="small" style="width:100px">
                    <el-option label="1档" value="1" />
                    <el-option label="2档" value="2" />
                    <el-option label="3档" value="3" />
                    <el-option label="4档" value="4" />
                    <el-option label="5档" value="5" />
                  </el-select>
                  <el-radio-group v-else v-model="pirConfigForm[item.key].defaultVal" size="small">
                    <el-radio label="1">开启</el-radio>
                    <el-radio label="0">关闭</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </el-form-item>
          </template>
        </el-form>
      </div>

      <el-divider />

      <!-- 标准能力 -->
      <div class="algo-cap-section">
        <div class="algo-cap-section-header">
          <span class="algo-cap-section-title">标准能力</span>
          <el-button size="small" @click="openCapabilityDialog('standard')">+ 标准能力</el-button>
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
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row, $index }">
              <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'standard', idx: $index })">编辑</el-button>
              <el-button size="small" text type="danger" @click="standardCapList.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="algo-config-empty">暂无标准能力</div>
      </div>

      <!-- 自定义能力 -->
      <div class="algo-cap-section">
        <div class="algo-cap-section-header">
          <span class="algo-cap-section-title">自定义能力</span>
          <el-button size="small" @click="openCustomCapCreate">+ 自定义能力</el-button>
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
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row, $index }">
              <el-button size="small" text type="primary" @click="openAlgoCapEdit({ cap: row, source: 'custom', idx: $index })">编辑</el-button>
              <el-button size="small" text type="danger" @click="customCapList.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="algo-config-empty">暂无自定义能力</div>
      </div>

      <template #footer>
        <el-button @click="pirConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="savePirConfig">确定</el-button>
      </template>
    </el-drawer>

    <!-- 能力参数编辑/创建弹窗 -->
    <el-dialog v-model="algoCapEditVisible" :title="isAlgoCreateMode ? '创建参数' : '编辑参数 - ' + (algoCapEditRef?.cap?.name || '')" width="860px" top="3vh" :close-on-click-modal="false" class="cap-dialog">
      <el-form v-if="isAlgoCreateMode || algoCapEditRef" label-width="100px">
        <el-form-item label="能力类型">
          <div class="type-cards">
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'prop' }]" :style="canPickType ? 'cursor:pointer' : 'pointer-events:none'" @click="canPickType && onAlgoCapTypeChange('prop')">属性</div>
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'svc' }]" :style="canPickType ? 'cursor:pointer' : 'pointer-events:none'" @click="canPickType && onAlgoCapTypeChange('svc')">服务</div>
            <div :class="['type-card', { active: (isAlgoCreateMode ? algoCapEditForm.capType : algoCapEditRef?.cap?.capType) === 'evt' }]" :style="canPickType ? 'cursor:pointer' : 'pointer-events:none'" @click="canPickType && onAlgoCapTypeChange('evt')">事件</div>
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
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'info' }]" :style="canPickType ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'info')">信息 (Info)</div>
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'alarm' }]" :style="canPickType ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'alarm')">告警 (Alarm)</div>
              <div :class="['type-card', { active: algoCapEditForm.eventType === 'fault' }]" :style="canPickType ? 'cursor:pointer' : 'pointer-events:none'" @click="isAlgoCreateMode && (algoCapEditForm.eventType = 'fault')">故障 (Fault)</div>
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

    <!-- 关联事件弹窗 -->
    <el-drawer
      v-model="eventLinkVisible"
      :title="'关联事件 - ' + (editingAlgo?._name?.['1'] || editingAlgo?.algorithmId)"
      direction="rtl"
      size="640px"
      :close-on-click-modal="false"
      class="event-link-drawer"
    >
      <template v-if="editingAlgo">
<el-table
          ref="eventTableRef"
          :data="linkedEventOptions"
          stripe
          @selection-change="handleEventSelectionChange"
        >
          <el-table-column type="selection" width="44" />
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
        <el-empty v-if="linkedEventOptions.length === 0" description="暂无关联事件" :image-size="80" />
      </template>
      <template #footer>
        <el-button @click="eventLinkVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEventLink">保存</el-button>
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

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, ArrowLeft, ArrowRight, Edit, Switch, Check, Setting, QuestionFilled, Delete, Search, InfoFilled, CircleCheck, Document, CopyDocument, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listAlgorithms, listServices, allEvents, getCapabilitiesByIds, getModules, getAllCapabilities, getAlgorithmServiceId, getAlgorithmEvents, getAllAlgorithmServices } from '@/data/thing-model'
import { store, getCategoryLinkedCapIds, getCategoryLinkedLegacyCapIds } from '@/data/thing-model'
import CapModules from './cap-modules.vue'
import AppPhonePreview from './AppPhonePreview.vue'
import PageBackBar from '@/components/layout/PageBackBar.vue'

const route = useRoute()
const router = useRouter()

const productName = ref(route.query.name || 'API测试产品_388537')
const productId = ref(route.query.id || 'PDRSAs9HaSQzNPrG')
const productCategory = ref(route.query.category || '')

const savedAt = ref(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
const productDescription = computed(() =>
  productCategory.value === '香薰机'
    ? '支持超声波冷雾雾化、多色情境氛围灯联动及定时喷雾逻辑'
    : '定义产品物模型能力、APP 控制面板与平台服务，完成能力配置到发布的全流程。'
)
const productCategoryDisplay = computed(() =>
  productCategory.value === '香薰机' ? '环境电器 / 香薰机' : (productCategory.value || '—')
)
const customEmptyDesc = computed(() =>
  productCategory.value === '香薰机'
    ? '当平台标准物模型无法满足该香薰机专属业务（如精油余量探测、雾化片压电陶瓷振荡频段校准）时，可在此进行自主扩展。'
    : `当平台标准物模型无法满足「${productCategory.value || '该产品'}」专属业务时，可在此进行自主扩展。`
)
const footerNextLabel = computed(() =>
  currentStep.value === 0 ? '保存并下一步: 配置 APP' : currentStep.value === 2 ? '保存并下一步: 平台服务' : '保存并完成'
)

const standardTableRef = ref(null)
const customTableRef = ref(null)
function toggleStandardRow(row) { standardTableRef.value?.toggleRowExpansion(row) }
function toggleCustomRow(row) { customTableRef.value?.toggleRowExpansion(row) }

function copyProductId() {
  navigator.clipboard.writeText(productId.value)
    .then(() => ElMessage.success('产品 ID 已复制'))
    .catch(() => ElMessage.warning('复制失败，请手动复制'))
}

function handleFooterNext() {
  if (currentStep.value === 0) {
    ElMessage.success('已保存功能定义与配置')
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    ElMessage.success('已保存 APP 配置')
    currentStep.value = 3
  } else {
    savePlatformTab()
    finishDev()
  }
}

// ===== 步骤导航 =====
const initialStep = Number(route.query.step)
const currentStep = ref(initialStep === 2 ? 2 : initialStep === 3 ? 3 : 0)

// new：已去掉 网络配置/设备能力/镜头能力配置/麦克风能力配置 四个子 tab
// APP 控制面板示例展开状态
const showPhoneDemo = ref(false)

// ===== 能力项配置模型 =====
// 每个能力项：先选「支持/不支持」，选「支持」后展开默认值（下发固件）
//   supported   — '1' 支持 / '0' 不支持
//   defaultValue — 默认值控件，仅 supported==='1' 时显示
//   children     — 级联子项（如 音量调节 → 音量），仅 supported==='1' 时显示
// 控件 type: switch / checkbox / radio / select / number / time
function capSwitch(value) { return { type: 'switch', value } }
function capCheckbox(options, value) { return { type: 'checkbox', options, value } }
function capRadio(options, value) { return { type: 'radio', options, value } }
function capSelect(options, value) { return { type: 'select', options, value } }
function capNumber(value, min, max, unit) { return { type: 'number', value, min, max, unit } }
function capTime(value) { return { type: 'time', value } }

// ===== 网络配置（设备级网络相关参数）=====
const networkParams = reactive([
  { id: 'netTypes', name: '联网方式', cap: capCheckbox(['有线', 'WIFI', '移动网络'], ['WIFI']) },
  { id: 'dualBand', name: '是否支持双频路由器(5Ghz)', cap: capRadio(['是', '否'], '否'), when: 'wifi' },
  { id: 'distMethods', name: '配网方式', cap: capCheckbox(['AP', '声音', 'smartlink', '摄像机识别二维码添加', '局域网', 'APP扫码添加', '蓝牙添加'], ['AP']) },
  { id: 'apPassword', name: 'AP是否支持设置密码', cap: capRadio(['是', '否'], '否'), when: 'ap' },
  { id: 'defaultDistMethod', name: '默认配网方式', cap: capSelect(['AP', 'smartlink', '局域网'], 'AP') }
])

// 条件显隐：联网方式含 WIFI 显示双频路由器；配网方式含 AP 显示 AP 密码配置
const visibleNetworkParams = computed(() => {
  const netTypes = networkParams.find(p => p.id === 'netTypes')?.cap.value || []
  const distMethods = networkParams.find(p => p.id === 'distMethods')?.cap.value || []
  const conditions = {
    wifi: netTypes.includes('WIFI'),
    ap: distMethods.includes('AP')
  }
  return networkParams.filter(p => !p.when || conditions[p.when])
})

// ===== 设备能力（设备级单例，17 项，按 7 模块分组）=====
const deviceCapModules = reactive([
  {
    name: '扬声器模块',
    items: [
      { id: 'intercom', name: '对讲能力', supported: '0', defaultValue: capSelect(['半双工', '全双工'], '半双工'), defaultName: '对讲类型', access: 'ro' },
      { id: 'hasSpeaker', name: '喇叭能力', supported: '0', defaultValue: null },
      { id: 'volumeAdjust', name: '音量调节能力', supported: '0', defaultValue: null, children: [
        { id: 'volume', name: '音量', defaultValue: capNumber(1, 0, 100, '') }
      ] },
      { id: 'customRing', name: '自定义铃声能力', supported: '0', defaultValue: null }
    ]
  },
  {
    name: '录制模块',
    items: [
      { id: 'storageMethod', name: '存储能力', supported: '0', defaultValue: capRadio(['TF卡存储', '磁盘存储'], 'TF卡存储'), defaultName: '存储方式', access: 'ro' },
      { id: 'recordMode', name: 'SD卡全天录制能力', supported: '0', defaultValue: capSwitch(false), defaultName: '全天录制开关' },
      { id: 'alarmRecord', name: 'SD卡事件录制能力', supported: '0', defaultValue: null, children: [
        { id: 'alarmDuration', name: '事件录制时长', defaultValue: capNumber(15, 5, 300, '秒') }
      ] }
    ]
  },
  {
    name: '电池模块',
    items: [
      { id: 'hasBattery', name: '电池能力', supported: '0', defaultValue: null },
      { id: 'wakeup', name: '唤醒能力', supported: '0', defaultValue: capRadio(['本地唤醒', '远程唤醒', '本地和远程'], '本地唤醒'), defaultName: '唤醒方式', access: 'ro' }
    ]
  },
  {
    name: '灯光模块',
    items: [
      { id: 'indicator', name: '状态指示灯能力', supported: '0', defaultValue: null },
      { id: 'irLight', name: '红外灯能力', supported: '0', defaultValue: null }
    ]
  },
  {
    name: '云端抓图模块',
    items: [
      { id: 'cloudCapture', name: '云端抓图能力', supported: '0', defaultValue: null, children: [
        { id: 'ccDefaultOn', name: '默认开启', defaultValue: capRadio(['开启', '关闭'], '开启') },
        { id: 'ccSupportGif', name: '支持动图', defaultValue: capRadio(['是', '否'], '否') },
        { id: 'ccGifEnabled', name: '动图开关', defaultValue: capRadio(['开启', '关闭'], '关闭') },
        { id: 'ccQuality', name: '抓图质量', defaultValue: capSelect(['小图', '标清', '高清'], '小图') },
        { id: 'ccStorageDays', name: '存储时长', defaultValue: capNumber(1, 1, 30, '天') },
        { id: 'ccStorageMode', name: '存储方式', defaultValue: capRadio(['事件', '定时'], '事件') },
        { id: 'ccStorageFormat', name: '存储格式', defaultValue: capRadio(['已有格式，带有私有头', '标准jpg'], '已有格式，带有私有头') },
        { id: 'ccCaptureCount', name: '抓图数目', defaultValue: capNumber(1, 0, 99, '') },
        { id: 'ccCaptureInterval', name: '抓拍间隔', defaultValue: capNumber(30, 5, 300, '秒') }
      ] }
    ]
  }
])

// ===== 镜头能力项（每个镜头实例一份，17 项，按 2 模块分组）=====
function defaultLensCapabilityConfig() {
  return [
    {
      name: 'PTZ模块',
      items: [
        { id: 'ptzSupported', name: 'PTZ能力', supported: '0', defaultValue: null, children: [
          { id: 'ptzCaps', name: 'PTZ方向', defaultValue: capCheckbox(['平移', '倾斜', '变焦'], []), access: 'ro' }
        ] },
        { id: 'preset', name: '预置位能力', supported: '0', defaultValue: null },
        { id: 'cruise', name: '自动巡航能力', supported: '0', defaultValue: null },
        { id: 'spatial', name: '空间定位能力', supported: '0', defaultValue: capRadio(['支持3D居中', '支持GPS定位'], '支持3D居中'), defaultName: '定位方式', access: 'ro' },
        { id: 'ptzSpeed', name: 'PTZ转速能力', supported: '0', defaultValue: null }
      ]
    },
    {
      name: '图像采集模块',
      items: [
        { id: 'flip', name: '图像翻转能力', supported: '0', defaultValue: capRadio(['正放', '翻转'], '正放'), defaultName: '翻转方向', access: 'rw' },
        { id: 'mirror', name: '镜像能力', supported: '0', defaultValue: capRadio(['打开', '关闭'], '关闭'), defaultName: '镜像状态', access: 'rw' },
        { id: 'nightVision', name: '夜视能力', supported: '0', defaultValue: null },
        { id: 'wdr', name: '宽动态能力', supported: '0', defaultValue: capSwitch(false), defaultName: '宽动态开关', access: 'rw' },
        { id: 'hdr', name: '高动态能力', supported: '0', defaultValue: capSwitch(false), defaultName: '高动态开关', access: 'rw' },
        { id: 'antiFlicker', name: '抗闪烁能力', supported: '0', defaultValue: capRadio(['50', '60'], '50'), defaultName: '抗闪烁频率', access: 'rw' },
        { id: 'privacyZone', name: '隐私区域能力', supported: '0', defaultValue: null },
        { id: 'logoWatermark', name: 'LOGO水印能力', supported: '0', defaultValue: null },
        { id: 'fisheye', name: '鱼眼矫正能力', supported: '0', defaultValue: capRadio(['设备矫正', 'App矫正'], '设备矫正'), defaultName: '矫正方式', access: 'rw' },
        { id: 'snapshot', name: '抓图能力', supported: '0', defaultValue: null },
        { id: 'humanoidCoord', name: '人形坐标写入能力', supported: '0', defaultValue: null },
        { id: 'compositeStream', name: '合成流能力', supported: '0', defaultValue: null }
      ]
    }
  ]
}

// ===== 麦克风能力项（每个麦克风实例一份，2 项，1 模块）=====
function defaultMicCapabilityConfig() {
  return [
    {
      name: '麦克风模块',
      items: [
        { id: 'micSwitch', name: '麦克风开关能力', supported: '0', defaultValue: null },
        { id: 'volumeAdjust', name: '音量调节能力', supported: '0', defaultValue: null, children: [
          { id: 'captureVolume', name: '采集音量', defaultValue: capNumber(0, 0, 100, ''), access: 'rw' }
        ] }
      ]
    }
  ]
}

// ===== 出厂参数（归档，不维护；由设备固件上报，页面不渲染，后续按需接回）=====
const factoryParams = [
  { id: 'lensType', name: '镜头类型', type: 'select', options: ['普通镜头', '广角镜头', '长焦镜头', '鱼眼镜头'] },
  { id: 'focalLength', name: '焦距', type: 'range', min: 0, max: 100 },
  { id: 'resolutions', name: '支持的分辨率', type: 'checkbox', options: ['320*240', '640*360', '640*480', '1280*720', '1280*960', '1920*1080', '1600*1200', '2048*1536', '2560*1440', '2688*1520', '2560*1920'] },
  { id: 'bitrateControl', name: '码率控制类型', type: 'radio', options: ['CBR', 'VBR'] },
  { id: 'bitrateValue', name: '码率值', type: 'number', min: 64, max: 20480, unit: 'kbps' },
  { id: 'streamEncodeTypes', name: '码流编码类型', type: 'checkbox', options: ['H264', 'H265', 'MJPEG', 'VP8'] },
  { id: 'streamDefaultEncode', name: '码流默认编码', type: 'select', options: ['H264', 'H265', 'MJPEG'] },
  { id: 'smartEncode', name: '智能编码', type: 'switch' },
  { id: 'keyFrameInterval', name: '关键帧间隔', type: 'number', min: 1, max: 250 },
  { id: 'frameRate', name: '帧率', type: 'number', min: 1, max: 60 },
  { id: 'defaultResolution', name: '默认分辨率', type: 'select', options: ['320*240', '640*360', '640*480', '1280*720', '1280*960', '1920*1080', '1600*1200', '2048*1536', '2560*1440', '2688*1520', '2560*1920'] },
  { id: 'otaSupport', name: '是否支持远程OTA', type: 'switch' },
  { id: 'workMode', name: '摄像机工作模式', type: 'radio', options: ['独立工作', '联动工作'] },
  { id: 'hasDisplay', name: '是否有屏显', type: 'switch' },
  { id: 'displayResolutions', name: '屏显分辨率', type: 'checkbox', options: ['1920*1080', '1280*720', '640*480', '640*360', '320*240'] },
  { id: 'displaySleepTime', name: '屏息时间', type: 'number', min: 1, max: 3600, unit: '秒' },
  { id: 'displayDecodeTypes', name: '屏显解码方式', type: 'checkbox', options: ['H264', 'H265', 'MJPG'] },
  { id: 'displayTypes', name: '屏显类型', type: 'checkbox', options: ['文字', '背景图', '图片', '视频'] },
  { id: 'speakerEncodeTypes', name: '喇叭编码方式', type: 'checkbox', options: ['PCM', 'G711A', 'g711u', 'ACC'] },
  { id: 'speakerSampleDepth', name: '喇叭采样位深', type: 'radio', options: ['16bit', '24bit'] },
  { id: 'speakerSampleRate', name: '喇叭采样率', type: 'radio', options: ['8000', '16000', '44100', '48000'] },
  { id: 'speakerChannels', name: '喇叭声道数', type: 'radio', options: ['单声道', '双声道'] },
  { id: 'micEncodeTypes', name: '麦克风编码方式', type: 'checkbox', options: ['PCM', 'G711A', 'G711U', 'AAC', 'MP3'] },
  { id: 'micDefaultEncode', name: '麦克风默认编码', type: 'select', options: ['PCM', 'G711A', 'G711U', 'AAC', 'MP3'] },
  { id: 'micSampleDepth', name: '麦克风采样位深', type: 'radio', options: ['16bit', '24bit'] },
  { id: 'micSampleRate', name: '麦克风采样率', type: 'radio', options: ['8000', '16000', '44100', '48000'] },
  { id: 'micChannels', name: '麦克风声道数', type: 'radio', options: ['单声道', '双声道'] }
]

// ===== 镜头配置 =====
const activeCameraIdx = ref(0)

const cameraList = ref([
  { id: 1, name: 'Camera_ 1', capabilityConfig: defaultLensCapabilityConfig(), standardCaps: [], customCaps: [] }
])

const activeCamera = computed(() => cameraList.value[activeCameraIdx.value] || null)

function addCamera() {
  const idx = cameraList.value.length + 1
  cameraList.value.push({ id: Date.now(), name: `Camera_ ${idx}`, capabilityConfig: defaultLensCapabilityConfig(), standardCaps: [], customCaps: [] })
  activeCameraIdx.value = cameraList.value.length - 1
  ElMessage.success(`镜头 Camera_ ${idx} 已添加`)
}

function removeCamera(idx) {
  if (cameraList.value.length <= 1) { ElMessage.warning('至少保留一个镜头'); return }
  cameraList.value.splice(idx, 1)
  if (activeCameraIdx.value >= cameraList.value.length) activeCameraIdx.value = cameraList.value.length - 1
  ElMessage.success('镜头已删除')
}

// 镜头能力穿梭框
const lensCapType = ref('standard')
function openLensCapDialog(type) {
  lensCapType.value = type
  // reuse the same transfer dialog and mechanism
  currentCapType.value = type
  capDialogTitle.value = type === 'standard' ? '添加平台能力项 — 导入能力' : '添加自定义能力项 — 导入能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capPoolModuleNames()
  capDialogVisible.value = true
}

// ===== 麦克风配置 =====
const micList = ref([
  { id: 1, name: 'Microphone_ 1', capabilityConfig: defaultMicCapabilityConfig(), standardCaps: [], customCaps: [] }
])
const activeMicIdx = ref(0)

const activeMic = computed(() => micList.value[activeMicIdx.value] || null)

function addMic() {
  const idx = micList.value.length + 1
  micList.value.push({ id: Date.now(), name: `Microphone_ ${idx}`, capabilityConfig: defaultMicCapabilityConfig(), standardCaps: [], customCaps: [] })
  activeMicIdx.value = micList.value.length - 1
  ElMessage.success(`Microphone_ ${idx} 已添加`)
}

function removeMic(idx) {
  if (micList.value.length <= 1) { ElMessage.warning('至少保留一个Microphone'); return }
  micList.value.splice(idx, 1)
  if (activeMicIdx.value >= micList.value.length) activeMicIdx.value = micList.value.length - 1
}

const micCapType = ref('standard')
function openMicCapDialog(type) {
  micCapType.value = type
  currentCapType.value = type
  capDialogTitle.value = type === 'standard' ? '添加平台能力项 — 导入能力' : '添加自定义能力项 — 导入能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capPoolModuleNames()
  capDialogVisible.value = true
}

// ===== 标准/自定义能力 =====
const standardCapList = ref([])
const customCapList = ref([])

// ===== APP配置（继续开发第 2 步）=====
const appConfig = reactive({
  resolutionDisplayMode: 'friendly', // friendly=通俗标识(超清/高清) / pixel=像素规格(1080P/2K/4K)
  // 插值设置
  imageInterp: true,
  imageHeight: '1080',
  imageWidth: '1920',
  videoInterp: true,
  // 其他
  videoLimit: 'unlimited',        // limited=开启限制 / unlimited=无限制
  videoLimitSeconds: 0,           // 视频播放时长限制(秒)
  warningSwitch: true,            // 播放预警开关
  warningSeconds: 0,              // 播放剩余多少秒时触发预警
  fakeTriple: 'on',               // on / off
  fakeTripleStreamId: 1,
  fakeTriplePercent: 100,
  lightSwitch: 'show',            // hide / show
  lightDuration: 43200,           // 0~86400 秒
  lowBatteryEnabled: false,
  lowBatteryThreshold: 20,
  disabledFeatures: []
})

// 视频插值开启时，图片插值强制同步开启且不可关闭
watch(() => appConfig.videoInterp, (v) => { if (v) appConfig.imageInterp = true })

// 分辨率显示模式的说明文案
const resolutionDisplayDesc = computed(() =>
  appConfig.resolutionDisplayMode === 'pixel'
    ? 'APP 端按设备实际像素规格显示，如「1080P」「2K」「4K」'
    : 'APP 端按清晰度档位显示，如「超清」「高清」「标清」'
)

// ===== 自定义能力项（先定义能力项，再在它下面加参数）=====
const customCapItems = ref([])
const customCapItemDialogVisible = ref(false)
const customCapItemForm = reactive({ name: '', identifier: '', capType: 'prop' })
const pendingCapItemId = ref(null)

// 标准能力：按能力项分组成二级
const standardCapTree = computed(() => {
  const map = new Map()
  standardCapList.value.forEach(c => {
    const key = c.capItemId ?? '_none'
    if (!map.has(key)) {
      const it = store.capItems.find(x => x.id === c.capItemId)
      map.set(key, {
        id: 'std_' + key,
        _rawId: c.capItemId,
        capType: it?.capType || c.capType || 'prop',
        name: it?.name || '未归属参数',
        identifier: it?.identifier || '—',
        updateTime: it?.updateTime || '—',
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

function editStandardCapParam(p) {
  currentCapType.value = 'standard'
  editCapability(p, standardCapList.value.indexOf(p))
}

function removeStandardCapParam(p) {
  standardCapList.value = standardCapList.value.filter(c => c.id !== p.id)
}

function removeStandardCapItem(item) {
  ElMessageBox.confirm(
    '确定移除能力项「' + item.name + '」？其下的 ' + item.paramCount + ' 个参数将一并移除。',
    '移除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    const ids = new Set(item.params.map(p => p.identifier))
    standardCapList.value = standardCapList.value.filter(c => !ids.has(c.identifier))
    ElMessage.success('已移除')
  }).catch(() => {})
}

const customCapTree = computed(() =>
  customCapItems.value.map(it => {
    const params = customCapList.value.filter(c => c.capItemId === it.id)
    return { ...it, updateTime: it.updateTime || '—', params, paramCount: params.length }
  })
)

function openAddCustomCapItem() {
  customDraftParams.value = []
  customCapItemForm.name = ''
  customCapItemForm.identifier = ''
  customCapItemForm.capType = 'prop'
  customCapItemDialogVisible.value = true
}

const customDraftParams = ref([])
const customDraftMode = ref(false)
// 参数类型跟随所属能力项时不可改
const capTypeLocked = computed(() => !!(pendingCapItemId.value || customDraftMode.value))
const canPickType = computed(() => isAlgoCreateMode.value && !capTypeLocked.value)

function openDraftCustomParam() {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(customCapItemForm.identifier || '')) {
    ElMessage.warning('请先填好能力项ID，再添加参数')
    return
  }
  isAlgoCreateMode.value = true
  algoCapEditRef.value = null
  resetAlgoCapForm()
  customDraftMode.value = true
  pendingCapItemId.value = null
  algoCapEditForm.capType = customCapItemForm.capType || 'prop'
  algoCapEditVisible.value = true
}

function handleCustomCapItemConfirm() {
  if (!customCapItemForm.name.trim()) { ElMessage.warning('请输入能力项名称'); return }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(customCapItemForm.identifier || '')) { ElMessage.warning('能力项ID不合法：字母开头，仅允许字母、数字、下划线'); return }
  if (customCapItems.value.some(x => x.identifier === customCapItemForm.identifier)) { ElMessage.warning('能力项ID已存在'); return }
  const d = new Date()
  const pad = (v) => String(v).padStart(2, '0')
  customCapItems.value.push({
    id: Date.now() + Math.random(),
    name: customCapItemForm.name.trim(),
    identifier: customCapItemForm.identifier.trim(),
    capType: customCapItemForm.capType,
    updateTime: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  })
  const newItem = customCapItems.value[customCapItems.value.length - 1]
  const draftCount = customDraftParams.value.length
  customDraftParams.value.forEach(dp => {
    customCapList.value.push({ ...dp, capItemId: newItem.id })
  })
  customDraftParams.value = []
  customCapItemDialogVisible.value = false
  ElMessage.success(draftCount ? '能力项已创建（含 ' + draftCount + ' 个参数）' : '能力项已创建')
}

function removeCustomCapItem(item) {
  ElMessageBox.confirm(
    `确定删除能力项「${item.name}」？其下的 ${item.paramCount} 个参数将一并删除。`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    customCapList.value = customCapList.value.filter(c => c.capItemId !== item.id)
    customCapItems.value = customCapItems.value.filter(x => x.id !== item.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function editCustomCapParam(param) {
  currentCapType.value = 'custom'
  editCapability(param, customCapList.value.indexOf(param))
}

function removeCustomCapParam(param) {
  customCapList.value = customCapList.value.filter(c => c.id !== param.id)
  ElMessage.success('已删除')
}

// ===== TSL（下发给设备的物模型 JSON）=====
// 一级键为模块标识符，二级键为能力标识符。属性给默认值，服务/事件给描述，
// 让设备端一次性拿全「要接哪些能力、各自长什么样」。
const tslDialogVisible = ref(false)

// 能力记录里只带了模块中文名，这里补回模块标识符
function tslModuleKey(cap) {
  const mods = getModules()
  const mod = mods.find(m => String(m.id) === String(cap.moduleId))
    || mods.find(m => m.name === cap.moduleName)
  return mod?.identifier || cap.moduleName || 'OtherModule'
}

const tslNumOrStr = (v) => {
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return Number.isNaN(n) ? v : n
}

function tslValue(cap) {
  const dd = cap.dataDef || {}
  // 服务：出参即设备需要实现的指令签名
  if (cap.capType === 'svc') {
    return { capType: 'svc', inputParams: dd.inputParams || [], outputParams: dd.outputParams || [] }
  }
  // 事件：设备需要按此上报
  if (cap.capType === 'evt') {
    return { capType: 'evt', eventType: dd.eventType || '', outputParams: dd.outputParams || [] }
  }
  // 属性：给默认值（缺省取 defaultVal）
  switch (dd.dataType) {
    case 'int':
    case 'enum':
    case 'boolean':
      return tslNumOrStr(dd.defaultVal)
    case 'string':
      return dd.defaultVal || ''
    case 'struct': {
      const obj = {}
      ;(dd.fields || []).forEach(f => {
        obj[f.identifier] = f.dataType === 'string' ? (f.defaultVal || '') : tslNumOrStr(f.defaultVal)
      })
      return obj
    }
    case 'array':
      return []
    default:
      return dd.defaultVal ?? null
  }
}

const tslAllCaps = computed(() => [...standardCapList.value, ...customCapList.value])
const tslPropCount = computed(() => tslAllCaps.value.filter(c => c.capType === 'prop').length)
const tslOtherCount = computed(() => tslAllCaps.value.filter(c => c.capType !== 'prop').length)

const tslPayload = computed(() => {
  const model = {}
  tslAllCaps.value.forEach(cap => {
    const key = tslModuleKey(cap)
    if (!model[key]) model[key] = {}
    model[key][cap.identifier] = tslValue(cap)
  })
  return model
})

const tslJson = computed(() => JSON.stringify(tslPayload.value, null, 2))

function copyTsl() {
  navigator.clipboard.writeText(tslJson.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.warning('复制失败，请手动复制')
  })
}

// ===== 算法配置 — 能力列表 =====
const allCapList = computed(() => [
  ...standardCapList.value.map((c, i) => ({ cap: c, source: 'standard', idx: i })),
  ...customCapList.value.map((c, i) => ({ cap: c, source: 'custom', idx: i }))
])

function deleteCap(index) {
  const item = allCapList.value[index]
  if (!item) return
  if (item.source === 'standard') standardCapList.value.splice(item.idx, 1)
  else customCapList.value.splice(item.idx, 1)
}

const capTypeMap = { prop: '属性', svc: '服务', evt: '事件' }
function capTypeLabel(t) { return capTypeMap[t] || t }

function dataTypeLabel(cap) {
  if (cap.capType === 'prop') {
    const m = { enum: '枚举型', int: '数值型', boolean: '布尔型', string: '字符串', array: '数组型', struct: '结构体型' }
    return m[cap.dataDef?.dataType] || ''
  }
  if (cap.capType === 'svc') return '服务'
  if (cap.capType === 'evt') return '事件'
  return ''
}

// ===== 能力参数编辑/创建弹窗 =====
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

// 在某个自定义能力项下添加参数
function openCustomCapCreate(item) {
  if (!item) { ElMessage.warning('请先在能力项那一行点「添加参数」'); return }
  customDraftMode.value = false
  isAlgoCreateMode.value = true
  algoCapEditRef.value = null
  resetAlgoCapForm()
  pendingCapItemId.value = item.id
  algoCapEditForm.capType = item.capType || 'prop'
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
    if (customDraftMode.value) {
      if (customDraftParams.value.some(d => d.identifier === algoCapEditForm.identifier.trim())) {
        ElMessage.warning('参数标识符重复，请更换'); return
      }
      customDraftParams.value.push({
        id: Date.now() + Math.random(),
        capType: algoCapEditForm.capType,
        name: algoCapEditForm.name.trim(),
        identifier: algoCapEditForm.identifier.trim(),
        descr: algoCapEditForm.descr.trim(),
        dataType: algoCapEditForm.dataType,
        dataDef: buildDataDefFromForm()
      })
      customDraftMode.value = false
      algoCapEditVisible.value = false
      return
    }

    const parent = customCapItems.value.find(x => x.id === pendingCapItemId.value)
    if (!parent) { ElMessage.warning('请从能力项的「添加参数」进入'); return }
    if (parent.capType !== algoCapEditForm.capType) {
      ElMessage.warning(`该能力项是「${capTypeLabel(parent.capType)}」类型，只能添加${capTypeLabel(parent.capType)}参数`); return
    }
    const cap = {
      id: Date.now() + Math.random(),
      capItemId: parent.id,
      capType: algoCapEditForm.capType,
      name: algoCapEditForm.name.trim(),
      identifier: algoCapEditForm.identifier.trim(),
      descr: algoCapEditForm.descr.trim(),
      dataType: algoCapEditForm.dataType,
      dataDef: buildDataDefFromForm()
    }
    customCapList.value.push(cap)
    ElMessage.success('参数已创建')
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

function dataDefSummary(dd) {
  if (!dd) return '—'
  if (dd.dataType === 'enum' && dd.enumValues) return '枚举: ' + dd.enumValues.map(e => e.name).join(' / ')
  if (dd.dataType === 'boolean') return '布尔型'
  if (dd.dataType === 'int') return `整数 (${dd.min || 0}~${dd.max || 100}${dd.unit ? ' ' + dd.unit : ''})`
  if (dd.dataType === 'event') return '事件' + (dd.eventType ? ` (${dd.eventType})` : '')
  if (dd.dataType === 'service') return '服务'
  return dd.dataType || '—'
}

// ===== 自定义导入穿梭框 =====
const capDialogVisible = ref(false)
const capDialogTitle = ref('添加平台能力项')
const importSelectedIds = ref([])
const importCheckedIds = ref([])
const importSearchText = ref('')
const expandedLeftModules = ref([])
const expandedModules = ref([])
const currentCapType = ref('standard')
const algoCapScope = ref(null) // editing algorithm when algo config is active, for scoping capability transfer

// 按能力自带的模块名分组（能力池里的记录已带 moduleName）。
// 原来按写死的 capModules（'record'/'basic'… 那套假模块）匹配，跟物模型的真实模块
// （数字 id 的 WorkModeModule/EventDetectModule 等）对不上，会把所有能力打成「其他」。
function buildModuleGroups(capList) {
  const mods = getModules()
  const groupMap = new Map()
  capList.forEach(cap => {
    const name = cap.moduleName || '其他'
    if (!groupMap.has(name)) {
      const mod = mods.find(m => m.name === name)
      groupMap.set(name, {
        id: name,
        name: mod ? `${mod.name} (${mod.identifier})` : name,
        caps: []
      })
    }
    groupMap.get(name).caps.push(cap)
  })
  return [...groupMap.values()]
}

function getExistingIds() {
  // new：只有页面级的标准/自定义能力两张表
  return new Set(standardCapList.value.map(c => c.identifier).concat(customCapList.value.map(c => c.identifier)))
}

function getAlgoCapPool() {
  // Returns the capability pool scoped to the current algo config context
  if (!algoCapScope.value) return null
  const modules = getModules()
  const modMap = Object.fromEntries(modules.map(m => [m.id, m]))
  const normalize = (cap) => ({
    capType: cap.capType,
    name: cap.name,
    identifier: cap.identifier,
    descr: cap.descr || '',
    dataDef: cap.dataDef || {},
    moduleId: String(cap.moduleId),
    moduleName: modMap[cap.moduleId]?.name || ''
  })
  if (currentCapType.value === 'standard') {
    const ids = (() => { try { return JSON.parse(algoCapScope.value.capabilityIds || '[]') } catch { return [] } })()
    return getCapabilitiesByIds(ids).map(normalize)
  }
  // custom: all thing-model capabilities not already in standard scope
  const stdIds = new Set((() => { try { return JSON.parse(algoCapScope.value.capabilityIds || '[]') } catch { return [] } })())
  return getAllCapabilities().filter(c => !stdIds.has(c.identifier)).map(normalize)
}

// new：去掉「设备算法服务」步骤后，能力池取物模型「标准能力」池，
// 并按**产品所属类目**过滤 —— 只出该类目已绑定的能力项（类目↔能力关联见物模型管理）
// 可选单位是「能力项」：只列出该类目已绑定的能力项，选中后连带其全部参数
function getStandardCapItemPool() {
  const cat = resolveProductCategory()
  if (!cat) return []
  const linkedIds = getCategoryLinkedCapIds(cat.id)
  if (!linkedIds.length) return []
  const modMap = Object.fromEntries(getModules().map(m => [m.id, m]))
  return store.capItems
    .map(it => {
      const modName = modMap[String(it.moduleId)]?.name || ''
      const params = store.capabilities
        .filter(c => c.capItemId === it.id && linkedIds.includes(c.id))
        .map(c => ({
          capType: c.capType,
          name: c.name,
          identifier: c.identifier,
          descr: c.descr || '',
          dataDef: c.dataDef || {},
          moduleId: String(c.moduleId),
          moduleName: modName
        }))
      return {
        id: it.id,
        name: it.name,
        identifier: it.identifier,
        capType: it.capType || 'prop',
        moduleId: String(it.moduleId),
        moduleName: modName,
        params,
        paramCount: params.length
      }
    })
    .filter(it => it.paramCount > 0)
}

// 穿梭框左侧分组的展开键（用真实模块名，跟 buildModuleGroups 的 group.id 对齐）
const capPoolModuleNames = () => [...new Set(getStandardCapItemPool().map(c => c.moduleName).filter(Boolean))]

// 路由 query 里的 category 传的是类目名称（如「智能门铃」），兼容按标识符匹配
function resolveProductCategory() {
  const key = (productCategory.value || '').trim()
  if (!key) return null
  return store.categories.find(c => c.name === key || c.identifier === key) || null
}

const importAvailableByModule = computed(() => {
  const pool = getStandardCapItemPool()
  const existingIds = getExistingIds()
  // 参数已全部加入的能力项不再列出
  const available = pool.filter(it =>
    !importSelectedIds.value.includes(it.identifier) && !it.params.every(p => existingIds.has(p.identifier))
  )
  return buildModuleGroups(available)
})

const importSelectedByModule = computed(() => {
  const pool = getStandardCapItemPool()
  const items = importSelectedIds.value.map(id => pool.find(c => c.identifier === id)).filter(Boolean)
  return buildModuleGroups(items)
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
    // expand target module
    const cap = getStandardCapItemPool().find(c => c.identifier === id)
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
  capDialogTitle.value = type === 'standard' ? '添加平台能力项 — 导入能力' : '添加自定义能力项 — 导入能力'
  importSelectedIds.value = []
  importCheckedIds.value = []
  importSearchText.value = ''
  expandedLeftModules.value = capPoolModuleNames()
  expandedModules.value = []
  capDialogVisible.value = true
}

function getCapTarget() {
  // new：目标固定为页面级的标准/自定义能力表
  return currentCapType.value === 'standard' ? standardCapList.value : customCapList.value
}

function handleImportConfirm() {
  if (!importSelectedIds.value.length) { ElMessage.warning('请选择要添加的能力项'); return }
  const target = getCapTarget()
  const pool = getStandardCapItemPool()
  let added = 0
  importSelectedIds.value.forEach(itemId => {
    const it = pool.find(c => c.identifier === itemId)
    if (!it) return
    it.params.forEach(c => {
      if (target.some(x => x.identifier === c.identifier)) return
      target.push({
        id: Date.now() + Math.random(), capType: c.capType, name: c.name,
        identifier: c.identifier, descr: c.descr, dataType: c.dataDef?.dataType || '—',
        dataDef: JSON.parse(JSON.stringify(c.dataDef)), moduleName: c.moduleName,
        capItemId: it.id
      })
      added++
    })
  })
  ElMessage.success(`已添加 ${importSelectedIds.value.length} 个能力项（${added} 个参数）`)
  capDialogVisible.value = false
}

const currentCapList = computed(() => currentCapType.value === 'standard' ? standardCapList : customCapList)

function editCapability(row, idx) {
  openAlgoCapEdit({ cap: row, source: currentCapType.value, idx })
}

function removeCapability(idx) {
  currentCapList.value.splice(idx, 1)
  ElMessage.success('已删除')
}

// ===== Tab 2: 事件配置 =====
const eventConfigList = ref([])

function loadEventConfig() {
  const res = allEvents()
  eventConfigList.value = (res.data?.list || []).map(e => {
    try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
    return { ...e, supported: false, descr: e.eventRemark || '' }
  })
}


// ===== Tab 3: 算法 =====
const algoList = ref([])

function loadAlgorithms() {
  const res = listAlgorithms({ pageSize: 200 })
  const rows = []
  ;(res.data?.list || []).forEach(a => {
    try { a._name = JSON.parse(a.algorithmName || '{}') } catch { a._name = {} }
    try { a._eventIds = JSON.parse(a.eventIds || '[]') } catch { a._eventIds = [] }
    const hasConfig = (() => { try { return JSON.parse(a.capabilityIds || '[]').length > 0 } catch { return false } })()
    const algoEvents = getAlgorithmEvents(a.algorithmId)
    // 获取该算法对应的所有服务
    const services = getAllAlgorithmServices(a.algorithmId)
    if (services.length === 0) {
      // 无服务映射 → 单行占位
      rows.push({
        ...a,
        serviceId: a.serviceId || '-',
        serviceName: '',
        supported: false,
        free: false,
        boundPackage: '',
        hasConfig,
        algoOptions: [],
        linkedEvents: algoEvents,
        standardCaps: [],
        customCaps: [],
        _rowSpan: 1,
        _isFirstRow: true
      })
    } else {
      services.forEach((svc, si) => {
        rows.push({
          ...a,
          serviceId: svc.serviceId,
          serviceName: svc.name,
          supported: false,
          free: false,
          boundPackage: '',
          hasConfig,
          algoOptions: [],
          linkedEvents: algoEvents,
          standardCaps: [],
          customCaps: [],
          _rowSpan: services.length,
          _isFirstRow: si === 0
        })
      })
    }
  })
  algoList.value = rows
}

// 合并算法级单元格（算法ID/名称/描述/能力配置/关联事件）
function algoSpanMethod({ columnIndex, row }) {
  // 算法级列: 0=算法ID, 1=算法名称, 2=描述, 3=能力配置, 4=关联事件
  if (columnIndex <= 4) {
    if (row._isFirstRow) {
      return { rowspan: row._rowSpan, colspan: 1 }
    }
    return { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

// ===== 步骤3: 平台服务 =====
const platformServices = ref([])

function parseI18nName(jsonStr) {
  try { return JSON.parse(jsonStr || '{}')['1'] || '' } catch { return '' }
}

function getAlgoNamesForService(serviceId) {
  const svcs = listServices().data?.list || []
  const svc = svcs.find(s => s.serviceId === serviceId)
  if (!svc || !svc.algorithmIds?.length) return []
  const algos = listAlgorithms({ page: 1, pageSize: 999 }).data?.list || []
  return svc.algorithmIds
    .map(aid => algos.find(a => a.algorithmId === aid))
    .filter(Boolean)
    .map(a => parseI18nName(a.algorithmName) || a.algorithmId)
}

function loadPlatformServices() {
  const rows = []
  cloudRecordServices.value.forEach(svc => {
    rows.push({ serviceId: svc.serviceId, serviceName: svc.name, descr: svc.descr || '', supported: svc.supported, algoNames: getAlgoNamesForService(svc.serviceId) })
  })
  cloudSnapshotServices.value.forEach(svc => {
    rows.push({ serviceId: svc.serviceId, serviceName: svc.name, descr: svc.descr || '', supported: svc.supported, algoNames: getAlgoNamesForService(svc.serviceId) })
  })
  oldAlgoList.value.forEach(item => {
    rows.push({ serviceId: item.serviceId, serviceName: item.name, descr: item.descr || '', supported: item.supported, algoNames: getAlgoNamesForService(item.serviceId) })
  })
  platformServices.value = rows
}

const cloudRecordServices = ref([
  { serviceId: '300010', name: '事件云存', supported: true, descr: '事件录像：产生告警时触发录像' },
  { serviceId: '300011', name: '全天云存', supported: true, descr: '全天录像：全天24小时持续录像' }
])

const cloudSnapshotServices = ref([
  { serviceId: '300012', name: '鸟类检测', supported: false, descr: '云端抓图-鸟类识别与分类' },
  { serviceId: '300013', name: '松鼠检测', supported: false, descr: '云端抓图-松鼠识别与分类' }
])

const oldAlgoList = ref([
  { id: '1013', name: '全能AI', serviceId: '300051', descr: '集成多种AI算法服务', supported: true, hasConfig: true },
  { id: '1093', name: '离线监控', serviceId: '300008', descr: '设备断电或离线时的状态监测', supported: true, hasConfig: true },
  { id: '1096', name: '智能告警-儿童检测', serviceId: '300044', descr: '综合全天候的儿童看护识别', supported: false, hasConfig: true },
  { id: '1098', name: '智能告警服务', serviceId: '300009', descr: '基于多维参数的综合告警策略', supported: false, hasConfig: true },
  { id: '1103', name: '智能告警-老人看护', serviceId: '300039', descr: '针对老年用户的异常行为识别', supported: false, hasConfig: true },
  { id: '1104', name: '智能告警-厨房监测', serviceId: '300040', descr: '全方位监测厨房油烟和火情', supported: false, hasConfig: true },
  { id: '1105', name: '智能告警-家门检测', serviceId: '300041', descr: '门口逗留、门缝检测等安防预警', supported: false, hasConfig: true },
  { id: '1106', name: '智能告警-宠物检测', serviceId: '300042', descr: '整合宠物的多项健康和活动指标', supported: true, hasConfig: true },
  { id: '1016', name: '逗留提醒', serviceId: '300036', descr: '检测人员逗留并触发提醒', supported: false, hasConfig: true },
  { id: '1061', name: '设备算法', serviceId: '-', descr: '设备端算法能力配置', supported: false, hasConfig: false },
  { id: '2000', name: '短信套餐', serviceId: '300031', descr: '短信通知服务套餐', supported: false, hasConfig: false },
  { id: '2001', name: '去广告套餐', serviceId: '300030', descr: '去除APP内广告展示', supported: false, hasConfig: false }
])

const eventOptions = ref([])

function loadEvents() {
  const res = allEvents()
  eventOptions.value = (res.data?.list || []).map(e => {
    try { e._name = JSON.parse(e.eventName || '{}') } catch { e._name = {} }
    try { e._push = JSON.parse(e.pushCopy || '{}') } catch { e._push = {} }
    return { id: e.eventId, name: e._name?.['1'] || e.eventId, descr: e.eventRemark || '', _push: e._push, _dbId: e.id }
  })
}

const algoConfigVisible = ref(false)
const editingAlgo = ref(null)

// ===== PIR侦测 能力配置 =====
const pirConfigVisible = ref(false)
const pirConfigItems = [
  { key: 'abilitySwitch',   label: '能力开关' },
  { key: 'sensitivity',     label: '灵敏度' },
  { key: 'smartTracking',   label: '智能追踪开关' },
  { key: 'soundAlarm',      label: '声音报警' },
  { key: 'deviceLight',     label: '设备报警灯' },
  { key: 'personDetect',    label: '人形侦测' },
  { key: 'vehicleDetect',   label: '车辆检测' },
  { key: 'petDetect',       label: '宠物检测' },
  { key: 'motionDetect',    label: '移动检测' },
  { key: 'scheduledDetect', label: '定时设置' },
  { key: 'zoneDetect',      label: '自定义区域' }
]
const pirConfigForm = reactive({
  abilitySwitch:   { supported: '1', defaultVal: '1' },
  sensitivity:     { supported: '1', defaultVal: '3' },
  smartTracking:   { supported: '0', defaultVal: '0' },
  soundAlarm:      { supported: '1', defaultVal: '1' },
  deviceLight:     { supported: '1', defaultVal: '0' },
  personDetect:    { supported: '1', defaultVal: '1' },
  vehicleDetect:   { supported: '0', defaultVal: '0' },
  petDetect:       { supported: '0', defaultVal: '0' },
  motionDetect:    { supported: '1', defaultVal: '1' },
  scheduledDetect: { supported: '0', defaultVal: '0' },
  zoneDetect:      { supported: '0', defaultVal: '0' }
})

function savePirConfig() {
  if (editingAlgo.value) {
    editingAlgo.value._pirConfig = JSON.parse(JSON.stringify(pirConfigForm))
    editingAlgo.value.standardCaps = JSON.parse(JSON.stringify(standardCapList.value))
    editingAlgo.value.customCaps = JSON.parse(JSON.stringify(customCapList.value))
  }
  ElMessage.success('PIR侦测能力配置已保存')
  pirConfigVisible.value = false
  algoCapScope.value = null
}

function openAlgoConfig(row) {
  if (row.algorithmId === '4003') {
    editingAlgo.value = row
    algoCapScope.value = row
    // Reset PIR config from row data or defaults
    if (row._pirConfig) {
      Object.keys(pirConfigForm).forEach(key => {
        if (row._pirConfig[key]) {
          pirConfigForm[key].supported = row._pirConfig[key].supported
          pirConfigForm[key].defaultVal = row._pirConfig[key].defaultVal
        }
      })
    }
    // Initialize standard/custom caps from algorithm library
    if (!row.standardCaps || row.standardCaps.length === 0) {
      const ids = (() => { try { return JSON.parse(row.capabilityIds || '[]') } catch { return [] } })()
      const modules = getModules()
      const modMap = Object.fromEntries(modules.map(m => [m.id, m]))
      row.standardCaps = getCapabilitiesByIds(ids).map(c => ({
        id: Date.now() + Math.random(), capType: c.capType, name: c.name,
        identifier: c.identifier, descr: c.descr || '', dataType: c.dataDef?.dataType || '—',
        dataDef: JSON.parse(JSON.stringify(c.dataDef)),
        moduleName: modMap[c.moduleId]?.name || ''
      }))
    }
    standardCapList.value = JSON.parse(JSON.stringify(row.standardCaps || []))
    customCapList.value = JSON.parse(JSON.stringify(row.customCaps || []))
    pirConfigVisible.value = true
    return
  }
  editingAlgo.value = row
  algoCapScope.value = row
  // Initialize standard caps from algorithm library on first open
  if (!row.standardCaps || row.standardCaps.length === 0) {
    const ids = (() => { try { return JSON.parse(row.capabilityIds || '[]') } catch { return [] } })()
    const modules = getModules()
    const modMap = Object.fromEntries(modules.map(m => [m.id, m]))
    row.standardCaps = getCapabilitiesByIds(ids).map(c => ({
      id: Date.now() + Math.random(), capType: c.capType, name: c.name,
      identifier: c.identifier, descr: c.descr || '', dataType: c.dataDef?.dataType || '—',
      dataDef: JSON.parse(JSON.stringify(c.dataDef)),
      moduleName: modMap[c.moduleId]?.name || ''
    }))
  }
  standardCapList.value = JSON.parse(JSON.stringify(row.standardCaps || []))
  customCapList.value = JSON.parse(JSON.stringify(row.customCaps || []))
  algoConfigVisible.value = true
  // list populated from algorithm's standardCaps/customCaps
}
function saveAlgoConfig() {
  if (editingAlgo.value) {
    editingAlgo.value.standardCaps = JSON.parse(JSON.stringify(standardCapList.value))
    editingAlgo.value.customCaps = JSON.parse(JSON.stringify(customCapList.value))
  }
  ElMessage.success('算法配置已保存')
  algoConfigVisible.value = false
  algoCapScope.value = null
}
function savePlatformTab() { ElMessage.success('平台服务配置已保存') }

const eventLinkVisible = ref(false)
const eventTableRef = ref(null)
const linkedEventOptions = computed(() => {
  if (!editingAlgo.value) return []
  const allSvcEventIds = getAlgorithmEvents(editingAlgo.value.algorithmId)
  return eventOptions.value.filter(e => allSvcEventIds.includes(e.id))
})
function handleEventSelectionChange(rows) {
  if (editingAlgo.value) {
    editingAlgo.value.linkedEvents = rows.map(r => r.id)
  }
}
function openEventLink(row) {
  editingAlgo.value = row
  eventLinkVisible.value = true
  nextTick(() => {
    const table = eventTableRef.value
    if (!table) return
    linkedEventOptions.value.forEach(evt => {
      table.toggleRowSelection(evt, row.linkedEvents.includes(evt.id))
    })
  })
}
function saveEventLink() { ElMessage.success('关联事件已保存'); eventLinkVisible.value = false }

// ===== Tab 3: 语音 =====
const voiceList = ref([
  { alloTType: 1063, platform: 'ALEXA', descr: 'ALEXA', supported: false },
  { alloTType: 1063, platform: 'GOOGLE_HOME', descr: 'GOOGLE_HOME', supported: false }
])

// ===== 套餐绑定 =====
const packageOptions = [
  { id: '300031', name: '短信套餐（300031）' },
  { id: '300030', name: '去广告套餐（300030）' },
  { id: '300010', name: '事件云存（300010）' },
  { id: '300011', name: '全天云存（300011）' }
]

const packageDrawerVisible = ref(false)
const packageDrawerRow = ref(null)

function onFreeChange(row) {
  if (!row.free) row.boundPackage = ''
}

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

function finishDev() {
  ElMessage.success('产品配置已完成，即将返回产品列表')
  setTimeout(() => router.push('/product-new/development'), 1200)
}

function handleBack() { router.push('/product-new/development') }
function handleEditProduct() { ElMessage.info('编辑产品基础信息') }

// ===== 按产品类目代入新/老能力 =====
const categoryCapIds = ref([])
const categoryLegacyCapIds = ref([])

const categoryCapsList = computed(() => {
  const cat = store.categories.find(c => c.name === productCategory.value)
  if (!cat) return []
  return store.capabilities.filter(cap => categoryCapIds.value.includes(cap.id))
})

const categoryLegacyCapsList = computed(() => {
  const cat = store.categories.find(c => c.name === productCategory.value)
  if (!cat) return []
  return store.legacyCapabilities.filter(cap => categoryLegacyCapIds.value.includes(cap.id))
})

// 迭代 buildModuleGroups：把物模型能力按模块分组为 { name, items } 供 CapModules 渲染
function moduleItemsFromCaps(caps) {
  const moduleMap = {}
  caps.forEach(cap => {
    const mod = store.modules.find(m => m.id === cap.moduleId)
    const modName = mod ? mod.name : '其他'
    if (!moduleMap[modName]) moduleMap[modName] = []
    moduleMap[modName].push({
      id: cap.identifier,
      name: cap.name,
      supported: '1',
      defaultValue: null,
      defaultName: cap.name,
      access: cap.dataDef?.accessMode === 'ro' ? 'ro' : 'rw',
      identifier: cap.identifier
    })
  })
  return Object.entries(moduleMap).map(([name, items]) => ({ name, items }))
}

function loadCategoryConfig() {
  const cat = store.categories.find(c => c.name === productCategory.value)
  if (!cat) return
  categoryCapIds.value = getCategoryLinkedCapIds(cat.id)
  categoryLegacyCapIds.value = getCategoryLinkedLegacyCapIds(cat.id)
  if (categoryCapIds.value.length) {
    // 新能力 → 标准能力表
    // 只预填属性（prop）：服务/事件留给用户在「添加标准能力」里自己选，
    // 否则可选池（同样按类目过滤）会被全部排除，列表变空
    const modMap = Object.fromEntries(store.modules.map(m => [String(m.id), m]))
    standardCapList.value = store.capabilities
      .filter(cap => categoryCapIds.value.includes(cap.id) && cap.capType === 'prop')
      .map(cap => ({
        capItemId: cap.capItemId,
        capType: cap.capType,
        name: cap.name,
        identifier: cap.identifier,
        dataType: cap.dataDef?.dataType || '',
        dataDef: cap.dataDef || {},
        descr: cap.descr || '',
        moduleName: modMap[String(cap.moduleId)]?.name || ''
      }))
  }
  if (categoryLegacyCapIds.value.length) {
    // 老能力 → 设备能力 tab（上面的 CapModules）
    const legacyByModule = {}
    categoryLegacyCapsList.value.forEach(cap => {
      const mod = store.legacyModules.find(m => m.id === cap.moduleId)
      const modName = mod ? mod.name : '其他'
      if (!legacyByModule[modName]) legacyByModule[modName] = []
      const jc = (() => { try { return JSON.parse(cap.jsonContent || '{}') } catch { return {} } })()
      legacyByModule[modName].push({
        id: cap.identifier,
        name: cap.name,
        supported: '1',
        defaultValue: jc.dataType === 'int' ? { type: 'number', value: jc.min ?? 0, min: jc.min ?? 0, max: jc.max ?? 100, unit: jc.unit || '' } : null,
        defaultName: cap.name,
        access: jc.accessMode === 'ro' ? 'ro' : 'rw',
        identifier: cap.identifier
      })
    })
    Object.keys(legacyByModule).forEach(modName => {
      const existing = deviceCapModules.find(m => m.name === modName)
      if (existing) {
        existing.items = legacyByModule[modName]
      } else {
        deviceCapModules.push({ name: modName, items: legacyByModule[modName] })
      }
    })
  }
}

onMounted(() => {
  loadAlgorithms(); loadEvents(); loadEventConfig(); loadPlatformServices()
  loadCategoryConfig()
})
</script>

<style lang="scss" scoped>

// ===== Wizard connectors =====
.stepper-connector {
  flex: 1 1 0%;
  height: 2px;
  background-color: #e2e8f0;
}

.config-table {
  :deep(th.el-table__cell) {
    background: #f8fafc !important;
  }
  :deep(.row-actions) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}

// ===== 页面头部 =====
.page-header-bar {
  margin-bottom: 6px;
  :deep(.el-page-header__back) {
    font-size: 14px; color: var(--text-regular);
  }
}

.page-header-title {
  font-weight: 600; font-size: 14px; color: var(--text-primary);
  margin-right: 12px;
}

// ===== 产品信息 =====
.product-info-bar {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 16px;
}

.product-info-left {
  display: flex; align-items: center; gap: 12px;
  .product-name { margin: 0; font-size: 20px; font-weight: 600; color: var(--text-primary); }
}

.product-info-meta {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-secondary);
  .meta-sep { color: var(--border-color); margin: 0 4px; }
}

// ===== 步骤条 =====
.steps-bar {
  position: relative;
  background: #F5F7FA;
  padding: 13px 0;
  margin-bottom: 20px;



  :deep(.el-steps) { display: flex; }
  // 清掉 EP 自带的 13px 8% 内边距，让各步骤铺满整条
  :deep(.el-steps--simple) { padding: 0; background: transparent; }

  // 每个步骤等分宽度（与步数无关），[图标 + 文案] 在自己那段里居中。
  // EP 默认 .el-step__main{flex-grow:1} + .el-step__arrow{flex-grow:1} 会把内容推向一端，
  // 这里把两者都收成内容宽，改由 .el-step 自身 justify-content:center 定位。
  // !important 用于压过 EP 可能打在 .el-step 上的行内 flex-basis。
  :deep(.el-step.is-simple) {
    flex: 1 1 0 !important;
    max-width: none;
    min-width: 0;
    justify-content: center;
  }
  :deep(.el-step.is-simple .el-step__main) { flex-grow: 0; }
  :deep(.el-step.is-simple .el-step__title) { max-width: none; }
  // 步骤之间的 ">"：画在每个步骤的右边界，与步数无关
  :deep(.el-step.is-simple:not(:last-of-type)) {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      width: 8px;
      height: 8px;
      border-top: 1px solid var(--el-text-color-placeholder, #a8abb2);
      border-right: 1px solid var(--el-text-color-placeholder, #a8abb2);
      transform: translate(50%, -50%) rotate(45deg);
      pointer-events: none;
    }
  }
  // EP 自带的箭头跟着第一步文案走，隐藏掉，改由上面按步骤边界画的 ::after
  :deep(.el-step.is-simple .el-step__arrow) { display: none; }

  :deep(.el-step__title) {
    cursor: pointer; font-size: 14px; font-weight: 400;
    &.is-process { color: #4992FE; font-weight: 500; }
    &.is-wait { color: #909399; }
  }
  :deep(.el-step__head.is-process) { color: #4992FE; border-color: #4992FE; }
}

// ===== Border-card 设备 Tabs =====
.device-tabs {
  border: 1px solid #DDD;
  background: #fff;

  :deep(.el-tabs__header) {
    background: #F5F7FA;
    border-bottom: 1px solid #E4E7ED;
    margin: 0;
  }
  :deep(.el-tabs__nav) { border: none; }
  :deep(.el-tabs__item) {
    padding: 0 20px; height: 40px; line-height: 40px;
    font-size: 14px; color: #909399; border: none;
    &:hover { color: #4992FE; }
    &.is-active { color: #4992FE; background: #fff; font-weight: 500; }
  }
  :deep(.el-tabs__content) { padding: 20px 24px 0; }
}

// ===== 步骤内容卡片 (步骤1, 步骤2) =====
.step-content-card {
  background: #fff;
  border: 1px solid #DDD;
  padding: 0 0 20px;
}

// ===== Step 按钮栏 =====
.step-btns-bar {
  display: flex; justify-content: center; align-items: center; gap: 12px;
  padding: 16px 20px 13px;
  .w-160 { width: 160px; }
}

// ===== 底部悬浮操作条 =====
// 固定悬浮在视口底部；左侧偏移跟随侧边栏宽度（--sb-current 由 Layout 提供）
.step-float-bar {
  position: fixed;
  bottom: 0;
  left: var(--sb-current, 224px);
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: #fff;
  border-top: 1px solid var(--border-lighter);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  transition: left .2s ease;
  .w-160 { width: 160px; }
}

// 表格操作列的按钮组：强制一行，不换行
.row-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  :deep(.el-button + .el-button) { margin-left: 4px; }
}

// ===== TSL 弹窗 =====
.tsl-meta {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  em { font-style: normal; font-weight: 500; color: var(--text-primary); }
}
.tsl-meta-sep { margin: 0 8px; color: var(--border-light); }
.json-viewer {
  background: var(--bg-body);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 12px 16px;
  pre { margin: 0; font-size: 13px; font-family: monospace; white-space: pre-wrap; word-break: break-all; color: var(--text-primary); }
}

// ===== 配置分隔线 =====
.config-divider {
  :deep(.el-divider) { margin: 20px 0; }
  :deep(.el-divider__text) {
    display: flex; align-items: center; gap: 6px;
    color: var(--text-regular); font-weight: 500; font-size: 14px;
  }
}

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
  .tip-bar-toggle {
    margin-left: auto;
    flex-shrink: 0;
    padding: 0;
    font-size: 13px;
  }
}

// ===== APP 控制面板预览（设备能力页内，右侧展开） =====
.device-cap-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.device-cap-main {
  flex: 1;
  min-width: 0;
}

.device-cap-side {
  width: 300px;
  max-width: 300px;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: max-width 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  max-width: 0;
  opacity: 0;
}


// ===== 配置布局 (分段控件 + 内容) =====
.config-layout {
  display: flex; gap: 24px;
  min-height: 400px;
}

.module-segmented {
  flex-shrink: 0;
  width: 130px;
  background: #F5F7FA;
  border-radius: 6px;
  padding: 8px;
  :deep(.el-segmented__group) { width: 100%; }
  :deep(.el-segmented) { background: transparent; }
  :deep(.el-segmented__item) {
    padding: 10px 12px; justify-content: center;
    font-size: 13px; text-align: center;
    border-radius: 4px; color: #606266;
    transition: all .2s;
    &:hover { color: #4992FE; }
    &.is-selected {
      background: #4992FE; color: #fff;
      border-radius: 4px;
    }
  }
}

.config-detail {
  flex: 1; padding: 0;
}

// ===== 配置表单 =====
.config-form {
  :deep(.el-form-item) { margin-bottom: 20px; }
  :deep(.el-form-item__label) {
    color: var(--text-regular); font-weight: 400; font-size: 14px;
  }
  :deep(.el-checkbox) { margin-right: 30px; }
  :deep(.el-checkbox__label) { font-weight: 400; }
  :deep(.el-radio) { margin-right: 24px; }
  :deep(.el-form-item:last-child) { margin-bottom: 0; }
}

// ===== 配置区域 =====
.config-section {
  padding: 0 0 24px;
}

.section-title {
  font-size: 14px; font-weight: 500;
}

.section-subtitle {
  font-size: 14px; font-weight: 600; color: var(--text-primary);
  margin-bottom: 12px;
}

// ===== 能力表格区域 =====
.cap-section {
  padding: 24px 0 0;
  // new：模块卡片区已移除，「标准能力」成了首个 section，不再需要顶部分隔线与上边距
  &:first-of-type { padding-top: 0; }
}

.cap-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
  .cap-section-title {
    display: inline-flex; align-items: center;
    margin: 0; font-size: 16px; font-weight: 500; color: var(--text-primary);
  }
  .cap-section-desc {
    font-size: 12px; color: var(--text-placeholder); margin-left: 12px;
  }
}

// 区块头右侧的按钮组（查看TSL / 添加标准能力）
.cap-section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

// ===== 类型标签 =====
.type-tag {
  display: inline-block; padding: 2px 8px; border-radius: 3px;
  font-size: 12px; font-weight: 500; line-height: 1.5;
  &.type-prop { background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff; }
  &.type-svc { background: #f0f9eb; color: #67c23a; border: 1px solid #e1f3d8; }
  &.type-evt { background: #fdf6ec; color: #e6a23c; border: 1px solid #faecd8; }
}

// ===== 算法 =====
.algo-service-section {
  padding: 20px 24px;
  &:first-of-type { border-bottom: 1px solid var(--border-lighter, #e4e7ed); }
  // 合并单元格居中
  .merged-cell {
    font-weight: 500;
  }
}
.algo-service-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  .algo-service-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .algo-service-sub { font-size: 13px; color: var(--text-secondary); }
}

// ===== 镜头/麦克风 =====
.lens-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}

.lens-config-body {
  padding-top: 4px;
}

.lens-actions { display: flex; gap: 12px; }

.camera-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; }

// 镜头/码流卡片
.lens-item-card, .stream-item-card {
  margin-top: 16px;
  :deep(.el-card__header) { padding: 12px 16px; }
  :deep(.el-card__body) { padding: 16px 20px; }
}

.card-header-row {
  display: flex; align-items: center;
  .card-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-right: auto; }
}

// 分辨率列表
.resolution-list {
  display: flex; flex-wrap: wrap; gap: 4px 0;
}
.resolution-item {
  width: 50%;
}

// 表单提示
.form-tip { font-size: 12px; color: var(--text-placeholder); }

.camera-form {
  :deep(.el-card) {
    border: 1px solid var(--border-lighter, #e4e7ed);
    margin-bottom: 12px;
  }
}

// ===== 事件关联 =====
.event-check-item {
  padding: 8px 12px; border-bottom: 1px solid var(--border-lighter, #e4e7ed);
  &:last-child { border-bottom: none; }
  .event-name { font-weight: 500; }
  .event-desc { color: var(--text-secondary); margin-left: 8px; font-size: 13px; }
}

// ===== 穿梭框 =====
.transfer-item {
  display: flex; align-items: center;
  .transfer-meta { margin-left: auto; font-size: 12px; color: var(--text-placeholder); }
}

// ===== 算法配置弹窗 — 列表布局 =====
.algo-config-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.algo-config-count { font-size: 13px; color: var(--text-secondary); }
.algo-config-toolbar-actions { display: flex; gap: 8px; }
.algo-config-empty {
  text-align: center; padding: 40px 0; color: var(--text-placeholder); font-size: 14px;
}
.algo-cap-section { margin-bottom: 16px; }
.algo-cap-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.algo-cap-section-title {
  font-size: 14px; font-weight: 500; color: var(--text-primary);
  padding-left: 4px; border-left: 3px solid var(--el-color-primary);
}

// 能力类型卡片
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

// ===== PIR 配置 =====
.pir-config-section { padding: 0 20px; }
.pir-item-row { display: flex; align-items: center; gap: 8px; }
.pir-item-label { font-size: 12px; color: var(--text-secondary); flex-shrink: 0; }
.pir-item-sep { color: var(--border-light); margin: 0 4px; }

// ===== 通用 =====
.cell-name { font-weight: 500; color: var(--text-primary); font-size: 13px; }
.cell-desc { font-size: 13px; color: var(--text-secondary); }
.cell-service-id { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.text-muted { color: var(--text-placeholder); }
.header-tip-icon { margin-left: 4px; color: var(--text-placeholder); cursor: help; font-size: 14px; }
.empty-state {
  display: flex; align-items: center; justify-content: center;
  padding: 60px 0; color: var(--text-placeholder); font-size: 14px;
}

// 穿梭框搜索栏
.pkg-param-count { margin-left: 8px; font-size: 12px; color: var(--text-placeholder); }
.draft-empty { font-size: 12px; color: var(--text-placeholder); padding: 4px 0; }
.draft-param {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; margin-bottom: 6px;
  border: 1px solid var(--border-lighter, #e4e7ed);
  border-radius: 6px;
  .draft-name { font-size: 13px; color: var(--text-primary); }
  .draft-id { font-size: 12px; color: var(--text-placeholder); font-family: monospace; }
  :deep(.el-button) { margin-left: auto; }
}

// APP配置步骤
.app-config-form { padding: 4px 24px; }
.app-config-item {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
  &:last-child { border-bottom: none; }
}
.app-config-label { width: 120px; flex-shrink: 0; font-size: 14px; color: var(--text-primary); line-height: 32px; }
.app-config-inline { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.app-config-col { display: flex; flex-direction: column; gap: 6px; }
.app-config-desc { font-size: 12px; color: var(--text-placeholder); }
.app-config-warn {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #E6A23C;
}
.app-config-hint { font-size: 13px; color: var(--text-secondary); }
.app-config-sub { font-size: 13px; color: var(--text-secondary); margin-left: 8px; }
.app-config-sublabel { width: 120px; flex-shrink: 0; font-size: 13px; color: var(--text-primary); }
.app-config-panel {
  background: var(--bg-page, #f5f7fa);
  border-radius: 6px;
  padding: 12px 16px;
}

// 参数子表：内嵌面板
.param-panel {
  padding: 12px 16px 14px 56px;
  background: var(--bg-page, #f5f7fa);
  :deep(.el-table) {
    border: 1px solid var(--border-lighter, #e4e7ed);
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-card, #fff);
  }
  :deep(th.el-table__cell) { background: var(--bg-card, #fff); }
}
.param-empty { padding: 28px 0; text-align: center; font-size: 13px; color: var(--text-placeholder); }

.transfer-panel-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
  flex-shrink: 0;
}
.transfer-panel-search-placeholder {
  height: 48px; flex-shrink: 0;
  border-bottom: 1px solid var(--border-lighter, #e4e7ed);
}

// 穿梭框箭头按钮统一尺寸
.transfer-arrow-btn {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  :deep(.el-icon) { font-size: 14px; margin: 0; }
}

// ===== 算法服务 新/老 分区标题 =====
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin: 24px 0 12px;
  padding: 0 24px;
  &:first-child { margin-top: 0; }
}
.section-header-title {
  margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary);
}

// ===== 旧版算法卡片 =====
.old-algo-card {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px 0;
  margin-top: 24px;
}
.legacy-tag {
  display: inline-block; vertical-align: middle;
  margin-left: 10px; padding: 1px 8px; border-radius: 3px;
  font-size: 12px; font-weight: 400; color: #909399;
  background: #f4f4f5; border: 1px solid #e9e9eb;
}

// ===== 老算法服务组 =====
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

</style>

<style lang="scss">
// 导入能力弹窗：加高穿梭框，一屏能展示更多能力项
// （全局 .transfer-container 固定 380px，这里按视口高度放开）
.transfer-container.cap-transfer-container { height: 58vh; }

.algo-config-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.event-link-drawer {
  .el-drawer__body { padding: 20px 24px; }
}
.event-id-code { font-size: 12px; color: var(--text-secondary); background: #f5f7fa; padding: 1px 6px; border-radius: 3px; }
.alg-cap-dialog .el-dialog__body { padding-top: 20px; }
.custom-cap-dialog .el-dialog__body { padding-top: 20px; }
.tsl-dialog .el-dialog__body { padding-top: 20px; }
.cap-dialog {
  .el-dialog__body { padding-top: 20px; }
  .el-form-item { margin-bottom: 18px; }
  .el-divider { margin: 24px 0 20px; }
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
// 弹窗顶部留白（非 scoped，弹窗被 teleport 到 body）
.app-dialog .el-dialog__body { padding-top: 20px; }
</style>
