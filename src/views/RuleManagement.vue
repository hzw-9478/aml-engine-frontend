<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import RuleBuilder from '@/components/RuleBuilder.vue';

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

const dialogVisible = ref(false)
const currentRule = ref<any>({})
const formRef = ref()
const filterType = ref<string>('')
const filterStatus = ref<string>('')

const filteredRules = computed(() => {
  return rules.value.filter(rule => {
    const typeMatch = filterType.value ? rule.ruleType === filterType.value : true
    const statusMatch = filterStatus.value ? rule.status === filterStatus.value : true
    return typeMatch && statusMatch
  })
})

const handleEdit = (index: number) => {
  currentRule.value = {...rules.value[index]}
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const index = rules.value.findIndex(r => r.id === currentRule.value.id)
      if (index >= 0) {
        rules.value[index] = {...currentRule.value}
      } else {
        rules.value.push({...currentRule.value, id: Date.now()})
      }
      dialogVisible.value = false
    }
  })
}

const handleNew = () => {
  currentRule.value = { 
    id: 0, 
    name: '', 
    status: '启用', 
    threshold: 0,
    ruleType: '交易金额',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastModifiedBy: '当前用户'
  }
  dialogVisible.value = true
}

const handleClone = (rule: any) => {
  currentRule.value = {
    ...rule,
    id: Date.now(),
    name: `${rule.name}(副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  dialogVisible.value = true
}

const handleDelete = (rule: any) => {
  const index = rules.value.findIndex(r => r.id === rule.id)
  if (index >= 0) {
    rules.value.splice(index, 1)
  }
}

const toggleStatus = (rule: any) => {
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

    <ElDialog v-model="dialogVisible" title="规则配置" width="30%">
      <ElForm :model="currentRule" ref="formRef" label-width="100px">
        <ElFormItem label="规则名称" prop="name" 
          :rules="[{ required: true, message: '请输入规则名称', trigger: 'blur' }]">
          <ElInput v-model="currentRule.name" />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSelect v-model="currentRule.status">
            <ElOption label="启用" value="启用" />
            <ElOption label="禁用" value="禁用" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="规则条件">
          <RuleBuilder 
            v-model="currentRule.conditions" 
            @save="handleSubmit" 
            @cancel="dialogVisible = false"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit">确定</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
}
</style>