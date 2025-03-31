<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { ElIcon } from 'element-plus'
import { Document, Folder, Warning, Timer } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ElSelect, ElOption, ElInput } from 'element-plus'
import draggable from 'vuedraggable'

interface NodeData {
  conjunction?: 'AND' | 'OR'
  conditions?: Array<any>
  field?: string
  operator?: string
  value?: any
  threshold?: number
  window?: number
}

// 先定义 props
const props = defineProps<{
  id: string
  type: string
  data: NodeData
  position: { x: number, y: number }
  selected?: boolean
  availableFields: Array<{ label: string, value: string }>
  availableOperators: Array<{ label: string, value: string }>
}>()

// 然后定义 conditionItems
interface ConditionItem {
  field: string
  operator: string
  value: any
}

const conditionItems = ref<ConditionItem[]>([
  {
    field: props.data.field || '',
    operator: props.data.operator || '',
    value: props.data.value || ''
  }
])

const showControls = ref(false)
const drag = ref(false)
const toggleControls = () => {
  showControls.value = !showControls.value
}

const handleDragStart = (event: DragEvent) => {
  event.dataTransfer?.setData('application/json', JSON.stringify(props.data))
}
</script>

<template>
  <div class="custom-node" :class="[type, { selected }]" @click="toggleControls" draggable="true" @dragstart="handleDragStart">
    <Handle type="target" :position="Position.Top" />
    <div class="node-header">
      <el-icon :size="18" :class="type">
        <component :is="type === 'condition' ? Document : 
          type === 'group' ? Folder :
          type === 'threshold' ? Warning : Timer" />
      </el-icon>
      <span>{{ type === 'condition' ? '条件节点' : 
        type === 'group' ? '规则组' :
        type === 'threshold' ? '风险阈值' : '时间窗口' }}</span>
    </div>
    <div class="node-content" @click="toggleControls">
      <slot name="content">
        <div v-if="type === 'condition'">
          <div v-show="showControls">
            <draggable v-model="conditionItems" group="conditions" @start="drag=true" @end="drag=false">
              <div v-for="(item, index) in conditionItems" :key="index">
                <el-select v-model="item.field" placeholder="选择字段" @change="$emit('update:data', {...data, ...item})">
                  <el-option
                    v-for="item in props.availableFields"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-select v-model="item.operator" placeholder="选择操作符" @change="$emit('update:data', {...data, ...item})">
                  <el-option
                    v-for="op in props.availableOperators"
                    :key="op.value"
                    :label="op.label"
                    :value="op.value"
                  />
                </el-select>
                <el-input v-model="item.value" placeholder="输入值" @input="$emit('update:data', {...data, ...item})" />
              </div>
            </draggable>
          </div>
          <div v-show="!showControls">
            {{ data.field }} {{ data.operator }} {{ data.value }}
          </div>
        </div>
        <div v-else>
          <div>逻辑关系: {{ data.conjunction }}</div>
          <div v-if="type === 'threshold'">阈值: {{ data.threshold }}</div>
          <div v-if="type === 'window'">窗口: {{ data.window }}小时</div>
        </div>
      </slot>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.custom-node {
  padding: 12px;
  border-radius: 6px;
  background: #fff;
  border: 2px solid #ddd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 220px;
  transition: all 0.3s ease;
}

.custom-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.custom-node.selected {
  border-color: var(--node-color);
  box-shadow: 0 0 0 3px rgba(var(--node-color-rgb), 0.1);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
  color: var(--node-color);
}

/* 节点类型颜色 */
.condition { --node-color: #409eff; --node-color-rgb: 64,158,255; }
.group { --node-color: #67c23a; --node-color-rgb: 103,194,58; }
.threshold { --node-color: #f56c6c; --node-color-rgb: 245,108,108; }
.window { --node-color: #e6a23c; --node-color-rgb: 230,162,60; }
</style>
import { Document, Folder, Warning, Timer } from '@element-plus/icons-vue'
import { ElSelect, ElOption, ElInput } from 'element-plus'