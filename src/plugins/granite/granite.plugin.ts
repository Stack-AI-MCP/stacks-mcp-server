import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { GraniteService } from './granite.service.js';

/**
 * Granite Protocol Plugin
 * Bitcoin-native lending protocol with sBTC collateral
 *
 * Features:
 * - Borrowing: BTC-backed stablecoin loans
 * - Liquidity Provision: Earn yield from lending
 * - Staking: Additional rewards for LP tokens
 * - Liquidations: Liquidate risky positions
 * - Flash Loans: Uncollateralized loans
 * - Governance: Protocol parameter updates
 */
export class GranitePlugin extends PluginBase<StacksWalletClient> {

  async getTools(walletClient: StacksWalletClient) {
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';
    const graniteService = new GraniteService({ network });

    return [
      // ========================= BORROWER OPERATIONS =========================

      createTool(
        {
          name: 'granite_borrow',
          description: 'Borrow stablecoins against BTC collateral on Granite',
          parameters: z.object({
            amount: z.number().positive().describe('Amount of stablecoins to borrow'),
            pyth_price_feed_data: z.string().optional().describe('Hex-encoded Pyth price feed data')
          })
        },
        async ({ amount, pyth_price_feed_data }) => {
          return await graniteService.executeBorrow({
            amount,
            pythPriceFeedData: pyth_price_feed_data
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'granite_repay',
          description: 'Repay borrowed stablecoins to reduce debt',
          parameters: z.object({
            amount: z.number().positive().describe('Amount of stablecoins to repay'),
            on_behalf_of: z.string().optional().describe('Repay on behalf of another user')
          })
        },
        async ({ amount, on_behalf_of }) => {
          return await graniteService.executeRepay({
            amount,
            onBehalfOf: on_behalf_of
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'granite_add_collateral',
          description: 'Deposit BTC (sBTC) as collateral to enable borrowing',
          parameters: z.object({
            collateral_token: z.string().describe('Collateral token contract address (sBTC)'),
            amount: z.number().positive().describe('Amount of collateral to deposit'),
            user: z.string().optional().describe('Deposit on behalf of another user')
          })
        },
        async ({ collateral_token, amount, user }) => {
          return graniteService.prepareAddCollateral({
            collateralToken: collateral_token,
            amount,
            user
          });
        }
      ),

      createTool(
        {
          name: 'granite_remove_collateral',
          description: 'Withdraw collateral if health factor allows',
          parameters: z.object({
            collateral_token: z.string().describe('Collateral token contract address'),
            amount: z.number().positive().describe('Amount of collateral to withdraw'),
            pyth_price_feed_data: z.string().optional().describe('Hex-encoded Pyth price feed data'),
            user: z.string().optional().describe('Withdraw on behalf of another user')
          })
        },
        async ({ collateral_token, amount, pyth_price_feed_data, user }) => {
          return graniteService.prepareRemoveCollateral({
            collateralToken: collateral_token,
            amount,
            pythPriceFeedData: pyth_price_feed_data,
            user
          });
        }
      ),

      // ========================= LIQUIDITY PROVIDER OPERATIONS =========================

      createTool(
        {
          name: 'granite_deposit',
          description: 'Deposit stablecoins to earn passive yield from borrowers',
          parameters: z.object({
            assets: z.number().positive().describe('Amount of stablecoins to deposit'),
            recipient: z.string().describe('Address to receive LP tokens')
          })
        },
        async ({ assets, recipient }) => {
          return await graniteService.executeDeposit({
            assets,
            recipient
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'granite_withdraw',
          description: 'Withdraw supplied assets plus earned interest',
          parameters: z.object({
            assets: z.number().positive().describe('Amount of stablecoins to withdraw'),
            recipient: z.string().describe('Address to receive withdrawn assets')
          })
        },
        async ({ assets, recipient }) => {
          return await graniteService.executeWithdraw({
            assets,
            recipient
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'granite_redeem',
          description: 'Redeem LP tokens for underlying stablecoin assets',
          parameters: z.object({
            shares: z.number().positive().describe('Number of LP tokens to redeem'),
            recipient: z.string().describe('Address to receive assets')
          })
        },
        async ({ shares, recipient }) => {
          return graniteService.prepareRedeem({
            shares,
            recipient
          });
        }
      ),

      // ========================= STAKING OPERATIONS =========================

      createTool(
        {
          name: 'granite_stake',
          description: 'Stake LP tokens to earn additional rewards',
          parameters: z.object({
            lp_tokens: z.number().positive().describe('Amount of LP tokens to stake')
          })
        },
        async ({ lp_tokens }) => {
          return await graniteService.executeStake({
            lpTokens: lp_tokens
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'granite_initiate_unstake',
          description: 'Initiate unstaking process (requires waiting period)',
          parameters: z.object({
            staked_lp_tokens: z.number().positive().describe('Amount of staked LP tokens to unstake')
          })
        },
        async ({ staked_lp_tokens }) => {
          return graniteService.prepareInitiateUnstake({
            stakedLpTokens: staked_lp_tokens
          });
        }
      ),

      createTool(
        {
          name: 'granite_finalize_unstake',
          description: 'Finalize unstaking after waiting period expires',
          parameters: z.object({
            index: z.number().nonnegative().describe('Index of unstake request to finalize')
          })
        },
        async ({ index }) => {
          return graniteService.prepareFinalizeUnstake(index);
        }
      ),

      // ========================= LIQUIDATION OPERATIONS =========================

      createTool(
        {
          name: 'granite_liquidate',
          description: 'Liquidate undercollateralized borrower position for profit',
          parameters: z.object({
            collateral_token: z.string().describe('Collateral token being liquidated'),
            user: z.string().describe('Address of borrower being liquidated'),
            liquidator_repay_amount: z.number().positive().describe('Amount of debt to repay'),
            min_collateral_expected: z.number().positive().describe('Minimum collateral to receive'),
            pyth_price_feed_data: z.string().optional().describe('Hex-encoded Pyth price feed data')
          })
        },
        async ({ collateral_token, user, liquidator_repay_amount, min_collateral_expected, pyth_price_feed_data }) => {
          return graniteService.prepareLiquidate({
            collateralToken: collateral_token,
            user,
            liquidatorRepayAmount: liquidator_repay_amount,
            minCollateralExpected: min_collateral_expected,
            pythPriceFeedData: pyth_price_feed_data
          });
        }
      ),

      // ========================= FLASH LOAN OPERATIONS =========================

      createTool(
        {
          name: 'granite_flash_loan',
          description: 'Execute uncollateralized flash loan (must repay + fee in same tx)',
          parameters: z.object({
            amount: z.number().positive().describe('Amount to borrow via flash loan'),
            callback_contract: z.string().describe('Contract implementing flash loan callback'),
            data: z.string().optional().describe('Optional data to pass to callback')
          })
        },
        async ({ amount, callback_contract, data }) => {
          return graniteService.prepareFlashLoan({
            amount,
            callbackContract: callback_contract,
            data
          });
        }
      ),

      createTool(
        {
          name: 'granite_get_flash_loan_info',
          description: 'Get flash loan contract information and requirements',
          parameters: z.object({})
        },
        async () => {
          return graniteService.getFlashLoanInfo();
        }
      ),

      // ========================= GOVERNANCE OPERATIONS =========================

      createTool(
        {
          name: 'granite_propose_market_feature',
          description: 'Propose to enable/disable market features via governance',
          parameters: z.object({
            action: z.number().nonnegative().describe('Action code for feature'),
            feature: z.boolean().describe('Enable (true) or disable (false) feature'),
            expires_in: z.number().positive().describe('Blocks until proposal expires'),
            cooldown: z.number().nonnegative().optional().describe('Cooldown period in blocks')
          })
        },
        async ({ action, feature, expires_in, cooldown }) => {
          return graniteService.prepareProposalSetMarketFeature(action, feature, {
            expiresIn: expires_in,
            cooldown
          });
        }
      ),

      createTool(
        {
          name: 'granite_propose_interest_params',
          description: 'Propose to update lending interest rate parameters',
          parameters: z.object({
            ir_slope_1: z.number().nonnegative().describe('Interest rate slope 1'),
            ir_slope_2: z.number().nonnegative().describe('Interest rate slope 2'),
            utilization_kink: z.number().nonnegative().describe('Utilization kink point'),
            base_ir: z.number().nonnegative().describe('Base interest rate'),
            expires_in: z.number().positive().describe('Blocks until proposal expires')
          })
        },
        async ({ ir_slope_1, ir_slope_2, utilization_kink, base_ir, expires_in }) => {
          return graniteService.prepareProposalUpdateInterestParams(
            ir_slope_1,
            ir_slope_2,
            utilization_kink,
            base_ir,
            expires_in
          );
        }
      ),

      // ========================= UTILITY TOOLS =========================

      createTool(
        {
          name: 'granite_get_contract_addresses',
          description: 'Get all Granite protocol contract addresses',
          parameters: z.object({})
        },
        async () => {
          return {
            network,
            contracts: graniteService.getContractAddresses()
          };
        }
      ),

      createTool(
        {
          name: 'granite_get_network_info',
          description: 'Get Granite network configuration and features',
          parameters: z.object({})
        },
        async () => {
          return graniteService.getNetworkInfo();
        }
      ),

      createTool(
        {
          name: 'granite_get_protocol_info',
          description: 'Get comprehensive Granite protocol information',
          parameters: z.object({})
        },
        async () => {
          return graniteService.getProtocolInfo();
        }
      ),
    ];
  }
}

/**
 * Factory function to create Granite plugin
 */
export function granite() {
  return new GranitePlugin();
}
