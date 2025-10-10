import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * StackPool operations plugin
 * Provides tools for stacking pool delegations and burnchain rewards
 */
export class StackPoolPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get pool delegations
      createTool(
        {
          name: 'get_pool_delegations',
          description: 'Get stacking pool delegations for a pool principal',
          parameters: z.object({
            pool_principal: z.string().describe('Pool principal address'),
            limit: z.number().optional().default(20).describe('Number of delegations to return'),
            offset: z.number().optional().default(0).describe('Delegation offset for pagination'),
            after_block: z.number().optional().describe('Only include delegations after this block'),
            height: z.number().optional().describe('Get delegations at specific block height'),
            unanchored: z.boolean().optional().default(true).describe('Include unanchored transactions'),
          }),
        },
        async ({ pool_principal, limit, offset, after_block, height, unanchored }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unanchored: unanchored.toString(),
          });
          
          if (after_block) params.append('after_block', after_block.toString());
          if (height) params.append('height', height.toString());
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/pox/${pool_principal}/delegations?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get pool delegations: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get burnchain reward slot holders
      createTool(
        {
          name: 'get_burnchain_reward_slots',
          description: 'Get burnchain reward slot holders (Bitcoin reward recipients)',
          parameters: z.object({
            limit: z.number().optional().default(20).describe('Number of slots to return'),
            offset: z.number().optional().default(0).describe('Slot offset for pagination'),
          }),
        },
        async ({ limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/burnchain/reward_slot_holders?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get burnchain reward slots: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get reward slots for specific address
      createTool(
        {
          name: 'get_address_reward_slots',
          description: 'Get burnchain reward slots for a specific Bitcoin address',
          parameters: z.object({
            address: z.string().describe('Bitcoin address to query'),
            limit: z.number().optional().default(20).describe('Number of slots to return'),
            offset: z.number().optional().default(0).describe('Slot offset for pagination'),
          }),
        },
        async ({ address, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/burnchain/reward_slot_holders/${address}?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get address reward slots: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get burnchain rewards
      createTool(
        {
          name: 'get_burnchain_rewards',
          description: 'Get burnchain rewards paid to Bitcoin addresses',
          parameters: z.object({
            limit: z.number().optional().default(20).describe('Number of rewards to return'),
            offset: z.number().optional().default(0).describe('Reward offset for pagination'),
          }),
        },
        async ({ limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/burnchain/rewards?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get burnchain rewards: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get rewards for specific Bitcoin address
      createTool(
        {
          name: 'get_address_burnchain_rewards',
          description: 'Get burnchain rewards for a specific Bitcoin address',
          parameters: z.object({
            address: z.string().describe('Bitcoin address to query'),
            limit: z.number().optional().default(20).describe('Number of rewards to return'),
            offset: z.number().optional().default(0).describe('Reward offset for pagination'),
          }),
        },
        async ({ address, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/burnchain/rewards/${address}?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get address burnchain rewards: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get total burnchain rewards for address
      createTool(
        {
          name: 'get_total_burnchain_rewards',
          description: 'Get total burnchain rewards earned by a Bitcoin address',
          parameters: z.object({
            address: z.string().describe('Bitcoin address to query'),
          }),
        },
        async ({ address }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/burnchain/rewards/${address}/total`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get total burnchain rewards: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),
    ];
  }
}

/**
 * Factory function to create stackpool plugin
 */
export function stackpool() {
  return new StackPoolPlugin();
}