import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { ArkadikoService } from './arkadiko.service.js';

/**
 * Arkadiko Protocol plugin
 * Comprehensive tools for Arkadiko DeFi operations including vaults, DEX, governance, and staking
 * Based on real Arkadiko V2 smart contracts
 */
export class ArkadikoPlugin extends PluginBase<StacksWalletClient> {

  async getTools(walletClient: StacksWalletClient) {
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';
    const arkadikoService = new ArkadikoService({ network });

    return [
      // ========================= VAULT MANAGEMENT TOOLS =========================

      createTool(
        {
          name: 'arkadiko_create_vault',
          description: 'Create new Arkadiko vault for minting USDA stablecoin',
          parameters: z.object({
            collateral_type: z.string().describe('Collateral token contract name (e.g., "wstx-token")'),
            collateral_amount: z.number().positive().describe('Amount of collateral to deposit'),
            debt_amount: z.number().positive().describe('Amount of USDA to mint'),
            prev_hint: z.string().optional().describe('Previous vault hint for sorted list optimization'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ collateral_type, collateral_amount, debt_amount, prev_hint, sender_key }) => {
          return await arkadikoService.createVault({
            collateralType: collateral_type,
            collateralAmount: collateral_amount,
            debtAmount: debt_amount,
            prevHint: prev_hint,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_update_vault',
          description: 'Update existing Arkadiko vault by adjusting collateral or debt',
          parameters: z.object({
            vault_id: z.number().positive().describe('Vault ID to update'),
            collateral_type: z.string().describe('Collateral token contract name'),
            collateral_delta: z.number().describe('Collateral change (positive to add, negative to remove)'),
            debt_delta: z.number().describe('Debt change (positive to mint more, negative to repay)'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ vault_id, collateral_type, collateral_delta, debt_delta, sender_key }) => {
          return await arkadikoService.updateVault({
            vaultId: vault_id,
            collateralType: collateral_type,
            collateralDelta: collateral_delta,
            debtDelta: debt_delta,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_close_vault',
          description: 'Close Arkadiko vault and repay all debt',
          parameters: z.object({
            vault_id: z.number().positive().describe('Vault ID to close'),
            collateral_type: z.string().describe('Collateral token contract name'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ vault_id, collateral_type, sender_key }) => {
          return await arkadikoService.closeVault({
            vaultId: vault_id,
            collateralType: collateral_type,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_get_vault_info',
          description: 'Get detailed information about an Arkadiko vault',
          parameters: z.object({
            vault_id: z.number().positive().describe('Vault ID to query'),
            owner: z.string().describe('Vault owner address')
          })
        },
        async ({ vault_id, owner }) => {
          return await arkadikoService.getVaultInfo(vault_id, owner);
        }
      ),

      createTool(
        {
          name: 'arkadiko_liquidate_vault',
          description: 'Liquidate under-collateralized Arkadiko vault',
          parameters: z.object({
            vault_id: z.number().positive().describe('Vault ID to liquidate'),
            owner: z.string().describe('Vault owner address'),
            collateral_type: z.string().describe('Collateral token contract name'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ vault_id, owner, collateral_type, sender_key }) => {
          return await arkadikoService.liquidateVault({
            vaultId: vault_id,
            owner,
            collateralType: collateral_type,
            senderKey: sender_key
          });
        }
      ),

      // ========================= DEX/SWAP TOOLS =========================

      createTool(
        {
          name: 'arkadiko_create_swap_pair',
          description: 'Create new liquidity pair on Arkadiko DEX',
          parameters: z.object({
            token_x: z.string().describe('First token contract name'),
            token_y: z.string().describe('Second token contract name'),
            lp_token: z.string().describe('LP token contract name'),
            pair_name: z.string().describe('Trading pair name (e.g., "wSTX-USDA")'),
            initial_x_amount: z.number().positive().describe('Initial amount of token X'),
            initial_y_amount: z.number().positive().describe('Initial amount of token Y'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ token_x, token_y, lp_token, pair_name, initial_x_amount, initial_y_amount, sender_key }) => {
          return await arkadikoService.createSwapPair({
            tokenX: token_x,
            tokenY: token_y,
            lpToken: lp_token,
            pairName: pair_name,
            initialXAmount: initial_x_amount,
            initialYAmount: initial_y_amount,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_add_liquidity',
          description: 'Add liquidity to existing Arkadiko swap pair',
          parameters: z.object({
            token_x: z.string().describe('First token contract name'),
            token_y: z.string().describe('Second token contract name'),
            lp_token: z.string().describe('LP token contract name'),
            x_amount: z.number().positive().describe('Amount of token X to add'),
            y_amount: z.number().positive().describe('Amount of token Y to add'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ token_x, token_y, lp_token, x_amount, y_amount, sender_key }) => {
          return await arkadikoService.addLiquidity({
            tokenX: token_x,
            tokenY: token_y,
            lpToken: lp_token,
            xAmount: x_amount,
            yAmount: y_amount,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_swap_tokens',
          description: 'Swap tokens on Arkadiko DEX',
          parameters: z.object({
            token_x: z.string().describe('Input token contract name'),
            token_y: z.string().describe('Output token contract name'),
            amount_in: z.number().positive().describe('Amount of input token to swap'),
            min_amount_out: z.number().positive().describe('Minimum output amount (slippage protection)'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ token_x, token_y, amount_in, min_amount_out, sender_key }) => {
          return await arkadikoService.swapTokens({
            tokenX: token_x,
            tokenY: token_y,
            amountIn: amount_in,
            minAmountOut: min_amount_out,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_get_swap_pair',
          description: 'Get detailed information about Arkadiko swap pair',
          parameters: z.object({
            token_x: z.string().describe('First token contract name'),
            token_y: z.string().describe('Second token contract name')
          })
        },
        async ({ token_x, token_y }) => {
          return await arkadikoService.getSwapPair(token_x, token_y);
        }
      ),

      createTool(
        {
          name: 'arkadiko_get_swap_fees',
          description: 'Get trading fees for Arkadiko swap pair',
          parameters: z.object({
            token_x: z.string().describe('First token contract name'),
            token_y: z.string().describe('Second token contract name')
          })
        },
        async ({ token_x, token_y }) => {
          return await arkadikoService.getSwapFees(token_x, token_y);
        }
      ),

      // ========================= GOVERNANCE TOOLS =========================

      createTool(
        {
          name: 'arkadiko_create_proposal',
          description: 'Create new Arkadiko governance proposal',
          parameters: z.object({
            title: z.string().min(1).describe('Proposal title'),
            description: z.string().min(1).describe('Detailed proposal description'),
            start_block: z.number().positive().describe('Block height when voting starts'),
            end_block: z.number().positive().describe('Block height when voting ends'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ title, description, start_block, end_block, sender_key }) => {
          return await arkadikoService.createProposal({
            title,
            description,
            startBlock: start_block,
            endBlock: end_block,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_vote_on_proposal',
          description: 'Vote on Arkadiko governance proposal',
          parameters: z.object({
            proposal_id: z.number().positive().describe('Proposal ID to vote on'),
            vote_amount: z.number().positive().describe('Amount of DIKO tokens to vote with'),
            support: z.boolean().describe('True to vote for, false to vote against'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ proposal_id, vote_amount, support, sender_key }) => {
          return await arkadikoService.voteOnProposal({
            proposalId: proposal_id,
            voteAmount: vote_amount,
            support,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_get_proposal',
          description: 'Get detailed information about Arkadiko governance proposal',
          parameters: z.object({
            proposal_id: z.number().positive().describe('Proposal ID to query')
          })
        },
        async ({ proposal_id }) => {
          return await arkadikoService.getProposal(proposal_id);
        }
      ),

      // ========================= STAKING TOOLS =========================

      createTool(
        {
          name: 'arkadiko_stake_diko',
          description: 'Stake DIKO tokens to earn rewards and voting power',
          parameters: z.object({
            amount: z.number().positive().describe('Amount of DIKO tokens to stake'),
            lock_period: z.number().positive().describe('Lock period in blocks'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ amount, lock_period, sender_key }) => {
          return await arkadikoService.stakeDiko({
            amount,
            lockPeriod: lock_period,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_unstake_diko',
          description: 'Unstake DIKO tokens',
          parameters: z.object({
            amount: z.number().positive().describe('Amount of DIKO tokens to unstake'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ amount, sender_key }) => {
          return await arkadikoService.unstakeDiko({
            amount,
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_claim_staking_rewards',
          description: 'Claim pending staking rewards',
          parameters: z.object({
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ sender_key }) => {
          return await arkadikoService.claimStakingRewards({
            senderKey: sender_key
          });
        }
      ),

      createTool(
        {
          name: 'arkadiko_get_stake_info',
          description: 'Get staking information for address',
          parameters: z.object({
            staker: z.string().describe('Staker address to query')
          })
        },
        async ({ staker }) => {
          return await arkadikoService.getStakeInfo(staker);
        }
      ),

      // ========================= TOKEN TOOLS =========================

      createTool(
        {
          name: 'arkadiko_get_token_balance',
          description: 'Get token balance for address',
          parameters: z.object({
            token_contract: z.string().describe('Token contract name'),
            address: z.string().describe('Address to check balance for')
          })
        },
        async ({ token_contract, address }) => {
          return await arkadikoService.getTokenBalance(token_contract, address);
        }
      ),

      createTool(
        {
          name: 'arkadiko_get_token_total_supply',
          description: 'Get total supply of Arkadiko token',
          parameters: z.object({
            token_contract: z.string().describe('Token contract name')
          })
        },
        async ({ token_contract }) => {
          return await arkadikoService.getTokenTotalSupply(token_contract);
        }
      ),

      createTool(
        {
          name: 'arkadiko_burn_usda',
          description: 'Burn USDA tokens to reduce total supply',
          parameters: z.object({
            amount: z.number().positive().describe('Amount of USDA to burn'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ amount, sender_key }) => {
          return await arkadikoService.burnUsda({
            amount,
            senderKey: sender_key
          });
        }
      ),

      // ========================= ORACLE TOOLS =========================

      createTool(
        {
          name: 'arkadiko_get_token_price',
          description: 'Get token price from Arkadiko oracle',
          parameters: z.object({
            token_id: z.number().positive().describe('Token ID in oracle system')
          })
        },
        async ({ token_id }) => {
          return await arkadikoService.getTokenPrice(token_id);
        }
      ),

      // ========================= UTILITY TOOLS =========================

      createTool(
        {
          name: 'arkadiko_get_network_info',
          description: 'Get Arkadiko network configuration and contract addresses',
          parameters: z.object({})
        },
        async () => {
          return arkadikoService.getNetworkInfo();
        }
      ),

      // ========================= COMPREHENSIVE WORKFLOW TOOLS =========================

      createTool(
        {
          name: 'arkadiko_complete_cdp_workflow',
          description: 'Complete CDP workflow: Create vault, mint USDA, and manage position',
          parameters: z.object({
            collateral_type: z.string().describe('Collateral token contract name'),
            collateral_amount: z.number().positive().describe('Amount of collateral to deposit'),
            usda_to_mint: z.number().positive().describe('Amount of USDA to mint'),
            target_ratio: z.number().positive().describe('Target collateralization ratio (e.g., 200 for 200%)'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ collateral_type, collateral_amount, usda_to_mint, target_ratio, sender_key }) => {
          const steps = [];

          try {
            // Step 1: Create vault
            const vaultResult = await arkadikoService.createVault({
              collateralType: collateral_type,
              collateralAmount: collateral_amount,
              debtAmount: usda_to_mint,
              senderKey: sender_key
            });
            steps.push({ step: 'create_vault', result: vaultResult });

            // Step 2: Calculate health metrics
            const currentRatio = (collateral_amount / usda_to_mint) * 100;
            const healthMetrics = {
              currentRatio: `${currentRatio.toFixed(2)}%`,
              targetRatio: `${target_ratio}%`,
              isHealthy: currentRatio >= target_ratio,
              liquidationRisk: currentRatio < 150 ? 'HIGH' : currentRatio < 200 ? 'MEDIUM' : 'LOW'
            };
            steps.push({ step: 'health_check', result: healthMetrics });

            return {
              success: true,
              workflow: 'complete_cdp',
              steps,
              summary: {
                vaultCreated: true,
                collateralDeposited: collateral_amount,
                usdaMinted: usda_to_mint,
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
      ),

      createTool(
        {
          name: 'arkadiko_complete_liquidity_workflow',
          description: 'Complete liquidity provision workflow: Create pair and add liquidity',
          parameters: z.object({
            token_x: z.string().describe('First token contract name'),
            token_y: z.string().describe('Second token contract name'),
            pair_name: z.string().describe('Trading pair name'),
            x_amount: z.number().positive().describe('Amount of token X'),
            y_amount: z.number().positive().describe('Amount of token Y'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ token_x, token_y, pair_name, x_amount, y_amount, sender_key }) => {
          const steps = [];

          try {
            // Step 1: Create swap pair
            const pairResult = await arkadikoService.createSwapPair({
              tokenX: token_x,
              tokenY: token_y,
              lpToken: `arkadiko-swap-token-${token_x}-${token_y}`,
              pairName: pair_name,
              initialXAmount: x_amount,
              initialYAmount: y_amount,
              senderKey: sender_key
            });
            steps.push({ step: 'create_pair', result: pairResult });

            // Step 2: Get pair information
            const pairInfo = await arkadikoService.getSwapPair(token_x, token_y);
            steps.push({ step: 'pair_info', result: pairInfo });

            return {
              success: true,
              workflow: 'complete_liquidity',
              steps,
              summary: {
                pairCreated: true,
                tokenX: token_x,
                tokenY: token_y,
                liquidityAdded: `${x_amount} + ${y_amount}`,
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
      ),

      createTool(
        {
          name: 'arkadiko_complete_governance_workflow',
          description: 'Complete governance workflow: Stake DIKO, create proposal, and vote',
          parameters: z.object({
            stake_amount: z.number().positive().describe('Amount of DIKO to stake'),
            proposal_title: z.string().describe('Proposal title'),
            proposal_description: z.string().describe('Proposal description'),
            voting_duration: z.number().positive().describe('Voting duration in blocks'),
            sender_key: z.string().describe('Private key for transaction signing')
          })
        },
        async ({ stake_amount, proposal_title, proposal_description, voting_duration, sender_key }) => {
          const steps = [];

          try {
            // Step 1: Stake DIKO
            const stakeResult = await arkadikoService.stakeDiko({
              amount: stake_amount,
              lockPeriod: voting_duration,
              senderKey: sender_key
            });
            steps.push({ step: 'stake_diko', result: stakeResult });

            // Step 2: Create proposal
            const currentBlock = 100000; // Placeholder - should get actual block height
            const proposalResult = await arkadikoService.createProposal({
              title: proposal_title,
              description: proposal_description,
              startBlock: currentBlock + 10,
              endBlock: currentBlock + 10 + voting_duration,
              senderKey: sender_key
            });
            steps.push({ step: 'create_proposal', result: proposalResult });

            return {
              success: true,
              workflow: 'complete_governance',
              steps,
              summary: {
                dikoStaked: stake_amount,
                proposalCreated: true,
                votingPower: stake_amount,
                proposal: {
                  title: proposal_title,
                  duration: voting_duration
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
      ),

      // ========================= PORTFOLIO MANAGEMENT TOOLS =========================

      createTool(
        {
          name: 'arkadiko_get_user_portfolio',
          description: 'Get complete user portfolio across all Arkadiko features',
          parameters: z.object({
            address: z.string().describe('User address to analyze')
          })
        },
        async ({ address }) => {
          try {
            const portfolio = {
              address,
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
                const balance = await arkadikoService.getTokenBalance(contract, address);
                portfolio.tokens[contract] = balance;
              } catch (error) {
                portfolio.tokens[contract] = '0';
              }
            }

            // Get staking info
            try {
              const stakeInfo = await arkadikoService.getStakeInfo(address);
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
      ),

      createTool(
        {
          name: 'arkadiko_calculate_vault_health',
          description: 'Calculate vault health metrics and liquidation risks',
          parameters: z.object({
            vault_id: z.number().positive().describe('Vault ID to analyze'),
            owner: z.string().describe('Vault owner address')
          })
        },
        async ({ vault_id, owner }) => {
          try {
            const vaultInfo = await arkadikoService.getVaultInfo(vault_id, owner);

            const collateralAmount = parseInt(vaultInfo.collateralAmount);
            const debtAmount = parseInt(vaultInfo.debtAmount);
            const currentRatio = debtAmount > 0 ? (collateralAmount / debtAmount) * 100 : Infinity;

            const calculateRiskLevel = (ratio: number): string => {
              if (!isFinite(ratio)) return 'NONE';
              if (ratio < 150) return 'CRITICAL';
              if (ratio < 180) return 'HIGH';
              if (ratio < 220) return 'MEDIUM';
              return 'LOW';
            };

            const getVaultRecommendations = (ratio: number): string[] => {
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
            };

            const health = {
              vaultId: vault_id,
              owner,
              collateralAmount: vaultInfo.collateralAmount,
              debtAmount: vaultInfo.debtAmount,
              currentRatio: isFinite(currentRatio) ? `${currentRatio.toFixed(2)}%` : '∞',
              liquidationRatio: '150%',
              safetyMargin: isFinite(currentRatio) ? `${Math.max(0, currentRatio - 150).toFixed(2)}%` : '∞',
              riskLevel: calculateRiskLevel(currentRatio),
              recommendations: getVaultRecommendations(currentRatio),
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
      ),

      createTool(
        {
          name: 'arkadiko_optimize_vault_position',
          description: 'Get recommendations for optimizing vault position',
          parameters: z.object({
            vault_id: z.number().positive().describe('Vault ID to optimize'),
            owner: z.string().describe('Vault owner address'),
            target_ratio: z.number().positive().describe('Target collateralization ratio')
          })
        },
        async ({ vault_id, owner, target_ratio }) => {
          try {
            const vaultInfo = await arkadikoService.getVaultInfo(vault_id, owner);

            const collateralAmount = parseInt(vaultInfo.collateralAmount);
            const debtAmount = parseInt(vaultInfo.debtAmount);
            const currentRatio = debtAmount > 0 ? (collateralAmount / debtAmount) * 100 : Infinity;

            const optimization = {
              vaultId: vault_id,
              currentStatus: {
                collateralAmount: vaultInfo.collateralAmount,
                debtAmount: vaultInfo.debtAmount,
                currentRatio: isFinite(currentRatio) ? `${currentRatio.toFixed(2)}%` : '∞'
              },
              targetRatio: `${target_ratio}%`,
              recommendations: [],
              timestamp: new Date().toISOString()
            };

            if (isFinite(currentRatio)) {
              if (currentRatio < target_ratio) {
                const neededCollateral = (debtAmount * target_ratio / 100) - collateralAmount;
                const neededDebtReduction = debtAmount - (collateralAmount * 100 / target_ratio);

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
                const excessCollateral = collateralAmount - (debtAmount * target_ratio / 100);
                const maxAdditionalDebt = (collateralAmount * 100 / target_ratio) - debtAmount;

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
      ),
    ];
  }
}

/**
 * Factory function to create Arkadiko plugin
 */
export function arkadiko() {
  return new ArkadikoPlugin();
}
