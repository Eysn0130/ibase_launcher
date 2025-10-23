import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ibase_launcher/',  // GitHub Pages 部署的路径，确保与你的仓库名称一致
  plugins: [react()],
  build: {
    outDir: 'dist',  // 构建输出目录
  }
})
