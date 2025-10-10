import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Fungible Token operations plugin
 * Provides tools for interacting with SIP-010 fungible tokens
 */
export class TokensPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get fungible token holders
      createTool(
        {
          name: 'get_ft_holders',
          description: 'Get list of holders for a fungible token',
          parameters: z.object({
            token_id: z.string().describe('Fungible token identifier (format: address.contract-name::asset-name)'),
            limit: z.number().optional().default(20).describe('Number of holders to return'),
            offset: z.number().optional().default(0).describe('Holder offset for pagination'),
          }),
        },
        async ({ token_id, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tokens/ft/${token_id}/holders?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get FT holders: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get fungible token metadata
      createTool(
        {
          name: 'get_ft_metadata',
          description: 'Get metadata for a fungible token',
          parameters: z.object({
            contract_id: z.string().describe('Token contract ID (format: address.contract-name)'),
          }),
        },
        async ({ contract_id }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tokens/ft/${contract_id}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get FT metadata: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get fungible token balance for address
      createTool(
        {
          name: 'get_ft_balance',
          description: 'Get fungible token balance for a specific address',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            token_id: z.string().describe('Fungible token identifier (format: address.contract-name::asset-name)'),
          }),
        },
        async ({ address, token_id }) => {
          return await apiService.getFungibleTokenBalance(address, token_id, network);
        }
      ),

      // Get all fungible token balances for address
      createTool(
        {
          name: 'get_address_ft_balances',
          description: 'Get all fungible token balances for an address',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            limit: z.number().optional().default(20).describe('Number of tokens to return'),
            offset: z.number().optional().default(0).describe('Token offset for pagination'),
          }),
        },
        async ({ address, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/assets?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get address FT balances: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get fungible token info with metadata
      createTool(
        {
          name: 'get_ft_info',
          description: 'Get comprehensive information about a fungible token including name, symbol, decimals',
          parameters: z.object({
            contract_id: z.string().describe('Token contract ID (format: address.contract-name)'),
          }),
        },
        async ({ contract_id }) => {
          return await apiService.getFungibleTokenInfo(contract_id, network);
        }
      ),

      // Transfer fungible tokens
      createTool(
        {
          name: 'transfer_ft',
          description: 'Transfer fungible tokens to another address',
          parameters: z.object({
            contract_id: z.string().describe('Token contract ID (format: address.contract-name)'),
            asset_name: z.string().describe('Asset name within the contract'),
            recipient: z.string().describe('Recipient Stacks address'),
            amount: z.number().describe('Amount to transfer'),
            memo: z.string().optional().describe('Optional memo message'),
          }),
        },
        async ({ contract_id, asset_name, recipient, amount, memo }) => {
          const [contractAddress, contractName] = contract_id.split('.');
          return await walletClient.transferFungibleToken(
            contractAddress,
            contractName,
            asset_name,
            recipient,
            amount,
            memo
          );
        }
      ),
    ];
  }
}

/**
 * Factory function to create tokens plugin
 */
export function tokens() {
  return new TokensPlugin();
}