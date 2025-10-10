import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Transaction operations plugin
 * Provides tools for querying and managing Stacks transactions
 */
export class TransactionsPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get transaction details
      createTool(
        {
          name: 'get_transaction',
          description: 'Get detailed information about a transaction by ID',
          parameters: z.object({
            tx_id: z.string().describe('Transaction ID (hex string)'),
            event_limit: z.number().optional().default(96).describe('Maximum number of events to return'),
            event_offset: z.number().optional().default(0).describe('Event offset for pagination'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
          }),
        },
        async ({ tx_id, event_limit, event_offset, unanchored }) => {
          const params = new URLSearchParams({
            event_limit: event_limit.toString(),
            event_offset: event_offset.toString(),
            unanchored: unanchored.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/${tx_id}?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get transaction: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get mempool transactions
      createTool(
        {
          name: 'get_mempool_transactions',
          description: 'Get transactions currently in the mempool',
          parameters: z.object({
            sender_address: z.string().optional().describe('Filter by sender address'),
            recipient_address: z.string().optional().describe('Filter by recipient address'),
            address: z.string().optional().describe('Filter by address (sender or recipient)'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
          }),
        },
        async ({ sender_address, recipient_address, address, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          if (sender_address) params.append('sender_address', sender_address);
          if (recipient_address) params.append('recipient_address', recipient_address);
          if (address) params.append('address', address);
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx/mempool?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get mempool transactions: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get recent transactions
      createTool(
        {
          name: 'get_recent_transactions',
          description: 'Get list of recent transactions',
          parameters: z.object({
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
            type: z.enum(['coinbase', 'token_transfer', 'smart_contract', 'contract_call', 'poison_microblock']).optional().describe('Filter by transaction type'),
          }),
        },
        async ({ limit, offset, type }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          if (type) params.append('type', type);
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tx?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get recent transactions: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Send STX tokens
      createTool(
        {
          name: 'send_stx',
          description: 'Send STX tokens to another address',
          parameters: z.object({
            recipient: z.string().describe('Recipient Stacks address'),
            amount: z.number().describe('Amount of STX to send'),
            memo: z.string().optional().describe('Optional memo message'),
          }),
        },
        async ({ recipient, amount, memo }) => {
          return await walletClient.transferSTX(recipient, amount, memo);
        }
      ),

      // Get address transactions
      createTool(
        {
          name: 'get_address_transactions',
          description: 'Get transactions for a specific address',
          parameters: z.object({
            address: z.string().describe('Stacks address'),
            limit: z.number().optional().default(20).describe('Number of transactions to return'),
            offset: z.number().optional().default(0).describe('Transaction offset for pagination'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
          }),
        },
        async ({ address, limit, offset, unanchored }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unanchored: unanchored.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/transactions?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get address transactions: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),
    ];
  }
}

/**
 * Factory function to create transactions plugin
 */
export function transactions() {
  return new TransactionsPlugin();
}