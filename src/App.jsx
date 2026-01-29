import { useState } from 'react'
import Player from './components/Player/Player'
import PodcastList from './components/PodcastList/PodcastList'
import EpisodeList from './components/EpisodeList/EpisodeList'
import Playlist from './components/Playlist/Playlist'
import AddFeed from './components/AddFeed/AddFeed'
import styles from './App.module.css'

function App() {
  const [selectedPodcast, setSelectedPodcast] = useState(null)

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.logoIcon}>
            <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
          </svg>
          Podcast Player
        </h1>
      </header>

      <main className={styles.main}>
        <aside className={styles.sidebar}>
          <AddFeed />
          <PodcastList
            onSelectPodcast={setSelectedPodcast}
            selectedPodcast={selectedPodcast}
          />
          <Playlist />
        </aside>

        <section className={styles.content}>
          <EpisodeList podcast={selectedPodcast} />
        </section>
      </main>

      <footer className={styles.footer}>
        <Player />
      </footer>
    </div>
  )
}

export default App
