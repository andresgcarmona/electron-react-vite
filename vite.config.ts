import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-electron-plugin'
import { rmSync } from 'fs'
import { customStart } from 'vite-electron-plugin/plugin'
import renderer from 'vite-plugin-electron-renderer'
import pkg from './package.json'

rmSync('dist-electron', { recursive: true, force: true })

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      include: ['electron'],
      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG,
      },
      // Will start Electron via VSCode Debug
      plugins: process.env.VSCODE_DEBUG
        ? [customStart(debounce(() => console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')))]
        : undefined,
    }),
    // Use Node.js API in the Renderer-process
    renderer({
      nodeIntegration: true,
    }),
  ],
  server: process.env.VSCODE_DEBUG ? (() => {
    const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
    return {
      host: url.hostname,
      port: +url.port,
    }
  })() : undefined,
  clearScreen: false,
  build: {
    assetsDir: '', // #287
  },
})

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout
  return ((...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }) as Fn
}
