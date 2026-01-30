import { usePlayer } from '../../context/PlayerContext'
import { formatTime } from '../../utils/rssParser'
import styles from './Player.module.css'

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

export default function Player({ mini, fullScreen }) {
  const {
    currentEpisode,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    playbackRate,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    skip,
    playNext,
    playPrevious,
  } = usePlayer()

  if (!currentEpisode) {
    if (fullScreen) {
      return (
        <div className={styles.fullScreen}>
          <div className={styles.emptyFull}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.emptyIcon}>
              <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
            </svg>
            <p>エピソードを選択してください</p>
          </div>
        </div>
      )
    }
    return null
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seek(percent * duration)
  }

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length
    setPlaybackRate(PLAYBACK_RATES[nextIndex])
  }

  // Mini Player
  if (mini) {
    return (
      <div className={styles.mini}>
        {currentEpisode.podcastImage && (
          <img
            src={currentEpisode.podcastImage}
            alt={currentEpisode.podcastTitle}
            className={styles.miniArtwork}
          />
        )}
        <div className={styles.miniInfo}>
          <div className={styles.miniTitle}>{currentEpisode.title}</div>
          <div className={styles.miniProgress}>
            <div
              className={styles.miniProgressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          className={styles.miniPlayBtn}
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.spinner}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 50" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  // Full Screen Player
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={styles.fullArtworkContainer}>
          {currentEpisode.podcastImage ? (
            <img
              src={currentEpisode.podcastImage}
              alt={currentEpisode.podcastTitle}
              className={styles.fullArtwork}
            />
          ) : (
            <div className={styles.fullArtworkPlaceholder}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
              </svg>
            </div>
          )}
        </div>

        <div className={styles.fullInfo}>
          <h2 className={styles.fullTitle}>{currentEpisode.title}</h2>
          <p className={styles.fullPodcast}>{currentEpisode.podcastTitle}</p>
        </div>

        <div className={styles.fullProgressContainer}>
          <div className={styles.fullProgressBar} onClick={handleSeek}>
            <div
              className={styles.fullProgress}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.fullTimeDisplay}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className={styles.fullControls}>
          <button
            className={styles.fullControlBtn}
            onClick={playPrevious}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            className={styles.fullControlBtn}
            onClick={() => skip(-10)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
            <span className={styles.skipLabel}>10</span>
          </button>

          <button
            className={styles.fullPlayBtn}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className={styles.spinner}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 50" />
              </svg>
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            className={styles.fullControlBtn}
            onClick={() => skip(30)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
            </svg>
            <span className={styles.skipLabel}>30</span>
          </button>

          <button
            className={styles.fullControlBtn}
            onClick={playNext}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <div className={styles.fullExtraControls}>
          <button
            className={styles.fullRateBtn}
            onClick={cyclePlaybackRate}
          >
            {playbackRate}x
          </button>

          <div className={styles.fullVolumeControl}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.volumeIcon}>
              {volume === 0 ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : volume < 0.5 ? (
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              )}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.fullVolumeSlider}
            />
          </div>
        </div>
      </div>
    )
  }

  // Default Player (not used in new layout, but kept for compatibility)
  return (
    <div className={styles.player}>
      <div className={styles.episodeInfo}>
        {currentEpisode.podcastImage && (
          <img
            src={currentEpisode.podcastImage}
            alt={currentEpisode.podcastTitle}
            className={styles.artwork}
          />
        )}
        <div className={styles.textInfo}>
          <div className={styles.title}>{currentEpisode.title}</div>
          <div className={styles.podcast}>{currentEpisode.podcastTitle}</div>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div className={styles.progressBar} onClick={handleSeek}>
          <div
            className={styles.progress}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>

      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={playPrevious}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button className={styles.controlBtn} onClick={() => skip(-10)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>
        <button
          className={`${styles.controlBtn} ${styles.playBtn}`}
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.spinner}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 50" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button className={styles.controlBtn} onClick={() => skip(30)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
          </svg>
        </button>
        <button className={styles.controlBtn} onClick={playNext}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <div className={styles.extraControls}>
        <button className={styles.rateBtn} onClick={cyclePlaybackRate}>
          {playbackRate}x
        </button>
        <div className={styles.volumeControl}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.volumeIcon}>
            {volume === 0 ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            ) : volume < 0.5 ? (
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            )}
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        </div>
      </div>
    </div>
  )
}
