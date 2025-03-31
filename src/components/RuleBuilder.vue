<script setup lang="ts">
import { ref, computed, watch, nextTick, shallowRef, markRaw } from 'vue'
import { ElButton, ElSelect, ElOption, ElForm, ElFormItem, ElInput, ElIcon } from 'element-plus'
import { Document, Folder, Warning, Timer } from '@element-plus/icons-vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import CustomNode from './CustomNode.vue'
import Draggable from 'vuedraggable'
import type { Node, Edge, Elements, Connection } from '@vue-flow/core'  // 添加 Connection 类型

const availableFields = ref([
  { label: '交易金额', value: 'amount' },
  { label: '交易频率', value: 'count' },
  { label: '时间范围', value: 'timeRange' }
])

const availableOperators = ref([
  { label: '大于', value: '>' },
  { label: '小于', value: '<' },
  { label: '等于', value: '=' },
  { label: '不等于', value: '!=' }
])

type Condition = {
  id: string
  field: string
  operator: string
  value: any
}

type RuleGroup = {
  id: string
  conjunction: 'AND' | 'OR'
  conditions: Array<Condition | RuleGroup>
}

// 修改props定义，添加ruleData属性
const props = withDefaults(defineProps<{
  modelValue: RuleGroup | Condition
  ruleData?: string  // 添加可选的ruleData属性
}>(), {
  modelValue: () => ({
    id: Date.now().toString(),
    conjunction: 'AND',
    conditions: []
  } as RuleGroup)
})

// 添加类型守卫
const isRuleGroup = (item: any): item is RuleGroup => {
  return 'conjunction' in item && 'conditions' in item
}

// 修改 emits 定义
const emit = defineEmits<{
  (e: 'update:modelValue', value: RuleGroup | Condition): void
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'connection-change', payload: { source: string, target: string }): void
}>()

// 修改路由参数解析逻辑
if (props.ruleData) {
  try {
    const parsedData = JSON.parse(props.ruleData)
    emit('update:modelValue', {
      id: parsedData.id?.toString() || Date.now().toString(),
      conjunction: 'AND',
      conditions: []
    })
  } catch (error) {
    console.error('解析规则数据失败:', error)
  }
}

const { addEdges, addNodes, getNodes, onConnect, fitView } = useVueFlow()

const elements = ref<Elements>([])

// 将规则数据转换为Vue Flow节点
// 修改节点类型定义
interface CustomNodeData {
  conjunction?: 'AND' | 'OR'
  conditions?: Array<Condition | RuleGroup>
  field?: string
  operator?: string
  value?: any
  availableFields?: Array<{ label: string, value: string }>
  availableOperators?: Array<{ label: string, value: string }>
}



// 修改 convertToNodes 函数
const convertToNodes = (rule: RuleGroup | Condition, parentId?: string) => {
  if (isRuleGroup(rule)) {
    const groupNode: Node = {
      id: rule.id,
      type: 'custom',  // 确保此类型已在 nodeTypes 中注册
      data: { 
        conjunction: rule.conjunction,
        conditions: rule.conditions,
        availableFields: availableFields.value,
        availableOperators: availableOperators.value
      },
      position: { x: 0, y: 0 },
      class: 'rule-group'
    }
    
    if (parentId) {
      elements.value.push({
        id: `e${parentId}-${rule.id}`,
        source: parentId,
        target: rule.id,
        animated: true,
        type: 'default'  // 添加边的类型
      } as Edge)
    }
    
    elements.value.push(groupNode)
    rule.conditions.forEach(cond => convertToNodes(cond, rule.id))
  } else {
    const conditionNode: Node = {
      id: rule.id,
      type: 'custom',
      data: {
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        availableFields: availableFields.value,
        availableOperators: availableOperators.value
      },
      position: { x: 0, y: 0 },
      class: 'condition-node'
    }
    
    if (parentId) {
      elements.value.push({
        id: `e${parentId}-${rule.id}`,
        source: parentId,
        target: rule.id,
        animated: true,
        type: 'default'  // 添加边的类型
      } as Edge)
    }
    
    elements.value.push(conditionNode)
  }
}

// 初始化时将现有规则转换为节点
watch(() => props.modelValue, (newVal) => {
  try {
    elements.value = []
    if (newVal) {
      convertToNodes(newVal)
      nextTick(() => fitView())
    }
  } catch (error) {
    console.error('规则转换节点失败:', error)
  }
}, { immediate: true })

// 修改连接处理函数
const handleConnect = (params: Connection) => {
  const nodes = getNodes.value
  const sourceNode = nodes.find(n => n.id === params.source)
  const targetNode = nodes.find(n => n.id === params.target)
  
  if (sourceNode && targetNode) {
    emit('connection-change', { source: sourceNode.id, target: targetNode.id })
  }
}

// Fix node double click handler
const handleNodeDoubleClick = (event: { node?: Node }) => {
  if (event.node?.type === 'custom') {
    console.log('双击节点:', event.node)
  }
}

// 添加规则验证函数
const validateRule = (rule: RuleGroup | Condition): boolean => {
  if (isRuleGroup(rule)) {
    if (rule.conditions.length === 0) return false
    return rule.conditions.every(validateRule)
  } else {
    return !!rule.field && !!rule.operator && rule.value !== undefined
  }
}

const ruleTemplates = ref([
  {
    name: '大额交易监控',
    description: '监控单笔交易金额超过阈值的交易',
    conditions: {
      conjunction: 'AND',
      conditions: [
        {
          field: 'amount',
          operator: '>',
          value: 50000
        }
      ]
    }
  },
  {
    name: '频繁交易检测',
    description: '检测短时间内多次交易的账户',
    conditions: {
      conjunction: 'AND',
      conditions: [
        {
          field: 'count',
          operator: '>',
          value: 10
        },
        {
          field: 'timeRange',
          operator: '<',
          value: 3600
        }
      ]
    }
  }
])



const paletteItems = shallowRef([
  { icon: markRaw(Document), label: '条件节点', type: 'condition' },
  { icon: markRaw(Folder), label: '规则组', type: 'group' },
  { icon: markRaw(Warning), label: '风险阈值', type: 'threshold' },
  { icon: markRaw(Timer), label: '时间窗口', type: 'window' }
])

const handleDragStart = (event: DragEvent, item: any) => {
  event.dataTransfer?.setData('application/json', JSON.stringify(item))
}

const addCondition = () => {
  if (!isRuleGroup(props.modelValue)) return
  
  const newCondition: Condition = {
    id: Date.now().toString(),
    field: '',
    operator: '',
    value: ''
  }
  emit('update:modelValue', {
    ...props.modelValue,
    conditions: [...props.modelValue.conditions, newCondition]
  })
}

const addGroup = () => {
  if (!isRuleGroup(props.modelValue)) return
  
  const newGroup: RuleGroup = {
    id: Date.now().toString(),
    conjunction: 'AND',
    conditions: []
  }
  emit('update:modelValue', {
    ...props.modelValue,
    conditions: [...props.modelValue.conditions, newGroup]
  })
}

const removeItem = (id: string) => {
  if (!isRuleGroup(props.modelValue)) return
  
  const filterConditions = (conditions: Array<Condition | RuleGroup>) => {
    return conditions.filter(condition => {
      if (isRuleGroup(condition)) {
        condition.conditions = filterConditions(condition.conditions)
        return condition.conditions.length > 0
      }
      return condition.id !== id
    })
  }

  emit('update:modelValue', {
    ...props.modelValue,
    conditions: filterConditions(props.modelValue.conditions)
  })
}

const applyTemplate = (template: any) => {
  emit('update:modelValue', template.conditions)
}

// 导出规则为JSON
const exportRule = () => {
  return JSON.stringify(props.modelValue, null, 2)
}

// 导入规则
const importRule = (jsonString: string) => {
  try {
    const parsedData = JSON.parse(jsonString)
    emit('update:modelValue', parsedData)
    return true
  } catch (error) {
    console.error('导入规则失败:', error)
    return false
  }
}
</script>

<template>
  <div class="rule-builder">
    <div class="icon-palette">
      <div class="palette-title">规则元素</div>
      <div class="palette-items">
        <div 
          v-for="(item, index) in paletteItems" 
          :key="index"
          class="palette-item"
          draggable="true"
          @dragstart="handleDragStart($event, item)"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
    <div class="flow-container" style="width: 100%; height: 600px;">
      <VueFlow
        :nodes="elements as Node[]"
        :edges="[]"
        :default-viewport="{ x: 0, y: 0, zoom: 1 }"
        :nodes-draggable="true"
        :nodes-connectable="true"
        @connect="handleConnect"
        @node-double-click="handleNodeDoubleClick"
      >
        <template #node-custom="props">
          <CustomNode 
            v-if="props" 
            :id="props.id"
            :type="props.type"
            :data="props.data"
            :position="props.position"
            :available-fields="props.data?.availableFields || []"
            :available-operators="props.data?.availableOperators || []"
          />
        </template>
      </VueFlow>
    </div>
  </div>
</template>

<style scoped>
.flow-container {
  flex: 1;
  min-height: 600px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.rule-builder {
  display: flex;
  flex-direction: row;
  gap: 20px;
  height: 100%;
}

.icon-palette {
  width: 200px;
  padding: 15px;
  background-color: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.palette-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: var(--el-color-primary);
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s;
}

.palette-item:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.template-selector {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.template-item {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.rule-editor {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
}

.condition-item {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: move;
}

.draggable-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.drag-handle {
  cursor: move;
  margin-right: 10px;
}

.nested-group {
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.flow-container {
  width: 100%;
  height: 600px;
  min-height: 400px;
  max-height: 800px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin: 15px 0;
  position: relative;
}
</style>