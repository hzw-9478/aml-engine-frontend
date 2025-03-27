<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart?.dispose();
});

const initChart = () => {
  if (!chartRef.value) return;
  
  chart = echarts.init(chartRef.value);
  chart.setOption({
    title: { text: '风险指标统计', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['SQL注入', 'XSS攻击', 'CSRF漏洞', '越权访问', '数据泄露']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [820, 932, 901, 934, 1290],
      type: 'bar',
      itemStyle: { color: '#5470c6' }
    }]
  });
};

const handleResize = () => {
  chart?.resize();
};
</script>

<template>
  <div class="dashboard-container">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: var(--card-padding);
  background: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin: var(--base-padding);
}

.chart-container {
  width: 100%;
  height: 70vh;
  min-height: 400px;
  position: relative;
}

/* 加载状态动画 */
.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .chart-container {
    height: 60vh;
  }
}
</style>