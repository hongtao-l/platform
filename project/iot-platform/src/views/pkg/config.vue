<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑套餐' : '创建套餐'"
    size="640px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <!-- ===== 基础信息 ===== -->
      <span class="section-label">基础信息</span>

      <el-form-item label="套餐名称" prop="name">
        <div style="display:flex;align-items:center;gap:8px">
          <el-input v-model="form.name" placeholder="请输入套餐名称" style="flex:1" />
          <span class="i18n-icon" title="多语言配置">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </span>
        </div>
      </el-form-item>

      <!-- ===== 选择套餐服务 ===== -->
      <span class="section-label">选择套餐服务</span>
      <div class="section-block">
        <el-form-item label="应用方向" prop="direction">
          <el-radio-group v-model="form.direction">
            <el-radio value="device">设备套餐</el-radio>
            <el-radio value="user">用户套餐</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生效时长" prop="duration">
          <el-select v-model="form.duration" placeholder="请选择生效时长" style="width:100%">
            <template v-if="form.direction === 'device'">
              <el-option label="7天" value="7" />
              <el-option label="15天" value="15" />
              <el-option label="30天" value="30" />
              <el-option label="1年" value="365" />
            </template>
            <template v-else>
              <el-option label="3个月" value="90" />
              <el-option label="6个月" value="180" />
            </template>
          </el-select>
        </el-form-item>

        <el-form-item label="套餐服务" prop="services">
          <el-select
            v-model="form.services"
            multiple
            filterable
            placeholder="搜索并选择套餐服务"
            style="width:100%"
          >
            <template v-if="form.direction === 'device'">
              <el-option label="7天事件云存" value="7天事件云存" />
              <el-option label="15天事件云存" value="15天事件云存" />
              <el-option label="30天事件云存" value="30天事件云存" />
              <el-option label="AI智能识别" value="AI智能识别" />
            </template>
            <template v-else>
              <el-option label="短信套餐" value="短信套餐" />
              <el-option label="免广告-年" value="免广告-年" />
              <el-option label="专属客服" value="专属客服" />
              <el-option label="高级功能" value="高级功能" />
            </template>
          </el-select>
        </el-form-item>

        <!-- 服务明细卡片 -->
        <div v-if="form.services.length > 0" style="margin-top:12px">
          <div
            v-for="(svc, idx) in serviceDetails"
            :key="svc.name"
            class="service-detail"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-weight:600;font-size:14px;color:var(--text-primary)">{{ svc.name }}</span>
              <el-tag size="small">{{ svc.type }}</el-tag>
            </div>
            <div class="service-detail-row">
              <span class="service-detail-label">平台成本（¥）</span>
              <span class="service-detail-value">{{ svc.costYuan }}</span>
            </div>
            <div class="service-detail-row">
              <span class="service-detail-label">平台成本（$）</span>
              <span class="service-detail-value">{{ svc.costDollar }}</span>
            </div>
            <div class="service-detail-row">
              <span class="service-detail-label">描述</span>
              <span class="service-detail-value" style="font-weight:400;color:var(--text-secondary)">{{ svc.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 可绑定设备数 -->
      <span class="section-label">可绑定设备数</span>
      <div class="section-block">
        <el-form-item v-if="form.direction === 'device'" label="可绑定设备数" prop="bindCount">
          <el-input-number v-model="form.bindCount" :min="1" style="width:100%" />
        </el-form-item>
        <div v-else style="padding:8px 0;font-size:13px;color:var(--text-placeholder)">仅设备套餐支持绑定设备数配置</div>
      </div>

      <!-- ===== 限制产品购买 ===== -->
      <span class="section-label">限制产品购买</span>
      <div class="section-block">
        <el-form-item label="">
          <el-radio-group v-model="form.productRestrict" @change="onProductRestrictChange">
            <el-radio value="none">不限制</el-radio>
            <el-radio value="black">黑名单</el-radio>
            <el-radio value="white">白名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="form.productRestrict !== 'none'" class="product-restrict-area">
          <el-form-item :label="form.productRestrict === 'black' ? '黑名单产品' : '白名单产品'">
            <el-select
              v-model="form.restrictProducts"
              multiple
              filterable
              placeholder="搜索并选择产品ID"
              style="width:100%"
            >
              <el-option label="PROD001 - 牵心PRO基础版" value="PROD001" />
              <el-option label="PROD002 - 牵心PRO高级版" value="PROD002" />
              <el-option label="PROD003 - 鹤梦之家标准版" value="PROD003" />
              <el-option label="PROD004 - 鹤梦之家旗舰版" value="PROD004" />
              <el-option label="PROD005 - AI智能检测模块" value="PROD005" />
              <el-option label="PROD006 - 云存储7天包" value="PROD006" />
              <el-option label="PROD007 - 云存储30天包" value="PROD007" />
              <el-option label="PROD008 - 全能AI套装" value="PROD008" />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- ===== 套餐定价 ===== -->
      <span class="section-label">套餐定价 <span style="color:var(--danger-color)">*</span></span>
      <div class="section-block">
        <el-form-item label="">
          <el-checkbox
            v-model="form.priceNonSub"
            @change="onPriceTypeChange('nonSub')"
          >非订阅</el-checkbox>
          <el-checkbox
            v-model="form.priceSub"
            @change="onPriceTypeChange('sub')"
            style="margin-left:24px"
          >订阅制</el-checkbox>
          <el-checkbox
            v-model="form.priceFree"
            @change="onPriceTypeChange('free')"
            style="margin-left:24px"
          ><span style="color:#AD6800">免费套餐</span></el-checkbox>
        </el-form-item>

        <!-- 免费套餐提示 -->
        <div v-if="form.priceFree" class="free-tip">
          <el-icon :size="16" style="color:#AD6800;flex-shrink:0"><Warning /></el-icon>
          <span>免费套餐用户无需付费，请仔细核对套餐内容和服务范围。</span>
        </div>

        <!-- 非订阅定价 -->
        <div v-if="form.priceNonSub" style="margin-top:16px;padding-top:16px;border-top:1px dashed var(--border-lighter)">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px">非订阅定价</div>
          <div class="price-row">
            <el-form-item label="划线价（¥）" prop="nonSubListYuan">
              <div class="price-prefix">
                <span class="prefix-label">¥</span>
                <el-input v-model="form.nonSubListYuan" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
            <el-form-item label="划线价（$）" prop="nonSubListDollar">
              <div class="price-prefix">
                <span class="prefix-label">$</span>
                <el-input v-model="form.nonSubListDollar" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
          </div>
          <div class="price-row">
            <el-form-item label="售价（¥）" prop="nonSubPriceYuan">
              <div class="price-prefix">
                <span class="prefix-label">¥</span>
                <el-input v-model="form.nonSubPriceYuan" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
            <el-form-item label="售价（$）" prop="nonSubPriceDollar">
              <div class="price-prefix">
                <span class="prefix-label">$</span>
                <el-input v-model="form.nonSubPriceDollar" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- 订阅制定价 -->
        <div v-if="form.priceSub" style="margin-top:16px;padding-top:16px;border-top:1px dashed var(--border-lighter)">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px">订阅制定价</div>
          <el-form-item label="订阅文案">
            <div style="display:flex;align-items:center;gap:8px">
              <el-input v-model="form.subText" placeholder="如：每月自动续费，可随时取消" style="flex:1" />
              <span class="i18n-icon" title="多语言配置">
                <el-icon :size="16"><EditPen /></el-icon>
              </span>
            </div>
          </el-form-item>
          <div class="price-row">
            <el-form-item label="划线价（¥)">
              <div class="price-prefix">
                <span class="prefix-label">¥</span>
                <el-input v-model="form.subListYuan" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
            <el-form-item label="划线价（$）">
              <div class="price-prefix">
                <span class="prefix-label">$</span>
                <el-input v-model="form.subListDollar" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
          </div>
          <el-form-item label="允许试用" class="inline-form-item">
            <el-switch v-model="form.freeTrial" />
          </el-form-item>
          <div v-if="form.freeTrial" class="trial-config">
            <el-form-item label="试用类型">
              <el-radio-group v-model="form.trialType" size="small">
                <el-radio label="free">免费试用</el-radio>
                <el-radio label="paid">付费试用</el-radio>
              </el-radio-group>
            </el-form-item>
            <div v-if="form.trialType === 'paid'" class="price-row">
              <el-form-item label="试用售价（¥）">
                <div class="price-prefix">
                  <span class="prefix-label">¥</span>
                  <el-input v-model="form.trialPriceYuan" type="number" placeholder="0.00" />
                </div>
              </el-form-item>
              <el-form-item label="试用售价（$）">
                <div class="price-prefix">
                  <span class="prefix-label">$</span>
                  <el-input v-model="form.trialPriceDollar" type="number" placeholder="0.00" />
                </div>
              </el-form-item>
            </div>
            <div class="price-row">
              <el-form-item label="试用周期（天）" prop="trialDays">
                <el-input-number v-model="form.trialDays" :min="1" placeholder="如：7" style="width:100%" />
              </el-form-item>
              <el-form-item label="过滤条件" prop="trialFilter">
                <el-select v-model="form.trialFilter" placeholder="请选择过滤条件" style="width:100%">
                  <el-option label="从未试用过此套餐" value="never_this" />
                  <el-option label="从未试用过该服务类型" value="never_any" />
                  <el-option label="不限制" value="none" />
                </el-select>
              </el-form-item>
            </div>
          </div>
          <div class="price-row">
            <el-form-item label="订阅售价（¥）" prop="subPriceYuan">
              <div class="price-prefix">
                <span class="prefix-label">¥</span>
                <el-input v-model="form.subPriceYuan" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
            <el-form-item label="订阅售价（$）" prop="subPriceDollar">
              <div class="price-prefix">
                <span class="prefix-label">$</span>
                <el-input v-model="form.subPriceDollar" type="number" placeholder="0.00" />
              </div>
            </el-form-item>
          </div>
        </div>
      </div>

      <!-- ===== 套餐介绍 ===== -->
      <span class="section-label">套餐介绍 <span style="font-size:12px;font-weight:400;color:var(--text-placeholder);margin-left:6px">非必填</span></span>
      <div class="section-block">
        <el-form-item label="国内落地页URL">
          <el-input v-model="form.lpUrlCn" placeholder="请输入国内落地页URL，如：https://www.example.com/cn/package/xxx" />
        </el-form-item>
        <el-form-item label="海外落地页URL" style="margin-bottom:0">
          <el-input v-model="form.lpUrlEn" placeholder="请输入海外落地页URL，如：https://www.example.com/en/package/xxx" />
        </el-form-item>
      </div>

      <!-- ===== 内购Key配置 ===== -->
      <span class="section-label">
        内购Key配置
        <span style="font-size:12px;font-weight:400;color:var(--text-placeholder);margin-left:6px">选填，针对每个APP配置</span>
      </span>
      <div class="section-block">
        <div class="iap-app-row">
          <div class="iap-app-info">
            <div class="iap-app-name">牵心PRO</div>
            <div class="iap-app-id">APPID: QX_PRO_001</div>
          </div>
          <div class="iap-keys">
            <el-input v-model="form.iapQxproGoogle" placeholder="Google 内购 Key" />
            <el-input v-model="form.iapQxproApple" placeholder="Apple 内购 Key" />
          </div>
        </div>
        <div class="iap-app-row" style="margin-bottom:0">
          <div class="iap-app-info">
            <div class="iap-app-name">鹤梦之家</div>
            <div class="iap-app-id">APPID: HM_HOME_001</div>
          </div>
          <div class="iap-keys">
            <el-input v-model="form.iapHmhomeGoogle" placeholder="Google 内购 Key" />
            <el-input v-model="form.iapHmhomeApple" placeholder="Apple 内购 Key" />
          </div>
        </div>
      </div>

      <!-- ===== 标签配置 ===== -->
      <el-form-item label="套餐标签">
        <div class="ms-label-row" style="margin-bottom:4px">
          <span></span>
          <el-button size="small" text type="primary" @click="emit('open-tag-modal', 'pkg')">管理</el-button>
        </div>
        <el-select
          v-model="form.pkgTags"
          multiple
          filterable
          placeholder="请选择套餐标签"
          style="width:100%"
        >
          <el-option
            v-for="t in pkgTagOptions"
            :key="t"
            :label="t"
            :value="t"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="套餐描述标签">
        <div class="ms-label-row" style="margin-bottom:4px">
          <span></span>
          <el-button size="small" text type="primary" @click="emit('open-tag-modal', 'desc')">管理</el-button>
        </div>
        <el-select
          v-model="form.descTags"
          multiple
          filterable
          placeholder="请选择套餐描述标签"
          style="width:100%"
        >
          <el-option
            v-for="t in descTagOptions"
            :key="t"
            :label="t"
            :value="t"
          />
        </el-select>
      </el-form-item>

      <!-- ===== 上架配置 ===== -->
      <span class="section-label">上架配置</span>
      <div class="section-block">
        <el-form-item label="投放区域">
          <el-select
            v-model="form.shelfRegion"
            multiple
            filterable
            placeholder="请选择投放区域"
            style="width:100%"
          >
            <el-option label="国内" value="国内" />
            <el-option label="海外" value="海外" />
          </el-select>
        </el-form-item>
        <el-form-item label="投放APP">
          <el-select
            v-model="form.shelfApp"
            multiple
            filterable
            placeholder="请选择投放APP"
            style="width:100%"
          >
            <el-option label="牵心PRO" value="牵心PRO" />
            <el-option label="鹤梦之家" value="鹤梦之家" />
          </el-select>
        </el-form-item>
        <el-form-item label="投放运营位">
          <el-select
            v-model="form.shelfSlot"
            multiple
            filterable
            placeholder="请选择投放运营位"
            style="width:100%"
          >
            <el-option label="商城位" value="商城位" />
            <el-option label="推荐位" value="推荐位" />
          </el-select>
        </el-form-item>
        <el-form-item label="套餐分类" style="margin-bottom:0">
          <div class="ms-label-row" style="margin-bottom:4px">
            <span></span>
            <el-button size="small" text type="primary" @click="emit('open-category-modal')">管理</el-button>
          </div>
          <el-select
            v-model="form.category"
            placeholder="请选择套餐分类"
            style="width:100%"
          >
            <el-option
              v-for="c in categoryOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  mode: { type: String, default: 'add' },
  data: { type: Object, default: null },
  pkgTagOptions: { type: Array, default: () => ['免费试用', '限时优惠', '新用户特惠', '热门推荐', '销量第一', '专订'] },
  descTagOptions: { type: Array, default: () => ['7天循环事件录制', '7天消息回溯', '15天循环事件录制', 'AI智能检测'] },
  categoryOptions: { type: Array, default: () => ['云存储套餐', 'AI智能服务', '综合套餐'] }
})

const emit = defineEmits(['update:visible', 'save', 'open-tag-modal', 'open-category-modal'])

const visible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const isEdit = computed(() => props.mode === 'edit')

const formRef = ref(null)
const saving = ref(false)

const defaultForm = () => ({
  name: '',
  lpUrlCn: '',
  lpUrlEn: '',
  direction: 'device',
  duration: '30',
  services: [],
  bindCount: 1,
  productRestrict: 'none',
  restrictProducts: [],
  priceNonSub: false,
  priceSub: true,
  priceFree: false,
  nonSubListYuan: '',
  nonSubListDollar: '',
  nonSubPriceYuan: '',
  nonSubPriceDollar: '',
  subText: '',
  subListYuan: '',
  subListDollar: '',
  subPriceYuan: '',
  subPriceDollar: '',
  freeTrial: false,
  trialType: 'free',
  trialPriceYuan: '',
  trialPriceDollar: '',
  trialDays: 7,
  trialFilter: '',
  iapQxproGoogle: '',
  iapQxproApple: '',
  iapHmhomeGoogle: '',
  iapHmhomeApple: '',
  pkgTags: [],
  descTags: [],
  shelfRegion: [],
  shelfApp: [],
  shelfSlot: [],
  category: ''
})

const form = reactive(defaultForm())

const rules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  direction: [{ required: true, message: '请选择应用方向', trigger: 'change' }],
  duration: [{ required: true, message: '请选择生效时长', trigger: 'change' }]
}

// 标签和分类选项（优先使用父组件传入，否则使用默认值）
const pkgTagOptions = computed(() => props.pkgTagOptions)
const descTagOptions = computed(() => props.descTagOptions)
const categoryOptions = computed(() => props.categoryOptions)

const durationLabel = computed(() => {
  const map = { '7': '7天', '15': '15天', '30': '30天', '365': '1年', '90': '3个月', '180': '6个月' }
  return map[form.duration] || form.duration
})

// 服务元数据映射
const serviceMetaMap = {
  '7天事件云存':  { type: '云存储', costYuan: '¥0.80', costDollar: '$0.12', desc: '支持7天内事件录像云端存储与回放' },
  '15天事件云存': { type: '云存储', costYuan: '¥1.50', costDollar: '$0.22', desc: '支持15天内事件录像云端存储与回放' },
  '30天事件云存': { type: '云存储', costYuan: '¥2.50', costDollar: '$0.35', desc: '支持30天内事件录像云端存储与回放' },
  'AI智能识别':    { type: 'AI服务', costYuan: '¥3.00', costDollar: '$0.42', desc: '人形/车辆/宠物智能识别与告警推送' },
  '短信套餐':      { type: '通讯',  costYuan: '¥5.00', costDollar: '$0.70', desc: '每月100条短信通知，覆盖注册/告警/营销场景' },
  '免广告-年':     { type: '权益',  costYuan: '¥12.00', costDollar: '$1.68', desc: '全年免除APP内所有横幅及插屏广告' },
  '专属客服':      { type: '服务',  costYuan: '¥8.00', costDollar: '$1.12', desc: '7x24小时VIP专属客服通道，30秒内响应' },
  '高级功能':      { type: '功能',  costYuan: '¥6.00', costDollar: '$0.84', desc: '解锁全部高级功能：自定义场景、联动自动化等' }
}

const serviceDetails = computed(() =>
  form.services.map(s => ({ name: s, ...serviceMetaMap[s] })).filter(Boolean)
)

// 方向切换时重置时长
watch(() => form.direction, (val) => {
  form.duration = val === 'device' ? '30' : '90'
  form.services = []
})

// 定价联动
const onPriceTypeChange = (type) => {
  if (type === 'free') {
    if (form.priceFree) {
      form.priceNonSub = false
      form.priceSub = false
    }
  } else {
    if ((type === 'nonSub' && form.priceNonSub) || (type === 'sub' && form.priceSub)) {
      form.priceFree = false
    }
  }
}

// 产品限制切换
const onProductRestrictChange = () => {
  if (form.productRestrict === 'none') {
    form.restrictProducts = []
  }
}

// 编辑时回填数据
watch(() => props.visible, (val) => {
  if (val) {
    if (isEdit.value && props.data) {
      Object.assign(form, defaultForm(), props.data._formData || {})
      if (props.data._formData) {
        Object.assign(form, props.data._formData)
      }
    }
  }
})

const handleClosed = () => {
  Object.assign(form, defaultForm())
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  // 至少选一种定价方式
  if (!form.priceNonSub && !form.priceSub && !form.priceFree) {
    return ElMessage.warning('请至少选择一种定价方式')
  }

  saving.value = true
  setTimeout(() => {
    const output = {
      name: form.name,
      direction: form.direction,
      duration: form.duration,
      services: [...form.services],
      bindCount: form.bindCount,
      productRestrict: form.productRestrict,
      restrictProducts: [...form.restrictProducts],
      priceNonSub: form.priceNonSub,
      priceSub: form.priceSub,
      priceFree: form.priceFree,
      pkgTags: [...form.pkgTags],
      descTags: [...form.descTags],
      shelfRegion: [...form.shelfRegion],
      shelfApp: [...form.shelfApp],
      shelfSlot: [...form.shelfSlot],
      category: form.category,
      subType: form.priceFree ? 'free' : (form.priceSub ? 'sub' : 'nonSub'),
      price: form.priceFree ? '免费' : '待定',
      cost: '待定',
      apps: form.shelfApp.map(a => ({ name: a, count: 1 })),
      slots: [...form.shelfSlot],
      tags: [...form.pkgTags],
      region: form.shelfRegion.includes('国内') && form.shelfRegion.includes('海外') ? 'global'
        : form.shelfRegion.includes('国内') ? 'cn'
        : form.shelfRegion.includes('海外') ? 'overseas'
        : 'global',
      _formData: { ...form }  // 保存完整表单数据供编辑回填
    }
    emit('save', output)
    saving.value = false
  }, 300)
}
</script>

<style lang="scss" scoped>
.el-form {
  padding-bottom: 16px;
}

.trial-config {
  margin-top: 4px;
}

.inline-form-item.el-form-item {
  display: flex;
  align-items: center;
  :deep(.el-form-item__label) {
    flex-shrink: 0;
    margin-bottom: 0;
    padding-right: 12px;
  }
  :deep(.el-form-item__content) {
    flex: 1;
    margin-left: 0;
  }
}
</style>
