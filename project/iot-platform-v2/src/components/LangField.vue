<template>
  <div class="lang-field">
    <el-input
      :model-value="modelValue?.['1'] || ''"
      :placeholder="placeholder"
      @update:model-value="v => update('1', v)"
    />
    <button
      type="button"
      class="i18n-icon"
      :class="{ 'has-more': hasOtherLang }"
      title="配置多语言翻译"
      @click="openDialog"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
      </svg>
    </button>

    <el-dialog
      v-model="dialogVisible"
      title="配置多语言翻译"
      width="680px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="zh-preview">
        <div class="zh-label">默认展示文案（中文）：</div>
        <div class="zh-value">{{ modelValue?.['1'] || '—' }}</div>
      </div>

      <div class="lang-grid">
        <div v-for="l in languages" :key="l.key" class="lang-item">
          <div class="lang-head">
            <span class="lang-name">{{ l.label }}</span>
            <span class="lang-code">{{ l.key }}</span>
          </div>
          <el-input
            :model-value="draft[l.key] || ''"
            type="textarea"
            :rows="2"
            :placeholder="`请输入${l.label}翻译内容`"
            @update:model-value="v => draft[l.key] = v"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  placeholder: { type: String, default: '请输入中文文案' }
})
const emit = defineEmits(['update:modelValue'])

const languages = [
  { key: 'en', label: 'English' },
  { key: 'zh-Hant', label: '繁體中文' },
  { key: 'fr', label: 'Français' },
  { key: 'ja', label: '日本語' },
  { key: 'es', label: 'Español' },
  { key: 'ko', label: '한국어' },
  { key: 'de', label: 'Deutsch' },
  { key: 'it', label: 'Italiano' },
  { key: 'ru', label: 'Русский' },
  { key: 'pt', label: 'Português' },
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'th', label: 'ไทย' },
  { key: 'tr', label: 'Türkçe' },
  { key: 'fa', label: 'فارسی' },
  { key: 'id', label: 'Indonesia' }
]

const dialogVisible = ref(false)
const draft = reactive({})

const hasOtherLang = computed(() =>
  Object.keys(props.modelValue || {}).some(k => k !== '1' && props.modelValue[k])
)

function openDialog() {
  Object.keys(draft).forEach(k => delete draft[k])
  languages.forEach(l => { draft[l.key] = props.modelValue?.[l.key] || '' })
  dialogVisible.value = true
}

function confirm() {
  const next = { ...(props.modelValue || {}) }
  languages.forEach(l => {
    const v = (draft[l.key] || '').trim()
    if (v) next[l.key] = v
    else delete next[l.key]
  })
  emit('update:modelValue', next)
  dialogVisible.value = false
}

function update(key, val) {
  const next = { ...(props.modelValue || {}) }
  if (val) next[key] = val
  else delete next[key]
  emit('update:modelValue', next)
}
</script>

<style scoped>
.lang-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.i18n-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #94a3b8;
  cursor: pointer;
  transition: all .15s;
}
.i18n-icon:hover,
.i18n-icon.has-more {
  color: #0284c7;
  border-color: #bae6fd;
  background: #f0f9ff;
}
.i18n-icon svg {
  width: 15px;
  height: 15px;
}
.zh-preview {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 18px;
}
.zh-label {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
.zh-value {
  font-size: 13px;
  color: #334155;
  margin-top: 6px;
  line-height: 1.6;
  word-break: break-all;
}
.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 4px;
}
.lang-head {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}
.lang-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
.lang-code {
  font-size: 11px;
  color: #94a3b8;
}
</style>
