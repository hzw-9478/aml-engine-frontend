import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src' // 确保与 tsconfig.json 的 paths 配置一致
    }
  },
  optimizeDeps: {
    include: ['echarts']
  }
})