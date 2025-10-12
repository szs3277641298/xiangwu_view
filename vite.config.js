import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  plugins: [
    vue(),
    // 自动导入API
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia'
      ],
      resolvers: [ElementPlusResolver()],
      dts: true, // 生成类型声明文件
      eslintrc: {
        enabled: true, // 生成eslint配置
      }
    }),
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true, // 生成类型声明文件
    })
  ],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@api': resolve(__dirname, 'src/api'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@store': resolve(__dirname, 'src/store'),
      '@router': resolve(__dirname, 'src/router')
    }
  },
  
  // 开发服务器配置
  server: {
    port: env.VITE_DEV_PORT || 8080,
    open: true,
    host: env.VITE_DEV_HOST || '0.0.0.0',
    allowedHosts: [
      'frp-bus.com' // 添加您的穿透域名
    ],
    proxy: {
      // API代理配置
      '/api': {
        target: env.VITE_API_BASE_URL || 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: env.VITE_BUILD_OUTPUT_DIR || 'dist',
    assetsDir: env.VITE_BUILD_ASSETS_DIR || 'assets',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    rollupOptions: {
      output: {
        // 分包配置
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts'],
          'axios': ['axios']
        }
      }
    },
    // 构建文件大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  
  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },
  
  // 优化配置
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'echarts',
      'axios'
    ]
  }
  }
})