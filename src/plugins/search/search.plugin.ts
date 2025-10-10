import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Search operations plugin
 * Provides tools for searching blocks, transactions, contracts, and accounts
 */
export class SearchPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Search by ID
      createTool(
        {
          name: 'search_by_id',
          description: 'Search blocks, transactions, contracts, or accounts by hash/ID',
          parameters: z.object({
            id: z.string().describe('Hash or ID to search for (transaction ID, block hash, contract ID, or address)'),
            include_metadata: z.boolean().optional().default(false).describe('Include metadata in response'),
          }),
        },
        async ({ id, include_metadata }) => {
          const params = new URLSearchParams({
            include_metadata: include_metadata.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/search/${id}?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to search: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get account balances
      createTool(
        {
          name: 'get_account_balance',
          description: 'Get STX and token balances for an account',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
          }),
        },
        async ({ address, unanchored }) => {
          const params = new URLSearchParams({
            unanchored: unanchored.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/balances?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get account balance: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get account STX balance
      createTool(
        {
          name: 'get_account_stx_balance',
          description: 'Get STX balance for an account',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
            until_block: z.string().optional().describe('Get balance at specific block hash'),
          }),
        },
        async ({ address, unanchored, until_block }) => {
          const params = new URLSearchParams({
            unanchored: unanchored.toString(),
          });
          
          if (until_block) params.append('until_block', until_block);
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/stx?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get STX balance: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get account nonces
      createTool(
        {
          name: 'get_account_nonces',
          description: 'Get nonce information for an account',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            block_height: z.number().optional().describe('Get nonces at specific block height'),
            block_hash: z.string().optional().describe('Get nonces at specific block hash'),
          }),
        },
        async ({ address, block_height, block_hash }) => {
          const params = new URLSearchParams();
          
          if (block_height) params.append('block_height', block_height.toString());
          if (block_hash) params.append('block_hash', block_hash);
          
          const queryString = params.toString() ? `?${params}` : '';
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/nonces${queryString}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get account nonces: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get wallet balance and info
      createTool(
        {
          name: 'get_wallet_info',
          description: 'Get current wallet address, balance, and network information',
          parameters: z.object({}),
        },
        async () => {
          const address = walletClient.getAddress();
          const network = walletClient.getNetwork();
          const balance = await walletClient.getBalance();
          
          return {
            address,
            network,
            balance,
          };
        }
      ),
    ];
  }
}

/**
 * Factory function to create search plugin
 */
export function search() {
  return new SearchPlugin();
}