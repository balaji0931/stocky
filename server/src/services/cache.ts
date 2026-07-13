interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cacheMap = new Map<string, CacheEntry<any>>();

// Cache TTL: 24 hours
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/**
 * Retrieve an item from the in-memory cache.
 * Returns null if missing or expired.
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cacheMap.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cacheMap.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Save an item in the in-memory cache with an optional TTL.
 */
export function setInCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  cacheMap.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

/**
 * Empty all items from the cache.
 */
export function clearCache(): void {
  cacheMap.clear();
}
