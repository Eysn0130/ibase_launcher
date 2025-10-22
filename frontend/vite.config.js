import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './frontend',  // 确保根目录为 frontend 文件夹
  plugins: [react()],
  build: {
    outDir: '../dist',  // 确保构建输出到项目根目录的 dist 文件夹
    emptyOutDir: true,  // 如果需要，清空输出目录
  },
});
