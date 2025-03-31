import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import RuleManagement from '@/views/RuleManagement.vue';
import RuleBuilder from '@/components/RuleBuilder.vue';

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
  },
  {
    path: '/rule-builder/:id',
    name: 'rule-builder',
    component: RuleBuilder,
    props: (route) => ({
      modelValue: {
        id: route.params.id,
        conjunction: 'AND',
        conditions: []
      }
    })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;