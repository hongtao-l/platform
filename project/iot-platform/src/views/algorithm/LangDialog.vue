<template>
  <el-dialog v-model="visible" :title="title" width="640px" :close-on-click-modal="false" top="5vh">
    <div class="lang-preview">
      <div class="lang-preview-label">默认展示文案（中文）：</div>
      <div class="lang-preview-value">{{ localData['1'] || '暂未填写' }}</div>
    </div>
    <div class="lang-grid">
      <div v-for="lang in otherLangs" :key="lang.value" class="lang-item">
        <div class="lang-item-label">{{ lang.label }}<sup class="lang-code">{{ lang.code }}</sup></div>
        <el-input v-model="localData[lang.value]" :placeholder="`请输入${lang.label}翻译`" size="small" />
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const visible = defineModel('visible', { default: false })
const data = defineModel('data', { default: () => ({}) })
const props = defineProps({ title: { type: String, default: '配置多语言翻译' } })

const localData = ref({})

const languages = [
  { label: '中文简体', value: '1', code: 'zh' },
  { label: 'English', value: '2', code: 'en' },
  { label: '中文繁体', value: '3', code: 'zh-Hant' },
  { label: 'Français', value: '4', code: 'fr' },
  { label: '日本語', value: '5', code: 'ja' },
  { label: 'Español', value: '6', code: 'es' },
  { label: '한국어', value: '7', code: 'ko' },
  { label: 'Deutsch', value: '8', code: 'de' },
  { label: 'Italiano', value: '9', code: 'it' },
  { label: 'Русский', value: '10', code: 'ru' },
  { label: 'Português', value: '11', code: 'pt' },
  { label: 'Tiếng Việt', value: '12', code: 'vi' },
  { label: 'ภาษาไทย', value: '13', code: 'th' },
  { label: 'Türkçe', value: '14', code: 'tr' },
  { label: 'فارسی', value: '15', code: 'fa' },
  { label: 'Bahasa Indonesia', value: '16', code: 'id' }
]

const otherLangs = computed(() => languages.filter(l => l.value !== '1'))

watch(visible, (val) => {
  if (val) localData.value = { ...(data.value || {}) }
})

function handleSave() {
  data.value = { ...localData.value }
  visible.value = false
}
</script>

<style lang="scss" scoped>
.lang-preview {
  background: var(--primary-bg); border: 1px solid var(--primary-light);
  border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 20px;
  .lang-preview-label { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
  .lang-preview-value { font-size: 14px; color: var(--text-regular); min-height: 20px; word-break: break-all; }
}
.lang-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
.lang-item-label { font-size: 13px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px; }
.lang-code { font-size: 11px; color: var(--text-secondary); font-weight: normal; margin-left: 2px; vertical-align: super; }
</style>
