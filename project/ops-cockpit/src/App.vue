<script setup>
import { useDashboard } from './composables/useDashboard.js'
import { money, money2, int, pct } from './utils/format.js'
import TopBar from './components/TopBar.vue'
import FilterBar from './components/FilterBar.vue'
import KpiCard from './components/KpiCard.vue'
import FunnelPanel from './components/FunnelPanel.vue'
import SlotRevenuePanel from './components/SlotRevenuePanel.vue'
import SlotConversionPanel from './components/SlotConversionPanel.vue'
import RegionDonutPanel from './components/RegionDonutPanel.vue'
import RegionTablePanel from './components/RegionTablePanel.vue'
import ServiceRankPanel from './components/ServiceRankPanel.vue'
import ServiceTrendPanel from './components/ServiceTrendPanel.vue'

const {
  REGIONS,
  TIME_RANGES,
  APPS,
  FUNNEL_TABS,
  filters,
  compareMode,
  compareLabel,
  data,
  loading,
  updatedAt,
  kpi,
  kpiCompare,
  setRegion,
  setTime,
  setApp,
  setFunnelTab,
  setCompareMode,
  refresh
} = useDashboard()
</script>

<template>
  <TopBar :updated-at="updatedAt" :loading="loading" @refresh="refresh" />
  <FilterBar
    :regions="REGIONS"
    :time-ranges="TIME_RANGES"
    :apps="APPS"
    :filters="filters"
    :compare-mode="compareMode"
    @region="setRegion"
    @time="setTime"
    @app="setApp"
    @compare="setCompareMode"
  />

  <main
    class="flex-1 min-h-0 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 overflow-hidden"
  >
    <div class="scan-line"></div>

    <template v-if="data">
      <!-- 左列 8 -->
      <div class="lg:col-span-8 flex flex-col gap-4 min-h-0">
        <!-- KPI -->
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
          <KpiCard
            label="总收入"
            :value="money(kpi.revenue)"
            :delta="kpiCompare.revenue"
            :compare-label="compareLabel"
            highlight
          />
          <KpiCard
            label="ARP值"
            :value="money2(kpi.arp)"
            :delta="kpiCompare.arp"
            :compare-label="compareLabel"
            note="单用户平均收入"
          />
          <KpiCard
            label="总用户数"
            :value="int(kpi.users)"
            :delta="kpiCompare.users"
            :compare-label="compareLabel"
          />
          <KpiCard
            label="总转化率"
            :value="pct(kpi.conversion)"
            :delta="kpiCompare.conversion"
            :compare-label="compareLabel"
          />
        </div>

        <!-- 漏斗 -->
        <FunnelPanel
          class="shrink-0"
          :funnel="data.funnel"
          :step-rates="data.stepRates"
          :overall-rate="data.overallRate"
          :tabs="FUNNEL_TABS"
          :active-tab="filters.funnelTab"
          @tab="setFunnelTab"
        />

        <!-- 运营位双面板（撑满剩余高度，与右列平衡） -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          <SlotRevenuePanel :items="data.slotRevenue" />
          <SlotConversionPanel :items="data.slotConversion" />
        </div>
      </div>

      <!-- 右列 4 -->
      <div class="lg:col-span-4 flex flex-col gap-4 min-h-0">
        <RegionDonutPanel class="shrink-0" :items="data.regionShare" :total="kpi.revenue" />
        <RegionTablePanel class="shrink-0" :rows="data.regionTable" />
        <ServiceRankPanel class="shrink-0" :items="data.serviceRanking" />
        <ServiceTrendPanel class="flex-1 min-h-0" :trend="data.serviceTrend" />
      </div>
    </template>

    <!-- 加载骨架 -->
    <template v-else>
      <div class="lg:col-span-8 flex flex-col gap-6">
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="skeleton h-32"></div>
        </div>
        <div class="skeleton h-72"></div>
        <div class="grid grid-cols-2 gap-6">
          <div class="skeleton h-72"></div>
          <div class="skeleton h-72"></div>
        </div>
      </div>
      <div class="lg:col-span-4 flex flex-col gap-6">
        <div class="skeleton h-72"></div>
        <div class="skeleton h-52"></div>
        <div class="skeleton h-52"></div>
        <div class="skeleton h-52"></div>
      </div>
    </template>
  </main>
</template>
