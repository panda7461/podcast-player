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
          res.end(JSON.stringify({ error: 'URL parameter is required' }))
          return
        }

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          })

          // Forward response headers
          const contentType = response.headers.get('content-type')
          if (contentType) {
            res.setHeader('Content-Type', contentType)
          }

          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            res.setHeader('Content-Length', contentLength)
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

          // Stream the response
          const buffer = await response.arrayBuffer()
          res.end(Buffer.from(buffer))
        } catch (error) {
          console.error('Proxy error:', error)
          res.statusCode = 500
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), corsProxyPlugin()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173,
  },
})
