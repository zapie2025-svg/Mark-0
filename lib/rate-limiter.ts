import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  statusCode?: number
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs || 15 * 60 * 1000, // 15 minutes default
      max: config.max || 100, // 100 requests per window default
      message: config.message || 'Too many requests from this IP',
      statusCode: config.statusCode || 429,
    }
  }

  private getKey(request: NextRequest): string {
    // Use user ID if authenticated, otherwise use IP
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      // Extract user ID from token (simplified)
      return `user:${authHeader.slice(-10)}` // Use last 10 chars as identifier
    }
    
    // Fallback to IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return `ip:${ip}`
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    rateLimitStore.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      rateLimitStore.delete(key)
    })
  }

  public check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup()
    
    const key = this.getKey(request)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: now + this.config.windowMs
      }
    }

    if (current.count >= this.config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    // Increment count
    current.count++
    rateLimitStore.set(key, current)

    return {
      allowed: true,
      remaining: this.config.max - current.count,
      resetTime: current.resetTime
    }
  }

  public middleware() {
    return (request: NextRequest) => {
      const result = this.check(request)
      
      if (!result.allowed) {
        return NextResponse.json(
          { 
            error: this.config.message,
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          },
          { 
            status: this.config.statusCode,
            headers: {
              'X-RateLimit-Limit': this.config.max.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      return null // Continue to next middleware/handler
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'API rate limit exceeded. Please try again later.'
  }),

  // Post generation (more restrictive due to AI costs)
  postGeneration: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 AI generations per hour
    message: 'Post generation limit exceeded. Please try again in an hour.'
  }),

  // LinkedIn API calls (respect LinkedIn's rate limits)
  linkedin: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 LinkedIn API calls per hour
    message: 'LinkedIn API rate limit exceeded. Please try again later.'
  }),

  // Authentication attempts (prevent brute force)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 auth attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  })
}

// Utility function to apply rate limiting to API routes
export function withRateLimit(rateLimiter: RateLimiter) {
  return function(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function(request: NextRequest) {
      const rateLimitResult = rateLimiter.middleware()(request)
      if (rateLimitResult) {
        return rateLimitResult
      }
      
      return handler(request)
    }
  }
}
