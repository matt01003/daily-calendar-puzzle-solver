import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  base: "/daily-calendar-puzzle-solver/",
  plugins: [react()],
})
