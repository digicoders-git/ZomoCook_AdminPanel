import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'https://api.zomocook.in/api'

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['react-quill-new'],
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    }
  }
})
