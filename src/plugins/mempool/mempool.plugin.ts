import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Mempool operations plugin
 * Provides tools for querying mempool statistics and transactions
 */
export class MempoolPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get mempool stats
      createTool(
        {
          name: 'get_mempool_stats',
          description: 'Get current mempool statistics',
          parameters: z.object({}),
        },
        async () => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/mempool/stats`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get mempool stats: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get mempool fee estimates
      createTool(
        {
          name: 'get_fee_estimates',
          description: 'Get current fee estimates for transactions',
          parameters: z.object({
            estimated_len: z.number().optional().describe('Estimated transaction length in bytes'),
            estimated_len_sig: z.number().optional().describe('Estimated signature length in bytes'),
          }),
        },
        async ({ estimated_len, estimated_len_sig }) => {
          const params = new URLSearchParams();
          if (estimated_len) params.append('estimated_len', estimated_len.toString());
          if (estimated_len_sig) params.append('estimated_len_sig', estimated_len_sig.toString());
          
          const queryString = params.toString() ? `?${params}` : '';
          
          const response = await fetch(`${apiService.getApiUrl(network)}/v2/fees/transfer${queryString}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get fee estimates: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get dropped mempool transactions
      createTool(
        {
          name: 'get_dropped_mempool_txs',
          description: 'Get transactions that were dropped from mempool',
          parameters: z.object({
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
          }),
        },
        async ({ limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/mempool/dropped?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get dropped mempool transactions: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get mempool transactions by address
      createTool(
        {
          name: 'get_mempool_txs_by_address',
          description: 'Get mempool transactions for a specific address',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
          }),
        },
        async ({ address, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/mempool?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get mempool transactions for address: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Broadcast raw transaction
      createTool(
        {
          name: 'broadcast_transaction',
          description: 'Broadcast a raw transaction to the network',
          parameters: z.object({
            tx_hex: z.string().describe('Raw transaction data in hex format'),
          }),
        },
        async ({ tx_hex }) => {
          return await apiService.broadcastTransaction(tx_hex, network);
        }
      ),

      // Get transaction nonce requirements
      createTool(
        {
          name: 'get_nonce_info',
          description: 'Get nonce information for transaction preparation',
          parameters: z.object({
            address: z.string().optional().describe('Address to check (defaults to wallet address)'),
          }),
        },
        async ({ address }) => {
          const targetAddress = address || walletClient.getAddress();
          return await walletClient.getNonce(targetAddress);
        }
      ),

      // Estimate transaction fees
      createTool(
        {
          name: 'estimate_contract_call_fee',
          description: 'Estimate fees for a contract call transaction',
          parameters: z.object({
            contract_address: z.string().describe('Contract address'),
            contract_name: z.string().describe('Contract name'),
            function_name: z.string().describe('Function name to call'),
            function_args: z.array(z.string()).optional().default([]).describe('Function arguments'),
          }),
        },
        async ({ contract_address, contract_name, function_name, function_args }) => {
          // Use existing fee estimation endpoints
          const params = new URLSearchParams({
            estimated_len: '200', // Rough estimate for contract call
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/v2/fees/transaction?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to estimate contract call fee: ${response.statusText}`);
          }
          
          const feeData = await response.json();
          
          return {
            contract_call: {
              contract_address,
              contract_name,
              function_name,
              estimated_fee: feeData,
            }
          };
        }
      ),
    ];
  }
}

/**
 * Factory function to create mempool plugin
 */
export function mempool() {
  return new MempoolPlugin();
}