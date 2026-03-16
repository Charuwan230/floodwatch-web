import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
```

สร้างไฟล์ `floodwatch-web/.env.production`:
```
VITE_API_URL=https://floodwatch-backend-production.up.railway.app