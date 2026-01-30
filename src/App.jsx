import { useState } from 'react'
import Player from './components/Player/Player'
import PodcastList from './components/PodcastList/PodcastList'
import EpisodeList from './components/EpisodeList/EpisodeList'
import Playlist from './components/Playlist/Playlist'
import AddFeed from './components/AddFeed/AddFeed'
import AdBanner from './components/AdBanner/AdBanner'
import { usePlayer } from './context/PlayerContext'
import styles from './App.module.css'

// AdSense広告スロットID（AdSense管理画面で取得して設定してください）
const AD_SLOT_ID = 'YOUR_AD_SLOT_ID'

const TABS = {
  SEARCH: 'search',
  PODCASTS: 'podcasts',
  EPISODES: 'episodes',
  PLAYLIST: 'playlist',
  PLAYER: 'player',
}

function App() {
  const [activeTab, setActiveTab] = useState(TABS.PODCASTS)
  const [selectedPodcast, setSelectedPodcast] = useState(null)
  const { currentEpisode, isPlaying } = usePlayer()

  const handleSelectPodcast = (podcast) => {
    setSelectedPodcast(podcast)
    setActiveTab(TABS.EPISODES)
  }

  const renderContent = () => {
    switch (activeTab) {
      case TABS.SEARCH:
        return <AddFeed onPodcastAdded={() => setActiveTab(TABS.PODCASTS)} />
      case TABS.PODCASTS:
        return (
          <PodcastList
            onSelectPodcast={handleSelectPodcast}
            selectedPodcast={selectedPodcast}
          />
        )
      case TABS.EPISODES:
        return (
          <EpisodeList
            podcast={selectedPodcast}
            onBack={() => setActiveTab(TABS.PODCASTS)}
          />
        )
      case TABS.PLAYLIST:
        return <Playlist />
      case TABS.PLAYER:
        return <Player fullScreen />
      default:
        return null
    }
  }

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        {renderContent()}
      </main>

      {/* Mini Player - shown when not on player tab and episode is loaded */}
      {activeTab !== TABS.PLAYER && currentEpisode && (
        <div className={styles.miniPlayer} onClick={() => setActiveTab(TABS.PLAYER)}>
          <Player mini />
        </div>
      )}

      {/* AdSense Banner */}
      {activeTab !== TABS.PLAYER && (
        <AdBanner slot={AD_SLOT_ID} hasMiniPlayer={!!currentEpisode} />
      )}

      {/* Bottom Navigation */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navButton} ${activeTab === TABS.SEARCH ? styles.active : ''}`}
          onClick={() => setActiveTab(TABS.SEARCH)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span>検索</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === TABS.PODCASTS ? styles.active : ''}`}
          onClick={() => setActiveTab(TABS.PODCASTS)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
          </svg>
          <span>番組</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === TABS.EPISODES ? styles.active : ''}`}
          onClick={() => setActiveTab(TABS.EPISODES)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          <span>エピソード</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === TABS.PLAYLIST ? styles.active : ''}`}
          onClick={() => setActiveTab(TABS.PLAYLIST)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
          <span>リスト</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === TABS.PLAYER ? styles.active : ''} ${isPlaying ? styles.playing : ''}`}
          onClick={() => setActiveTab(TABS.PLAYER)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            {isPlaying ? (
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            ) : (
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            )}
          </svg>
          <span>再生</span>
        </button>
      </nav>
    </div>
  )
}

export default App
