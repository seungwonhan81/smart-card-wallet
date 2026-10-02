import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolveGeminiConfig } from './src/services/geminiConfig'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gemini = resolveGeminiConfig(env, process.env);
  return {
    plugins: [react(), basicSsl()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(gemini.apiKey),
      'process.env.GEMINI_MODEL': JSON.stringify(gemini.model)
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
