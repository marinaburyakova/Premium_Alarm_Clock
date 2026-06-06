import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
    plugins: [react()],
  base: "./Premium_Alarm_Clock/",

  server: {
    port: 3000,
    open: true
  }
})