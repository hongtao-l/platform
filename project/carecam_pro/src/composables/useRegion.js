import { ref, readonly, onMounted } from 'vue'
import { fetchRegionInfo } from '@/mock/region'

const isCrossRegion = ref(false)

export function useRegion() {
  onMounted(async () => {
    try {
      const res = await fetchRegionInfo()
      if (res.code === 0) {
        isCrossRegion.value = res.data.isCrossRegion || false
      }
    } catch {
      isCrossRegion.value = false
    }
  })

  return { isCrossRegion: readonly(isCrossRegion) }
}
