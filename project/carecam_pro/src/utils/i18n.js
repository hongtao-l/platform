const messages = {
  'zh-CN': {
    crossRegionTip: '当前访问区域与注册区域不一致，可能影响使用'
  },
  en: {
    crossRegionTip: 'Your current region differs from your registered region'
  }
}

const LANG_KEY = 'carecam_language'

export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'zh-CN'
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang)
}

export function t(key) {
  const lang = getLang()
  return messages[lang]?.[key] || messages['zh-CN']?.[key] || key
}
