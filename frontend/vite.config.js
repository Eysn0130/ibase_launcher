import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './frontend',  // 设置根目录为 frontend 文件夹
  plugins: [react()],
  build: {
    outDir: '../dist',  // 设置构建输出目录为根目录下的 dist 文件夹
  },
});
