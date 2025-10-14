import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { AlexService } from './alex.service.js';

/**
 * ALEX Lab Foundation DEX plugin
 * Comprehensive tools for ALEX DeFi operations on Stacks
 * Based on official ALEX API and contract documentation
 */
export class AlexPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';
    const alexService = new AlexService(network);

    return [
      // ========================= SWAP OPERATIONS =========================
      
      createTool(
        {
          name: 'alex_get_all_swaps',
          description: 'Get all available swap pairs with current volumes and prices in USD',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAllSwaps();
        }
      ),

      createTool(
        {
          name: 'alex_get_trading_pairs',
          description: 'Get all active trading pairs on ALEX AMM',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getTradingPairs();
        }
      ),

      createTool(
        {
          name: 'alex_get_all_tickers',
          description: 'Get market statistics for all trading pairs (24h data)',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAllTickers();
        }
      ),

      createTool(
        {
          name: 'alex_get_ticker',
          description: 'Get market statistics for specific trading pair',
          parameters: z.object({
            ticker_id: z.string().describe('Ticker ID (format: token1_token2)'),
          }),
        },
        async ({ ticker_id }) => {
          return await alexService.getTicker(ticker_id);
        }
      ),

      createTool(
        {
          name: 'alex_get_historical_swaps',
          description: 'Get historical trades for specific pool token',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
            limit: z.number().optional().default(1000).describe('Number of trades to return'),
          }),
        },
        async ({ pool_token_id, limit }) => {
          return await alexService.getHistoricalSwaps(pool_token_id, limit);
        }
      ),

      // ========================= PRICING DATA =========================

      createTool(
        {
          name: 'alex_get_token_price',
          description: 'Get current price of a specific token',
          parameters: z.object({
            token_address: z.string().describe('Token contract address'),
          }),
        },
        async ({ token_address }) => {
          return await alexService.getTokenPrice(token_address);
        }
      ),

      createTool(
        {
          name: 'alex_get_token_price_history',
          description: 'Get historical price data for a token',
          parameters: z.object({
            token_address: z.string().describe('Token contract address'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
            order_by: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order'),
            start_block_height: z.number().optional().describe('Start block height'),
            end_block_height: z.number().optional().describe('End block height'),
          }),
        },
        async ({ token_address, limit, offset, order_by, start_block_height, end_block_height }) => {
          return await alexService.getTokenPriceHistory(token_address, {
            limit,
            offset,
            orderBy: order_by,
            startBlockHeight: start_block_height,
            endBlockHeight: end_block_height
          });
        }
      ),

      createTool(
        {
          name: 'alex_get_token_price_15min',
          description: 'Get 15-minute interval price history for a token',
          parameters: z.object({
            token_address: z.string().describe('Token contract address'),
            start_ts: z.number().describe('Start unix timestamp'),
            end_ts: z.number().describe('End unix timestamp'),
            limit: z.number().optional().default(10).describe('Number of intervals'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
            order_by: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order'),
          }),
        },
        async ({ token_address, start_ts, end_ts, limit, offset, order_by }) => {
          return await alexService.getTokenPriceHistory15Min(token_address, start_ts, end_ts, {
            limit,
            offset,
            orderBy: order_by
          });
        }
      ),

      createTool(
        {
          name: 'alex_get_all_token_prices',
          description: 'Get current prices for all tokens on ALEX',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAllTokenPrices();
        }
      ),

      // ========================= POOL OPERATIONS =========================

      createTool(
        {
          name: 'alex_get_pool_token_price',
          description: 'Get current price of a pool token',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
          }),
        },
        async ({ pool_token_id }) => {
          return await alexService.getPoolTokenPrice(pool_token_id);
        }
      ),

      createTool(
        {
          name: 'alex_get_all_pool_stats',
          description: 'Get statistics for all pool tokens',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAllPoolTokenStats();
        }
      ),

      createTool(
        {
          name: 'alex_get_pool_stats',
          description: 'Get detailed statistics for a specific pool including volume, fees, liquidity and APR',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
          }),
        },
        async ({ pool_token_id, limit, offset }) => {
          return await alexService.getPoolStats(pool_token_id, limit, offset);
        }
      ),

      createTool(
        {
          name: 'alex_get_pool_volume_24h',
          description: 'Get 24-hour pool volume history',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
          }),
        },
        async ({ pool_token_id, limit, offset }) => {
          return await alexService.getPoolVolume24h(pool_token_id, limit, offset);
        }
      ),

      createTool(
        {
          name: 'alex_get_pool_volume_7d',
          description: 'Get 7-day pool volume history',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
          }),
        },
        async ({ pool_token_id, limit, offset }) => {
          return await alexService.getPoolVolume7d(pool_token_id, limit, offset);
        }
      ),

      createTool(
        {
          name: 'alex_get_pool_liquidity',
          description: 'Get liquidity history for a specific pool',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
          }),
        },
        async ({ pool_token_id, limit, offset }) => {
          return await alexService.getPoolLiquidity(pool_token_id, limit, offset);
        }
      ),

      createTool(
        {
          name: 'alex_get_pool_fees',
          description: 'Get fee rebate history for a specific pool',
          parameters: z.object({
            pool_token_id: z.number().describe('Pool token ID'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
          }),
        },
        async ({ pool_token_id, limit, offset }) => {
          return await alexService.getPoolFees(pool_token_id, limit, offset);
        }
      ),

      createTool(
        {
          name: 'alex_get_all_pools',
          description: 'Get information about all pools on ALEX',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAllPools();
        }
      ),

      createTool(
        {
          name: 'alex_get_amm_pool_stats',
          description: 'Get AMM pool statistics including TVL and APY',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAmmPoolStats();
        }
      ),

      // ========================= TVL & STATISTICS =========================

      createTool(
        {
          name: 'alex_get_total_tvl',
          description: 'Get total value locked across all ALEX pools',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getTotalTVL();
        }
      ),

      createTool(
        {
          name: 'alex_get_token_tvl',
          description: 'Get TVL time series for a specific token',
          parameters: z.object({
            token_address: z.string().describe('Token contract address'),
            limit: z.number().optional().default(10).describe('Number of data points'),
            offset: z.number().optional().default(0).describe('Offset for pagination'),
          }),
        },
        async ({ token_address, limit, offset }) => {
          return await alexService.getTokenTVL(token_address, limit, offset);
        }
      ),

      createTool(
        {
          name: 'alex_get_token_total_supply',
          description: 'Get total supply for a specific token',
          parameters: z.object({
            token_name: z.string().describe('Token name (e.g., age000-governance-token)'),
          }),
        },
        async ({ token_name }) => {
          return await alexService.getTokenTotalSupply(token_name);
        }
      ),

      createTool(
        {
          name: 'alex_get_circulating_supply',
          description: 'Get circulating supply of ALEX governance token',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getAlexCirculatingSupply();
        }
      ),

      createTool(
        {
          name: 'alex_get_token_mappings',
          description: 'Get token mappings (wrapped token relationships)',
          parameters: z.object({}),
        },
        async () => {
          return await alexService.getTokenMappings();
        }
      ),

      // ========================= CONTRACT INFORMATION =========================

      createTool(
        {
          name: 'alex_get_contract_addresses',
          description: 'Get all ALEX contract addresses for current network',
          parameters: z.object({}),
        },
        async () => {
          return {
            network,
            contracts: alexService.getContractAddresses()
          };
        }
      ),

      createTool(
        {
          name: 'alex_get_contract_address',
          description: 'Get specific ALEX contract address',
          parameters: z.object({
            contract_name: z.enum([
              'dao', 'vault', 'reservePool', 'ammPool', 'fixedWeightPool', 
              'swapRouter', 'swapBridge', 'alexToken', 'autoAlex', 'swapHelper'
            ]).describe('Contract name to lookup'),
          }),
        },
        async ({ contract_name }) => {
          return {
            network,
            contract_name,
            address: alexService.getContractAddress(contract_name as any)
          };
        }
      ),

      // ========================= FLASH LOANS (CONTRACT INTERACTION) =========================

      createTool(
        {
          name: 'alex_get_flash_loan_contract_info',
          description: 'Get information about ALEX flash loan contract and requirements',
          parameters: z.object({}),
        },
        async () => {
          return alexService.getFlashLoanContractInfo();
        }
      ),

      createTool(
        {
          name: 'alex_prepare_flash_loan_contract_call',
          description: 'Prepare flash loan contract call with requirements and estimated fees',
          parameters: z.object({
            token_address: z.string().describe('Token contract address to borrow'),
            amount: z.string().describe('Amount to borrow (in token units)'),
            memo: z.string().optional().describe('Optional memo for the transaction'),
          }),
        },
        async ({ token_address, amount, memo }) => {
          const userAddress = walletClient.getAddress();
          return alexService.prepareFlashLoanContractCall(token_address, amount, userAddress, memo);
        }
      ),

      // ========================= SWAP EXECUTION =========================

      createTool(
        {
          name: 'alex_execute_swap',
          description: 'Execute 1-hop token swap on ALEX AMM via swap-helper',
          parameters: z.object({
            token_x: z.string().describe('Input token contract address'),
            token_y: z.string().describe('Output token contract address'),
            dx: z.number().positive().describe('Amount of token X to swap'),
            min_dy: z.number().positive().optional().describe('Minimum amount of token Y expected'),
            factor: z.number().positive().default(5000).describe('Pool factor (default: 5000)'),
          }),
        },
        async ({ token_x, token_y, dx, min_dy, factor }) => {
          return await alexService.executeSwap({
            tokenX: token_x,
            tokenY: token_y,
            factor,
            dx,
            minDy: min_dy
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'alex_execute_swap_2hop',
          description: 'Execute 2-hop token swap via swap-helper-a (token-x/token-y -> token-y/token-z)',
          parameters: z.object({
            token_x: z.string().describe('Input token contract address'),
            token_y: z.string().describe('Intermediate token contract address'),
            token_z: z.string().describe('Output token contract address'),
            factor_x: z.number().positive().default(5000).describe('Factor for token-x/token-y pool'),
            factor_y: z.number().positive().default(5000).describe('Factor for token-y/token-z pool'),
            dx: z.number().positive().describe('Amount of token X to swap'),
            min_dz: z.number().positive().optional().describe('Minimum amount of token Z expected'),
          }),
        },
        async ({ token_x, token_y, token_z, factor_x, factor_y, dx, min_dz }) => {
          return await alexService.executeSwap2Hop({
            tokenX: token_x,
            tokenY: token_y,
            tokenZ: token_z,
            factorX: factor_x,
            factorY: factor_y,
            dx,
            minDz: min_dz
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'alex_execute_swap_3hop',
          description: 'Execute 3-hop token swap via swap-helper-b (X->Y->Z->W)',
          parameters: z.object({
            token_x: z.string().describe('Input token contract address'),
            token_y: z.string().describe('First intermediate token'),
            token_z: z.string().describe('Second intermediate token'),
            token_w: z.string().describe('Output token contract address'),
            factor_x: z.number().positive().default(5000).describe('Factor for X/Y pool'),
            factor_y: z.number().positive().default(5000).describe('Factor for Y/Z pool'),
            factor_z: z.number().positive().default(5000).describe('Factor for Z/W pool'),
            dx: z.number().positive().describe('Amount of token X to swap'),
            min_dw: z.number().positive().optional().describe('Minimum amount of token W expected'),
          }),
        },
        async ({ token_x, token_y, token_z, token_w, factor_x, factor_y, factor_z, dx, min_dw }) => {
          return await alexService.executeSwap3Hop({
            tokenX: token_x,
            tokenY: token_y,
            tokenZ: token_z,
            tokenW: token_w,
            factorX: factor_x,
            factorY: factor_y,
            factorZ: factor_z,
            dx,
            minDw: min_dw
          }, walletClient);
        }
      ),

      createTool(
        {
          name: 'alex_execute_swap_4hop',
          description: 'Execute 4-hop token swap via swap-helper-c (X->Y->Z->W->V)',
          parameters: z.object({
            token_x: z.string().describe('Input token contract address'),
            token_y: z.string().describe('First intermediate token'),
            token_z: z.string().describe('Second intermediate token'),
            token_w: z.string().describe('Third intermediate token'),
            token_v: z.string().describe('Output token contract address'),
            factor_x: z.number().positive().default(5000).describe('Factor for X/Y pool'),
            factor_y: z.number().positive().default(5000).describe('Factor for Y/Z pool'),
            factor_z: z.number().positive().default(5000).describe('Factor for Z/W pool'),
            factor_w: z.number().positive().default(5000).describe('Factor for W/V pool'),
            dx: z.number().positive().describe('Amount of token X to swap'),
            min_dv: z.number().positive().optional().describe('Minimum amount of token V expected'),
          }),
        },
        async ({ token_x, token_y, token_z, token_w, token_v, factor_x, factor_y, factor_z, factor_w, dx, min_dv }) => {
          return await alexService.executeSwap4Hop({
            tokenX: token_x,
            tokenY: token_y,
            tokenZ: token_z,
            tokenW: token_w,
            tokenV: token_v,
            factorX: factor_x,
            factorY: factor_y,
            factorZ: factor_z,
            factorW: factor_w,
            dx,
            minDv: min_dv
          }, walletClient);
        }
      ),
    ];
  }
}

/**
 * Factory function to create ALEX plugin
 */
export function alex() {
  return new AlexPlugin();
}