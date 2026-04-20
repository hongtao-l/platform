<template>
  <div class="empty-container">
    <div class="empty-icon">
      <el-icon :size="64" color="#C0C4CC">
        <component :is="icon" />
      </el-icon>
    </div>
    <p class="empty-text">{{ text }}</p>
    <el-button v-if="showButton" type="primary" @click="$emit('action')">
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script setup>
import { FolderOpened } from '@element-plus/icons-vue'

defineProps({
  // 图标
  icon: {
    type: [String, Object],
    default: FolderOpened
  },
  // 提示文字
  text: {
    type: String,
    default: '暂无数据'
  },
  // 是否显示按钮
  showButton: {
    type: Boolean,
    default: false
  },
  // 按钮文字
  buttonText: {
    type: String,
    default: '立即添加'
  }
})

defineEmits(['action'])
</script>

<style lang="scss" scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;

  .empty-icon {
    margin-bottom: 16px;
  }

  .empty-text {
    color: var(--text-secondary);
    font-size: var(--font-md);
    margin-bottom: 20px;
  }
}
</style>
