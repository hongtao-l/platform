/**
 * 公共组件统一注册
 */

import Empty from './Empty/index.vue'
import Loading from './Loading/index.vue'
import Error from './Error/index.vue'

// 组件列表
const components = [
  Empty,
  Loading,
  Error
]

// 注册函数
const install = (app) => {
  components.forEach((component) => {
    app.component(component.name, component)
  })
}

export default {
  install
}

// 单独导出组件
export { Empty, Loading, Error }
