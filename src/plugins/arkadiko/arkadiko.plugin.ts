import { z } from 'zod';
import { MCPTool, StacksPlugin } from '../../types/index.js';
import { ArkadikoService } from './arkadiko.service.js';
import { StacksWalletClient } from '../../wallet/StacksWalletClient.js';

export class ArkadikoPlugin implements StacksPlugin {
  private arkadikoService: ArkadikoService;
  private wallet: StacksWalletClient;

  constructor(wallet: StacksWalletClient) {
    this.wallet = wallet;
    const network = wallet.getNetwork() as 'mainnet' | 'testnet';
    this.arkadikoService = new ArkadikoService({ network });
  }

  getTools(): MCPTool[] {
    return [
      // ========================= VAULT MANAGEMENT TOOLS =========================
      
      {
        name: 'arkadiko_create_vault',
        description: 'Create new Arkadiko vault for minting USDA stablecoin',
        inputSchema: z.object({
          collateral_type: z.string().describe('Collateral token contract name (e.g., "wstx-token")'),
          collateral_amount: z.number().positive().describe('Amount of collateral to deposit'),
          debt_amount: z.number().positive().describe('Amount of USDA to mint'),
          prev_hint: z.string().optional().describe('Previous vault hint for sorted list optimization'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_update_vault',
        description: 'Update existing Arkadiko vault by adjusting collateral or debt',
        inputSchema: z.object({
          vault_id: z.number().positive().describe('Vault ID to update'),
          collateral_type: z.string().describe('Collateral token contract name'),
          collateral_delta: z.number().describe('Collateral change (positive to add, negative to remove)'),
          debt_delta: z.number().describe('Debt change (positive to mint more, negative to repay)'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_close_vault',
        description: 'Close Arkadiko vault and repay all debt',
        inputSchema: z.object({
          vault_id: z.number().positive().describe('Vault ID to close'),
          collateral_type: z.string().describe('Collateral token contract name'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_get_vault_info',
        description: 'Get detailed information about an Arkadiko vault',
        inputSchema: z.object({
          vault_id: z.number().positive().describe('Vault ID to query'),
          owner: z.string().describe('Vault owner address')
        })
      },
      
      {
        name: 'arkadiko_liquidate_vault',
        description: 'Liquidate under-collateralized Arkadiko vault',
        inputSchema: z.object({
          vault_id: z.number().positive().describe('Vault ID to liquidate'),
          owner: z.string().describe('Vault owner address'),
          collateral_type: z.string().describe('Collateral token contract name'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },

      // ========================= DEX/SWAP TOOLS =========================
      
      {
        name: 'arkadiko_create_swap_pair',
        description: 'Create new liquidity pair on Arkadiko DEX',
        inputSchema: z.object({
          token_x: z.string().describe('First token contract name'),
          token_y: z.string().describe('Second token contract name'),
          lp_token: z.string().describe('LP token contract name'),
          pair_name: z.string().describe('Trading pair name (e.g., "wSTX-USDA")'),
          initial_x_amount: z.number().positive().describe('Initial amount of token X'),
          initial_y_amount: z.number().positive().describe('Initial amount of token Y'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_add_liquidity',
        description: 'Add liquidity to existing Arkadiko swap pair',
        inputSchema: z.object({
          token_x: z.string().describe('First token contract name'),
          token_y: z.string().describe('Second token contract name'),
          lp_token: z.string().describe('LP token contract name'),
          x_amount: z.number().positive().describe('Amount of token X to add'),
          y_amount: z.number().positive().describe('Amount of token Y to add'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_swap_tokens',
        description: 'Swap tokens on Arkadiko DEX',
        inputSchema: z.object({
          token_x: z.string().describe('Input token contract name'),
          token_y: z.string().describe('Output token contract name'),
          amount_in: z.number().positive().describe('Amount of input token to swap'),
          min_amount_out: z.number().positive().describe('Minimum output amount (slippage protection)'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_get_swap_pair',
        description: 'Get detailed information about Arkadiko swap pair',
        inputSchema: z.object({
          token_x: z.string().describe('First token contract name'),
          token_y: z.string().describe('Second token contract name')
        })
      },
      
      {
        name: 'arkadiko_get_swap_fees',
        description: 'Get trading fees for Arkadiko swap pair',
        inputSchema: z.object({
          token_x: z.string().describe('First token contract name'),
          token_y: z.string().describe('Second token contract name')
        })
      },

      // ========================= GOVERNANCE TOOLS =========================
      
      {
        name: 'arkadiko_create_proposal',
        description: 'Create new Arkadiko governance proposal',
        inputSchema: z.object({
          title: z.string().min(1).describe('Proposal title'),
          description: z.string().min(1).describe('Detailed proposal description'),
          start_block: z.number().positive().describe('Block height when voting starts'),
          end_block: z.number().positive().describe('Block height when voting ends'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_vote_on_proposal',
        description: 'Vote on Arkadiko governance proposal',
        inputSchema: z.object({
          proposal_id: z.number().positive().describe('Proposal ID to vote on'),
          vote_amount: z.number().positive().describe('Amount of DIKO tokens to vote with'),
          support: z.boolean().describe('True to vote for, false to vote against'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_get_proposal',
        description: 'Get detailed information about Arkadiko governance proposal',
        inputSchema: z.object({
          proposal_id: z.number().positive().describe('Proposal ID to query')
        })
      },

      // ========================= STAKING TOOLS =========================
      
      {
        name: 'arkadiko_stake_diko',
        description: 'Stake DIKO tokens to earn rewards and voting power',
        inputSchema: z.object({
          amount: z.number().positive().describe('Amount of DIKO tokens to stake'),
          lock_period: z.number().positive().describe('Lock period in blocks'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_unstake_diko',
        description: 'Unstake DIKO tokens',
        inputSchema: z.object({
          amount: z.number().positive().describe('Amount of DIKO tokens to unstake'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_claim_staking_rewards',
        description: 'Claim pending staking rewards',
        inputSchema: z.object({
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_get_stake_info',
        description: 'Get staking information for address',
        inputSchema: z.object({
          staker: z.string().describe('Staker address to query')
        })
      },

      // ========================= TOKEN TOOLS =========================
      
      {
        name: 'arkadiko_get_token_balance',
        description: 'Get token balance for address',
        inputSchema: z.object({
          token_contract: z.string().describe('Token contract name'),
          address: z.string().describe('Address to check balance for')
        })
      },
      
      {
        name: 'arkadiko_get_token_total_supply',
        description: 'Get total supply of Arkadiko token',
        inputSchema: z.object({
          token_contract: z.string().describe('Token contract name')
        })
      },
      
      {
        name: 'arkadiko_burn_usda',
        description: 'Burn USDA tokens to reduce total supply',
        inputSchema: z.object({
          amount: z.number().positive().describe('Amount of USDA to burn'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },

      // ========================= ORACLE TOOLS =========================
      
      {
        name: 'arkadiko_get_token_price',
        description: 'Get token price from Arkadiko oracle',
        inputSchema: z.object({
          token_id: z.number().positive().describe('Token ID in oracle system')
        })
      },

      // ========================= UTILITY TOOLS =========================
      
      {
        name: 'arkadiko_get_network_info',
        description: 'Get Arkadiko network configuration and contract addresses',
        inputSchema: z.object({})
      },

      // ========================= COMPREHENSIVE WORKFLOW TOOLS =========================
      
      {
        name: 'arkadiko_complete_cdp_workflow',
        description: 'Complete CDP workflow: Create vault, mint USDA, and manage position',
        inputSchema: z.object({
          collateral_type: z.string().describe('Collateral token contract name'),
          collateral_amount: z.number().positive().describe('Amount of collateral to deposit'),
          usda_to_mint: z.number().positive().describe('Amount of USDA to mint'),
          target_ratio: z.number().positive().describe('Target collateralization ratio (e.g., 200 for 200%)'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_complete_liquidity_workflow',
        description: 'Complete liquidity provision workflow: Create pair and add liquidity',
        inputSchema: z.object({
          token_x: z.string().describe('First token contract name'),
          token_y: z.string().describe('Second token contract name'),
          pair_name: z.string().describe('Trading pair name'),
          x_amount: z.number().positive().describe('Amount of token X'),
          y_amount: z.number().positive().describe('Amount of token Y'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },
      
      {
        name: 'arkadiko_complete_governance_workflow',
        description: 'Complete governance workflow: Stake DIKO, create proposal, and vote',
        inputSchema: z.object({
          stake_amount: z.number().positive().describe('Amount of DIKO to stake'),
          proposal_title: z.string().describe('Proposal title'),
          proposal_description: z.string().describe('Proposal description'),
          voting_duration: z.number().positive().describe('Voting duration in blocks'),
          sender_key: z.string().describe('Private key for transaction signing')
        })
      },

      // ========================= PORTFOLIO MANAGEMENT TOOLS =========================
      
      {
        name: 'arkadiko_get_user_portfolio',
        description: 'Get complete user portfolio across all Arkadiko features',
        inputSchema: z.object({
          address: z.string().describe('User address to analyze')
        })
      },
      
      {
        name: 'arkadiko_calculate_vault_health',
        description: 'Calculate vault health metrics and liquidation risks',
        inputSchema: z.object({
          vault_id: z.number().positive().describe('Vault ID to analyze'),
          owner: z.string().describe('Vault owner address')
        })
      },
      
      {
        name: 'arkadiko_optimize_vault_position',
        description: 'Get recommendations for optimizing vault position',
        inputSchema: z.object({
          vault_id: z.number().positive().describe('Vault ID to optimize'),
          owner: z.string().describe('Vault owner address'),
          target_ratio: z.number().positive().describe('Target collateralization ratio')
        })
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        // ========================= VAULT OPERATIONS =========================
        
        case 'arkadiko_create_vault':
          return this.arkadikoService.createVault({
            collateralType: args.collateral_type,
            collateralAmount: args.collateral_amount,
            debtAmount: args.debt_amount,
            prevHint: args.prev_hint,
            senderKey: args.sender_key
          });

        case 'arkadiko_update_vault':
          return this.arkadikoService.updateVault({
            vaultId: args.vault_id,
            collateralType: args.collateral_type,
            collateralDelta: args.collateral_delta,
            debtDelta: args.debt_delta,
            senderKey: args.sender_key
          });

        case 'arkadiko_close_vault':
          return this.arkadikoService.closeVault({
            vaultId: args.vault_id,
            collateralType: args.collateral_type,
            senderKey: args.sender_key
          });

        case 'arkadiko_get_vault_info':
          return this.arkadikoService.getVaultInfo(args.vault_id, args.owner);

        case 'arkadiko_liquidate_vault':
          return this.arkadikoService.liquidateVault({
            vaultId: args.vault_id,
            owner: args.owner,
            collateralType: args.collateral_type,
            senderKey: args.sender_key
          });

        // ========================= DEX/SWAP OPERATIONS =========================
        
        case 'arkadiko_create_swap_pair':
          return this.arkadikoService.createSwapPair({
            tokenX: args.token_x,
            tokenY: args.token_y,
            lpToken: args.lp_token,
            pairName: args.pair_name,
            initialXAmount: args.initial_x_amount,
            initialYAmount: args.initial_y_amount,
            senderKey: args.sender_key
          });

        case 'arkadiko_add_liquidity':
          return this.arkadikoService.addLiquidity({
            tokenX: args.token_x,
            tokenY: args.token_y,
            lpToken: args.lp_token,
            xAmount: args.x_amount,
            yAmount: args.y_amount,
            senderKey: args.sender_key
          });

        case 'arkadiko_swap_tokens':
          return this.arkadikoService.swapTokens({
            tokenX: args.token_x,
            tokenY: args.token_y,
            amountIn: args.amount_in,
            minAmountOut: args.min_amount_out,
            senderKey: args.sender_key
          });

        case 'arkadiko_get_swap_pair':
          return this.arkadikoService.getSwapPair(args.token_x, args.token_y);

        case 'arkadiko_get_swap_fees':
          return this.arkadikoService.getSwapFees(args.token_x, args.token_y);

        // ========================= GOVERNANCE OPERATIONS =========================
        
        case 'arkadiko_create_proposal':
          return this.arkadikoService.createProposal({
            title: args.title,
            description: args.description,
            startBlock: args.start_block,
            endBlock: args.end_block,
            senderKey: args.sender_key
          });

        case 'arkadiko_vote_on_proposal':
          return this.arkadikoService.voteOnProposal({
            proposalId: args.proposal_id,
            voteAmount: args.vote_amount,
            support: args.support,
            senderKey: args.sender_key
          });

        case 'arkadiko_get_proposal':
          return this.arkadikoService.getProposal(args.proposal_id);

        // ========================= STAKING OPERATIONS =========================
        
        case 'arkadiko_stake_diko':
          return this.arkadikoService.stakeDiko({
            amount: args.amount,
            lockPeriod: args.lock_period,
            senderKey: args.sender_key
          });

        case 'arkadiko_unstake_diko':
          return this.arkadikoService.unstakeDiko({
            amount: args.amount,
            senderKey: args.sender_key
          });

        case 'arkadiko_claim_staking_rewards':
          return this.arkadikoService.claimStakingRewards({
            senderKey: args.sender_key
          });

        case 'arkadiko_get_stake_info':
          return this.arkadikoService.getStakeInfo(args.staker);

        // ========================= TOKEN OPERATIONS =========================
        
        case 'arkadiko_get_token_balance':
          return this.arkadikoService.getTokenBalance(args.token_contract, args.address);

        case 'arkadiko_get_token_total_supply':
          return this.arkadikoService.getTokenTotalSupply(args.token_contract);

        case 'arkadiko_burn_usda':
          return this.arkadikoService.burnUsda({
            amount: args.amount,
            senderKey: args.sender_key
          });

        // ========================= ORACLE OPERATIONS =========================
        
        case 'arkadiko_get_token_price':
          return this.arkadikoService.getTokenPrice(args.token_id);

        // ========================= UTILITY OPERATIONS =========================
        
        case 'arkadiko_get_network_info':
          return this.arkadikoService.getNetworkInfo();

        // ========================= WORKFLOW OPERATIONS =========================
        
        case 'arkadiko_complete_cdp_workflow':
          return this.handleCompleteCdpWorkflow(args);

        case 'arkadiko_complete_liquidity_workflow':
          return this.handleCompleteLiquidityWorkflow(args);

        case 'arkadiko_complete_governance_workflow':
          return this.handleCompleteGovernanceWorkflow(args);

        // ========================= PORTFOLIO OPERATIONS =========================
        
        case 'arkadiko_get_user_portfolio':
          return this.handleGetUserPortfolio(args);

        case 'arkadiko_calculate_vault_health':
          return this.handleCalculateVaultHealth(args);

        case 'arkadiko_optimize_vault_position':
          return this.handleOptimizeVaultPosition(args);

        default:
          throw new Error(`Unknown Arkadiko tool: ${name}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        tool: name,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========================= WORKFLOW HANDLERS =========================

  private async handleCompleteCdpWorkflow(args: any) {
    const steps = [];
    
    try {
      // Step 1: Create vault
      const vaultResult = await this.arkadikoService.createVault({
        collateralType: args.collateral_type,
        collateralAmount: args.collateral_amount,
        debtAmount: args.usda_to_mint,
        senderKey: args.sender_key
      });
      steps.push({ step: 'create_vault', result: vaultResult });

      // Step 2: Calculate health metrics
      const currentRatio = (args.collateral_amount / args.usda_to_mint) * 100;
      const healthMetrics = {
        currentRatio: `${currentRatio.toFixed(2)}%`,
        targetRatio: `${args.target_ratio}%`,
        isHealthy: currentRatio >= args.target_ratio,
        liquidationRisk: currentRatio < 150 ? 'HIGH' : currentRatio < 200 ? 'MEDIUM' : 'LOW'
      };
      steps.push({ step: 'health_check', result: healthMetrics });

      return {
        success: true,
        workflow: 'complete_cdp',
        steps,
        summary: {
          vaultCreated: true,
          collateralDeposited: args.collateral_amount,
          usdaMinted: args.usda_to_mint,
          healthStatus: healthMetrics
        }
      };
    } catch (error) {
      return {
        success: false,
        workflow: 'complete_cdp',
        steps,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  private async handleCompleteLiquidityWorkflow(args: any) {
    const steps = [];
    
    try {
      // Step 1: Create swap pair
      const pairResult = await this.arkadikoService.createSwapPair({
        tokenX: args.token_x,
        tokenY: args.token_y,
        lpToken: `arkadiko-swap-token-${args.token_x}-${args.token_y}`,
        pairName: args.pair_name,
        initialXAmount: args.x_amount,
        initialYAmount: args.y_amount,
        senderKey: args.sender_key
      });
      steps.push({ step: 'create_pair', result: pairResult });

      // Step 2: Get pair information
      const pairInfo = await this.arkadikoService.getSwapPair(args.token_x, args.token_y);
      steps.push({ step: 'pair_info', result: pairInfo });

      return {
        success: true,
        workflow: 'complete_liquidity',
        steps,
        summary: {
          pairCreated: true,
          tokenX: args.token_x,
          tokenY: args.token_y,
          liquidityAdded: `${args.x_amount} + ${args.y_amount}`,
          pairInfo
        }
      };
    } catch (error) {
      return {
        success: false,
        workflow: 'complete_liquidity',
        steps,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  private async handleCompleteGovernanceWorkflow(args: any) {
    const steps = [];
    
    try {
      // Step 1: Stake DIKO
      const stakeResult = await this.arkadikoService.stakeDiko({
        amount: args.stake_amount,
        lockPeriod: args.voting_duration,
        senderKey: args.sender_key
      });
      steps.push({ step: 'stake_diko', result: stakeResult });

      // Step 2: Create proposal
      const currentBlock = await this.getCurrentBlockHeight();
      const proposalResult = await this.arkadikoService.createProposal({
        title: args.proposal_title,
        description: args.proposal_description,
        startBlock: currentBlock + 10,
        endBlock: currentBlock + 10 + args.voting_duration,
        senderKey: args.sender_key
      });
      steps.push({ step: 'create_proposal', result: proposalResult });

      return {
        success: true,
        workflow: 'complete_governance',
        steps,
        summary: {
          dikoStaked: args.stake_amount,
          proposalCreated: true,
          votingPower: args.stake_amount,
          proposal: {
            title: args.proposal_title,
            duration: args.voting_duration
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        workflow: 'complete_governance',
        steps,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  private async handleGetUserPortfolio(args: any) {
    try {
      const portfolio = {
        address: args.address,
        tokens: {},
        vaults: [],
        staking: {},
        governance: {},
        timestamp: new Date().toISOString()
      };

      // Get token balances
      const tokenContracts = ['arkadiko-token', 'usda-token', 'wrapped-stx-token'];
      for (const contract of tokenContracts) {
        try {
          const balance = await this.arkadikoService.getTokenBalance(contract, args.address);
          portfolio.tokens[contract] = balance;
        } catch (error) {
          portfolio.tokens[contract] = '0';
        }
      }

      // Get staking info
      try {
        const stakeInfo = await this.arkadikoService.getStakeInfo(args.address);
        portfolio.staking = stakeInfo;
      } catch (error) {
        portfolio.staking = { error: 'Unable to fetch staking info' };
      }

      return {
        success: true,
        portfolio
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get portfolio'
      };
    }
  }

  private async handleCalculateVaultHealth(args: any) {
    try {
      const vaultInfo = await this.arkadikoService.getVaultInfo(args.vault_id, args.owner);
      
      const collateralAmount = parseInt(vaultInfo.collateralAmount);
      const debtAmount = parseInt(vaultInfo.debtAmount);
      const currentRatio = debtAmount > 0 ? (collateralAmount / debtAmount) * 100 : Infinity;
      
      const health = {
        vaultId: args.vault_id,
        owner: args.owner,
        collateralAmount: vaultInfo.collateralAmount,
        debtAmount: vaultInfo.debtAmount,
        currentRatio: isFinite(currentRatio) ? `${currentRatio.toFixed(2)}%` : '∞',
        liquidationRatio: '150%',
        safetyMargin: isFinite(currentRatio) ? `${Math.max(0, currentRatio - 150).toFixed(2)}%` : '∞',
        riskLevel: this.calculateRiskLevel(currentRatio),
        recommendations: this.getVaultRecommendations(currentRatio),
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        health
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate vault health'
      };
    }
  }

  private async handleOptimizeVaultPosition(args: any) {
    try {
      const vaultInfo = await this.arkadikoService.getVaultInfo(args.vault_id, args.owner);
      
      const collateralAmount = parseInt(vaultInfo.collateralAmount);
      const debtAmount = parseInt(vaultInfo.debtAmount);
      const currentRatio = debtAmount > 0 ? (collateralAmount / debtAmount) * 100 : Infinity;
      
      const optimization = {
        vaultId: args.vault_id,
        currentStatus: {
          collateralAmount: vaultInfo.collateralAmount,
          debtAmount: vaultInfo.debtAmount,
          currentRatio: isFinite(currentRatio) ? `${currentRatio.toFixed(2)}%` : '∞'
        },
        targetRatio: `${args.target_ratio}%`,
        recommendations: [],
        timestamp: new Date().toISOString()
      };

      if (isFinite(currentRatio)) {
        if (currentRatio < args.target_ratio) {
          const neededCollateral = (debtAmount * args.target_ratio / 100) - collateralAmount;
          const neededDebtReduction = debtAmount - (collateralAmount * 100 / args.target_ratio);
          
          optimization.recommendations.push({
            action: 'add_collateral',
            amount: Math.max(0, neededCollateral),
            description: `Add ${Math.max(0, neededCollateral / 1000000).toFixed(6)} tokens to reach target ratio`
          });
          
          optimization.recommendations.push({
            action: 'repay_debt',
            amount: Math.max(0, neededDebtReduction),
            description: `Repay ${Math.max(0, neededDebtReduction / 1000000).toFixed(6)} USDA to reach target ratio`
          });
        } else {
          const excessCollateral = collateralAmount - (debtAmount * args.target_ratio / 100);
          const maxAdditionalDebt = (collateralAmount * 100 / args.target_ratio) - debtAmount;
          
          optimization.recommendations.push({
            action: 'withdraw_collateral',
            amount: Math.max(0, excessCollateral),
            description: `Can withdraw up to ${Math.max(0, excessCollateral / 1000000).toFixed(6)} tokens while maintaining target ratio`
          });
          
          optimization.recommendations.push({
            action: 'mint_additional_usda',
            amount: Math.max(0, maxAdditionalDebt),
            description: `Can mint up to ${Math.max(0, maxAdditionalDebt / 1000000).toFixed(6)} additional USDA while maintaining target ratio`
          });
        }
      }

      return {
        success: true,
        optimization
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize vault position'
      };
    }
  }

  // ========================= UTILITY HELPERS =========================

  private calculateRiskLevel(ratio: number): string {
    if (!isFinite(ratio)) return 'NONE';
    if (ratio < 150) return 'CRITICAL';
    if (ratio < 180) return 'HIGH';
    if (ratio < 220) return 'MEDIUM';
    return 'LOW';
  }

  private getVaultRecommendations(ratio: number): string[] {
    const recommendations = [];
    
    if (!isFinite(ratio)) {
      recommendations.push('No debt - vault is safe');
      return recommendations;
    }
    
    if (ratio < 150) {
      recommendations.push('URGENT: Add collateral or repay debt to avoid liquidation');
      recommendations.push('Vault is below liquidation threshold');
    } else if (ratio < 180) {
      recommendations.push('Consider adding collateral for safety');
      recommendations.push('Monitor price movements closely');
    } else if (ratio < 220) {
      recommendations.push('Vault is in acceptable range');
      recommendations.push('Consider setting up monitoring alerts');
    } else {
      recommendations.push('Vault is very safe');
      recommendations.push('Consider minting more USDA or withdrawing excess collateral');
    }
    
    return recommendations;
  }

  private async getCurrentBlockHeight(): Promise<number> {
    // This would need to be implemented to get current block height
    // For now, return a placeholder
    return 100000;
  }
}