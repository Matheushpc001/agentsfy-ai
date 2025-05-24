
import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persistent?: boolean; // Use localStorage instead of memory
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function useLocalCache<T>(key: string, options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, persistent = true } = options; // Default 5 minutes TTL
  
  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map());

  const getStorageKey = (cacheKey: string) => `cache_${cacheKey}`;

  const isExpired = (item: CacheItem<T>): boolean => {
    return Date.now() - item.timestamp > item.ttl;
  };

  const get = useCallback((cacheKey: string = key): T | null => {
    if (persistent) {
      try {
        const stored = localStorage.getItem(getStorageKey(cacheKey));
        if (stored) {
          const item: CacheItem<T> = JSON.parse(stored);
          if (!isExpired(item)) {
            return item.data;
          } else {
            localStorage.removeItem(getStorageKey(cacheKey));
          }
        }
      } catch (error) {
        console.warn('Error reading from localStorage cache:', error);
      }
    }

    const item = cache.get(cacheKey);
    if (item && !isExpired(item)) {
      return item.data;
    }

    if (item && isExpired(item)) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });
    }

    return null;
  }, [cache, key, persistent, ttl]);

  const set = useCallback((data: T, cacheKey: string = key, customTtl?: number) => {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
    };

    if (persistent) {
      try {
        localStorage.setItem(getStorageKey(cacheKey), JSON.stringify(item));
      } catch (error) {
        console.warn('Error writing to localStorage cache:', error);
      }
    }

    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, item);
      return newCache;
    });
  }, [key, persistent, ttl]);

  const remove = useCallback((cacheKey: string = key) => {
    if (persistent) {
      localStorage.removeItem(getStorageKey(cacheKey));
    }

    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(cacheKey);
      return newCache;
    });
  }, [key, persistent]);

  const clear = useCallback(() => {
    if (persistent) {
      // Remove all cache items from localStorage
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith('cache_')) {
          localStorage.removeItem(storageKey);
        }
      });
    }

    setCache(new Map());
  }, [persistent]);

  const has = useCallback((cacheKey: string = key): boolean => {
    return get(cacheKey) !== null;
  }, [get, key]);

  // Clean expired items on mount
  useEffect(() => {
    const cleanExpired = () => {
      if (persistent) {
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.startsWith('cache_')) {
            try {
              const stored = localStorage.getItem(storageKey);
              if (stored) {
                const item: CacheItem<any> = JSON.parse(stored);
                if (isExpired(item)) {
                  localStorage.removeItem(storageKey);
                }
              }
            } catch (error) {
              localStorage.removeItem(storageKey);
            }
          }
        });
      }

      setCache(prev => {
        const newCache = new Map();
        prev.forEach((item, key) => {
          if (!isExpired(item)) {
            newCache.set(key, item);
          }
        });
        return newCache;
      });
    };

    cleanExpired();
    
    // Set up periodic cleanup
    const interval = setInterval(cleanExpired, 60000); // Clean every minute
    
    return () => clearInterval(interval);
  }, [persistent]);

  return {
    get,
    set,
    remove,
    clear,
    has,
  };
}
