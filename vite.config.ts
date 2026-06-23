import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/mdEC/' fuer GitHub Pages unter https://thomas-lauer.github.io/mdEC/
// Im Electron-Build wird ueber MDEC_ELECTRON ein relativer base genutzt,
// damit die App auch aus dem Dateisystem (file://) korrekt laedt.
export default defineConfig(() => ({
  base: process.env.MDEC_ELECTRON ? './' : '/mdEC/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}))
