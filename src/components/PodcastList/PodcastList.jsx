import { usePlayer } from '../../context/PlayerContext'
import styles from './PodcastList.module.css'

export default function PodcastList({ onSelectPodcast, selectedPodcast }) {
  const { podcasts, removePodcast } = usePlayer()

  if (podcasts.length === 0) {
    return (
      <div className={styles.podcastList}>
        <h3 className={styles.title}>ポッドキャスト</h3>
        <div className={styles.empty}>
          RSSフィードを追加してください
        </div>
      </div>
    )
  }

  return (
    <div className={styles.podcastList}>
      <h3 className={styles.title}>ポッドキャスト</h3>
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
    </div>
  )
}
