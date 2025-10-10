// ============================================================================
// TELEMETRY UTILITIES
// ============================================================================

import { Environment } from '../config/index.js';

export interface TelemetryEvent {
  action: string;
  network?: 'mainnet' | 'testnet' | 'devnet';
  contractAddress?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface RequestContext {
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

/**
 * Record telemetry events for usage tracking and analytics
 * Respects user privacy and can be disabled via environment variable
 */
export async function recordTelemetry(
  event: TelemetryEvent, 
  context?: RequestContext
): Promise<void> {
  // Skip telemetry if disabled
  if (!Environment.enableTelemetry()) {
    return;
  }

  const telemetryData = {
    timestamp: new Date().toISOString(),
    action: event.action,
    network: event.network,
    duration: event.duration,
    success: !event.error,
    error: event.error,
    metadata: {
      ...event.metadata,
      userAgent: context?.userAgent,
      sessionId: context?.sessionId,
    },
    // Never log sensitive data like private keys, addresses, etc.
    // Only log anonymized usage patterns
  };

  try {
    // In development, log to console
    if (Environment.isDevelopment() && Environment.enableDebugLogs()) {
      console.log('📊 Telemetry Event:', JSON.stringify(telemetryData, null, 2));
    }

    // In production, this could send to analytics service
    // Example: await sendToAnalyticsService(telemetryData);
    
  } catch (error) {
    // Never throw errors from telemetry - fail silently
    if (Environment.enableDebugLogs()) {
      console.warn('⚠️  Telemetry recording failed:', error);
    }
  }
}

/**
 * Create a telemetry wrapper for timing operations
 */
export function withTelemetry<T>(
  action: string,
  operation: () => Promise<T>,
  context?: RequestContext
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      await recordTelemetry({ action, duration }, context);
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await recordTelemetry({ 
        action, 
        duration, 
        error: errorMessage 
      }, context);
      
      reject(error);
    }
  });
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, Date.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      throw new Error(`Timer '${label}' was not started`);
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(label);
    
    if (Environment.enableDebugLogs()) {
      console.log(`⏱️  ${label}: ${duration}ms`);
    }
    
    return duration;
  }

  static async measure<T>(
    label: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    this.start(label);
    try {
      const result = await operation();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

/**
 * Usage analytics for different MCP operations
 */
export const Analytics = {
  // Account operations
  accountInfoRequested: (network: string, context?: RequestContext) =>
    recordTelemetry({ action: 'account_info_requested', network: network as any }, context),
  
  balanceChecked: (network: string, context?: RequestContext) =>
    recordTelemetry({ action: 'balance_checked', network: network as any }, context),
  
  transactionHistoryRequested: (network: string, context?: RequestContext) =>
    recordTelemetry({ action: 'transaction_history_requested', network: network as any }, context),

  // Contract operations
  contractCalled: (network: string, contractAddress: string, context?: RequestContext) =>
    recordTelemetry({ 
      action: 'contract_called', 
      network: network as any, 
      contractAddress 
    }, context),
  
  readOnlyFunctionCalled: (network: string, contractAddress: string, context?: RequestContext) =>
    recordTelemetry({ 
      action: 'read_only_function_called', 
      network: network as any, 
      contractAddress 
    }, context),

  // Token operations
  sip010BalanceChecked: (network: string, contractAddress: string, context?: RequestContext) =>
    recordTelemetry({ 
      action: 'sip010_balance_checked', 
      network: network as any, 
      contractAddress 
    }, context),
  
  sip009NftQueried: (network: string, contractAddress: string, context?: RequestContext) =>
    recordTelemetry({ 
      action: 'sip009_nft_queried', 
      network: network as any, 
      contractAddress 
    }, context),

  // Stacking operations
  stackingEligibilityChecked: (network: string, context?: RequestContext) =>
    recordTelemetry({ action: 'stacking_eligibility_checked', network: network as any }, context),
  
  stackingTransactionCreated: (network: string, context?: RequestContext) =>
    recordTelemetry({ action: 'stacking_transaction_created', network: network as any }, context),

  // Error tracking
  errorOccurred: (action: string, error: string, context?: RequestContext) =>
    recordTelemetry({ action: `${action}_error`, error }, context),

  // General usage
  toolUsed: (toolName: string, context?: RequestContext) =>
    recordTelemetry({ action: 'tool_used', metadata: { toolName } }, context),
  
  serverStarted: () =>
    recordTelemetry({ action: 'server_started', metadata: { version: process.env.npm_package_version } }),
  
  serverShutdown: () =>
    recordTelemetry({ action: 'server_shutdown' }),
};

/**
 * Export commonly used telemetry functions
 */
export { recordTelemetry as recordEvent };
export { withTelemetry as measureAsync };
export { PerformanceMonitor as perf };