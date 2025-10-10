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

      // ========================= WALLET INTEGRATION =========================

      createTool(
        {
          name: 'alex_execute_swap',
          description: 'Execute a token swap on ALEX DEX (requires contract interaction)',
          parameters: z.object({
            token_from: z.string().describe('Source token contract address'),
            token_to: z.string().describe('Destination token contract address'),
            amount_in: z.number().describe('Amount of source token to swap'),
            min_amount_out: z.number().optional().describe('Minimum amount of destination token expected'),
            factor: z.number().optional().default(5000).describe('Pool factor (default: 5000)'),
          }),
        },
        async ({ token_from, token_to, amount_in, min_amount_out, factor }) => {
          // This would involve creating actual contract calls to ALEX AMM
          const swapRoute = `${token_from}/${token_to}`;
          
          console.error(`🔄 ALEX Swap: ${amount_in} ${token_from} → ${token_to}`);
          console.error(`📊 Route: ${swapRoute}, Factor: ${factor}`);
          console.error(`💼 Wallet: ${walletClient.getAddress()}`);
          
          return {
            success: true,
            message: 'ALEX swap prepared - contract interaction would be executed here',
            details: {
              tokenFrom: token_from,
              tokenTo: token_to,
              amountIn: amount_in,
              minAmountOut: min_amount_out,
              factor,
              swapRoute,
              walletAddress: walletClient.getAddress(),
              network,
              contractAddress: alexService.getContractAddress('ammPool')
            }
          };
        }
      ),

      createTool(
        {
          name: 'alex_add_liquidity',
          description: 'Add liquidity to ALEX pool (requires contract interaction)',
          parameters: z.object({
            token_x: z.string().describe('First token contract address'),
            token_y: z.string().describe('Second token contract address'),
            amount_x: z.number().describe('Amount of first token'),
            amount_y: z.number().describe('Amount of second token'),
            factor: z.number().optional().default(5000).describe('Pool factor (default: 5000)'),
          }),
        },
        async ({ token_x, token_y, amount_x, amount_y, factor }) => {
          const poolPair = `${token_x}/${token_y}`;
          
          console.error(`➕ ALEX Add Liquidity: ${amount_x} ${token_x} + ${amount_y} ${token_y}`);
          console.error(`🏊 Pool: ${poolPair}, Factor: ${factor}`);
          console.error(`💼 Wallet: ${walletClient.getAddress()}`);
          
          return {
            success: true,
            message: 'ALEX liquidity addition prepared - contract interaction would be executed here',
            details: {
              tokenX: token_x,
              tokenY: token_y,
              amountX: amount_x,
              amountY: amount_y,
              factor,
              poolPair,
              walletAddress: walletClient.getAddress(),
              network,
              contractAddress: alexService.getContractAddress('ammPool')
            }
          };
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