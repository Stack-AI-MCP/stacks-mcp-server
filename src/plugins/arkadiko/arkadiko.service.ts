import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  contractPrincipalCV,
  uintCV,
  stringUtf8CV,
  standardPrincipalCV,
  PostConditionMode,
  cvToJSON,
  someCV,
  noneCV,
  stringAsciiCV,
  intCV,
  getAddressFromPrivateKey
} from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';

export interface ArkadikoConfig {
  network?: 'mainnet' | 'testnet';
  contractAddress?: string;
}

export interface VaultInfo {
  id: number;
  owner: string;
  collateralType: string;
  collateralAmount: string;
  debtAmount: string;
  collateralizationRatio: string;
  liquidationPrice: string;
  status: string;
}

export interface SwapPair {
  tokenX: string;
  tokenY: string;
  lpToken: string;
  name: string;
  reserveX: string;
  reserveY: string;
  totalSupply: string;
}

export interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  votesFor: string;
  votesAgainst: string;
  startBlock: number;
  endBlock: number;
  executed: boolean;
  proposer: string;
}

export interface StakeInfo {
  staker: string;
  amount: string;
  reward: string;
  cooldownPeriod: number;
}

/**
 * Arkadiko Protocol Service
 * Comprehensive service for Arkadiko CDP protocol, DEX, governance, and staking
 * Uses direct Stacks.js integration following official script patterns
 */
export class ArkadikoService {
  private readonly networkName: 'mainnet' | 'testnet';
  private readonly contractAddress: string;

  // Core contract names from scripts analysis
  private readonly contracts = {
    // Vault System
    vaultsOperations: 'arkadiko-vaults-operations-v1-3',
    vaultsTokens: 'arkadiko-vaults-tokens-v1-1',
    vaultsData: 'arkadiko-vaults-data-v1-1',
    vaultsSorted: 'arkadiko-vaults-sorted-v1-1',
    vaultsPoolActive: 'arkadiko-vaults-pool-active-v1-1',
    vaultsHelpers: 'arkadiko-vaults-helpers-v1-1',
    
    // DEX System
    swap: 'arkadiko-swap-v2-1',
    
    // Governance System
    governance: 'arkadiko-governance-v2-1',
    stakePoolDiko: 'arkadiko-stake-pool-diko-v1-1',
    
    // Token Contracts
    dikoToken: 'arkadiko-token',
    usdaToken: 'usda-token',
    wrappedStx: 'wrapped-stx-token',
    
    // Oracle System
    oracle: 'arkadiko-oracle-v2-3',
    
    // Staking System
    stakingRewards: 'arkadiko-staking-rewards-v1-1',
    liquidationPool: 'arkadiko-liquidation-pool-v1-1'
  };

  constructor(config: ArkadikoConfig = {}) {
    this.networkName = config.network || 'mainnet';
    // Arkadiko is only deployed on mainnet - no public testnet deployment
    this.contractAddress = config.contractAddress || 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR';

    // Warn if trying to use testnet
    if (this.networkName === 'testnet' && !config.contractAddress) {
      console.warn('⚠️  Arkadiko is only deployed on mainnet. Testnet operations will fail unless using a local mocknet deployment.');
    }
  }

  // ========================= VAULT OPERATIONS =========================

  /**
   * Create new vault for minting USDA
   */
  async createVault(params: {
    collateralType: string;
    collateralAmount: number;
    debtAmount: number;
    prevHint?: string;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsTokens),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsData),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsSorted),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsPoolActive),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsHelpers),
      contractPrincipalCV(this.contractAddress, this.contracts.oracle),
      contractPrincipalCV(this.contractAddress, params.collateralType),
      uintCV(params.collateralAmount * 1000000), // Convert to microunits
      uintCV(params.debtAmount * 1000000),
      params.prevHint ? someCV(standardPrincipalCV(params.prevHint)) : noneCV()
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.vaultsOperations,
      functionName: 'open-vault',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Update existing vault
   */
  async updateVault(params: {
    vaultId: number;
    collateralType: string;
    collateralDelta: number;
    debtDelta: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsTokens),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsData),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsSorted),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsPoolActive),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsHelpers),
      contractPrincipalCV(this.contractAddress, this.contracts.oracle),
      contractPrincipalCV(this.contractAddress, params.collateralType),
      uintCV(params.vaultId),
      intCV(params.collateralDelta * 1000000),
      intCV(params.debtDelta * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.vaultsOperations,
      functionName: 'update-vault',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Close vault and repay debt
   */
  async closeVault(params: {
    vaultId: number;
    collateralType: string;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsTokens),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsData),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsSorted),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsPoolActive),
      contractPrincipalCV(this.contractAddress, params.collateralType),
      uintCV(params.vaultId)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.vaultsOperations,
      functionName: 'close-vault',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Get vault information
   */
  async getVaultInfo(vaultId: number, owner: string): Promise<VaultInfo> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contracts.vaultsData,
      functionName: 'get-vault',
      functionArgs: [uintCV(vaultId), standardPrincipalCV(owner)],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    const vaultData = cvToJSON(result).value || {};
    
    return {
      id: vaultId,
      owner,
      collateralType: vaultData.collateral?.value || '',
      collateralAmount: vaultData['collateral-amount']?.value || '0',
      debtAmount: vaultData.debt?.value || '0',
      collateralizationRatio: this.calculateCollateralizationRatio(
        vaultData['collateral-amount']?.value || '0',
        vaultData.debt?.value || '0'
      ),
      liquidationPrice: vaultData['liquidation-price']?.value || '0',
      status: vaultData.status?.value || 'unknown'
    };
  }

  /**
   * Liquidate under-collateralized vault
   */
  async liquidateVault(params: {
    vaultId: number;
    owner: string;
    collateralType: string;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsTokens),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsData),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsSorted),
      contractPrincipalCV(this.contractAddress, this.contracts.vaultsPoolActive),
      contractPrincipalCV(this.contractAddress, this.contracts.oracle),
      contractPrincipalCV(this.contractAddress, params.collateralType),
      uintCV(params.vaultId),
      standardPrincipalCV(params.owner)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.vaultsOperations,
      functionName: 'liquidate',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  // ========================= DEX/SWAP OPERATIONS =========================

  /**
   * Create new swap pair
   */
  async createSwapPair(params: {
    tokenX: string;
    tokenY: string;
    lpToken: string;
    pairName: string;
    initialXAmount: number;
    initialYAmount: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, params.tokenX),
      contractPrincipalCV(this.contractAddress, params.tokenY),
      contractPrincipalCV(this.contractAddress, params.lpToken),
      stringAsciiCV(params.pairName),
      uintCV(params.initialXAmount * 1000000),
      uintCV(params.initialYAmount * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.swap,
      functionName: 'create-pair',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.25 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Add liquidity to existing pair
   */
  async addLiquidity(params: {
    tokenX: string;
    tokenY: string;
    lpToken: string;
    xAmount: number;
    yAmount: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, params.tokenX),
      contractPrincipalCV(this.contractAddress, params.tokenY),
      contractPrincipalCV(this.contractAddress, params.lpToken),
      uintCV(params.xAmount * 1000000),
      uintCV(params.yAmount * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.swap,
      functionName: 'add-to-position',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Swap tokens
   */
  async swapTokens(params: {
    tokenX: string;
    tokenY: string;
    amountIn: number;
    minAmountOut: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, params.tokenX),
      contractPrincipalCV(this.contractAddress, params.tokenY),
      uintCV(params.amountIn * 1000000),
      uintCV(params.minAmountOut * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.swap,
      functionName: 'swap-x-for-y',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Get swap pair information
   */
  async getSwapPair(tokenX: string, tokenY: string): Promise<SwapPair> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contracts.swap,
      functionName: 'get-pair-details',
      functionArgs: [
        contractPrincipalCV(this.contractAddress, tokenX),
        contractPrincipalCV(this.contractAddress, tokenY)
      ],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    const pairData = cvToJSON(result).value || {};
    
    return {
      tokenX,
      tokenY,
      lpToken: pairData['lp-token']?.value || '',
      name: pairData.name?.value || '',
      reserveX: pairData['balance-x']?.value || '0',
      reserveY: pairData['balance-y']?.value || '0',
      totalSupply: pairData['total-supply']?.value || '0'
    };
  }

  /**
   * Get swap fees
   */
  async getSwapFees(tokenX: string, tokenY: string): Promise<{ feeX: string; feeY: string }> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contracts.swap,
      functionName: 'get-fees',
      functionArgs: [
        contractPrincipalCV(this.contractAddress, tokenX),
        contractPrincipalCV(this.contractAddress, tokenY)
      ],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    const feeData = cvToJSON(result).value || {};
    
    return {
      feeX: feeData['fee-x']?.value || '0',
      feeY: feeData['fee-y']?.value || '0'
    };
  }

  // ========================= GOVERNANCE OPERATIONS =========================

  /**
   * Create governance proposal
   */
  async createProposal(params: {
    title: string;
    description: string;
    startBlock: number;
    endBlock: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      stringUtf8CV(params.title),
      stringUtf8CV(params.description),
      uintCV(params.startBlock),
      uintCV(params.endBlock)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.governance,
      functionName: 'propose',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Vote on governance proposal
   */
  async voteOnProposal(params: {
    proposalId: number;
    voteAmount: number;
    support: boolean;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionName = params.support ? 'vote-for' : 'vote-against';
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.stakePoolDiko),
      contractPrincipalCV(this.contractAddress, this.contracts.dikoToken),
      uintCV(params.proposalId),
      uintCV(params.voteAmount * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.governance,
      functionName,
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.25 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Get governance proposal details
   */
  async getProposal(proposalId: number): Promise<GovernanceProposal> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contracts.governance,
      functionName: 'get-proposal',
      functionArgs: [uintCV(proposalId)],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    const proposalData = cvToJSON(result).value || {};
    
    return {
      id: proposalId,
      title: proposalData.title?.value || '',
      description: proposalData.description?.value || '',
      votesFor: proposalData['votes-for']?.value || '0',
      votesAgainst: proposalData['votes-against']?.value || '0',
      startBlock: parseInt(proposalData['start-block']?.value || '0'),
      endBlock: parseInt(proposalData['end-block']?.value || '0'),
      executed: proposalData.executed?.value || false,
      proposer: proposalData.proposer?.value || ''
    };
  }

  // ========================= STAKING OPERATIONS =========================

  /**
   * Stake DIKO tokens
   */
  async stakeDiko(params: {
    amount: number;
    lockPeriod: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.dikoToken),
      uintCV(params.amount * 1000000),
      uintCV(params.lockPeriod)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.stakePoolDiko,
      functionName: 'stake',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Unstake DIKO tokens
   */
  async unstakeDiko(params: {
    amount: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.dikoToken),
      uintCV(params.amount * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.stakePoolDiko,
      functionName: 'unstake',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Claim staking rewards
   */
  async claimStakingRewards(params: {
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      contractPrincipalCV(this.contractAddress, this.contracts.dikoToken)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.stakePoolDiko,
      functionName: 'claim-pending-rewards',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  /**
   * Get stake information for address
   */
  async getStakeInfo(staker: string): Promise<StakeInfo> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contracts.stakePoolDiko,
      functionName: 'get-stake-of',
      functionArgs: [standardPrincipalCV(staker)],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    const stakeData = cvToJSON(result).value || {};
    
    return {
      staker,
      amount: stakeData.amount?.value || '0',
      reward: stakeData.reward?.value || '0',
      cooldownPeriod: parseInt(stakeData.cooldown?.value || '0')
    };
  }

  // ========================= TOKEN OPERATIONS =========================

  /**
   * Get token balance
   */
  async getTokenBalance(tokenContract: string, address: string): Promise<string> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: tokenContract,
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    return cvToJSON(result).value?.value || '0';
  }

  /**
   * Get token total supply
   */
  async getTokenTotalSupply(tokenContract: string): Promise<string> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: tokenContract,
      functionName: 'get-total-supply',
      functionArgs: [],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    return cvToJSON(result).value?.value || '0';
  }

  /**
   * Burn USDA tokens
   */
  async burnUsda(params: {
    amount: number;
    senderKey: string;
  }) {
    const nonce = await this.getNonce(this.getAddressFromPrivateKey(params.senderKey));
    
    const functionArgs = [
      uintCV(params.amount * 1000000)
    ];

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contracts.usdaToken,
      functionName: 'burn',
      functionArgs,
      senderKey: params.senderKey,
      nonce: nonce,
      fee: 0.1 * 1000000,
      postConditionMode: PostConditionMode.Allow,
      network: this.networkName
    };

    const transaction = await makeContractCall(txOptions);
    return await broadcastTransaction({ transaction, network: this.networkName });
  }

  // ========================= ORACLE OPERATIONS (READ-ONLY) =========================

  /**
   * Get token price from oracle
   */
  async getTokenPrice(tokenId: number): Promise<{ price: string; decimals: string }> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contracts.oracle,
      functionName: 'get-price',
      functionArgs: [uintCV(tokenId)],
      senderAddress: this.contractAddress,
      network: this.networkName
    });

    const priceData = cvToJSON(result).value || {};
    
    return {
      price: priceData.price?.value || '0',
      decimals: priceData.decimals?.value || '0'
    };
  }

  // ========================= UTILITY METHODS =========================

  /**
   * Get current nonce for address
   */
  private async getNonce(address: string): Promise<number> {
    const apiUrl = this.networkName === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';
    const url = `${apiUrl}/v2/accounts/${address}?proof=0`;
    const response = await fetch(url);
    const data = await response.json();
    return data.nonce || 0;
  }

  /**
   * Get address from private key
   */
  private getAddressFromPrivateKey(privateKey: string): string {
    return getAddressFromPrivateKey(privateKey, this.networkName);
  }

  /**
   * Calculate collateralization ratio
   */
  private calculateCollateralizationRatio(collateralAmount: string, debtAmount: string): string {
    const collateral = parseInt(collateralAmount);
    const debt = parseInt(debtAmount);
    
    if (debt === 0) return '∞';
    
    const ratio = (collateral / debt) * 100;
    return `${ratio.toFixed(2)}%`;
  }

  /**
   * Get network configuration
   */
  getNetworkInfo() {
    return {
      network: this.networkName,
      contractAddress: this.contractAddress,
      contracts: this.contracts,
      apiUrl: this.networkName === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so'
    };
  }
}