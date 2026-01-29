import { usePlayer } from '../../context/PlayerContext'
import { formatTime, formatDate } from '../../utils/rssParser'
import styles from './EpisodeList.module.css'

export default function EpisodeList({ podcast }) {
  const {
    playEpisode,
    currentEpisode,
    isPlaying,
    toggleFavorite,
    isFavorite,
    addToPlaylist,
    isInPlaylist,
    downloadEpisode,
    deleteDownload,
    isDownloaded,
    getProgress,
  } = usePlayer()

  if (!podcast) {
    return (
      <div className={styles.episodeList}>
        <h3 className={styles.title}>エピソード</h3>
        <div className={styles.empty}>
          ポッドキャストを選択してください
        </div>
      </div>
    )
  }

  const handleDownload = async (episode, e) => {
    e.stopPropagation()
    try {
      await downloadEpisode(episode)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDeleteDownload = async (guid, e) => {
    e.stopPropagation()
    try {
      await deleteDownload(guid)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className={styles.episodeList}>
      <h3 className={styles.title}>{podcast.title} - エピソード</h3>
      <div className={styles.list}>
        {podcast.episodes.map((episode) => {
          const isCurrentEpisode = currentEpisode?.guid === episode.guid
          const favorite = isFavorite(episode)
          const inPlaylist = isInPlaylist(episode)
          const downloaded = isDownloaded(episode.guid)
          const progress = getProgress(episode.guid)
          const isDownloading = progress !== undefined

          return (
            <div
              key={episode.guid}
              className={`${styles.item} ${isCurrentEpisode ? styles.playing : ''}`}
            >
              <div
                className={styles.mainContent}
                onClick={() => playEpisode(episode)}
              >
                <div className={styles.header}>
                  <span className={styles.date}>{formatDate(episode.pubDate)}</span>
                  {episode.duration > 0 && (
                    <span className={styles.duration}>{formatTime(episode.duration)}</span>
                  )}
                  {downloaded && (
                    <span className={styles.offlineBadge}>オフライン</span>
                  )}
                </div>
                <div className={styles.episodeTitle}>
                  {isCurrentEpisode && isPlaying && (
                    <span className={styles.playingIcon}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    </span>
                  )}
                  {episode.title}
                </div>
                {episode.description && (
                  <div className={styles.description}>
                    {episode.description.replace(/<[^>]*>/g, '').substring(0, 150)}
                    {episode.description.length > 150 ? '...' : ''}
                  </div>
                )}
              </div>
              <div className={styles.actions}>
                {isDownloading ? (
                  <div className={styles.progressWrapper}>
                    <div className={styles.progressCircle}>
                      <svg viewBox="0 0 36 36">
                        <path
                          className={styles.progressBg}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={styles.progressFill}
                          strokeDasharray={`${progress}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className={styles.progressText}>{progress}%</span>
                    </div>
                  </div>
                ) : downloaded ? (
                  <button
                    className={`${styles.actionBtn} ${styles.downloaded}`}
                    onClick={(e) => handleDeleteDownload(episode.guid, e)}
                    title="ダウンロードを削除"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => handleDownload(episode, e)}
                    title="ダウンロード"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                )}
                <button
                  className={`${styles.actionBtn} ${favorite ? styles.active : ''}`}
                  onClick={() => toggleFavorite(episode)}
                  title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  <svg viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <button
                  className={`${styles.actionBtn} ${inPlaylist ? styles.active : ''}`}
                  onClick={() => addToPlaylist(episode)}
                  disabled={inPlaylist}
                  title={inPlaylist ? 'プレイリストに追加済み' : 'プレイリストに追加'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
