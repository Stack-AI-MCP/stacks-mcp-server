import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { TradePortService } from './tradeport.service.js';

/**
 * TradePort NFT Marketplace Plugin
 * Provides tools for querying Stacks NFT marketplace data via TradePort API
 */
export class TradePortPlugin extends PluginBase<StacksWalletClient> {
  private service: TradePortService;

  constructor() {
    super();
    this.service = new TradePortService();
  }

  async getTools(walletClient: StacksWalletClient) {
    return [
      // ============================================================================
      // Collection Tools
      // ============================================================================

      createTool(
        {
          name: 'tradeport_search_collections',
          description: 'Search for NFT collections on Stacks marketplace by name or keyword',
          parameters: z.object({
            text: z.string().describe('Search text to find collections'),
            offset: z.number().optional().default(0).describe('Pagination offset'),
            limit: z.number().optional().default(30).describe('Number of results to return (max 30)'),
          }),
        },
        async ({ text, offset, limit }) => {
          const collections = await this.service.searchCollections(text, offset, limit);
          return {
            success: true,
            collections,
            total: collections.length,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_collection_info',
          description: 'Get detailed information about a specific NFT collection',
          parameters: z.object({
            slug: z.string().describe('Collection slug or semantic slug'),
          }),
        },
        async ({ slug }) => {
          const collection = await this.service.getCollectionInfo(slug);
          if (!collection) {
            throw new Error(`Collection not found: ${slug}`);
          }
          return {
            success: true,
            collection,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_collection_stats',
          description: 'Get trading statistics for an NFT collection (volume, sales, mints)',
          parameters: z.object({
            slug: z.string().describe('Collection slug'),
          }),
        },
        async ({ slug }) => {
          const stats = await this.service.getCollectionStats(slug);
          if (!stats) {
            throw new Error(`Collection stats not found: ${slug}`);
          }
          return {
            success: true,
            stats,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_trending_collections',
          description: 'Get trending NFT collections for a specific time period',
          parameters: z.object({
            period: z.enum(['days_1', 'days_7', 'days_30']).describe('Time period for trending data'),
            trending_by: z.enum(['volume', 'usd_volume', 'trades_count']).describe('Metric to sort by'),
            offset: z.number().optional().default(0).describe('Pagination offset'),
            limit: z.number().optional().default(40).describe('Number of results (max 40)'),
          }),
        },
        async ({ period, trending_by, offset, limit }) => {
          const trending = await this.service.getTrendingCollections(period, trending_by, offset, limit);
          return {
            success: true,
            trending,
            period,
            trending_by,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_collection_floor_history',
          description: 'Get historical floor price data for an NFT collection',
          parameters: z.object({
            slug: z.string().describe('Collection slug'),
            period: z.enum(['hours_1', 'hours_24', 'days_7', 'days_30', 'all']).describe('Time period for floor history'),
            offset: z.number().optional().default(0).describe('Pagination offset'),
            limit: z.number().optional().default(100).describe('Number of data points (max 100)'),
          }),
        },
        async ({ slug, period, offset, limit }) => {
          const floorHistory = await this.service.getCollectionFloorHistory(slug, period, offset, limit);
          return {
            success: true,
            slug,
            period,
            floor_history: floorHistory,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_collection_activity',
          description: 'Get recent trading activity for an NFT collection',
          parameters: z.object({
            collection_id: z.string().describe('Collection UUID'),
            action_types: z.array(z.enum([
              'list', 'relist', 'unlist', 'buy', 'solo-bid', 'accept-bid',
              'unlist-bid', 'collection-bid', 'accept-collection-bid',
              'cancel-collection-bid', 'transfer', 'transfer-hold',
              'mint', 'burn', 'stake', 'unstake', 'trade-hold'
            ])).optional().describe('Filter by specific action types'),
            offset: z.number().optional().default(0).describe('Pagination offset'),
            limit: z.number().optional().default(30).describe('Number of activities (max 30)'),
          }),
        },
        async ({ collection_id, action_types, offset, limit }) => {
          const activity = await this.service.getCollectionActivity(
            collection_id,
            action_types,
            offset,
            limit
          );
          return {
            success: true,
            collection_id,
            activity,
          };
        }
      ),

      // ============================================================================
      // NFT Tools
      // ============================================================================

      createTool(
        {
          name: 'tradeport_get_nft_info',
          description: 'Get detailed information about a specific NFT including listings and bids',
          parameters: z.object({
            collection_id: z.string().describe('Collection UUID'),
            token_id: z.string().describe('NFT token ID'),
          }),
        },
        async ({ collection_id, token_id }) => {
          const nft = await this.service.getNFTInfo(collection_id, token_id);
          if (!nft) {
            throw new Error(`NFT not found: ${collection_id}/${token_id}`);
          }
          return {
            success: true,
            nft,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_nft_history',
          description: 'Get transaction history for a specific NFT',
          parameters: z.object({
            collection_id: z.string().describe('Collection UUID'),
            token_id: z.string().describe('NFT token ID'),
            action_types: z.array(z.enum([
              'list', 'relist', 'unlist', 'buy', 'solo-bid', 'accept-bid',
              'unlist-bid', 'collection-bid', 'accept-collection-bid',
              'cancel-collection-bid', 'transfer', 'transfer-hold',
              'mint', 'burn', 'stake', 'unstake', 'trade-hold'
            ])).optional().describe('Filter by specific action types'),
            offset: z.number().optional().default(0).describe('Pagination offset'),
            limit: z.number().optional().default(15).describe('Number of history items (max 15)'),
          }),
        },
        async ({ collection_id, token_id, action_types, offset, limit }) => {
          const history = await this.service.getNFTHistory(
            collection_id,
            token_id,
            action_types,
            offset,
            limit
          );
          return {
            success: true,
            collection_id,
            token_id,
            history,
          };
        }
      ),

      // ============================================================================
      // Wallet Tools
      // ============================================================================

      createTool(
        {
          name: 'tradeport_get_wallet_nfts',
          description: 'Get all NFTs owned by a wallet address',
          parameters: z.object({
            wallet_address: z.string().describe('Stacks wallet address'),
            collection_id: z.string().optional().describe('Filter by specific collection UUID'),
            offset: z.number().optional().default(0).describe('Pagination offset'),
            limit: z.number().optional().default(30).describe('Number of NFTs (max 30)'),
          }),
        },
        async ({ wallet_address, collection_id, offset, limit }) => {
          const nfts = await this.service.getWalletNFTs(wallet_address, collection_id, offset, limit);
          return {
            success: true,
            wallet_address,
            nfts,
            total: nfts.length,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_wallet_stats',
          description: 'Get wallet portfolio statistics including P&L',
          parameters: z.object({
            wallet_address: z.string().describe('Stacks wallet address'),
          }),
        },
        async ({ wallet_address }) => {
          const stats = await this.service.getWalletStats(wallet_address);
          if (!stats) {
            throw new Error(`Wallet stats not found: ${wallet_address}`);
          }
          return {
            success: true,
            wallet_address,
            stats,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_wallet_trades',
          description: 'Get realized P&L and trading history for a wallet',
          parameters: z.object({
            wallet_address: z.string().describe('Stacks wallet address'),
          }),
        },
        async ({ wallet_address }) => {
          const { trades, cryptoRates } = await this.service.getWalletTrades(wallet_address);
          return {
            success: true,
            wallet_address,
            trades,
            crypto_rates: cryptoRates,
          };
        }
      ),

      createTool(
        {
          name: 'tradeport_get_wallet_portfolio_history',
          description: 'Get historical portfolio value for a wallet',
          parameters: z.object({
            wallet_address: z.string().describe('Stacks wallet address'),
            period: z.enum(['hours_24', 'days_7', 'days_30', 'all']).describe('Time period for portfolio history'),
          }),
        },
        async ({ wallet_address, period }) => {
          const history = await this.service.getWalletPortfolioHistory(wallet_address, period);
          return {
            success: true,
            wallet_address,
            period,
            portfolio_history: history,
          };
        }
      ),
    ];
  }
}

/**
 * Factory function to create TradePort plugin
 */
export function tradeport() {
  return new TradePortPlugin();
}
