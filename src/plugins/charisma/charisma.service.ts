/**
 * Charisma DEX & Blaze Protocol Service
 * Professional implementation with real API integration
 *
 * Features:
 * - DEX Quote & Swap routing via vault architecture
 * - Order Management (create, cancel, execute)
 * - API Key Management for automation
 * - Blaze Intent-based execution for subnet operations
 *
 * Base URLs:
 * - DEX API: https://swap.charisma.rocks/api/v1
 * - Blaze API: https://blaze.charisma.rocks/api
 */

export interface CharismaConfig {
  network?: 'mainnet' | 'testnet';
  apiKey?: string;
}

export interface QuoteParams {
  tokenIn: string;
  tokenOut: string;
  amount: number;
}

export interface QuoteResponse {
  success: boolean;
  data: {
    amountIn: number;
    amountOut: number;
    expectedPrice: number;
    minimumReceived: number;
    route: {
      hops: Array<{
        vault: string;
        opcode: number;
      }>;
    };
  };
}

export interface CreateOrderParams {
  owner: string;
  inputToken: string;
  outputToken: string;
  amountIn: string;
  targetPrice: string;
  direction: 'gt' | 'lt';
  conditionToken: string;
  recipient: string;
  signature: string;
  uuid: string;
  baseAsset?: string;
  validFrom?: string;
  validTo?: string;
}

export interface Order {
  uuid: string;
  owner: string;
  status: 'open' | 'filled' | 'cancelled' | 'expired';
  inputToken: string;
  outputToken: string;
  amountIn: string;
  targetPrice: string;
  direction: 'gt' | 'lt';
  conditionToken: string;
  recipient: string;
  createdAt: string;
  validFrom?: string;
  validTo?: string;
}

export interface ApiKeyParams {
  action: 'create_api_key' | 'list_api_keys' | 'delete_api_key';
  keyName?: string;
  permissions?: Array<'create' | 'execute' | 'cancel'>;
  keyId?: string;
  timestamp: number;
}

export interface ApiKeyResponse {
  apiKey?: string;
  keyId: string;
  name: string;
  permissions: string[];
  rateLimit: number;
  status?: string;
  createdAt?: string;
  usageStats?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    creationCount: number;
    executionCount: number;
    cancellationCount: number;
  };
}

export interface BlazeIntentParams {
  contractId: string;
  intent: string;
  signature: string;
  uuid: string;
  amountOptional?: number | null;
  targetOptional?: string | null;
  opcodeOptional?: string | null;
  network?: 'mainnet' | 'testnet';
}

export interface BlazeIntentResponse {
  success: boolean;
  message?: string;
  uuid?: string;
  error?: string;
}

/**
 * Professional Charisma Service
 * No mock data - all real API calls with proper error handling
 */
export class CharismaService {
  private readonly network: 'mainnet' | 'testnet';
  private readonly dexApiUrl: string;
  private readonly blazeApiUrl: string;
  private readonly apiKey?: string;

  constructor(config: CharismaConfig = {}) {
    this.network = config.network || 'mainnet';
    this.apiKey = config.apiKey;

    // Real API endpoints
    this.dexApiUrl = 'https://swap.charisma.rocks/api/v1';
    this.blazeApiUrl = 'https://blaze.charisma.rocks/api';
  }

  // ========================= DEX QUOTE & SWAP =========================

  /**
   * Get quote for token swap via vault routing
   */
  async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    const url = new URL(`${this.dexApiUrl}/quote`);
    url.searchParams.append('tokenIn', params.tokenIn);
    url.searchParams.append('tokenOut', params.tokenOut);
    url.searchParams.append('amount', params.amount.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get quote');
    }

    return await response.json();
  }

  // ========================= ORDER MANAGEMENT =========================

  /**
   * List all orders, optionally filtered by owner
   */
  async listOrders(owner?: string): Promise<{ status: string; data: Order[] }> {
    const url = new URL(`${this.dexApiUrl}/orders`);
    if (owner) {
      url.searchParams.append('owner', owner);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch orders');
    }

    return await response.json();
  }

  /**
   * Get single order by UUID
   */
  async getOrder(uuid: string): Promise<{ status: string; data: Order }> {
    const response = await fetch(`${this.dexApiUrl}/orders/${uuid}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Order not found: ${uuid}`);
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch order');
    }

    return await response.json();
  }

  /**
   * Create new limit/triggered order
   */
  async createOrder(params: CreateOrderParams): Promise<{ status: string; data: Order }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(`${this.dexApiUrl}/orders/new`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return await response.json();
  }

  /**
   * Cancel an open order
   */
  async cancelOrder(
    uuid: string,
    auth: { apiKey?: string; signature?: string; message?: string; walletAddress?: string }
  ): Promise<{ status: string; data: { uuid: string; status: string } }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth.apiKey) {
      headers['X-API-Key'] = auth.apiKey;
    }

    const body = auth.signature ? {
      message: auth.message || uuid,
      signature: auth.signature,
      walletAddress: auth.walletAddress
    } : undefined;

    const response = await fetch(`${this.dexApiUrl}/orders/${uuid}/cancel`, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel order');
    }

    return await response.json();
  }

  /**
   * Force execute an order immediately
   */
  async executeOrder(
    uuid: string,
    auth: { apiKey?: string; signature?: string; message?: string; walletAddress?: string }
  ): Promise<{ status: string; txid: string }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth.apiKey) {
      headers['X-API-Key'] = auth.apiKey;
    }

    const body = auth.signature ? {
      message: auth.message || uuid,
      signature: auth.signature,
      walletAddress: auth.walletAddress
    } : undefined;

    const response = await fetch(`${this.dexApiUrl}/orders/${uuid}/execute`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute order');
    }

    return await response.json();
  }

  // ========================= API KEY MANAGEMENT =========================

  /**
   * Create new API key for automation
   */
  async createApiKey(params: {
    message: string;
    signature: string;
    walletAddress: string;
  }): Promise<ApiKeyResponse> {
    const response = await fetch(`${this.dexApiUrl}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create API key');
    }

    return await response.json();
  }

  /**
   * List all API keys for wallet
   */
  async listApiKeys(params: {
    message: string;
    signature: string;
    walletAddress: string;
  }): Promise<{ apiKeys: ApiKeyResponse[] }> {
    const response = await fetch(`${this.dexApiUrl}/api-keys`, {
      method: 'GET',
      headers: {
        'X-Message': params.message,
        'X-Signature': params.signature,
        'X-Wallet-Address': params.walletAddress
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list API keys');
    }

    return await response.json();
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(params: {
    keyId: string;
    message: string;
    signature: string;
    walletAddress: string;
  }): Promise<{ message: string }> {
    const response = await fetch(`${this.dexApiUrl}/api-keys/${params.keyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: params.message,
        signature: params.signature,
        walletAddress: params.walletAddress
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to revoke API key');
    }

    return await response.json();
  }

  // ========================= BLAZE INTENT EXECUTION =========================

  /**
   * Execute Blaze intent for subnet operations
   */
  async executeIntent(params: BlazeIntentParams): Promise<BlazeIntentResponse> {
    const response = await fetch(`${this.blazeApiUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        network: params.network || this.network
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute intent');
    }

    return await response.json();
  }

  /**
   * Execute multihop swap via Blaze
   */
  async executeMultihopSwap(params: {
    contractId: string;
    signature: string;
    uuid: string;
    hops: Array<{
      vault: string;
      opcode: number;
    }>;
    amountIn: number;
    targetOptional?: string;
    network?: 'mainnet' | 'testnet';
  }): Promise<BlazeIntentResponse> {
    const response = await fetch(`${this.blazeApiUrl}/multihop-execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        network: params.network || this.network
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute multihop swap');
    }

    return await response.json();
  }

  // ========================= UTILITY METHODS =========================

  /**
   * Get network configuration
   */
  getNetworkInfo() {
    return {
      network: this.network,
      dexApiUrl: this.dexApiUrl,
      blazeApiUrl: this.blazeApiUrl,
      hasApiKey: !!this.apiKey
    };
  }
}