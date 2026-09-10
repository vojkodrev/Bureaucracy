import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    preview: {
        allowedHosts: ['drevi-pc'],
        port: 4173,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(dirname, './src'),
        },
    },
})
