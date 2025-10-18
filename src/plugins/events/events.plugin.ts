import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Transaction Events operations plugin
 * Provides tools for detailed transaction event queries and analysis
 */
export class EventsPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get transaction events
      createTool(
        {
          name: 'get_transaction_events',
          description: 'Get events for a specific transaction with detailed filtering',
          parameters: z.object({
            tx_id: z.string().describe('Transaction ID'),
            address: z.string().optional().describe('Filter events by address involvement'),
            type: z.enum(['stx_asset', 'fungible_token_asset', 'non_fungible_token_asset', 'smart_contract_log', 'stx_lock']).optional().describe('Filter by event type'),
            offset: z.number().optional().default(0).describe('Event offset for pagination'),
            limit: z.number().optional().default(20).describe('Number of events to return'),
          }),
        },
        async ({ tx_id, address, type, offset, limit }) => {
          const params = new URLSearchParams({
            tx_id,
            offset: offset.toString(),
            limit: limit.toString(),
          });
          
          if (address) params.append('address', address);
          if (type) params.append('type', type);
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/events?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get transaction events: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get address transaction events  
      createTool(
        {
          name: 'get_address_transaction_events',
          description: 'Get transaction events for a specific address and transaction',
          parameters: z.object({
            address: z.string().describe('Stacks address'),
            tx_id: z.string().describe('Transaction ID'),
            limit: z.number().optional().default(20).describe('Number of events to return'),
            offset: z.number().optional().default(0).describe('Event offset for pagination'),
          }),
        },
        async ({ address, tx_id, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/addresses/${address}/transactions/${tx_id}/events?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get address transaction events: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get block transactions with detailed info
      createTool(
        {
          name: 'get_block_transactions_detailed',
          description: 'Get transactions in a block with detailed event information',
          parameters: z.object({
            height_or_hash: z.string().describe('Block height (number) or block hash'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
          }),
        },
        async ({ height_or_hash, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/blocks/${height_or_hash}/transactions?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get block transactions: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get raw transaction data
      createTool(
        {
          name: 'get_raw_transaction',
          description: 'Get raw transaction data in hex format',
          parameters: z.object({
            tx_id: z.string().describe('Transaction ID'),
            event_limit: z.number().optional().default(96).describe('Maximum number of events to include'),
            event_offset: z.number().optional().default(0).describe('Event offset for pagination'),
          }),
        },
        async ({ tx_id, event_limit, event_offset }) => {
          const params = new URLSearchParams({
            event_limit: event_limit.toString(),
            event_offset: event_offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/${tx_id}/raw?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get raw transaction: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get address transactions with event summaries
      createTool(
        {
          name: 'get_address_transactions_with_events',
          description: 'Get transactions for an address with event summaries and transfer info',
          parameters: z.object({
            address: z.string().describe('Stacks address'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
            exclude_function_args: z.boolean().optional().default(false).describe('Exclude function arguments from contract calls'),
          }),
        },
        async ({ address, limit, offset, exclude_function_args }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            exclude_function_args: exclude_function_args.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/addresses/${address}/transactions?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get address transactions with events: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get contract log events
      createTool(
        {
          name: 'get_contract_log_events',
          description: 'Get smart contract events for a specific contract',
          parameters: z.object({
            contract_id: z.string().describe('Contract ID (address.contract-name) - REQUIRED'),
            limit: z.number().optional().default(20).describe('Number of events to return'),
            offset: z.number().optional().default(0).describe('Event offset for pagination'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored events'),
          }),
        },
        async ({ contract_id, limit, offset, unanchored }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unanchored: unanchored.toString(),
          });

          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/contract/${contract_id}/events?${params}`, {
            headers: { 'Accept': 'application/json' }
          });

          if (!response.ok) {
            throw new Error(`Failed to get contract events: ${response.statusText}`);
          }

          return await response.json();
        }
      ),

      // Get STX transfer events
      createTool(
        {
          name: 'get_stx_transfer_events',
          description: 'Get STX transfer events for a specific address',
          parameters: z.object({
            address: z.string().describe('Stacks address - REQUIRED'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
          }),
        },
        async ({ address, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });

          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/transactions?${params}`, {
            headers: { 'Accept': 'application/json' }
          });

          if (!response.ok) {
            throw new Error(`Failed to get STX transfer events: ${response.statusText}`);
          }

          const data = await response.json();

          // Filter for STX transfer events
          const stxTransfers = data.results?.filter((tx: any) =>
            tx.tx_type === 'token_transfer' ||
            (tx.events && tx.events.some((e: any) => e.event_type === 'stx_asset'))
          ) || [];

          return {
            ...data,
            results: stxTransfers,
          };
        }
      ),
    ];
  }
}

/**
 * Factory function to create events plugin
 */
export function events() {
  return new EventsPlugin();
}