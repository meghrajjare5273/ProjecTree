/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/cache.ts
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  cleanupInterval?: number; // Cleanup interval in milliseconds
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export class InMemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: number;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000; // 1000 entries default
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minute default

    this.startCleanup();
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.defaultTTL;

    // Remove oldest entries if cache is at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data: value,
      timestamp: now,
      ttl: entryTTL,
      hits: 0,
      lastAccessed: now,
    });
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = now;

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate entries by pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<K = T>(
    key: string,
    factory: () => Promise<K>,
    ttl?: number
  ): Promise<K> {
    const cached = this.get(key) as K;

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value as unknown as T, ttl);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    totalRequests: number;
  } {
    let totalHits = 0;
    let totalRequests = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      totalRequests += entry.hits + 1; // +1 for the initial miss
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      totalHits,
      totalRequests,
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Stop automatic cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Cache manager for different cache instances
export class CacheManager {
  private static instance: CacheManager;
  private caches = new Map<string, InMemoryCache>();

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get or create a cache instance
   */
  getCache<T = any>(name: string, options?: CacheOptions): InMemoryCache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new InMemoryCache<T>(options));
    }
    return this.caches.get(name) as InMemoryCache<T>;
  }

  /**
   * Delete a cache instance
   */
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.destroy();
      return this.caches.delete(name);
    }
    return false;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Get stats for all caches
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  /**
   * Destroy all caches
   */
  destroy(): void {
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Common cache configurations
export const CacheConfigs = {
  // Fast changing data - 1 minute
  FAST: { ttl: 60 * 1000, maxSize: 500 },

  // Medium changing data - 5 minutes
  MEDIUM: { ttl: 5 * 60 * 1000, maxSize: 1000 },

  // Slow changing data - 30 minutes
  SLOW: { ttl: 30 * 60 * 1000, maxSize: 2000 },

  // Very slow changing data - 2 hours
  VERY_SLOW: { ttl: 2 * 60 * 60 * 1000, maxSize: 5000 },
};
