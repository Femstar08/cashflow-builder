/**
 * Cache utilities for API responses
 * Simple in-memory cache - for production, consider Redis
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60 * 1000) {
    this.defaultTTL = defaultTTL;
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { data, expiresAt });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new SimpleCache(60 * 1000); // 1 minute default

/**
 * Generate cache key from request
 */
export function getCacheKey(path: string, params?: Record<string, unknown>): string {
  const paramStr = params ? JSON.stringify(params) : '';
  return `${path}:${paramStr}`;
}

/**
 * Cache headers for Next.js responses
 */
export function getCacheHeaders(maxAge: number = 60): HeadersInit {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  };
}

