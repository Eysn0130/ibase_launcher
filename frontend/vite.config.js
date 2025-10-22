import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 不要再写 root
  plugins: [react()],
  build: {
    outDir: 'dist',       // 输出到 frontend/dist
    emptyOutDir: true
  }
})
