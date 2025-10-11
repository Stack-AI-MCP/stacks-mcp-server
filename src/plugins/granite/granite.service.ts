/**
 * Granite Protocol Service
 * Bitcoin-native lending protocol on Stacks with sBTC collateral
 *
 * Core Features:
 * - Borrowing: Deposit BTC collateral, borrow stablecoins
 * - Liquidity Provision: Supply stablecoins, earn yield
 * - Staking: Stake LP tokens for additional rewards
 * - Liquidations: Liquidate undercollateralized positions
 * - Governance: Propose and vote on protocol changes
 * - Flash Loans: Uncollateralized loans for single-transaction use
 */

export interface GraniteConfig {
  network?: 'mainnet' | 'testnet';
}

// Borrower operations
export interface BorrowParams {
  amount: number;
  pythPriceFeedData?: string; // hex-encoded Pyth price data
}

export interface RepayParams {
  amount: number;
  onBehalfOf?: string;
}

export interface AddCollateralParams {
  collateralToken: string;
  amount: number;
  user?: string;
}

export interface RemoveCollateralParams {
  collateralToken: string;
  amount: number;
  pythPriceFeedData?: string;
  user?: string;
}

// Liquidity Provider operations
export interface DepositParams {
  assets: number;
  recipient: string;
}

export interface WithdrawParams {
  assets: number;
  recipient: string;
}

export interface RedeemParams {
  shares: number;
  recipient: string;
}

// Staking operations
export interface StakeParams {
  lpTokens: number;
}

export interface UnstakeParams {
  stakedLpTokens: number;
}

// Liquidation operations
export interface LiquidateParams {
  collateralToken: string;
  user: string;
  liquidatorRepayAmount: number;
  minCollateralExpected: number;
  pythPriceFeedData?: string;
}

// Flash Loan operations
export interface FlashLoanParams {
  amount: number;
  callbackContract: string;
  data?: string;
}

// Governance operations
export interface ProposalParams {
  expiresIn: number;
  cooldown?: number;
}

/**
 * Granite Service
 * Professional implementation for Bitcoin lending protocol
 */
export class GraniteService {
  private readonly network: 'mainnet' | 'testnet';

  // Granite contract addresses on mainnet
  private readonly CONTRACTS = {
    mainnet: {
      // Core contracts
      constantsV1: 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.constants-v1',
      constantsV2: 'SP3BJR4P3W2Y9G22HA595Z59VHBC9EQYRFWSKG743.constants-v2',
      state: 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.state-v1',

      // Main modules
      borrower: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.borrower-v1',
      liquidityProvider: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.liquidity-provider-v1',
      staking: 'SP3BJR4P3W2Y9G22HA595Z59VHBC9EQYRFWSKG743.staking-v1',
      liquidator: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.liquidator-v1',
      flashLoan: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.flash-loan-v1',
      governance: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.governance-v1',
      metaGovernance: 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.meta-governance-v1',

      // Supporting modules
      withdrawalCaps: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.withdrawal-caps-v1',
      linearKinkedIr: 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.linear-kinked-ir-v1',
      pythAdapter: 'SP26NGV9AFZBX7XBDBS2C7EC7FCPSAV9PKREQNMVS.pyth-adapter-v1',
      math: 'SP35E2BBMDT2Y1HB0NTK139YBGYV3PAPK3WA8BRNA.math-v1',
    },
    testnet: {
      // Testnet contracts would be similar structure
      constantsV1: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.constants-v1',
      constantsV2: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.constants-v2',
      state: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.state-v1',
      borrower: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.borrower-v1',
      liquidityProvider: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.liquidity-provider-v1',
      staking: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.staking-v1',
      liquidator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.liquidator-v1',
      flashLoan: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.flash-loan-v1',
      governance: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.governance-v1',
      metaGovernance: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.meta-governance-v1',
      withdrawalCaps: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.withdrawal-caps-v1',
      linearKinkedIr: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.linear-kinked-ir-v1',
      pythAdapter: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.pyth-adapter-v1',
      math: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.math-v1',
    }
  };

  constructor(config: GraniteConfig = {}) {
    this.network = config.network || 'mainnet';
  }

  // ========================= BORROWER OPERATIONS =========================

  /**
   * Prepare borrow operation - deposit collateral and borrow stablecoins
   */
  prepareBorrow(params: BorrowParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].borrower.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'borrow',
      functionArgs: {
        pythPriceFeedData: params.pythPriceFeedData || null,
        amount: params.amount,
        maybeUser: null // defaults to tx-sender
      },
      network: this.network,
      note: 'Borrow stablecoins against BTC collateral. Requires collateral to be deposited first.'
    };
  }

  /**
   * Prepare repay operation - repay borrowed stablecoins
   */
  prepareRepay(params: RepayParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].borrower.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'repay',
      functionArgs: {
        amount: params.amount,
        onBehalfOf: params.onBehalfOf || null
      },
      network: this.network,
      note: 'Repay borrowed stablecoins. Can repay on behalf of another user.'
    };
  }

  /**
   * Prepare add collateral operation
   */
  prepareAddCollateral(params: AddCollateralParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].borrower.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'add-collateral',
      functionArgs: {
        collateral: params.collateralToken,
        amount: params.amount,
        maybeUser: params.user || null
      },
      network: this.network,
      note: 'Deposit BTC (sBTC) as collateral to enable borrowing'
    };
  }

  /**
   * Prepare remove collateral operation
   */
  prepareRemoveCollateral(params: RemoveCollateralParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].borrower.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'remove-collateral',
      functionArgs: {
        pythPriceFeedData: params.pythPriceFeedData || null,
        collateral: params.collateralToken,
        amount: params.amount,
        maybeUser: params.user || null
      },
      network: this.network,
      note: 'Withdraw collateral. Must maintain healthy collateralization ratio.'
    };
  }

  // ========================= LIQUIDITY PROVIDER OPERATIONS =========================

  /**
   * Prepare deposit operation - supply stablecoins to earn yield
   */
  prepareDeposit(params: DepositParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].liquidityProvider.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'deposit',
      functionArgs: {
        assets: params.assets,
        recipient: params.recipient
      },
      network: this.network,
      note: 'Deposit stablecoins to earn passive yield from borrower interest'
    };
  }

  /**
   * Prepare withdraw operation - withdraw supplied stablecoins
   */
  prepareWithdraw(params: WithdrawParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].liquidityProvider.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'withdraw',
      functionArgs: {
        assets: params.assets,
        recipient: params.recipient
      },
      network: this.network,
      note: 'Withdraw supplied assets plus earned interest'
    };
  }

  /**
   * Prepare redeem operation - redeem LP tokens for assets
   */
  prepareRedeem(params: RedeemParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].liquidityProvider.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'redeem',
      functionArgs: {
        shares: params.shares,
        recipient: params.recipient
      },
      network: this.network,
      note: 'Redeem LP tokens for underlying stablecoin assets'
    };
  }

  // ========================= STAKING OPERATIONS =========================

  /**
   * Prepare stake operation - stake LP tokens for additional rewards
   */
  prepareStake(params: StakeParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].staking.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'stake',
      functionArgs: {
        lpTokens: params.lpTokens
      },
      network: this.network,
      note: 'Stake LP tokens to earn additional rewards'
    };
  }

  /**
   * Prepare initiate unstake operation - start unstaking process
   */
  prepareInitiateUnstake(params: UnstakeParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].staking.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'initiate-unstake',
      functionArgs: {
        stakedLpTokens: params.stakedLpTokens
      },
      network: this.network,
      note: 'Initiate unstaking. Must wait finalization period before finalizing.'
    };
  }

  /**
   * Prepare finalize unstake operation
   */
  prepareFinalizeUnstake(index: number) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].staking.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'finalize-unstake',
      functionArgs: {
        index
      },
      network: this.network,
      note: 'Finalize unstaking after waiting period expires'
    };
  }

  // ========================= LIQUIDATION OPERATIONS =========================

  /**
   * Prepare liquidate operation - liquidate undercollateralized position
   */
  prepareLiquidate(params: LiquidateParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].liquidator.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'liquidate-collateral',
      functionArgs: {
        pythPriceFeedData: params.pythPriceFeedData || null,
        collateral: params.collateralToken,
        user: params.user,
        liquidatorRepayAmount: params.liquidatorRepayAmount,
        minCollateralExpected: params.minCollateralExpected
      },
      network: this.network,
      note: 'Liquidate undercollateralized borrower position for profit'
    };
  }

  // ========================= FLASH LOAN OPERATIONS =========================

  /**
   * Prepare flash loan operation
   */
  prepareFlashLoan(params: FlashLoanParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].flashLoan.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'flash-loan',
      functionArgs: {
        amount: params.amount,
        callback: params.callbackContract,
        data: params.data || null
      },
      network: this.network,
      note: 'Execute flash loan. Must repay + fee in same transaction via callback.'
    };
  }

  /**
   * Get flash loan contract info
   */
  getFlashLoanInfo() {
    return {
      contract: this.CONTRACTS[this.network].flashLoan,
      network: this.network,
      requirements: {
        callbackContract: 'Must implement flash-loan callback trait',
        repayment: 'Must repay loan + fee in same transaction',
        fee: 'Fee percentage applied to loan amount',
        singleTransaction: 'All operations must complete in one transaction'
      },
      useCases: [
        'Arbitrage between DEXes',
        'Liquidation with borrowed capital',
        'Collateral swaps',
        'Refinancing positions'
      ]
    };
  }

  // ========================= GOVERNANCE OPERATIONS =========================

  /**
   * Prepare governance proposal - set market feature
   */
  prepareProposalSetMarketFeature(action: number, feature: boolean, params: ProposalParams) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].governance.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'initiate-proposal-to-set-market-feature',
      functionArgs: {
        action,
        feature,
        expiresIn: params.expiresIn,
        cooldown: params.cooldown || 0
      },
      network: this.network,
      note: 'Propose to enable/disable market features'
    };
  }

  /**
   * Prepare governance proposal - update interest rate parameters
   */
  prepareProposalUpdateInterestParams(
    irSlope1: number,
    irSlope2: number,
    utilizationKink: number,
    baseIr: number,
    expiresIn: number
  ) {
    const [contractAddress, contractName] = this.CONTRACTS[this.network].governance.split('.');

    return {
      contractAddress,
      contractName,
      functionName: 'initiate-proposal-to-update-interest-params',
      functionArgs: {
        irSlope1Val: irSlope1,
        irSlope2Val: irSlope2,
        utilizationKinkVal: utilizationKink,
        baseIrVal: baseIr,
        expiresIn
      },
      network: this.network,
      note: 'Propose to update lending interest rate curve parameters'
    };
  }

  // ========================= UTILITY METHODS =========================

  /**
   * Get Granite contract addresses
   */
  getContractAddresses() {
    return this.CONTRACTS[this.network];
  }

  /**
   * Get network configuration
   */
  getNetworkInfo() {
    return {
      network: this.network,
      contracts: this.CONTRACTS[this.network],
      features: {
        borrowing: 'Borrow stablecoins against BTC collateral',
        liquidityProvision: 'Supply stablecoins to earn yield',
        staking: 'Stake LP tokens for additional rewards',
        liquidations: 'Liquidate undercollateralized positions',
        flashLoans: 'Uncollateralized single-transaction loans',
        governance: 'Propose and vote on protocol changes'
      }
    };
  }

  /**
   * Get protocol information
   */
  getProtocolInfo() {
    return {
      name: 'Granite Protocol',
      description: 'Bitcoin-native lending protocol on Stacks',
      collateral: 'sBTC (Bitcoin wrapped on Stacks)',
      borrowAsset: 'Stablecoins (USDC, USDA)',
      features: [
        'No rehypothecation of collateral',
        'Single-asset borrowing (no cross-margin risk)',
        'Gradual liquidations (borrower-friendly)',
        'Decentralized governance',
        'Flash loan support'
      ],
      network: this.network
    };
  }
}
