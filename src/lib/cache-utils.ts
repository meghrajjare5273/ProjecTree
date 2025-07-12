/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/cache-utils.ts
import { cacheManager, CacheConfigs } from "./cache";

/**
 * Cache decorator for methods
 */
export function Cached(
  cacheName: string,
  keyGenerator?: (...args: any[]) => string,
  ttl?: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = cacheManager.getCache(cacheName, CacheConfigs.MEDIUM);

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator
        ? keyGenerator(...args)
        : `${propertyKey}_${JSON.stringify(args)}`;

      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
}

/**
 * Cache utility functions
 */
export const CacheUtils = {
  /**
   * Generic cache wrapper for any async function
   */
  async withCache<T>(
    cacheName: string,
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cache = cacheManager.getCache<T>(cacheName, CacheConfigs.MEDIUM);
    return await cache.getOrSet(key, factory, ttl);
  },

  /**
   * Cache invalidation utilities
   */
  invalidate: {
    byKey(cacheName: string, key: string): boolean {
      const cache = cacheManager.getCache(cacheName);
      return cache.delete(key);
    },

    byPattern(cacheName: string, pattern: string | RegExp): number {
      const cache = cacheManager.getCache(cacheName);
      return cache.invalidatePattern(pattern);
    },

    byTags(cacheName: string, tags: string[]): number {
      const cache = cacheManager.getCache(cacheName);
      let deletedCount = 0;

      for (const tag of tags) {
        deletedCount += cache.invalidatePattern(new RegExp(`.*${tag}.*`));
      }

      return deletedCount;
    },

    all(cacheName: string): void {
      const cache = cacheManager.getCache(cacheName);
      cache.clear();
    },
  },

  /**
   * Generate cache keys
   */
  generateKey: {
    fromObject(obj: Record<string, any>): string {
      return Object.keys(obj)
        .sort()
        .map((key) => `${key}:${obj[key]}`)
        .join("|");
    },

    fromArgs(...args: any[]): string {
      return args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join("|");
    },

    withPrefix(prefix: string, ...parts: string[]): string {
      return [prefix, ...parts].join(":");
    },
  },
};

/**
 * Cache middleware for API routes
 */
export function withCacheMiddleware(
  cacheName: string,
  keyGenerator: (request: Request) => string,
  ttl?: number
) {
  return function (handler: (request: Request) => Promise<Response>) {
    return async function (request: Request): Promise<Response> {
      const cache = cacheManager.getCache(cacheName, CacheConfigs.MEDIUM);
      const key = keyGenerator(request);

      // Try to get from cache
      const cached = cache.get(key);
      if (cached) {
        return new Response(JSON.stringify(cached), {
          headers: {
            "Content-Type": "application/json",
            "X-Cache": "HIT",
          },
        });
      }

      // Execute handler
      const response = await handler(request);

      // Cache successful responses
      if (response.ok) {
        const data = await response.json();
        cache.set(key, data, ttl);

        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "X-Cache": "MISS",
          },
        });
      }

      return response;
    };
  };
}

/**
 * Database query cache wrapper
 */
export class DatabaseCache {
  private cache = cacheManager.getCache("database", CacheConfigs.MEDIUM);

  async query<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    return await this.cache.getOrSet(key, queryFn, ttl);
  }

  invalidateTable(tableName: string): number {
    return this.cache.invalidatePattern(new RegExp(`^${tableName}:`));
  }

  invalidateUser(userId: string): number {
    return this.cache.invalidatePattern(new RegExp(`user:${userId}`));
  }

  invalidateProject(projectId: string): number {
    return this.cache.invalidatePattern(new RegExp(`project:${projectId}`));
  }

  invalidateEvent(eventId: string): number {
    return this.cache.invalidatePattern(new RegExp(`event:${eventId}`));
  }
}

export const dbCache = new DatabaseCache();

/**
 * Cache warming utilities
 */
export const CacheWarmer = {
  /**
   * Warm cache with common queries
   */
  async warmCommonQueries(): Promise<void> {
    // Add your common queries here
    console.log("Warming cache with common queries...");

    // Example: Pre-load popular projects, events, etc.
    // await dbCache.query('popular:projects', () => prisma.project.findMany({ take: 10 }));
    // await dbCache.query('recent:events', () => prisma.event.findMany({ take: 10 }));
  },

  /**
   * Schedule cache warming
   */
  scheduleWarming(intervalMs: number = 30 * 60 * 1000): NodeJS.Timeout {
    return setInterval(() => {
      this.warmCommonQueries().catch(console.error);
    }, intervalMs);
  },
};
