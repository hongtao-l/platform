import { reactive } from 'vue'

const state = reactive({
  services: [],
  loaded: false
})

export function useServicesStore() {
  return { state }
}
