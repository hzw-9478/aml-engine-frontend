<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElButton, ElTable, ElTableColumn, ElSwitch, ElDialog, ElForm } from 'element-plus'
import type { FormInstance } from 'element-plus'
import RuleBuilder from '@/components/RuleBuilder.vue'

// 类型定义
interface Rule {
  id: number
  name: string
  status: '启用' | '禁用'
  threshold: number
  ruleType: '交易金额' | '频率' | '关联方'
  createdAt?: string
  updatedAt?: string
  lastModifiedBy?: string
}

interface RuleGroup {
  id: string
  conjunction: 'AND' | 'OR'
  conditions: Array<Condition | RuleGroup>
}

interface Condition {
  id: string
  field: string
  operator: string
  value: any
}

// ref声明
const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const rules = ref<Rule[]>([
  { 
    id: 1, 
    name: '大额交易监控', 
    status: '启用', 
    threshold: 50000,
    ruleType: '交易金额',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedBy: '系统'
  },
  { 
    id: 2, 
    name: '频繁交易检测', 
    status: '禁用', 
    threshold: 10,
    ruleType: '频率',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedBy: '系统'
  }
])

const router = useRouter()
const currentRule = ref<Partial<Rule>>({})
const filterType = ref<string>('')
const filterStatus = ref<string>('')
const initialRuleGroup = ref<RuleGroup>({
  id: Date.now().toString(),
  conjunction: 'AND',
  conditions: []
})

const ruleBuilderData = ref<RuleGroup>({
  id: Date.now().toString(),
  conjunction: 'AND',
  conditions: []
})

const handleEditRule = (rule: Rule) => {
  currentRule.value = rule
  ruleBuilderData.value = {
    id: rule.id.toString(),
    conjunction: 'AND',
    conditions: []
  }
  dialogVisible.value = true
}

// 计算属性
const filteredRules = computed(() => {
  return rules.value.filter(rule => {
    const typeMatch = filterType.value ? rule.ruleType === filterType.value : true
    const statusMatch = filterStatus.value ? rule.status === filterStatus.value : true
    return typeMatch && statusMatch
  })
})

// 方法定义
const handleNew = () => {
  currentRule.value = {
    name: '',
    status: '禁用',
    threshold: 0,
    ruleType: '交易金额'
  }
  dialogVisible.value = true
}

const handleEdit = (index: number) => {
  router.push({
    path: `/rule-builder/${rules.value[index].id}`,
    query: {
      ruleData: JSON.stringify(rules.value[index])
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate()
  if (valid) {
    const ruleData = ruleBuilderData.value
    if (!currentRule.value.id) {
      rules.value.push({
        ...currentRule.value as Rule,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModifiedBy: '当前用户'
      })
    } else {
      const index = rules.value.findIndex(r => r.id === currentRule.value.id)
      if (index >= 0) {
        rules.value[index] = {
          ...currentRule.value as Rule,
          updatedAt: new Date().toISOString(),
          lastModifiedBy: '当前用户'
        }
      }
    }
    dialogVisible.value = false
  }
}

const handleClone = (rule: Rule) => {
  currentRule.value = {
    ...rule,
    id: Date.now(),
    name: `${rule.name}(副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  dialogVisible.value = true
}

const handleDelete = (rule: Rule) => {
  const index = rules.value.findIndex(r => r.id === rule.id)
  if (index >= 0) {
    rules.value.splice(index, 1)
  }
}

const toggleStatus = (rule: Rule) => {
  const index = rules.value.findIndex(r => r.id === rule.id)
  if (index >= 0) {
    rules.value[index].status = rule.status
    rules.value[index].updatedAt = new Date().toISOString()
  }
}
</script>

<template>
  <div class="rule-management">
    <div class="header">
      <h2>反洗钱规则配置</h2>
      <ElButton type="primary" @click="handleNew">新建规则</ElButton>
    </div>
    
    <ElDialog v-model="dialogVisible" title="规则配置" width="70%">
      <RuleBuilder
        v-model="ruleBuilderData"
        @save="handleSubmit"
        @cancel="dialogVisible = false"
      />
    </ElDialog>
    
    <ElTable :data="rules" border>
      <ElTableColumn prop="name" label="规则名称" width="200" />
      <ElTableColumn prop="status" label="状态" width="120" />
      <ElTableColumn prop="ruleType" label="规则类型" width="150" />
      <ElTableColumn prop="createdAt" label="创建时间" width="180" />
      <ElTableColumn prop="lastModifiedBy" label="最后修改人" width="150" />
      <ElTableColumn prop="threshold" label="阈值" width="150" />
      <ElTableColumn label="操作" width="180">
        <template #default="scope">
          <ElSwitch v-model="scope.row.status" @change="toggleStatus(scope.row)" />
          <ElButton @click="handleEdit(scope.$index)">编辑</ElButton>
          <ElButton @click="handleClone(scope.row)">克隆</ElButton>
          <ElButton type="danger" @click="handleDelete(scope.row)">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
}

.rule-management {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.rule-management :deep(.vue-flow) {
  width: 100%;
  height: 100%;
  min-height: 500px;
  position: relative;
}
</style>