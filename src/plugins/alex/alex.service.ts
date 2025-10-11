import axios from 'axios';

/**
 * ALEX Lab Foundation Service
 * Comprehensive API service for ALEX DEX operations on Stacks
 * Based on official ALEX API documentation
 */
export class AlexService {
  private readonly apiUrl: string;
  private readonly network: 'mainnet' | 'testnet';

  // ALEX Contract Addresses
  private readonly contracts = {
    mainnet: {
      dao: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.executor-dao',
      vault: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault',
      reservePool: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-reserve-pool',
      ammPool: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1',
      fixedWeightPool: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.fixed-weight-pool-v1-01',
      swapRouter: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03',
      swapBridge: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-bridged',
      alexToken: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
      autoAlex: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.auto-alex'
    },
    testnet: {
      vault: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.alex-vault',
      reservePool: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.alex-reserve-pool',
      ammPool: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.amm-swap-pool-v1-1',
      fixedWeightPool: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.fixed-weight-pool-v1-02',
      swapHelper: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.swap-helper-v1-03',
      alexToken: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.age000-governance-token',
      autoAlex: 'ST29E61D211DD0HB0S0JSKZ05X0DSAJS5G5QSTXDX.auto-alex'
    }
  };

  constructor(network: 'mainnet' | 'testnet' = 'mainnet') {
    this.network = network;
    this.apiUrl = 'https://api.alexgo.io'; // Production API works for both networks
  }

  // ========================= SWAP OPERATIONS =========================

  /**
   * Get all available swap pairs with volumes and prices
   */
  async getAllSwaps() {
    const response = await axios.get(`${this.apiUrl}/v1/allswaps`);
    return response.data;
  }

  /**
   * Get all trading pairs
   */
  async getTradingPairs() {
    const response = await axios.get(`${this.apiUrl}/v1/pairs`);
    return response.data;
  }

  /**
   * Get market statistics for all pairs (24h data)
   */
  async getAllTickers() {
    const response = await axios.get(`${this.apiUrl}/v1/tickers`);
    return response.data;
  }

  /**
   * Get market statistics for specific ticker
   */
  async getTicker(tickerId: string) {
    const response = await axios.get(`${this.apiUrl}/v1/ticker/${encodeURIComponent(tickerId)}`);
    return response.data;
  }

  /**
   * Get historical trades for specific pool
   */
  async getHistoricalSwaps(poolTokenId: number, limit: number = 1000) {
    const response = await axios.get(`${this.apiUrl}/v1/historical_swaps/${poolTokenId}`, {
      params: { limit }
    });
    return response.data;
  }

  // ========================= PRICING DATA =========================

  /**
   * Get current token price
   */
  async getTokenPrice(tokenAddress: string) {
    const response = await axios.get(`${this.apiUrl}/v1/price/${encodeURIComponent(tokenAddress)}`);
    return response.data;
  }

  /**
   * Get token price history
   */
  async getTokenPriceHistory(
    tokenAddress: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: 'asc' | 'desc';
      startBlockHeight?: number;
      endBlockHeight?: number;
    } = {}
  ) {
    const response = await axios.get(`${this.apiUrl}/v1/price_history/${encodeURIComponent(tokenAddress)}`, {
      params: {
        limit: options.limit || 10,
        offset: options.offset || 0,
        order_by: options.orderBy || 'desc',
        start_block_height: options.startBlockHeight,
        end_block_height: options.endBlockHeight
      }
    });
    return response.data;
  }

  /**
   * Get 15-minute price history
   */
  async getTokenPriceHistory15Min(
    tokenAddress: string,
    startTs: number,
    endTs: number,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: 'asc' | 'desc';
    } = {}
  ) {
    const response = await axios.get(`${this.apiUrl}/v1/price_history_15min/${encodeURIComponent(tokenAddress)}`, {
      params: {
        start_ts: startTs,
        end_ts: endTs,
        limit: options.limit || 10,
        offset: options.offset || 0,
        order_by: options.orderBy || 'desc'
      }
    });
    return response.data;
  }

  // ========================= POOL OPERATIONS =========================

  /**
   * Get pool token price
   */
  async getPoolTokenPrice(poolTokenId: number) {
    const response = await axios.get(`${this.apiUrl}/v1/pool_token_price/${poolTokenId}`);
    return response.data;
  }

  /**
   * Get all pool token statistics
   */
  async getAllPoolTokenStats() {
    const response = await axios.get(`${this.apiUrl}/v1/pool_token_stats`);
    return response.data;
  }

  /**
   * Get detailed pool statistics
   */
  async getPoolStats(poolTokenId: number, limit: number = 10, offset: number = 0) {
    const response = await axios.get(`${this.apiUrl}/v1/pool_stats/${poolTokenId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * Get pool volume history (24h)
   */
  async getPoolVolume24h(poolTokenId: number, limit: number = 10, offset: number = 0) {
    const response = await axios.get(`${this.apiUrl}/v1/volume_24h/${poolTokenId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * Get pool volume history (7d)
   */
  async getPoolVolume7d(poolTokenId: number, limit: number = 10, offset: number = 0) {
    const response = await axios.get(`${this.apiUrl}/v1/volume_7d/${poolTokenId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * Get pool liquidity history
   */
  async getPoolLiquidity(poolTokenId: number, limit: number = 10, offset: number = 0) {
    const response = await axios.get(`${this.apiUrl}/v1/pool_liquidity/${poolTokenId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * Get pool fee history
   */
  async getPoolFees(poolTokenId: number, limit: number = 10, offset: number = 0) {
    const response = await axios.get(`${this.apiUrl}/v1/fee/${poolTokenId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  // ========================= TVL & STATISTICS =========================

  /**
   * Get total TVL across all ALEX pools
   */
  async getTotalTVL() {
    const response = await axios.get(`${this.apiUrl}/v1/stats/tvl`);
    return response.data;
  }

  /**
   * Get TVL for specific token
   */
  async getTokenTVL(tokenAddress: string, limit: number = 10, offset: number = 0) {
    const response = await axios.get(`${this.apiUrl}/v1/stats/tvl/${encodeURIComponent(tokenAddress)}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  /**
   * Get total supply for specific token
   */
  async getTokenTotalSupply(tokenName: string) {
    const response = await axios.get(`${this.apiUrl}/v1/stats/total_supply/${tokenName}`);
    return response.data;
  }

  /**
   * Get circulating supply for ALEX governance token
   */
  async getAlexCirculatingSupply() {
    const response = await axios.get(`${this.apiUrl}/v1/stats/circulating_supply/age000-governance-token`);
    return response.data;
  }

  // ========================= PUBLIC DATA =========================

  /**
   * Get all token prices
   */
  async getAllTokenPrices() {
    const response = await axios.get(`${this.apiUrl}/v2/public/token-prices`);
    return response.data;
  }

  /**
   * Get all pool information
   */
  async getAllPools() {
    const response = await axios.get(`${this.apiUrl}/v2/public/pools`);
    return response.data;
  }

  /**
   * Get AMM pool statistics
   */
  async getAmmPoolStats() {
    const response = await axios.get(`${this.apiUrl}/v1/public/amm-pool-stats`);
    return response.data;
  }

  /**
   * Get token mappings
   */
  async getTokenMappings() {
    const response = await axios.get(`${this.apiUrl}/v2/public/token-mappings`);
    return response.data;
  }

  // ========================= FLASH LOANS (CONTRACT INTERACTION) =========================

  /**
   * Prepare flash loan contract call information
   * Flash loans are executed directly on the vault contract, not through API
   */
  prepareFlashLoanContractCall(
    tokenAddress: string, 
    amount: string, 
    userAddress: string,
    memo?: string
  ) {
    const vaultAddress = this.getContractAddress('vault');
    
    // Calculate estimated fee (default 0.05% = 5000/100000000)
    const estimatedFeeRate = 5000; // This should be read from contract
    const amountBN = BigInt(amount);
    const feeBN = (amountBN * BigInt(estimatedFeeRate)) / BigInt(100000000);
    
    return {
      contractAddress: vaultAddress,
      contractName: 'amm-vault-v2-01',
      functionName: 'flash-loan',
      functionArgs: [
        userAddress, // flash-loan-user-trait (must implement flash-loan-trait)
        tokenAddress, // token-trait
        amount, // amount (uint)
        memo || null // memo (optional buff 16)
      ],
      requirements: {
        userMustBeApproved: true,
        tokenMustBeApproved: true,
        vaultMustNotBePaused: true,
        sufficientVaultBalance: true
      },
      estimatedFee: {
        amount: feeBN.toString(),
        totalRepayment: (amountBN + feeBN).toString(),
        feeRate: '0.05%'
      },
      network: this.network,
      notes: [
        'User must implement flash-loan-trait in their contract',
        'User must be pre-approved by ALEX DAO',
        'Token must be approved for flash loans',
        'User contract must repay loan + fee in same transaction'
      ]
    };
  }

  /**
   * Get flash loan contract information
   */
  getFlashLoanContractInfo() {
    const vaultAddress = this.getContractAddress('vault');
    
    return {
      vaultContract: vaultAddress,
      contractName: 'amm-vault-v2-01',
      flashLoanFunction: 'flash-loan',
      network: this.network,
      requirements: {
        approvedUsers: 'Users must be in approved-flash-loan-users datamap',
        approvedTokens: 'Tokens must be in approved-tokens datamap',
        vaultStatus: 'Vault must not be paused',
        userContract: 'User must implement flash-loan-trait',
        repayment: 'Must repay loan + fee in same transaction'
      },
      readOnlyFunctions: {
        'get-flash-loan-enabled': 'Check if flash loans are enabled',
        'get-flash-loan-fee-rate': 'Get current fee rate',
        'get-reserve': 'Check vault reserves for token',
        'is-paused': 'Check if vault is paused'
      },
      constants: {
        'ONE_8': '100000000', // 8 decimal precision
        'DEFAULT_FEE_RATE': '5000' // 0.05%
      }
    };
  }

  // ========================= CONTRACT ADDRESSES =========================

  /**
   * Get contract addresses for current network
   */
  getContractAddresses() {
    return this.contracts[this.network];
  }

  /**
   * Get specific contract address
   */
  getContractAddress(contractName: keyof typeof this.contracts.mainnet) {
    const contracts = this.contracts[this.network];
    return contracts[contractName] || null;
  }

  // ========================= SWAP EXECUTION =========================

  /**
   * Prepare swap execution parameters for 1-hop swap
   * Returns contract call information for swap-helper
   */
  prepareSwapExecution(params: {
    tokenX: string;
    tokenY: string;
    factor: number;
    dx: number;
    minDy?: number;
  }) {
    const ammPoolContract = this.contracts[this.network].ammPool;
    const [contractAddress, contractName] = ammPoolContract.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'swap-helper',
      functionArgs: {
        tokenX: params.tokenX,
        tokenY: params.tokenY,
        factor: params.factor,
        dx: params.dx,
        minDy: params.minDy || null
      },
      network: this.network,
      note: 'Execute swap via ALEX AMM Pool contract'
    };
  }

  /**
   * Prepare 2-hop swap execution (token-x/token-y -> token-y/token-z)
   * Returns contract call information for swap-helper-a
   */
  prepareSwap2Hop(params: {
    tokenX: string;
    tokenY: string;
    tokenZ: string;
    factorX: number;
    factorY: number;
    dx: number;
    minDz?: number;
  }) {
    const ammPoolContract = this.contracts[this.network].ammPool;
    const [contractAddress, contractName] = ammPoolContract.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'swap-helper-a',
      functionArgs: {
        tokenX: params.tokenX,
        tokenY: params.tokenY,
        tokenZ: params.tokenZ,
        factorX: params.factorX,
        factorY: params.factorY,
        dx: params.dx,
        minDz: params.minDz || null
      },
      network: this.network,
      note: 'Execute 2-hop swap via ALEX AMM Pool contract'
    };
  }

  /**
   * Prepare 3-hop swap execution (token-x/token-y -> token-y/token-z -> token-z/token-w)
   * Returns contract call information for swap-helper-b
   */
  prepareSwap3Hop(params: {
    tokenX: string;
    tokenY: string;
    tokenZ: string;
    tokenW: string;
    factorX: number;
    factorY: number;
    factorZ: number;
    dx: number;
    minDw?: number;
  }) {
    const ammPoolContract = this.contracts[this.network].ammPool;
    const [contractAddress, contractName] = ammPoolContract.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'swap-helper-b',
      functionArgs: {
        tokenX: params.tokenX,
        tokenY: params.tokenY,
        tokenZ: params.tokenZ,
        tokenW: params.tokenW,
        factorX: params.factorX,
        factorY: params.factorY,
        factorZ: params.factorZ,
        dx: params.dx,
        minDw: params.minDw || null
      },
      network: this.network,
      note: 'Execute 3-hop swap via ALEX AMM Pool contract'
    };
  }

  /**
   * Prepare 4-hop swap execution (token-x/token-y -> ... -> token-w/token-v)
   * Returns contract call information for swap-helper-c
   */
  prepareSwap4Hop(params: {
    tokenX: string;
    tokenY: string;
    tokenZ: string;
    tokenW: string;
    tokenV: string;
    factorX: number;
    factorY: number;
    factorZ: number;
    factorW: number;
    dx: number;
    minDv?: number;
  }) {
    const ammPoolContract = this.contracts[this.network].ammPool;
    const [contractAddress, contractName] = ammPoolContract.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'swap-helper-c',
      functionArgs: {
        tokenX: params.tokenX,
        tokenY: params.tokenY,
        tokenZ: params.tokenZ,
        tokenW: params.tokenW,
        tokenV: params.tokenV,
        factorX: params.factorX,
        factorY: params.factorY,
        factorZ: params.factorZ,
        factorW: params.factorW,
        dx: params.dx,
        minDv: params.minDv || null
      },
      network: this.network,
      note: 'Execute 4-hop swap via ALEX AMM Pool contract'
    };
  }
}