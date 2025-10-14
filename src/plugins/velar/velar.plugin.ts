import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { VelarService } from './velar.service.js';

/**
 * Velar Protocol Plugin
 * Multi-chain Bitcoin Layer-2 DEX with SDK and API integration
 * Uses @velarprotocol/velar-sdk for swap operations and API for price/pool data
 */
export class VelarPlugin extends PluginBase<StacksWalletClient> {

  async getTools(walletClient: StacksWalletClient) {
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';
    const velarService = new VelarService({ network });

    return [
      // ========================= SDK SWAP OPERATIONS =========================

      createTool(
        {
          name: 'velar_get_pairs',
          description: 'Get available trading pairs for a token',
          parameters: z.object({
            symbol: z.string().describe('Token symbol to query pairs for')
          })
        },
        async ({ symbol }) => {
          return await velarService.getPairs(symbol);
        }
      ),

      createTool(
        {
          name: 'velar_get_computed_amount',
          description: 'Get computed swap amount with optimal routing',
          parameters: z.object({
            account: z.string().describe('Stacks address performing the swap'),
            in_token: z.string().describe('Input token symbol'),
            out_token: z.string().describe('Output token symbol'),
            amount: z.number().positive().describe('Amount to swap in smallest units'),
            slippage: z.number().positive().optional().describe('Slippage tolerance percentage (default: 1)')
          })
        },
        async ({ account, in_token, out_token, amount, slippage }) => {
          return await velarService.getComputedAmount({
            account,
            inToken: in_token,
            outToken: out_token,
            amount,
            slippage
          });
        }
      ),

      createTool(
        {
          name: 'velar_get_swap_call_params',
          description: 'Get contract call parameters for executing a swap',
          parameters: z.object({
            account: z.string().describe('Stacks address performing the swap'),
            in_token: z.string().describe('Input token symbol'),
            out_token: z.string().describe('Output token symbol'),
            amount: z.number().positive().describe('Amount to swap in smallest units'),
            slippage: z.number().positive().optional().describe('Slippage tolerance percentage (default: 1)')
          })
        },
        async ({ account, in_token, out_token, amount, slippage }) => {
          return await velarService.getSwapCallParams({
            account,
            inToken: in_token,
            outToken: out_token,
            amount,
            slippage
          });
        }
      ),

      createTool(
        {
          name: 'velar_execute_swap',
          description: 'Execute token swap on Velar DEX with optimal routing',
          parameters: z.object({
            in_token: z.string().describe('Input token symbol or contract address'),
            out_token: z.string().describe('Output token symbol or contract address'),
            amount: z.number().positive().describe('Amount to swap in smallest units'),
            slippage: z.number().positive().optional().describe('Slippage tolerance percentage (default: 1)')
          })
        },
        async ({ in_token, out_token, amount, slippage }) => {
          const account = walletClient.getAddress();
          return await velarService.executeSwap({
            account,
            inToken: in_token,
            outToken: out_token,
            amount,
            slippage
          }, walletClient);
        }
      ),

      // ========================= SDK TOKEN OPERATIONS =========================

      createTool(
        {
          name: 'velar_get_tokens',
          description: 'Get list of available tokens from Velar SDK',
          parameters: z.object({})
        },
        async () => {
          return await velarService.getTokensFromSDK();
        }
      ),

      createTool(
        {
          name: 'velar_get_tokens_metadata',
          description: 'Get detailed metadata for all tokens from Velar SDK',
          parameters: z.object({})
        },
        async () => {
          return await velarService.getTokensMetadata();
        }
      ),

      // ========================= API TICKER & TOKEN DATA =========================

      createTool(
        {
          name: 'velar_get_all_tickers',
          description: 'Get all token tickers with current market data',
          parameters: z.object({})
        },
        async () => {
          return await velarService.getAllTickers();
        }
      ),

      createTool(
        {
          name: 'velar_get_token_details',
          description: 'Get detailed information about specific token or all tokens',
          parameters: z.object({
            symbol: z.string().optional().describe('Optional token symbol to filter results')
          })
        },
        async ({ symbol }) => {
          return await velarService.getTokenDetails(symbol);
        }
      ),

      createTool(
        {
          name: 'velar_get_circulating_supply',
          description: 'Get VELAR token circulating supply',
          parameters: z.object({})
        },
        async () => {
          return await velarService.getCirculatingSupply();
        }
      ),

      // ========================= API PRICE DATA =========================

      createTool(
        {
          name: 'velar_get_current_prices',
          description: 'Get current prices for all tokens',
          parameters: z.object({})
        },
        async () => {
          return await velarService.getCurrentPrices();
        }
      ),

      createTool(
        {
          name: 'velar_get_price_by_contract',
          description: 'Get current price for specific token by contract address',
          parameters: z.object({
            contract_address: z.string().describe('Token contract address')
          })
        },
        async ({ contract_address }) => {
          return await velarService.getPriceByContract(contract_address);
        }
      ),

      createTool(
        {
          name: 'velar_get_historical_prices',
          description: 'Get historical price data for a token',
          parameters: z.object({
            contract_address: z.string().describe('Token contract address'),
            interval: z.enum(['hour', 'week', 'month', 'year']).optional().describe('Time interval (default: week)')
          })
        },
        async ({ contract_address, interval }) => {
          return await velarService.getHistoricalPrices({
            contractAddress: contract_address,
            interval
          });
        }
      ),

      // ========================= API POOL DATA =========================

      createTool(
        {
          name: 'velar_get_all_pools',
          description: 'Get all liquidity pools with current data',
          parameters: z.object({})
        },
        async () => {
          return await velarService.getAllPools();
        }
      ),

      createTool(
        {
          name: 'velar_get_pool_by_lp_token',
          description: 'Get pool information by LP token address',
          parameters: z.object({
            lp_token_address: z.string().describe('LP token contract address')
          })
        },
        async ({ lp_token_address }) => {
          return await velarService.getPoolByLPToken(lp_token_address);
        }
      ),

      createTool(
        {
          name: 'velar_get_pool_by_token_pair',
          description: 'Get pool information by token pair',
          parameters: z.object({
            token0: z.string().describe('First token address'),
            token1: z.string().describe('Second token address')
          })
        },
        async ({ token0, token1 }) => {
          return await velarService.getPoolByTokenPair(token0, token1);
        }
      ),

      // ========================= UTILITY TOOLS =========================

      createTool(
        {
          name: 'velar_get_contract_addresses',
          description: 'Get Velar protocol contract addresses',
          parameters: z.object({})
        },
        async () => {
          return velarService.getContractAddresses();
        }
      ),

      createTool(
        {
          name: 'velar_get_network_info',
          description: 'Get Velar network configuration and version info',
          parameters: z.object({})
        },
        async () => {
          return velarService.getNetworkInfo();
        }
      ),
    ];
  }
}

/**
 * Factory function to create Velar plugin
 */
export function velar() {
  return new VelarPlugin();
}
