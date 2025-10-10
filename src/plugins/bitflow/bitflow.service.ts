import { BitflowSDK, Token, SwapOptions, SelectedSwapRoute, QuoteResult, SwapExecutionData, GetKeeperContractParams, CreateOrderParams, GetQuoteParams, CreateGroupOrderParams, KeeperType } from '@bitflowlabs/core-sdk';

/**
 * Bitflow DEX Service
 * Service wrapper around the official Bitflow SDK
 * Provides additional utilities and network-specific configurations
 */
export class BitflowService {
  private readonly sdk: BitflowSDK;
  private readonly network: 'mainnet' | 'testnet';

  // Bitflow Contract Addresses for reference
  private readonly contracts = {
    mainnet: {
      // StableSwap Pools
      stableSwapPools: {
        'USDA-sUSDT': 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core',
        'STX-stSTX': 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stableswap-stx-ststx-v-1-2',
        'aBTC-xBTC': 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stableswap-abtc-xbtc-v-1-1',
        'DIKO-sDIKO': 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stableswap-diko-sdiko-v-1-1'
      },
      // XYK (Constant Product) Pools
      xykPools: {
        core: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core',
        router: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router',
        factory: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-factory'
      },
      // Keeper System
      keeper: {
        multiAction: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.keeper-multi-action-v-1-3',
        registry: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.keeper-registry-v-1-1'
      },
      // Bridge & Cross-chain
      bridge: {
        pontis: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pBTC',
        sBTC: 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.sbtc-token'
      },
      // LP Token Staking
      staking: {
        stakingRewards: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.staking-rewards-v-1-2',
        xykFarms: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.xyk-farms-v-1-1'
      }
    },
    testnet: {
      // Similar structure for testnet contracts
      stableSwapPools: {
        'USDA-sUSDT': 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-core'
      },
      xykPools: {
        core: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-core',
        router: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-router',
        factory: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-factory'
      },
      keeper: {
        multiAction: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.keeper-multi-action-v-1-3'
      }
    }
  };

  constructor(
    network: 'mainnet' | 'testnet' = 'mainnet',
    sdkConfig?: {
      BITFLOW_API_HOST?: string;
      BITFLOW_API_KEY?: string;
      BITFLOW_PROVIDER_ADDRESS?: string;
      READONLY_CALL_API_HOST?: string;
      READONLY_CALL_API_KEY?: string;
      KEEPER_API_KEY?: string;
      KEEPER_API_HOST?: string;
    }
  ) {
    this.network = network;
    
    // Initialize the official Bitflow SDK
    // If no config provided, SDK will use environment variables
    // The SDK will handle missing optional config parameters gracefully
    this.sdk = new BitflowSDK(sdkConfig as any);
  }

  // ========================= CORE SDK METHODS =========================

  /**
   * Get all available tokens on Bitflow
   */
  async getAvailableTokens(): Promise<Token[]> {
    return await this.sdk.getAvailableTokens();
  }

  /**
   * Get all possible swap options for a given token
   */
  async getPossibleSwaps(tokenXId: string): Promise<SwapOptions> {
    return await this.sdk.getPossibleSwaps(tokenXId);
  }

  /**
   * Get all possible tokens that can be swapped for a given token
   */
  async getAllPossibleTokenY(tokenXId: string): Promise<string[]> {
    return await this.sdk.getAllPossibleTokenY(tokenXId);
  }

  /**
   * Get all possible routes for swapping between two tokens
   */
  async getAllPossibleTokenYRoutes(tokenXId: string, tokenYId: string): Promise<SelectedSwapRoute[]> {
    return await this.sdk.getAllPossibleTokenYRoutes(tokenXId, tokenYId);
  }

  // ========================= SWAP OPERATIONS =========================

  /**
   * Get quote for a swap route
   */
  async getQuoteForRoute(tokenXId: string, tokenYId: string, amount: number): Promise<QuoteResult> {
    return await this.sdk.getQuoteForRoute(tokenXId, tokenYId, amount);
  }

  /**
   * Get swap parameters for transaction signing
   */
  async getSwapParams(
    swapExecutionData: SwapExecutionData,
    senderAddress: string,
    slippageTolerance: number
  ) {
    return await this.sdk.getSwapParams(swapExecutionData, senderAddress, slippageTolerance);
  }

  /**
   * Execute swap using Stacks Connect (requires StacksProvider)
   * This method would be used in frontend applications with wallet integration
   */
  async prepareSwapExecution(
    swapExecutionData: SwapExecutionData,
    senderAddress: string,
    slippageTolerance: number
  ) {
    // Return swap preparation data that can be used to execute the swap
    // The actual execution requires a StacksProvider from @stacks/connect
    const swapParams = await this.getSwapParams(swapExecutionData, senderAddress, slippageTolerance);
    
    return {
      swapParams,
      swapExecutionData,
      senderAddress,
      slippageTolerance,
      network: this.network,
      note: 'Use sdk.executeSwap() with a StacksProvider to execute this swap'
    };
  }

  // ========================= KEEPER OPERATIONS =========================

  /**
   * Get or create a keeper contract
   */
  async getOrCreateKeeperContract(params: {
    stacksAddress: string;
    keeperType: KeeperType;
    bitcoinAddress?: string;
    deployContract?: boolean;
    allActionsApproved?: boolean;
  }) {
    const keeperParams: GetKeeperContractParams = {
      stacksAddress: params.stacksAddress,
      keeperType: params.keeperType,
      bitcoinAddress: params.bitcoinAddress,
      deployContract: params.deployContract,
      allActionsApproved: params.allActionsApproved
    };
    return await this.sdk.getOrCreateKeeperContract(keeperParams);
  }

  /**
   * Create a new keeper order
   */
  async createKeeperOrder(params: {
    contractIdentifier: string;
    stacksAddress: string;
    keeperType: KeeperType;
    actionType: string;
    fundingTokens?: Record<string, string>;
    actionAggregatorTokens?: {
      tokenXId: string;
      tokenYId: string;
    };
    minReceived?: {
      amount: string;
      autoAdjust: boolean;
    };
    feeRecipient?: string;
    actionAmount?: string;
    bitcoinTxId?: string;
    stacksTxId?: string;
    actionFunctionArgs?: {
      tokenList?: Record<string, string>;
      xykPoolList?: Record<string, string>;
      stableswapPoolList?: Record<string, string>;
      boolList?: Record<string, string>;
    };
    actionPostConditions?: any[];
    bitcoinAddress?: string;
    cancelOrderAfter?: Date;
  }) {
    const orderParams: CreateOrderParams = {
      stacksAddress: params.stacksAddress,
      keeperType: params.keeperType,
      contractIdentifier: params.contractIdentifier,
      actionType: params.actionType,
      fundingTokens: params.fundingTokens,
      actionAggregatorTokens: params.actionAggregatorTokens,
      minReceived: params.minReceived,
      feeRecipient: params.feeRecipient,
      actionAmount: params.actionAmount,
      bitcoinTxId: params.bitcoinTxId || '',
      bitcoinAddress: params.bitcoinAddress,
      actionFunctionArgs: params.actionFunctionArgs
    };
    return await this.sdk.createOrder(orderParams);
  }

  /**
   * Get keeper order details
   */
  async getKeeperOrder(orderId: string) {
    return await this.sdk.getOrder(orderId);
  }

  /**
   * Get user information with keeper contracts and orders
   */
  async getKeeperUser(stacksAddress: string) {
    return await this.sdk.getUser(stacksAddress);
  }

  /**
   * Get quote for keeper action
   */
  async getKeeperQuote(params: {
    stacksAddress: string;
    actionAmount: string;
    keeperType: KeeperType;
    actionType?: string;
    tokenXId?: string;
    tokenYId?: string;
    minReceived?: {
      amount: string;
      autoAdjust: boolean;
    };
    feeRecipient?: string;
    bitcoinAddress?: string;
  }) {
    const quoteParams: GetQuoteParams = {
      stacksAddress: params.stacksAddress,
      actionAmount: params.actionAmount,
      keeperType: params.keeperType,
      actionType: params.actionType,
      tokenXId: params.tokenXId,
      tokenYId: params.tokenYId,
      minReceived: params.minReceived,
      feeRecipient: params.feeRecipient,
      bitcoinAddress: params.bitcoinAddress
    };
    return await this.sdk.getQuote(quoteParams);
  }

  /**
   * Create group order for scheduled execution
   */
  async createGroupOrder(params: {
    stacksAddress: string;
    amountPerOrder: number;
    numberOfOrders: number;
    executionFrequency: number;
    feeRecipient?: string;
    fundingTokens: Record<string, string>;
    bitcoinTxId?: string;
    stacksTxId?: string;
    keeperType: KeeperType;
    actionType?: string;
    actionAggregatorTokens?: {
      tokenXId: string;
      tokenYId: string;
    };
    minReceived?: {
      amount: string;
      autoAdjust: boolean;
    };
    bitcoinAddress?: string;
    nextExecutionAfter?: Date;
    priceRange?: {
      amount: string;
      minPrice: string;
      maxPrice: string;
    };
  }) {
    const groupOrderParams: CreateGroupOrderParams = {
      stacksAddress: params.stacksAddress,
      amountPerOrder: params.amountPerOrder,
      numberOfOrders: params.numberOfOrders,
      executionFrequency: params.executionFrequency,
      feeRecipient: params.feeRecipient || '',
      fundingTokens: params.fundingTokens,
      bitcoinTxId: params.bitcoinTxId,
      stacksTxId: params.stacksTxId,
      keeperType: params.keeperType,
      actionType: params.actionType,
      actionAggregatorTokens: params.actionAggregatorTokens,
      minReceived: params.minReceived || {
        amount: '0',
        autoAdjust: true
      },
      bitcoinAddress: params.bitcoinAddress,
      nextExecutionAfter: params.nextExecutionAfter,
      priceRange: params.priceRange
    };
    return await this.sdk.createGroupOrder(groupOrderParams);
  }

  /**
   * Get group order details
   */
  async getGroupOrder(groupOrderId: string, includeOrders?: boolean) {
    return await this.sdk.getGroupOrder(groupOrderId, includeOrders);
  }

  /**
   * Cancel keeper order
   */
  async cancelKeeperOrder(orderId: string) {
    return await this.sdk.cancelOrder(orderId);
  }

  /**
   * Cancel group order
   */
  async cancelGroupOrder(groupOrderId: string) {
    return await this.sdk.cancelGroupOrder(groupOrderId);
  }

  // ========================= KEEPER TOKEN OPERATIONS =========================

  /**
   * Get available tokens for keeper operations
   */
  async getKeeperTokens() {
    return await this.sdk.getKeeperTokens();
  }

  /**
   * Get possible keeper swaps for a token
   */
  async getKeeperPossibleSwaps(tokenXId: string) {
    return await this.sdk.getKeeperPossibleSwaps(tokenXId);
  }

  /**
   * Get all possible keeper token Y options
   */
  async getAllKeeperPossibleTokenY(tokenXId: string) {
    return await this.sdk.getAllKeeperPossibleTokenY(tokenXId);
  }

  /**
   * Get all possible keeper token Y routes
   */
  async getAllKeeperPossibleTokenYRoutes(tokenXId: string, tokenYId: string) {
    return await this.sdk.getAllKeeperPossibleTokenYRoutes(tokenXId, tokenYId);
  }

  /**
   * Get keeper quote for route
   */
  async getKeeperQuoteForRoute(tokenXId: string, tokenYId: string, amount: number) {
    return await this.sdk.getKeeperQuoteForRoute(tokenXId, tokenYId, amount);
  }

  // ========================= ADDITIONAL UTILITY METHODS =========================

  /**
   * Get network configuration
   */
  getNetworkInfo() {
    return {
      network: this.network,
      contracts: this.contracts[this.network],
      sdkVersion: '2.4.0'
    };
  }

  /**
   * Get supported token formats and examples
   */
  getTokenFormats() {
    return {
      supportedFormats: [
        'token-stx',
        'token-usda', 
        'token-susdt',
        'token-pbtc',
        'token-sbtc',
        'token-alex',
        'token-diko'
      ],
      examples: {
        'token-stx': 'Stacks Token',
        'token-usda': 'USDA Stablecoin',
        'token-susdt': 'Synthetic USDT',
        'token-pbtc': 'Pontis Bridged BTC',
        'token-sbtc': 'Synthetic BTC'
      },
      note: 'Use these token IDs with SDK methods'
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
  getContractAddress(category: keyof typeof this.contracts.mainnet, contractName: string) {
    const categoryContracts = this.contracts[this.network][category] as any;
    return categoryContracts?.[contractName] || null;
  }

  /**
   * Get all StableSwap pool addresses
   */
  getStableSwapPools() {
    return this.contracts[this.network].stableSwapPools;
  }

  /**
   * Get all XYK pool addresses
   */
  getXYKPools() {
    return this.contracts[this.network].xykPools;
  }
}