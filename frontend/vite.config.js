import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const https = {
    cert: fs.readFileSync(path.resolve(dirname, '../certs/bureaucracy.crt')),
    key: fs.readFileSync(path.resolve(dirname, '../certs/bureaucracy.key')),
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: '0.0.0.0',
        https,
        port: 5173,
        strictPort: true,
    },
    preview: {
        allowedHosts: ['drevi-pc'],
        host: '0.0.0.0',
        https,
        port: 4173,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(dirname, './src'),
        },
    },
})
