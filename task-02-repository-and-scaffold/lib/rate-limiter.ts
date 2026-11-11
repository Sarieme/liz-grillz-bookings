/**
 * In-Memory Sliding Window Rate Limiter
 * Tracks request timestamps keyed by client IP or composite identifier.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs?: number; // e.g. 15 minutes = 900,000 ms
  maxRequests?: number; // e.g. 5 requests
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const maxRequests = options.maxRequests || 5;
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Retain only timestamps within the current sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);

    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      retryAfterSec: Math.max(1, retryAfterSec),
    };
  }

  // Record this attempt
  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - activeTimestamps.length,
    retryAfterSec: 0,
  };
}

export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

