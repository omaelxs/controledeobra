/**
 * Client-side rate limiter using sliding window.
 * Prevents spam in chat, login attempts, etc.
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number, windowMs: number) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxAttempts) return false;
    this.timestamps.push(now);
    return true;
  }

  getRemainingTime(): number {
    if (this.timestamps.length === 0) return 0;
    const oldest = this.timestamps[0];
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }

  reset(): void {
    this.timestamps = [];
  }
}

// Pre-configured limiters
export const loginLimiter = new RateLimiter(5, 60 * 1000);      // 5 attempts per minute
export const chatLimiter = new RateLimiter(30, 60 * 1000);       // 30 messages per minute
export const notificationLimiter = new RateLimiter(10, 60 * 1000); // 10 per minute
