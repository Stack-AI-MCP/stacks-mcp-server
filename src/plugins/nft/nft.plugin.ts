import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Non-Fungible Token operations plugin
 * Provides tools for interacting with SIP-009 NFTs
 */
export class NftPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get NFT holdings for address
      createTool(
        {
          name: 'get_nft_holdings',
          description: 'Get NFT holdings for a specific address',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            asset_identifiers: z.array(z.string()).optional().describe('Filter by specific NFT asset identifiers'),
            limit: z.number().optional().default(20).describe('Number of NFTs to return'),
            offset: z.number().optional().default(0).describe('NFT offset for pagination'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
          }),
        },
        async ({ address, asset_identifiers, limit, offset, unanchored }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unanchored: unanchored.toString(),
          });
          
          if (asset_identifiers && asset_identifiers.length > 0) {
            asset_identifiers.forEach(id => params.append('asset_identifiers', id));
          }
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/assets?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get NFT holdings: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get NFT history for address
      createTool(
        {
          name: 'get_nft_history',
          description: 'Get NFT transaction history for an address',
          parameters: z.object({
            address: z.string().describe('Stacks address to query'),
            asset_identifier: z.string().optional().describe('Filter by specific NFT asset identifier'),
            value: z.string().optional().describe('Filter by specific NFT value (hex representation)'),
            limit: z.number().optional().default(20).describe('Number of events to return'),
            offset: z.number().optional().default(0).describe('Event offset for pagination'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
          }),
        },
        async ({ address, asset_identifier, value, limit, offset, unanchored }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unanchored: unanchored.toString(),
          });
          
          if (asset_identifier) params.append('asset_identifier', asset_identifier);
          if (value) params.append('value', value);
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/address/${address}/nft_events?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get NFT history: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get NFT mints
      createTool(
        {
          name: 'get_nft_mints',
          description: 'Get NFT mint events',
          parameters: z.object({
            asset_identifier: z.string().describe('NFT asset identifier (format: address.contract-name::asset-name)'),
            limit: z.number().optional().default(20).describe('Number of mint events to return'),
            offset: z.number().optional().default(0).describe('Event offset for pagination'),
            unanchored: z.boolean().optional().default(false).describe('Include unanchored transactions'),
          }),
        },
        async ({ asset_identifier, limit, offset, unanchored }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unanchored: unanchored.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/tokens/nft/mints?asset_identifier=${asset_identifier}&${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get NFT mints: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get NFT owner
      createTool(
        {
          name: 'get_nft_owner',
          description: 'Get the current owner of a specific NFT',
          parameters: z.object({
            contract_id: z.string().describe('NFT contract ID (format: address.contract-name)'),
            token_id: z.number().describe('Token ID of the NFT'),
          }),
        },
        async ({ contract_id, token_id }) => {
          return await apiService.getNFTOwner(contract_id, token_id, network);
        }
      ),

      // Get NFT token URI
      createTool(
        {
          name: 'get_nft_token_uri',
          description: 'Get the token URI/metadata for a specific NFT',
          parameters: z.object({
            contract_id: z.string().describe('NFT contract ID (format: address.contract-name)'),
            token_id: z.number().describe('Token ID of the NFT'),
          }),
        },
        async ({ contract_id, token_id }) => {
          return await apiService.getNFTTokenUri(contract_id, token_id, network);
        }
      ),

      // Transfer NFT
      createTool(
        {
          name: 'transfer_nft',
          description: 'Transfer an NFT to another address',
          parameters: z.object({
            contract_id: z.string().describe('NFT contract ID (format: address.contract-name)'),
            asset_name: z.string().describe('Asset name within the contract'),
            token_id: z.number().describe('Token ID of the NFT to transfer'),
            recipient: z.string().describe('Recipient Stacks address'),
          }),
        },
        async ({ contract_id, asset_name, token_id, recipient }) => {
          const [contractAddress, contractName] = contract_id.split('.');
          return await walletClient.transferNFT(
            contractAddress,
            contractName,
            asset_name,
            token_id,
            recipient
          );
        }
      ),

      // Get wallet NFT holdings
      createTool(
        {
          name: 'get_wallet_nfts',
          description: 'Get all NFT holdings for the current wallet',
          parameters: z.object({
            limit: z.number().optional().default(50).describe('Number of NFTs to return'),
            offset: z.number().optional().default(0).describe('NFT offset for pagination'),
          }),
        },
        async ({ limit, offset }) => {
          return await apiService.getNFTHoldings(walletClient.getAddress(), network);
        }
      ),
    ];
  }
}

/**
 * Factory function to create NFT plugin
 */
export function nft() {
  return new NftPlugin();
}