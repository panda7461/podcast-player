import { useState, useEffect } from 'react'
import { usePlayer } from '../../context/PlayerContext'
import { formatTime } from '../../utils/rssParser'
import styles from './Playlist.module.css'

export default function Playlist() {
  const [activeTab, setActiveTab] = useState('playlist')
  const [downloadedList, setDownloadedList] = useState([])
  const {
    playlist,
    favorites,
    currentEpisode,
    isPlaying,
    playEpisode,
    removeFromPlaylist,
    clearPlaylist,
    toggleFavorite,
    getDownloadedEpisodes,
    deleteDownload,
    downloadedEpisodes,
  } = usePlayer()

  // Load downloaded episodes when tab changes or downloads change
  useEffect(() => {
    if (activeTab === 'downloads') {
      getDownloadedEpisodes().then(setDownloadedList)
    }
  }, [activeTab, downloadedEpisodes, getDownloadedEpisodes])

  const getItems = () => {
    switch (activeTab) {
      case 'playlist':
        return playlist
      case 'favorites':
        return favorites
      case 'downloads':
        return downloadedList
      default:
        return []
    }
  }

  const items = getItems()

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'playlist':
        return 'プレイリストにエピソードがありません'
      case 'favorites':
        return 'お気に入りのエピソードがありません'
      case 'downloads':
        return 'ダウンロードしたエピソードがありません'
      default:
        return ''
    }
  }

  const handleRemove = (episode) => {
    switch (activeTab) {
      case 'playlist':
        removeFromPlaylist(episode.guid)
        break
      case 'favorites':
        toggleFavorite(episode)
        break
      case 'downloads':
        deleteDownload(episode.guid)
        break
    }
  }

  return (
    <div className={styles.playlist}>
      <div className={styles.header}>
        <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'playlist' ? styles.active : ''}`}
          onClick={() => setActiveTab('playlist')}
        >
          リスト ({playlist.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          お気に入り ({favorites.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'downloads' ? styles.active : ''}`}
          onClick={() => setActiveTab('downloads')}
        >
          DL ({Object.keys(downloadedEpisodes).length})
        </button>
        </div>
      </div>

      {activeTab === 'playlist' && playlist.length > 0 && (
        <button className={styles.clearBtn} onClick={clearPlaylist}>
          すべてクリア
        </button>
      )}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.emptyIcon}>
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((episode, index) => {
            const isCurrentEpisode = currentEpisode?.guid === episode.guid

            return (
              <div
                key={episode.guid}
                className={`${styles.item} ${isCurrentEpisode ? styles.playing : ''}`}
              >
                {activeTab === 'playlist' && (
                  <span className={styles.index}>{index + 1}</span>
                )}
                {activeTab === 'downloads' && (
                  <span className={styles.downloadIcon}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                )}
                <div
                  className={styles.content}
                  onClick={() => playEpisode(episode)}
                >
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
                  <div className={styles.meta}>
                    <span className={styles.podcast}>{episode.podcastTitle}</span>
                    {episode.duration > 0 && (
                      <span className={styles.duration}>{formatTime(episode.duration)}</span>
                    )}
                  </div>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(episode)}
                  title="削除"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
