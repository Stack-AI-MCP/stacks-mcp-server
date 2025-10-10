import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * PoX (Proof of Transfer) operations plugin
 * Provides tools for stacking and PoX-related operations
 */
export class PoxPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get PoX cycles
      createTool(
        {
          name: 'get_pox_cycles',
          description: 'Get list of PoX cycles with stacking information',
          parameters: z.object({
            limit: z.number().optional().default(20).describe('Number of cycles to return'),
            offset: z.number().optional().default(0).describe('Cycle offset for pagination'),
          }),
        },
        async ({ limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/pox/cycles?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get PoX cycles: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get specific PoX cycle
      createTool(
        {
          name: 'get_pox_cycle',
          description: 'Get detailed information about a specific PoX cycle',
          parameters: z.object({
            cycle_number: z.number().describe('PoX cycle number'),
          }),
        },
        async ({ cycle_number }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/pox/cycles/${cycle_number}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get PoX cycle: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get cycle signers
      createTool(
        {
          name: 'get_cycle_signers',
          description: 'Get signers for a specific PoX cycle',
          parameters: z.object({
            cycle_number: z.number().describe('PoX cycle number'),
            limit: z.number().optional().default(20).describe('Number of signers to return'),
            offset: z.number().optional().default(0).describe('Signer offset for pagination'),
          }),
        },
        async ({ cycle_number, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/pox/cycles/${cycle_number}/signers?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get cycle signers: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get signer details
      createTool(
        {
          name: 'get_signer_details',
          description: 'Get detailed information about a specific signer in a PoX cycle',
          parameters: z.object({
            cycle_number: z.number().describe('PoX cycle number'),
            signer_key: z.string().describe('Signer public key'),
          }),
        },
        async ({ cycle_number, signer_key }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/pox/cycles/${cycle_number}/signers/${signer_key}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get signer details: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get signer stackers
      createTool(
        {
          name: 'get_signer_stackers',
          description: 'Get stackers associated with a specific signer',
          parameters: z.object({
            cycle_number: z.number().describe('PoX cycle number'),
            signer_key: z.string().describe('Signer public key'),
            limit: z.number().optional().default(20).describe('Number of stackers to return'),
            offset: z.number().optional().default(0).describe('Stacker offset for pagination'),
          }),
        },
        async ({ cycle_number, signer_key, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/pox/cycles/${cycle_number}/signers/${signer_key}/stackers?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get signer stackers: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Stack STX
      createTool(
        {
          name: 'stack_stx',
          description: 'Stack STX tokens for a specified duration',
          parameters: z.object({
            amount: z.number().describe('Amount of STX to stack (in STX, not microSTX)'),
            cycles: z.number().describe('Number of cycles to stack for'),
            pox_address: z.string().describe('Bitcoin address to receive rewards'),
            start_burn_height: z.number().optional().describe('Burn height to start stacking (optional)'),
          }),
        },
        async ({ amount, cycles, pox_address, start_burn_height }) => {
          return await walletClient.stackSTX(amount, cycles, pox_address, start_burn_height);
        }
      ),

      // Get stacking info
      createTool(
        {
          name: 'get_stacking_info',
          description: 'Get current stacking information for the wallet',
          parameters: z.object({
            address: z.string().optional().describe('Address to check (defaults to wallet address)'),
          }),
        },
        async ({ address }) => {
          return await walletClient.getStackingInfo(address);
        }
      ),
    ];
  }
}

/**
 * Factory function to create PoX plugin
 */
export function pox() {
  return new PoxPlugin();
}