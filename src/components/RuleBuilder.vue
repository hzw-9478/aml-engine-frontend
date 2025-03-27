<template>
  <div class="rule-builder">
    <div class="builder-header">
      <h3>规则构建器</h3>
      <div class="logic-buttons">
        <el-button @click="addConditionGroup('AND')">添加AND组</el-button>
        <el-button @click="addConditionGroup('OR')">添加OR组</el-button>
      </div>
    </div>
    
    <div class="builder-content">
      <draggable 
        v-model="conditionGroups" 
        group="conditions" 
        handle=".drag-handle"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="condition-group" :class="element.type">
            <div class="group-header">
              <span class="drag-handle">☰</span>
              <span class="group-type">{{ element.type }}</span>
              <el-button 
                size="small" 
                type="danger" 
                @click="removeConditionGroup(element.id)"
              >
                删除
              </el-button>
            </div>
            
            <div class="group-conditions">
              <div 
                v-for="condition in element.conditions" 
                :key="condition.id" 
                class="condition-item"
              >
                <el-select v-model="condition.field" placeholder="选择字段">
                  <el-option 
                    v-for="field in availableFields" 
                    :key="field.value" 
                    :label="field.label" 
                    :value="field.value"
                  />
                </el-select>
                
                <el-select v-model="condition.operator" placeholder="选择操作符">
                  <el-option 
                    v-for="op in operators" 
                    :key="op.value" 
                    :label="op.label" 
                    :value="op.value"
                  />
                </el-select>
                
                <el-input-number 
                  v-if="condition.field === 'amount'" 
                  v-model="condition.value" 
                  :min="0" 
                  :step="100"
                />
                
                <el-input 
                  v-else 
                  v-model="condition.value" 
                  placeholder="输入值"
                />
                
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeCondition(element.id, condition.id)"
                >
                  删除
                </el-button>
              </div>
              
              <el-button 
                size="small" 
                @click="addCondition(element.id)"
              >
                添加条件
              </el-button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    
    <div class="builder-footer">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="saveRule">保存规则</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

interface Condition {
  id: string
  field: string
  operator: string
  value: any
}

interface ConditionGroup {
  id: string
  type: 'AND' | 'OR'
  conditions: Condition[]
}

export default defineComponent({
  name: 'RuleBuilder',
  components: { draggable },
  props: {
    modelValue: {
      type: Array as () => ConditionGroup[],
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save', 'cancel'],
  setup(props, { emit }) {
    const conditionGroups = ref<ConditionGroup[]>(props.modelValue)

    const availableFields = [
      { label: '交易金额', value: 'amount' },
      { label: '交易频率', value: 'frequency' },
      { label: '关联方', value: 'relatedParty' }
    ]

    const operators = [
      { label: '大于', value: '>' },
      { label: '小于', value: '<' },
      { label: '等于', value: '=' },
      { label: '不等于', value: '!=' },
      { label: '包含', value: 'contains' },
      { label: '不包含', value: 'notContains' }
    ]

    const generateId = () => Math.random().toString(36).substring(2, 9)

    // 所有方法需要在此处定义
    const addConditionGroup = (type: 'AND' | 'OR') => {
      conditionGroups.value.push({
        id: generateId(),
        type,
        conditions: [{
          id: generateId(),
          field: '',
          operator: '',
          value: ''
        }]
      })
    }

    const removeConditionGroup = (groupId: string) => {
      conditionGroups.value = conditionGroups.value.filter(g => g.id !== groupId)
    }

    const onDragEnd = () => {
      // 拖拽结束处理逻辑
    }

    const addCondition = (groupId: string) => {
      const group = conditionGroups.value.find(g => g.id === groupId)
      if (group) {
        group.conditions.push({
          id: generateId(),
          field: '',
          operator: '',
          value: ''
        })
      }
    }

    const removeCondition = (groupId: string, conditionId: string) => {
      const group = conditionGroups.value.find(g => g.id === groupId)
      if (group) {
        group.conditions = group.conditions.filter(c => c.id !== conditionId)
      }
    }

    const saveRule = () => {
      emit('save', conditionGroups.value)
    }

    // 需要返回所有模板使用的属性和方法
    return {
      conditionGroups,
      availableFields,
      operators,
      addConditionGroup,
      removeConditionGroup,
      onDragEnd,
      addCondition,
      removeCondition,
      saveRule
    }
  }
})
</script>


<style scoped>
.rule-builder {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.condition-group {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.drag-handle {
  margin-right: 10px;
  cursor: move;
}

.group-type {
  margin-right: 10px;
  font-weight: bold;
}

.group-conditions {
  padding-left: 20px;
}

.condition-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.builder-footer {
  margin-top: 20px;
  text-align: right;
}
</style>