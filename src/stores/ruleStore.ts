import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import axios from '@/services/amlService';

export interface Rule {
  id: number;
  name: string;
  status: '启用' | '禁用';
  threshold: number;
  ruleType: '交易金额' | '频率' | '关联方';
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

export const useRuleStore = defineStore('rules', () => {
  const state = reactive({
    rules: [] as Rule[],
    loading: false,
    error: null as string | null
  })

  const fetchRules = async () => {
    state.loading = true
    try {
      const response = await axios.get('/api/rules')
      state.rules = response.data
    } catch (error) {
      state.error = error instanceof Error ? error.message : '规则加载失败'
    } finally {
      state.loading = false
    }
  }

  const toggleRuleStatus = async (ruleId: number, newStatus: '启用' | '禁用') => {
    const rule = state.rules.find(r => r.id === ruleId)
    if (rule) {
      try {
        await axios.patch(`/api/rules/${ruleId}/status`, { status: newStatus })
        rule.status = newStatus
      } catch (error) {
        console.error('状态更新失败:', error)
      }
    }
  }

  return { 
    ...toRefs(state),
    fetchRules,
    toggleRuleStatus,
    persist: {
      key: 'aml_rules',
      storage: localStorage
    }
  }
})