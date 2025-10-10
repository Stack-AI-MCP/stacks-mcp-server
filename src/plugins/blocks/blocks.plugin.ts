import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Block operations plugin
 * Provides tools for querying blockchain blocks and network information
 */
export class BlocksPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get block by hash
      createTool(
        {
          name: 'get_block_by_hash',
          description: 'Get block information by block hash',
          parameters: z.object({
            block_hash: z.string().describe('Block hash (hex string)'),
          }),
        },
        async ({ block_hash }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/block/${block_hash}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get block: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get block by height
      createTool(
        {
          name: 'get_block_by_height',
          description: 'Get block information by block height',
          parameters: z.object({
            block_height: z.number().describe('Block height'),
          }),
        },
        async ({ block_height }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/block/by_height/${block_height}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get block: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get recent blocks
      createTool(
        {
          name: 'get_recent_blocks',
          description: 'Get list of recent blocks',
          parameters: z.object({
            limit: z.number().optional().default(20).describe('Number of blocks to return'),
            offset: z.number().optional().default(0).describe('Block offset for pagination'),
          }),
        },
        async ({ limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/block?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get recent blocks: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get block transactions
      createTool(
        {
          name: 'get_block_transactions',
          description: 'Get transactions in a specific block',
          parameters: z.object({
            block_hash: z.string().describe('Block hash (hex string)'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
          }),
        },
        async ({ block_hash, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/block/${block_hash}?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get block transactions: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get network info
      createTool(
        {
          name: 'get_network_info',
          description: 'Get current network information and status',
          parameters: z.object({}),
        },
        async () => {
          return await apiService.getNetworkInfo(network);
        }
      ),

      // Get current block height
      createTool(
        {
          name: 'get_current_block_height',
          description: 'Get the current blockchain height',
          parameters: z.object({}),
        },
        async () => {
          return await apiService.getCurrentBlockHeight(network);
        }
      ),

      // Get burn block height
      createTool(
        {
          name: 'get_burn_block_info',
          description: 'Get information about burn blocks (Bitcoin blocks)',
          parameters: z.object({
            burn_block_height: z.number().optional().describe('Specific burn block height to query'),
          }),
        },
        async ({ burn_block_height }) => {
          const endpoint = burn_block_height 
            ? `/extended/v1/burn-block/${burn_block_height}`
            : '/extended/v1/burn-block/latest';
            
          const response = await fetch(`${apiService.getApiUrl(network)}${endpoint}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get burn block info: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get microblocks
      createTool(
        {
          name: 'get_microblocks',
          description: 'Get microblocks for a specific block',
          parameters: z.object({
            block_hash: z.string().describe('Block hash to get microblocks for'),
            limit: z.number().optional().default(20).describe('Number of microblocks to return'),
            offset: z.number().optional().default(0).describe('Microblock offset for pagination'),
          }),
        },
        async ({ block_hash, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/microblock/${block_hash}?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get microblocks: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),
    ];
  }
}

/**
 * Factory function to create blocks plugin
 */
export function blocks() {
  return new BlocksPlugin();
}