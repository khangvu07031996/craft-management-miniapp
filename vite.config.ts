import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
// PostCSS + Tailwind được khai báo tại đây để Vite luôn xử lý `index.css` đúng cách
// (tránh trường hợ postcss.config không được resolve và toàn bộ utility mất → SVG phình to).
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
