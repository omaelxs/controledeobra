/**
 * Utilitários de Escalabilidade e Otimização
 * Cache, query optimization, error boundary, etc.
 */

/**
 * Cache em memória com TTL
 */
export class CacheManager<T> {
  private cache = new Map<string, { data: T; expiresAt: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Query Optimizer - Evita queries repetidas
 */
export class QueryOptimizer {
  private cache = new CacheManager<any>(30 * 1000); // 30s

  async executeQuery<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached) return cached;

    const result = await queryFn();
    this.cache.set(key, result);
    return result;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

/**
 * Retry Logic com exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Batch Processor - Processa itens em lotes
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Debounce - Evita múltiplas chamadas rápidas
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Throttle - Limita frequência de chamadas
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= delayMs) {
      fn(...args);
      lastCallTime = now;
      if (timeoutId) clearTimeout(timeoutId);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          fn(...args);
          lastCallTime = Date.now();
        },
        delayMs - (now - lastCallTime)
      );
    }
  };
}

/**
 * Environment Config Manager
 */
export const envConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  apiBase: process.env.NEXT_PUBLIC_API_BASE || "/api",
  firestoreEmulator: process.env.FIRESTORE_EMULATOR_HOST,
  enableLogging: process.env.NODE_ENV === "development",

  getApiUrl(endpoint: string): string {
    return `${this.apiBase}${endpoint}`;
  },
};

/**
 * Performance Monitoring
 */
export class PerformanceMonitor {
  private timestamps = new Map<string, number>();

  start(label: string): void {
    this.timestamps.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.timestamps.get(label);
    if (!startTime) {
      console.warn(`Performance label "${label}" not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timestamps.delete(label);

    if (envConfig.enableLogging) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }
}

/**
 * Global optimization instances
 */
export const queryOptimizer = new QueryOptimizer();
export const performanceMonitor = new PerformanceMonitor();
