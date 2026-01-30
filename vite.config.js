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
          const timeout = setTimeout(() => controller.abort(), 120000) // 2 minute timeout for large files

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': '*/*',
              'Accept-Encoding': 'identity',
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

          const contentType = response.headers.get('content-type') || 'application/octet-stream'
          res.setHeader('Content-Type', contentType)

          // Forward content-length if available
          const contentLength = response.headers.get('content-length')
          if (contentLength) {
            res.setHeader('Content-Length', contentLength)
          }

          // Check if this is binary content (audio, video, etc.)
          const isBinary = contentType.startsWith('audio/') ||
                          contentType.startsWith('video/') ||
                          contentType.startsWith('application/octet-stream') ||
                          url.match(/\.(mp3|mp4|m4a|ogg|wav|webm|aac)(\?|$)/i)

          if (isBinary) {
            // Handle binary data (audio files)
            console.log('[Proxy] Streaming binary content')
            const buffer = await response.arrayBuffer()
            console.log('[Proxy] Binary size:', buffer.byteLength, 'bytes')
            res.end(Buffer.from(buffer))
          } else {
            // Handle text data (RSS feeds, etc.)
            const text = await response.text()
            console.log('[Proxy] Text size:', text.length, 'chars')
            res.end(text)
          }
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
