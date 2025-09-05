// Simple in-memory cache for API responses
class Cache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map()
    this.ttl = ttl
  }

  set(key, value, customTtl = null) {
    const expiry = Date.now() + (customTtl || this.ttl)
    this.cache.set(key, { value, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Generate cache key from URL and options
  static generateKey(url, options = {}) {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${url}:${body}`
  }
}

// Create cache instances for different data types
export const channelCache = new Cache(10 * 60 * 1000) // 10 minutes
export const messageCache = new Cache(2 * 60 * 1000) // 2 minutes
export const userCache = new Cache(30 * 60 * 1000) // 30 minutes

// Enhanced fetch with caching
export async function cachedFetch(url, options = {}, cacheInstance = null) {
  const key = Cache.generateKey(url, options)
  
  // Only cache GET requests
  if (options.method === 'GET' || !options.method) {
    const cached = cacheInstance?.get(key)
    if (cached) {
      return cached
    }
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    // Cache successful GET responses
    if (response.ok && (options.method === 'GET' || !options.method) && cacheInstance) {
      cacheInstance.set(key, data)
    }
    
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}





