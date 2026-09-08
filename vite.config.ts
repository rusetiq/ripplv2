import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssTarget: ['chrome89', 'edge89', 'firefox103', 'safari15'],
    rollupOptions: {
      output: {
        // The SDKs change far less often than the app does, so they are split
        // out to stay cached across deploys instead of being invalidated by
        // every product change.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (/node_modules[\\/](@firebase|firebase)[\\/]/.test(id)) return 'vendor-firebase'
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor-react'
        },
      },
    },
  },
})
