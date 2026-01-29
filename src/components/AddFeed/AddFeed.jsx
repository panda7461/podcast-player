import { useState } from 'react'
import { usePlayer } from '../../context/PlayerContext'
import { parseRssFeed } from '../../utils/rssParser'
import styles from './AddFeed.module.css'

export default function AddFeed() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { addPodcast, podcasts } = usePlayer()

  const handleSubmit = async (e) => {
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
    } catch (err) {
      setError(err.message || 'フィードの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.addFeed}>
      <h3 className={styles.title}>ポッドキャストを追加</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
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
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
