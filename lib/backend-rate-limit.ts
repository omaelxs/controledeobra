/**
 * Rate Limiter de Backend (Sliding Window)
 * Armazena attempts em memória com TTL automático
 *
 * Importante: Para produção em escala, usar Redis
 */

interface AttemptRecord {
  count: number;
  resetTime: number;
}

class BackendRateLimiter {
  private store = new Map<string, AttemptRecord>();
  private maxAttempts: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxAttempts: number, windowMs: number) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;

    // Limpar entradas expiradas a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  canProceed(identifier: string): boolean {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      // Nova janela
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count < this.maxAttempts) {
      record.count++;
      return true;
    }

    return false;
  }

  getRemainingTime(identifier: string): number {
    const record = this.store.get(identifier);
    if (!record) return 0;

    const remaining = record.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Pre-configured limiters
export const loginLimiter = new BackendRateLimiter(5, 60 * 1000); // 5 por minuto
export const chatLimiter = new BackendRateLimiter(30, 60 * 1000); // 30 por minuto
export const notificationLimiter = new BackendRateLimiter(10, 60 * 1000); // 10 por minuto
export const apiLimiter = new BackendRateLimiter(100, 60 * 1000); // 100 por minuto (genérico)

/**
 * Middleware para validar rate limit
 */
export function checkRateLimit(
  limiter: BackendRateLimiter,
  identifier: string
): { allowed: boolean; retryAfterMs?: number } {
  if (limiter.canProceed(identifier)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    retryAfterMs: limiter.getRemainingTime(identifier),
  };
}

/**
 * Response helper para rate limit exceeded
 */
export function rateLimitExceededResponse(retryAfterMs: number) {
  return Response.json(
    {
      error: "Limite de requisições excedido. Tente novamente em alguns momentos.",
      retryAfterMs,
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(retryAfterMs / 1000).toString(),
      },
    }
  );
}
