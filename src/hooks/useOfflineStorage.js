import { useState, useEffect, useCallback } from 'react'

const DB_NAME = 'podcast-player-offline'
const DB_VERSION = 1
const STORE_NAME = 'episodes'

// Local proxy URL (built into Vite dev server)
const LOCAL_PROXY = '/api/proxy?url='

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'guid' })
      }
    }
  })
}

export function useOfflineStorage() {
  const [downloadedEpisodes, setDownloadedEpisodes] = useState({})
  const [downloadProgress, setDownloadProgress] = useState({})

  // Load downloaded episodes list on mount
  useEffect(() => {
    loadDownloadedList()
  }, [])

  const loadDownloadedList = useCallback(async () => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAllKeys()

      request.onsuccess = () => {
        const keys = request.result
        const downloaded = {}
        keys.forEach(key => {
          downloaded[key] = true
        })
        setDownloadedEpisodes(downloaded)
      }
    } catch (error) {
      console.error('Failed to load downloaded list:', error)
    }
  }, [])

  const downloadEpisode = useCallback(async (episode) => {
    const { guid, audioUrl, title, podcastTitle, podcastImage, duration, pubDate } = episode

    if (downloadedEpisodes[guid]) {
      return // Already downloaded
    }

    setDownloadProgress(prev => ({ ...prev, [guid]: 0 }))

    try {
      // Fetch the audio file via local proxy with progress tracking
      const proxyUrl = LOCAL_PROXY + encodeURIComponent(audioUrl)
      const response = await fetch(proxyUrl)

      if (!response.ok) {
        throw new Error('Failed to download episode')
      }

      const contentLength = response.headers.get('content-length')
      const total = parseInt(contentLength, 10)
      const reader = response.body.getReader()
      const chunks = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        received += value.length

        if (total) {
          const progress = Math.round((received / total) * 100)
          setDownloadProgress(prev => ({ ...prev, [guid]: progress }))
        }
      }

      // Combine chunks into a single Blob
      const blob = new Blob(chunks, { type: 'audio/mpeg' })

      // Store in IndexedDB
      const db = await openDatabase()
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const episodeData = {
        guid,
        title,
        podcastTitle,
        podcastImage,
        duration,
        pubDate,
        audioUrl,
        blob,
        downloadedAt: new Date().toISOString(),
      }

      await new Promise((resolve, reject) => {
        const request = store.put(episodeData)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      setDownloadedEpisodes(prev => ({ ...prev, [guid]: true }))
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[guid]
        return newProgress
      })

      return true
    } catch (error) {
      console.error('Download failed:', error)
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[guid]
        return newProgress
      })
      throw error
    }
  }, [downloadedEpisodes])

  const getOfflineAudioUrl = useCallback(async (guid) => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      return new Promise((resolve, reject) => {
        const request = store.get(guid)
        request.onsuccess = () => {
          const data = request.result
          if (data && data.blob) {
            const url = URL.createObjectURL(data.blob)
            resolve(url)
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to get offline audio:', error)
      return null
    }
  }, [])

  const deleteDownload = useCallback(async (guid) => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      await new Promise((resolve, reject) => {
        const request = store.delete(guid)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      setDownloadedEpisodes(prev => {
        const newDownloaded = { ...prev }
        delete newDownloaded[guid]
        return newDownloaded
      })

      return true
    } catch (error) {
      console.error('Failed to delete download:', error)
      throw error
    }
  }, [])

  const getDownloadedEpisodes = useCallback(async () => {
    try {
      const db = await openDatabase()
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)

      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const episodes = request.result.map(({ blob, ...rest }) => rest)
          resolve(episodes)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to get downloaded episodes:', error)
      return []
    }
  }, [])

  const isDownloaded = useCallback((guid) => {
    return !!downloadedEpisodes[guid]
  }, [downloadedEpisodes])

  const getProgress = useCallback((guid) => {
    return downloadProgress[guid]
  }, [downloadProgress])

  return {
    downloadedEpisodes,
    downloadProgress,
    downloadEpisode,
    getOfflineAudioUrl,
    deleteDownload,
    getDownloadedEpisodes,
    isDownloaded,
    getProgress,
  }
}
