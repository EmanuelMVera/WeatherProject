/**
 * Simple in-memory cache manager with TTL support
 * Suitable for development and single-server deployments
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get value from cache if exists and not expired
   * @param {string} key
   * @returns {any|undefined}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache with optional TTL (in milliseconds)
   * @param {string} key
   * @param {any} value
   * @param {number} ttlMs - Time to live in milliseconds. 0 = no expiration
   */
  set(key, value, ttlMs = 0) {
    const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : null;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove specific key from cache
   * @param {string} key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries (runs periodically)
   */
  cleanupExpired() {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Run cleanup every 5 minutes
setInterval(() => {
  cacheManager.cleanupExpired();
}, 5 * 60 * 1000);

export default cacheManager;
