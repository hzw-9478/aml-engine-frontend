<template>
  <div class="home-container">
    <h1 class="title">规则引擎管理系统</h1>
    
    <el-card class="system-overview">
      <h2>系统概述</h2>
      <p>本系统提供AML规则配置、流程编排和风险监控等功能，包含以下核心模块：</p>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(item, index) in modules" :key="index">
          <el-card shadow="hover" @click="item.onClick">
            <component :is="item.icon" style="width: 2em; height: 2em" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="dashboard-preview">
      <h2>数据看板</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in stats" :key="item.title">
          <el-card class="stat-card">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">{{ item.title }}</span>
              <el-icon :size="20" color="var(--primary-color)"><Odometer /></el-icon>
            </div>
            <div class="stat-value mt-2">
              {{ typeof item.value === 'number' ? item.value.toLocaleString() : item.value }}
              <span v-if="item.title === '系统可用率'" class="text-sm">%</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Management, TrendCharts, Document, Odometer } from '@element-plus/icons-vue'
import { ElIcon, ElRow, ElCol, ElCard } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const modules = [
  {
    icon: Management,
    title: '规则管理',
    description: '创建和维护反洗钱检测规则',
    onClick: () => router.push('/rule-management')
  },
  {
    icon: Document,
    title: '流程配置',
    description: '配置风险评估工作流程和审批节点'
  },
  {
    icon: TrendCharts,
    title: '风险监控',
    description: '实时监测交易风险指标和告警'
  }
]

const stats = [
  { title: '生效规则数', value: 28 },
  { title: '今日检测量', value: 14532 },
  { title: '风险交易数', value: 87 },
  { title: '系统可用率', value: 99.9 }
]
</script>

<style scoped>
.home-container {
  padding: 20px;
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--el-color-primary);
}

.system-overview {
  margin-bottom: 30px;
}

.el-col {
  margin-bottom: 20px;
}

dashboard-preview {
  margin-top: 30px;
}
</style>