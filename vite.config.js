import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 目标接口域名
        secure: false,  // 设置支持https协议的代理
        changeOrigin: true, // 是否跨域
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径
      }
    }
  }
})
