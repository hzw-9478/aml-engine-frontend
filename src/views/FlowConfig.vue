<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import BpmnModeler from 'bpmn-js/lib/Modeler';

const containerRef = ref<HTMLElement>();
const bpmnModeler = ref<BpmnModeler | null>(null);

onMounted(() => {
  if (!containerRef.value) return;

  bpmnModeler.value = new BpmnModeler({
    container: containerRef.value,
    additionalModules: []
  });

  // 初始化空流程图
  bpmnModeler.value.createDiagram();
});

onUnmounted(() => {
  bpmnModeler.value?.destroy();
});
</script>

<template>
  <div class="flow-config-container">
    <div ref="containerRef" class="bpmn-container"></div>
  </div>
</template>

<style scoped>
.flow-config-container {
  height: calc(100vh - 60px);
  background: #fff;
}

.bpmn-container {
  width: 100%;
  height: 100%;
}
</style>