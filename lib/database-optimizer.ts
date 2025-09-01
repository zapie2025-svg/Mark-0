import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Database connection pool configuration
const DB_CONFIG = {
  maxConnections: 20,
  idleTimeout: 30000, // 30 seconds
  connectionTimeout: 10000, // 10 seconds
  queryTimeout: 30000, // 30 seconds
}

// Query performance monitoring
interface QueryMetrics {
  query: string
  executionTime: number
  timestamp: Date
  userId?: string
  success: boolean
  error?: string
}

class DatabaseOptimizer {
  private queryMetrics: QueryMetrics[] = []
  private slowQueryThreshold = 2000 // 2 seconds
  private maxMetricsHistory = 1000

  // Track query performance
  public trackQuery(metrics: Omit<QueryMetrics, 'timestamp'>) {
    const fullMetrics: QueryMetrics = {
      ...metrics,
      timestamp: new Date()
    }

    this.queryMetrics.push(fullMetrics)

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory)
    }

    // Alert on slow queries
    if (metrics.executionTime > this.slowQueryThreshold) {
      console.warn(`🚨 Slow query detected: ${metrics.query} (${metrics.executionTime}ms)`)
      this.alertSlowQuery(fullMetrics)
    }
  }

  // Get performance statistics
  public getPerformanceStats() {
    const recentMetrics = this.queryMetrics.filter(
      m => m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    )

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        errorRate: 0
      }
    }

    const totalQueries = recentMetrics.length
    const averageExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
    const slowQueries = recentMetrics.filter(m => m.executionTime > this.slowQueryThreshold).length
    const errorRate = recentMetrics.filter(m => !m.success).length / totalQueries

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime),
      slowQueries,
      errorRate: Math.round(errorRate * 100) / 100
    }
  }

  // Optimize Supabase client with performance tracking
  public createOptimizedClient(supabaseUrl: string, supabaseKey: string): SupabaseClient {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'mark-0-optimized'
        }
      }
    })

    return client
  }

  private alertSlowQuery(metrics: QueryMetrics) {
    // In production, send to monitoring service (e.g., Sentry, DataDog)
    console.error(`🚨 Slow Query Alert:
      Query: ${metrics.query}
      Execution Time: ${metrics.executionTime}ms
      User: ${metrics.userId || 'unknown'}
      Timestamp: ${metrics.timestamp}
      Success: ${metrics.success}
      ${metrics.error ? `Error: ${metrics.error}` : ''}
    `)
  }

  // Get database health status
  public getHealthStatus() {
    const stats = this.getPerformanceStats()
    
    return {
      status: stats.errorRate > 0.05 ? 'warning' : 'healthy',
      metrics: stats,
      recommendations: this.getRecommendations(stats)
    }
  }

  private getRecommendations(stats: any) {
    const recommendations = []

    if (stats.averageExecutionTime > 1000) {
      recommendations.push('Consider adding database indexes for frequently queried columns')
    }

    if (stats.slowQueries > 10) {
      recommendations.push('Investigate slow queries and optimize database schema')
    }

    if (stats.errorRate > 0.01) {
      recommendations.push('High error rate detected. Check database connectivity and queries')
    }

    return recommendations
  }
}

// Export singleton instance
export const databaseOptimizer = new DatabaseOptimizer()

// Utility function to create optimized Supabase client
export function createOptimizedSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return databaseOptimizer.createOptimizedClient(supabaseUrl, supabaseKey)
}
