import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_PORT || 5173)
  const hmrHost = env.VITE_HMR_HOST || 'localhost'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: devPort,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: hmrHost,
        clientPort: devPort,
      },
    },
    preview: {
      host: true,
      port: devPort,
      strictPort: true,
    },
  }
})
