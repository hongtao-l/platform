<template>
  <div class="page-container">
      <!-- 顶部状态栏 -->
      <div class="status-bar">
        <div class="status-bar-left">
          <el-button size="small" @click="$router.push('/abtest')" :icon="ArrowLeft">返回</el-button>
          <el-tag :type="statusType(experiment.status)" size="default">{{ statusLabel(experiment.status) }}</el-tag>
          <span class="status-meta">{{ experiment.name }} | 目标分群：{{ experiment.segment }} | 流量：A {{ experiment.trafficA }}% / B {{ 100 - experiment.trafficA }}% | 已运行 {{ experiment.runDays }} 天</span>
        </div>
        <el-button v-if="experiment.status === 'running'" type="warning" plain size="default" @click="stopExperiment">停止实验</el-button>
      </div>

      <!-- 指标卡片 -->
      <div class="metric-grid">
        <div v-for="m in metrics" :key="m.label" class="metric-card">
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-row">
            <div class="metric-side">
              <div class="metric-val val-a">{{ m.valA }}</div>
              <div class="metric-sub">变体A</div>
            </div>
            <div class="metric-vs">vs</div>
            <div class="metric-side">
              <div class="metric-val val-b">{{ m.valB }}</div>
              <div class="metric-sub">变体B</div>
            </div>
          </div>
          <div :class="['metric-diff', m.diffUp ? 'up' : 'down']">
            B {{ m.diffUp ? '+' : '' }}{{ m.diff }}
          </div>
        </div>
      </div>

      <!-- 转化漏斗对比 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">转化漏斗对比</span>
        </div>
        <div class="card-body">
          <div class="funnel-row">
            <div :class="['funnel-col', { winner: experiment.winner === 'A' }]">
              <div class="funnel-col-title">
                <span class="dot dot-a" />
                变体A
                <el-tag v-if="experiment.winner === 'A'" type="success" size="small">胜出</el-tag>
              </div>
              <div v-for="(step, i) in funnelA" :key="i" class="funnel-step">
                <span class="funnel-step-name">{{ step.name }}</span>
                <span class="funnel-step-val">{{ step.val }}</span>
              </div>
              <div class="funnel-rate">转化率: <strong>{{ calcRate(funnelA) }}</strong></div>
            </div>
            <div :class="['funnel-col', { winner: experiment.winner === 'B' }]">
              <div class="funnel-col-title">
                <span class="dot dot-b" />
                变体B
                <el-tag v-if="experiment.winner === 'B'" type="success" size="small">胜出</el-tag>
              </div>
              <div v-for="(step, i) in funnelB" :key="i" class="funnel-step">
                <span class="funnel-step-name">{{ step.name }}</span>
                <span class="funnel-step-val">{{ step.val }}</span>
              </div>
              <div class="funnel-rate">转化率: <strong>{{ calcRate(funnelB) }}</strong></div>
            </div>
          </div>

          <!-- 柱状图 -->
          <div class="bar-chart">
            <div v-for="(f, fi) in funnelA" :key="'a'+fi" class="bar-col">
              <div class="bar-group">
                <div class="bar bar-a" :style="{ height: (f.val / maxFunnel * 100) + '%' }" />
                <div class="bar bar-b" :style="{ height: (funnelB[fi].val / maxFunnel * 100) + '%' }" />
              </div>
              <div class="bar-label">{{ f.nameShort }}</div>
            </div>
          </div>
          <div class="bar-legend">
            <span><span class="legend-dot legend-dot-a" />变体A</span>
            <span><span class="legend-dot legend-dot-b" />变体B</span>
          </div>
        </div>
      </div>

      <!-- 胜出横幅 -->
      <div v-if="experiment.winner" class="card">
        <div class="card-header">
          <span class="card-title">实验结果</span>
          <span class="card-header-info">数据更新时间：{{ lastUpdated }}</span>
        </div>
        <div class="card-body">
          <div class="winner-banner">
            <el-tag type="success" size="large" effect="dark">★ 变体{{ experiment.winner }} 胜出</el-tag>
            <span class="winner-text">
              转化率 <strong>{{ experiment.winner === 'B' ? '6.6%' : '4.2%' }}</strong>
              vs {{ experiment.winner === 'B' ? 'A 4.2%' : 'B 6.6%' }}，提升
              <strong class="text-success">+57.1%</strong>
            </span>
            <el-button type="success" class="winner-btn" @click="applyWinner">应用胜出变体</el-button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const experiment = ref({
  id: 1,
  name: '全能AI落地页 v1 vs v2',
  key: 'ai_landing_test_01',
  segment: '新注册用户',
  trafficA: 50,
  status: 'running',
  runDays: 12,
  lastUpdated: '2026-05-15 10:30',
  winner: 'B'
})
const lastUpdated = ref('2026-05-15 10:30')

const metrics = ref([
  { label: '页面曝光 (UV)', valA: '1,240', valB: '1,180', diff: '4.8%', diffUp: false },
  { label: '套餐选择率', valA: '30.6%', valB: '35.6%', diff: '16.3%', diffUp: true },
  { label: '支付转化率', valA: '4.2%', valB: '6.6%', diff: '57.1%', diffUp: true },
  { label: '总收入 (¥)', valA: '¥514', valB: '¥842', diff: '63.8%', diffUp: true }
])

const funnelA = ref([
  { name: '页面曝光', nameShort: '曝光', val: 1240 },
  { name: '选择套餐', nameShort: '选择', val: 380 },
  { name: '点击支付', nameShort: '支付点击', val: 62 },
  { name: '支付成功', nameShort: '支付成功', val: 52 }
])

const funnelB = ref([
  { name: '页面曝光', nameShort: '曝光', val: 1180 },
  { name: '选择套餐', nameShort: '选择', val: 420 },
  { name: '点击支付', nameShort: '支付点击', val: 90 },
  { name: '支付成功', nameShort: '支付成功', val: 78 }
])

const maxFunnel = computed(() => Math.max(funnelA.value[0].val, funnelB.value[0].val))

const calcRate = (funnel) => {
  if (!funnel.length) return '0%'
  return (funnel[funnel.length - 1].val / funnel[0].val * 100).toFixed(1) + '%'
}

const statusType = (s) => {
  const map = { running: 'success', paused: 'warning', ended: 'info' }
  return map[s] || 'info'
}
const statusLabel = (s) => {
  const map = { running: '运行中', paused: '已暂停', ended: '已结束' }
  return map[s] || s
}

const stopExperiment = () => {
  ElMessageBox.confirm('确定停止该实验？停止后所有用户将看到默认版本。', '停止实验', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    experiment.value.status = 'ended'
    ElMessage.success('实验已停止')
  }).catch(() => {})
}

const applyWinner = () => {
  ElMessageBox.confirm(`确定将变体${experiment.value.winner}应用为默认配置？所有用户将立即看到该版本。`, '应用胜出变体', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success(`变体${experiment.value.winner}已应用为默认配置`)
  }).catch(() => {})
}

</script>

<style lang="scss" scoped>
// ===== Status Bar =====
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  padding: 12px 16px;
  background: var(--bg-color);
  border: 1px solid var(--border-lighter);
  border-radius: var(--radius-md);
}

.status-bar-left { display: flex; align-items: center; gap: 12px; }

.status-meta { font-size: var(--font-xs); color: var(--text-secondary); }

// ===== Metric Cards =====
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: var(--spacing-lg);
}

.metric-card {
  background: var(--bg-color);
  border: 1px solid var(--border-lighter);
  border-radius: var(--radius-md);
  padding: 16px;
}

.metric-label {
  font-size: var(--font-xs);
  color: var(--text-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

.metric-row { display: flex; justify-content: space-between; align-items: flex-end; }
.metric-side { text-align: center; flex: 1; }

.metric-val { font-size: 24px; font-weight: 700; }
.val-a { color: var(--text-secondary); }
.val-b { color: var(--primary-color); }

.metric-sub { font-size: 11px; color: var(--text-placeholder); margin-top: 2px; }

.metric-vs {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-placeholder);
  flex-shrink: 0;
  padding: 0 8px;
}

.metric-diff {
  text-align: center;
  margin-top: 8px;
  font-size: var(--font-xs);
  font-weight: 600;

  &.up { color: var(--success-color); }
  &.down { color: var(--danger-color); }
}

// ===== Card =====
.card {
  background: var(--bg-color);
  border: 1px solid var(--border-lighter);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-lighter);
}

.card-title { font-size: var(--font-lg); font-weight: 600; color: var(--text-primary); }
.card-header-info { font-size: var(--font-xs); color: var(--text-secondary); }
.card-body { padding: 20px; }

// ===== Funnel =====
.funnel-row { display: flex; gap: 16px; margin-bottom: 20px; }

.funnel-col {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  background: var(--bg-elevated);

  &.winner {
    background: var(--primary-bg);
    border: 2px solid var(--primary-color);
  }
}

.funnel-col-title {
  font-size: var(--font-md);
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-a { background: var(--text-secondary); }
.dot-b { background: var(--primary-color); }

.funnel-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-lighter);

  &:last-child { border-bottom: none; }
}

.funnel-step-name { font-size: var(--font-sm); color: var(--text-regular); }
.funnel-step-val { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.funnel-col.winner .funnel-step-val { color: var(--primary-color); }

.funnel-rate {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: 8px;

  strong { color: var(--text-primary); }
}
.funnel-col.winner .funnel-rate { color: var(--primary-color); }

// ===== Bar Chart =====
.bar-chart {
  display: flex;
  justify-content: center;
  gap: 40px;
  align-items: flex-end;
  height: 120px;
  padding: 0 20px;
}

.bar-col {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bar-group { display: flex; gap: 4px; align-items: flex-end; height: 100px; }

.bar { width: 32px; border-radius: 4px 4px 0 0; transition: height 0.3s; }

.bar-a { background: linear-gradient(180deg, #bfbfbf, #8c8c8c); }
.bar-b { background: linear-gradient(180deg, #69b1ff, #1677ff); }

.bar-label { font-size: 11px; color: var(--text-secondary); margin-top: 6px; }

.bar-legend { display: flex; justify-content: center; gap: 20px; margin-top: 8px; }
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; }
.legend-dot-a { background: var(--text-secondary); }
.legend-dot-b { background: var(--primary-color); }

// ===== Winner Banner =====
.winner-banner {
  background: var(--success-bg);
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.winner-text {
  font-size: var(--font-md);
  color: var(--text-regular);

  strong { color: var(--success-color); }
}

.winner-btn { margin-left: auto; }

// ===== Utilities =====
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
</style>
