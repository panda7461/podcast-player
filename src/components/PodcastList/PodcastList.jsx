import { usePlayer } from '../../context/PlayerContext'
import styles from './PodcastList.module.css'

export default function PodcastList({ onSelectPodcast, selectedPodcast }) {
  const { podcasts, removePodcast } = usePlayer()

  return (
    <div className={styles.podcastList}>
      <div className={styles.header}>
        <h3 className={styles.title}>番組</h3>
      </div>
      {podcasts.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.emptyIcon}>
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
          <p>検索タブからポッドキャストを追加してください</p>
        </div>
      ) : (
        <div className={styles.list}>
          {podcasts.map((podcast) => (
            <div
              key={podcast.feedUrl}
              className={`${styles.item} ${selectedPodcast?.feedUrl === podcast.feedUrl ? styles.selected : ''}`}
              onClick={() => onSelectPodcast(podcast)}
            >
              <img
                src={podcast.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23667eea" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="40">P</text></svg>'}
                alt={podcast.title}
                className={styles.image}
              />
              <div className={styles.info}>
                <div className={styles.podcastTitle}>{podcast.title}</div>
                <div className={styles.episodeCount}>
                  {podcast.episodes.length} エピソード
                </div>
              </div>
              <button
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  removePodcast(podcast.feedUrl)
                }}
                title="削除"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
