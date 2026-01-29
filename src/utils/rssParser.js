// Local proxy URL (built into Vite dev server)
const LOCAL_PROXY = '/api/proxy?url='

export async function parseRssFeed(feedUrl) {
  // Use local proxy (built into Vite)
  const proxyUrl = LOCAL_PROXY + encodeURIComponent(feedUrl)

  const response = await fetch(proxyUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
  }

  const text = await response.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')

  const parserError = xml.querySelector('parsererror')
  if (parserError) {
    throw new Error('Failed to parse RSS feed: Invalid XML')
  }

  const channel = xml.querySelector('channel')
  if (!channel) {
    throw new Error('Invalid RSS feed: No channel found')
  }

  const podcast = {
    title: getTextContent(channel, 'title'),
    description: getTextContent(channel, 'description'),
    image: getImageUrl(channel),
    link: getTextContent(channel, 'link'),
    feedUrl: feedUrl,
    episodes: [],
  }

  const items = channel.querySelectorAll('item')
  items.forEach((item, index) => {
    const enclosure = item.querySelector('enclosure')
    const audioUrl = enclosure?.getAttribute('url')

    if (audioUrl) {
      const episode = {
        guid: getTextContent(item, 'guid') || `${feedUrl}-${index}`,
        title: getTextContent(item, 'title'),
        description: getTextContent(item, 'description') || getTextContent(item, 'itunes\\:summary'),
        pubDate: getTextContent(item, 'pubDate'),
        duration: parseDuration(getTextContent(item, 'itunes\\:duration')),
        audioUrl: audioUrl,
        podcastTitle: podcast.title,
        podcastImage: podcast.image,
      }
      podcast.episodes.push(episode)
    }
  })

  return podcast
}

function getTextContent(parent, selector) {
  // Handle namespaced selectors
  let element = parent.querySelector(selector)

  // Try without namespace escape for browsers that don't support it
  if (!element && selector.includes('\\:')) {
    const [namespace, tag] = selector.split('\\:')
    element = parent.getElementsByTagName(`${namespace}:${tag}`)[0]
  }

  return element?.textContent?.trim() || ''
}

function getImageUrl(channel) {
  // Try iTunes image first
  const itunesImage = channel.getElementsByTagName('itunes:image')[0]
  if (itunesImage) {
    return itunesImage.getAttribute('href')
  }

  // Try standard RSS image
  const image = channel.querySelector('image url')
  if (image) {
    return image.textContent?.trim()
  }

  return ''
}

function parseDuration(durationStr) {
  if (!durationStr) return 0

  // If it's just a number, assume it's seconds
  if (/^\d+$/.test(durationStr)) {
    return parseInt(durationStr, 10)
  }

  // Parse HH:MM:SS or MM:SS format
  const parts = durationStr.split(':').map(Number)

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }

  return 0
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
