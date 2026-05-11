import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/translate_api': {
            target: 'https://translate.googleapis.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/translate_api/, ''),
          }
        }
      },
      plugins: [tailwindcss(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'esnext',
        minify: 'terser',
        chunkSizeWarningLimit: 800,
        terserOptions: { compress: { drop_console: true, drop_debugger: true } },
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom', 'react-router-dom'],
              'vendor-motion': ['framer-motion'],
              'vendor-lucide': ['lucide-react'],
              'vendor-supabase': ['@supabase/supabase-js']
            }
          }
        }
      }
    };
});
