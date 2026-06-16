import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    // Vite 5: 启动时预编译页面，消除首次切换延迟
    warmup: {
      clientFiles: [
        './src/pages/index/index.vue',
        './src/pages/interaction/index.vue',
        './src/pages/profile/index.vue'
      ]
    }
  }
})
