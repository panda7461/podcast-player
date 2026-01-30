import { useState } from 'react'
import { usePlayer } from '../../context/PlayerContext'
import { parseRssFeed } from '../../utils/rssParser'
import styles from './AddFeed.module.css'

export default function AddFeed({ onPodcastAdded }) {
  const [mode, setMode] = useState('search') // 'search' or 'url'
  const [query, setQuery] = useState('')
  const [url, setUrl] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { addPodcast, podcasts } = usePlayer()

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setSearchResults([])

    const searchQuery = query.trim()
    if (!searchQuery) return

    setIsLoading(true)

    try {
      // iTunes Search API (Apple Podcasts)
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=podcast&limit=10`
      )
      const data = await response.json()
      setSearchResults(data.results || [])

      if (data.results?.length === 0) {
        setError('検索結果がありません')
      }
    } catch (err) {
      setError('検索に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPodcast = async (podcast) => {
    setError('')

    if (!podcast.feedUrl) {
      setError('このポッドキャストのRSSフィードが見つかりません')
      return
    }

    if (podcasts.some(p => p.feedUrl === podcast.feedUrl)) {
      setError('このポッドキャストは既に追加されています')
      return
    }

    setIsLoading(true)

    try {
      const parsedPodcast = await parseRssFeed(podcast.feedUrl)
      addPodcast(parsedPodcast)
      setQuery('')
      setSearchResults([])
      onPodcastAdded?.()
    } catch (err) {
      setError(err.message || 'フィードの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const feedUrl = url.trim()
    if (!feedUrl) return

    if (podcasts.some(p => p.feedUrl === feedUrl)) {
      setError('このポッドキャストは既に追加されています')
      return
    }

    setIsLoading(true)

    try {
      const podcast = await parseRssFeed(feedUrl)
      addPodcast(podcast)
      setUrl('')
      onPodcastAdded?.()
    } catch (err) {
      setError(err.message || 'フィードの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.addFeed}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${mode === 'search' ? styles.active : ''}`}
          onClick={() => { setMode('search'); setError(''); }}
        >
          検索
        </button>
        <button
          className={`${styles.tab} ${mode === 'url' ? styles.active : ''}`}
          onClick={() => { setMode('url'); setError(''); }}
        >
          URL入力
        </button>
      </div>

      {mode === 'search' ? (
        <>
          <form onSubmit={handleSearch} className={styles.form}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ポッドキャスト名で検索..."
              className={styles.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? '検索中...' : '検索'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className={styles.results}>
              {searchResults.map((podcast) => (
                <div
                  key={podcast.collectionId}
                  className={styles.resultItem}
                  onClick={() => handleSelectPodcast(podcast)}
                >
                  <img
                    src={podcast.artworkUrl60}
                    alt={podcast.collectionName}
                    className={styles.artwork}
                  />
                  <div className={styles.resultInfo}>
                    <div className={styles.resultTitle}>{podcast.collectionName}</div>
                    <div className={styles.resultArtist}>{podcast.artistName}</div>
                  </div>
                  <span className={styles.addIcon}>+</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleUrlSubmit} className={styles.form}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="RSSフィードURLを入力..."
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? '読込中...' : '追加'}
          </button>
        </form>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
