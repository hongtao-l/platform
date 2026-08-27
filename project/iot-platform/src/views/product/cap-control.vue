<template>
  <el-radio-group v-if="cap.type === 'switch'" v-model="cap.value">
    <el-radio :value="true">开启</el-radio>
    <el-radio :value="false">关闭</el-radio>
  </el-radio-group>
  <el-checkbox-group v-else-if="cap.type === 'checkbox'" v-model="cap.value">
    <el-checkbox v-for="o in cap.options" :key="o" :label="o">{{ o }}</el-checkbox>
  </el-checkbox-group>
  <el-radio-group v-else-if="cap.type === 'radio'" v-model="cap.value">
    <el-radio v-for="o in cap.options" :key="o" :value="o">{{ o }}</el-radio>
  </el-radio-group>
  <el-select v-else-if="cap.type === 'select'" v-model="cap.value" size="small" style="width:180px">
    <el-option v-for="o in cap.options" :key="o" :label="o" :value="o" />
  </el-select>
  <div v-else-if="cap.type === 'number'" class="cap-number">
    <el-input-number v-model="cap.value" :min="cap.min" :max="cap.max" size="small" style="width:180px" />
    <span v-if="cap.unit" class="cap-unit">{{ cap.unit }}</span>
  </div>
  <el-time-picker v-else-if="cap.type === 'time'" v-model="cap.value" format="HH:mm:ss" value-format="HH:mm:ss" size="small" style="width:180px" />
</template>

<script setup>
defineProps({
  cap: { type: Object, required: true }
})
</script>

<style scoped>
.cap-number {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cap-unit {
  color: var(--text-placeholder);
  font-size: 12px;
}
</style>
