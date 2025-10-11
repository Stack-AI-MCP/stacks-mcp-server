/**
 * Velar Protocol Service
 * Multi-chain Bitcoin Layer-2 DEX integration
 *
 * Uses:
 * - Velar SDK (@velarprotocol/velar-sdk) for swap operations
 * - Velar API (https://api.velar.co) for price/pool data
 */

import { VelarSDK, getTokens, getTokensMeta, type SwapConfig, type ISwapService, type AmountOutResponse } from '@velarprotocol/velar-sdk';

export interface VelarConfig {
  network?: 'mainnet' | 'testnet';
}

export interface VelarSwapParams {
  account: string;
  inToken: string;
  outToken: string;
  amount: number;
  slippage?: number;
}

export interface VelarPriceHistoryParams {
  contractAddress: string;
  interval?: 'hour' | 'week' | 'month' | 'year';
}

/**
 * Velar Service - Professional implementation using SDK and API
 */
export class VelarService {
  private readonly network: 'mainnet' | 'testnet';
  private readonly apiBaseUrl: string;
  private readonly sdk: VelarSDK;

  // Velar contract addresses on Stacks mainnet
  private readonly CONTRACTS = {
    deployer: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1',
    core: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core',
    router: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router',
    library: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-library',
    velarToken: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token',
    burner: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.devnull',
  };

  constructor(config: VelarConfig = {}) {
    this.network = config.network || 'mainnet';
    this.apiBaseUrl = 'https://api.velar.co';
    this.sdk = new VelarSDK();
  }

  // ========================= SDK OPERATIONS =========================

  /**
   * Get trading pairs for a token
   */
  async getPairs(symbol: string): Promise<Array<string>> {
    return await this.sdk.getPairs(symbol);
  }

  /**
   * Get computed swap amount with routing
   */
  async getComputedAmount(params: VelarSwapParams): Promise<AmountOutResponse> {
    const swapInstance: ISwapService = await this.sdk.getSwapInstance({
      account: params.account,
      inToken: params.inToken,
      outToken: params.outToken,
    });

    return await swapInstance.getComputedAmount({
      amount: params.amount,
      slippage: params.slippage,
    });
  }

  /**
   * Get swap contract call parameters
   */
  async getSwapCallParams(params: VelarSwapParams) {
    const swapInstance: ISwapService = await this.sdk.getSwapInstance({
      account: params.account,
      inToken: params.inToken,
      outToken: params.outToken,
    });

    return await swapInstance.swap({
      amount: params.amount,
      slippage: params.slippage,
    });
  }

  /**
   * Execute swap transaction
   * Returns the swap contract call parameters for transaction execution
   */
  async executeSwap(params: VelarSwapParams) {
    // Get swap contract call parameters from SDK
    const swapCallData = await this.getSwapCallParams(params);

    return {
      contractCall: swapCallData,
      swapDetails: {
        account: params.account,
        inToken: params.inToken,
        outToken: params.outToken,
        amount: params.amount,
        slippage: params.slippage || 1
      },
      note: 'Use these contract call parameters to execute the swap transaction'
    };
  }

  /**
   * Get available tokens from SDK
   */
  async getTokensFromSDK() {
    return await getTokens();
  }

  /**
   * Get token metadata from SDK
   */
  async getTokensMetadata() {
    return await getTokensMeta();
  }

  // ========================= API OPERATIONS =========================

  /**
   * Get all tokens data (tickers)
   */
  async getAllTickers() {
    const response = await fetch(`${this.apiBaseUrl}/tickers`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tickers: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get token details
   */
  async getTokenDetails(symbol?: string) {
    const url = symbol
      ? `${this.apiBaseUrl}/tokens?symbol=${symbol}`
      : `${this.apiBaseUrl}/tokens`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch token details: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get VELAR circulating supply
   */
  async getCirculatingSupply() {
    const response = await fetch(`${this.apiBaseUrl}/circulating-supply`);

    if (!response.ok) {
      throw new Error(`Failed to fetch circulating supply: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get current prices
   */
  async getCurrentPrices() {
    const response = await fetch(`${this.apiBaseUrl}/prices`);

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get price by contract address
   */
  async getPriceByContract(contractAddress: string) {
    const response = await fetch(`${this.apiBaseUrl}/prices/${contractAddress}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${contractAddress}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get historical price data
   */
  async getHistoricalPrices(params: VelarPriceHistoryParams) {
    const interval = params.interval || 'week';
    const response = await fetch(
      `${this.apiBaseUrl}/prices/historical/${params.contractAddress}?interval=${interval}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch historical prices: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get all pools
   */
  async getAllPools() {
    const response = await fetch(`${this.apiBaseUrl}/pools`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pools: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get pool by LP token address
   */
  async getPoolByLPToken(lpTokenAddress: string) {
    const response = await fetch(`${this.apiBaseUrl}/pools/${lpTokenAddress}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pool for LP token ${lpTokenAddress}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get pool by token pair
   */
  async getPoolByTokenPair(token0: string, token1: string) {
    const response = await fetch(`${this.apiBaseUrl}/pools/${token0}/${token1}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch pool for pair ${token0}/${token1}: ${response.statusText}`);
    }

    return await response.json();
  }

  // ========================= UTILITY METHODS =========================

  /**
   * Get Velar contract addresses
   */
  getContractAddresses() {
    return this.CONTRACTS;
  }

  /**
   * Get network configuration
   */
  getNetworkInfo() {
    return {
      network: this.network,
      apiBaseUrl: this.apiBaseUrl,
      contracts: this.CONTRACTS,
      sdkVersion: '0.7.6',
    };
  }
}
