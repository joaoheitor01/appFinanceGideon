import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import imagemin from 'vite-plugin-imagemin'; // Uncomment and install for image optimization

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Uncomment and configure after installing vite-plugin-imagemin
    // imagemin({
    //   gifsicle: { optimizationLevel: 7, interlaced: false },
    //   optipng: { optimizationLevel: 7 },
    //   mozjpeg: { quality: 20 },
    //   pngquant: { quality: [0.8, 0.9], speed: 4 },
    //   svgo: {
    //     plugins: [
    //       { name: 'removeViewBox' },
    //       { name: 'removeEmptyAttrs', active: false },
    //     ],
    //   },
    // }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split external libraries into separate chunks
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'chart-vendor';
            }
            return 'vendor'; // All other node_modules
          }
        },
      },
    },
    // Aggressive tree-shaking is enabled by default in production mode
    // You can further configure terser options here if needed
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //   },
    // },
  },
});
