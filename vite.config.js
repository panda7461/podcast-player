import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom proxy plugin for CORS bypass
function corsProxyPlugin() {
  return {
    name: 'cors-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        const url = new URL(req.url, 'http://localhost').searchParams.get('url')

        if (!url) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'URL parameter is required' }))
          return
        }

        console.log('[Proxy] Fetching:', url)

        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 30000) // 30 second timeout

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*',
              'Accept-Encoding': 'identity', // Disable compression to avoid issues
            },
            redirect: 'follow',
            signal: controller.signal,
          })

          clearTimeout(timeout)

          console.log('[Proxy] Response status:', response.status, response.statusText)

          if (!response.ok) {
            res.statusCode = response.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Upstream error: ${response.status} ${response.statusText}` }))
            return
          }

          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', '*')

          if (req.method === 'OPTIONS') {
            res.statusCode = 200
            res.end()
            return
          }

          // Read the full response as text to handle encoding properly
          const text = await response.text()
          console.log('[Proxy] Response size:', text.length, 'chars')

          // Set content type for XML
          const contentType = response.headers.get('content-type') || 'application/xml; charset=utf-8'
          res.setHeader('Content-Type', contentType)

          res.end(text)
        } catch (error) {
          console.error('[Proxy] Error:', error.message)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), corsProxyPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
