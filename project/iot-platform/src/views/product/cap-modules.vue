<template>
  <div class="cap-modules">
    <div v-for="mod in modules" :key="mod.name" class="cap-module">
      <div class="cap-module-title" @click="toggleCollapse(mod.name)">
        <el-icon class="cap-module-arrow" :class="{ 'is-collapsed': isCollapsed(mod.name) }">
          <ArrowRight />
        </el-icon>
        <span>{{ mod.name }}</span>
      </div>
      <div v-show="!isCollapsed(mod.name)" class="cap-module-body">
        <div class="cap-grid cap-grid-head">
          <span class="cap-col-name">能力名称</span>
          <span class="cap-col-support">支持状态<span class="cap-col-note">（影响APP控制面板显示）</span></span>
          <span class="cap-col-default">默认值<span class="cap-col-note">（“<span class="cap-col-em">读写</span>”属性值将同步下发至设备）</span></span>
        </div>
        <template v-for="item in mod.items" :key="item.id">
          <div class="cap-grid">
            <span class="cap-col-name cap-item-name">{{ item.name }}</span>
            <span class="cap-col-support">
              <el-radio-group v-model="item.supported" size="small">
                <el-radio value="1">支持</el-radio>
                <el-radio value="0">不支持</el-radio>
              </el-radio-group>
            </span>
            <span class="cap-col-default"></span>
          </div>
          <template v-if="item.supported === '1'">
            <div v-if="item.defaultValue" class="cap-grid cap-grid-sub">
              <span class="cap-col-name cap-sub-label">└ 默认值</span>
              <span class="cap-col-support"></span>
              <span class="cap-col-default">
                <CapControl :cap="item.defaultValue" />
                <span class="cap-access" :class="item.access === 'ro' ? 'ro' : 'rw'">{{ item.access === 'ro' ? '只读' : '读写' }}</span>
              </span>
            </div>
            <div v-for="child in item.children || []" :key="child.id" class="cap-grid cap-grid-sub">
              <span class="cap-col-name cap-sub-label">└ {{ child.name }}</span>
              <span class="cap-col-support"></span>
              <span class="cap-col-default">
                <CapControl v-if="child.defaultValue" :cap="child.defaultValue" />
                <span v-else class="cap-none">—</span>
                <span v-if="child.defaultValue" class="cap-access" :class="child.access === 'ro' ? 'ro' : 'rw'">{{ child.access === 'ro' ? '只读' : '读写' }}</span>
              </span>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import CapControl from './cap-control.vue'

defineProps({
  modules: { type: Array, required: true }
})

const collapsed = ref([])
function isCollapsed(name) {
  return collapsed.value.includes(name)
}
function toggleCollapse(name) {
  const i = collapsed.value.indexOf(name)
  if (i > -1) collapsed.value.splice(i, 1)
  else collapsed.value.push(name)
}
</script>

<style scoped>
.cap-modules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cap-module {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.cap-module-title {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  padding-left: 20px;
  border-left: 3px solid var(--el-color-primary);
  cursor: pointer;
  user-select: none;
}

.cap-module-arrow {
  margin-right: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  transition: transform .2s;
}
.cap-module-arrow:not(.is-collapsed) {
  transform: rotate(90deg);
}

.cap-module-body {
  padding: 0 16px;
}

.cap-grid {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}
.cap-grid:last-child {
  border-bottom: none;
}

.cap-grid-head {
  color: var(--text-secondary);
  font-size: 13px;
  border-bottom: 1px solid #ebeef5;
}

.cap-col-note {
  margin-left: 6px;
}
.cap-col-em {
  font-weight: 600;
  color: #e6a23c;
}

.cap-col-name {
  flex: 0 0 200px;
  font-size: 13px;
  color: var(--text-primary);
}
.cap-item-name {
  font-weight: 500;
}
.cap-col-support {
  flex: 0 0 280px;
}
.cap-col-default {
  flex: 1;
  display: flex;
  align-items: center;
}

.cap-grid-sub {
  background: #f7f9fc;
}
.cap-sub-label {
  padding-left: 20px;
  color: var(--text-secondary);
  font-weight: 400;
}

.cap-none {
  color: var(--text-placeholder);
}

.cap-access {
  margin-left: 8px;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 3px;
  line-height: 18px;
  white-space: nowrap;
}
.cap-access.ro {
  color: #e6a23c;
  background: #fdf6ec;
}
.cap-access.rw {
  color: #409eff;
  background: #ecf5ff;
}
</style>
