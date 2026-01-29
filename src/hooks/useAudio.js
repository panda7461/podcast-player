import { useState, useEffect, useRef, useCallback } from 'react'

export function useAudio(onEnded) {
  const audioRef = useRef(new Audio())
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const onEndedRef = useRef(onEnded)

  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  useEffect(() => {
    const audio = audioRef.current

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (onEndedRef.current) {
        onEndedRef.current()
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const loadAudio = useCallback((src, startTime = 0) => {
    const audio = audioRef.current
    setIsLoading(true)
    audio.src = src
    audio.currentTime = startTime
    audio.load()
  }, [])

  const play = useCallback(async () => {
    try {
      await audioRef.current.play()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }, [])

  const pause = useCallback(() => {
    audioRef.current.pause()
  }, [])

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, play, pause])

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((value) => {
    audioRef.current.volume = value
    setVolumeState(value)
  }, [])

  const setPlaybackRate = useCallback((rate) => {
    audioRef.current.playbackRate = rate
    setPlaybackRateState(rate)
  }, [])

  const skip = useCallback((seconds) => {
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration))
    seek(newTime)
  }, [duration, seek])

  return {
    isPlaying,
    duration,
    currentTime,
    volume,
    playbackRate,
    isLoading,
    loadAudio,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    skip,
  }
}
