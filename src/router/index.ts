import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import RuleManagement from '@/views/RuleManagement.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/rule-management',
    name: 'rule-management',
    component: RuleManagement
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;