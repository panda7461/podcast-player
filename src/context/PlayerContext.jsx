import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAudio } from '../hooks/useAudio'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useOfflineStorage } from '../hooks/useOfflineStorage'

const PlayerContext = createContext(null)

const initialState = {
  podcasts: [],
  currentEpisode: null,
  playlist: [],
  favorites: [],
  playbackPositions: {},
}

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_PODCASTS':
      return { ...state, podcasts: action.payload }
    case 'ADD_PODCAST':
      return { ...state, podcasts: [...state.podcasts, action.payload] }
    case 'REMOVE_PODCAST':
      return {
        ...state,
        podcasts: state.podcasts.filter(p => p.feedUrl !== action.payload),
      }
    case 'SET_CURRENT_EPISODE':
      return { ...state, currentEpisode: action.payload }
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload }
    case 'ADD_TO_PLAYLIST':
      if (state.playlist.some(e => e.guid === action.payload.guid)) {
        return state
      }
      return { ...state, playlist: [...state.playlist, action.payload] }
    case 'REMOVE_FROM_PLAYLIST':
      return {
        ...state,
        playlist: state.playlist.filter(e => e.guid !== action.payload),
      }
    case 'CLEAR_PLAYLIST':
      return { ...state, playlist: [] }
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload }
    case 'TOGGLE_FAVORITE':
      const isFavorite = state.favorites.some(e => e.guid === action.payload.guid)
      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter(e => e.guid !== action.payload.guid)
          : [...state.favorites, action.payload],
      }
    case 'SET_PLAYBACK_POSITIONS':
      return { ...state, playbackPositions: action.payload }
    case 'UPDATE_PLAYBACK_POSITION':
      return {
        ...state,
        playbackPositions: {
          ...state.playbackPositions,
          [action.payload.guid]: action.payload.position,
        },
      }
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  const audio = useAudio()
  const [savedState, setSavedState] = useLocalStorage('podcast-player-state', null)
  const offlineStorage = useOfflineStorage()

  // Load saved state on mount
  useEffect(() => {
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState })
    }
  }, [])

  // Save state changes
  useEffect(() => {
    const stateToSave = {
      podcasts: state.podcasts,
      playlist: state.playlist,
      favorites: state.favorites,
      playbackPositions: state.playbackPositions,
    }
    setSavedState(stateToSave)
  }, [state.podcasts, state.playlist, state.favorites, state.playbackPositions, setSavedState])

  // Save playback position periodically
  useEffect(() => {
    if (state.currentEpisode && audio.currentTime > 0) {
      const interval = setInterval(() => {
        dispatch({
          type: 'UPDATE_PLAYBACK_POSITION',
          payload: { guid: state.currentEpisode.guid, position: audio.currentTime },
        })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [state.currentEpisode, audio.currentTime])

  const playEpisode = useCallback(async (episode) => {
    dispatch({ type: 'SET_CURRENT_EPISODE', payload: episode })
    const savedPosition = state.playbackPositions[episode.guid] || 0

    // Try to use offline version first
    let audioSrc = episode.audioUrl
    if (offlineStorage.isDownloaded(episode.guid)) {
      const offlineUrl = await offlineStorage.getOfflineAudioUrl(episode.guid)
      if (offlineUrl) {
        audioSrc = offlineUrl
      }
    }

    audio.loadAudio(audioSrc, savedPosition)
    audio.play()
  }, [audio, state.playbackPositions, offlineStorage])

  const addPodcast = useCallback((podcast) => {
    dispatch({ type: 'ADD_PODCAST', payload: podcast })
  }, [])

  const removePodcast = useCallback((feedUrl) => {
    dispatch({ type: 'REMOVE_PODCAST', payload: feedUrl })
  }, [])

  const addToPlaylist = useCallback((episode) => {
    dispatch({ type: 'ADD_TO_PLAYLIST', payload: episode })
  }, [])

  const removeFromPlaylist = useCallback((guid) => {
    dispatch({ type: 'REMOVE_FROM_PLAYLIST', payload: guid })
  }, [])

  const clearPlaylist = useCallback(() => {
    dispatch({ type: 'CLEAR_PLAYLIST' })
  }, [])

  const toggleFavorite = useCallback((episode) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: episode })
  }, [])

  const isFavorite = useCallback((episode) => {
    return state.favorites.some(e => e.guid === episode.guid)
  }, [state.favorites])

  const isInPlaylist = useCallback((episode) => {
    return state.playlist.some(e => e.guid === episode.guid)
  }, [state.playlist])

  const playNext = useCallback(() => {
    if (state.playlist.length === 0) return

    const currentIndex = state.playlist.findIndex(
      e => e.guid === state.currentEpisode?.guid
    )
    const nextIndex = currentIndex + 1

    if (nextIndex < state.playlist.length) {
      playEpisode(state.playlist[nextIndex])
    }
  }, [state.playlist, state.currentEpisode, playEpisode])

  const playPrevious = useCallback(() => {
    if (state.playlist.length === 0) return

    const currentIndex = state.playlist.findIndex(
      e => e.guid === state.currentEpisode?.guid
    )
    const prevIndex = currentIndex - 1

    if (prevIndex >= 0) {
      playEpisode(state.playlist[prevIndex])
    }
  }, [state.playlist, state.currentEpisode, playEpisode])

  const value = {
    ...state,
    ...audio,
    ...offlineStorage,
    playEpisode,
    addPodcast,
    removePodcast,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    toggleFavorite,
    isFavorite,
    isInPlaylist,
    playNext,
    playPrevious,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
