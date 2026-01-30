import { useEffect, useRef } from 'react'
import styles from './AdBanner.module.css'

function AdBanner({ slot, format = 'horizontal', responsive = true }) {
  const adRef = useRef(null)
  const isAdLoaded = useRef(false)

  useEffect(() => {
    if (adRef.current && !isAdLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        isAdLoaded.current = true
      } catch (e) {
        console.error('AdSense error:', e)
      }
    }
  }, [])

  return (
    <div className={styles.adContainer}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9758482403757793"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  )
}

export default AdBanner
