import { GraphQLClient } from 'graphql-request';
import type {
  Collection,
  CollectionStats,
  CollectionFloorPoint,
  CollectionTrending,
  NFT,
  Action,
  WalletStats,
  WalletTrade,
  WalletPortfolioValue,
  TrendingPeriod,
  TrendingBy,
  CollectionFloorPeriod,
  WalletHistory,
  ActionType,
  CollectionsSearchResponse,
  CollectionInfoResponse,
  CollectionStatsResponse,
  CollectionTrendingResponse,
  CollectionFloorHistoryResponse,
  CollectionActivityResponse,
  NFTInfoResponse,
  NFTHistoryResponse,
  WalletNFTsResponse,
  WalletStatsResponse,
  WalletTradesResponse,
  WalletPortfolioResponse,
} from './types.js';

/**
 * TradePort GraphQL API Service
 * Handles all interactions with TradePort NFT marketplace API
 */
export class TradePortService {
  private client: GraphQLClient;
  private apiKey: string;
  private apiUser: string;

  constructor() {
    const apiKey = process.env.TRADEPORT_API_KEY || 'H13bkcc.e8fda0b2090bd31e74a432f0a3408bae';
    const apiUser = process.env.TRADEPORT_API_USER || 'ai-stacks';

    if (!apiKey || !apiUser) {
      throw new Error('TradePort API credentials not found in environment variables');
    }

    this.apiKey = apiKey;
    this.apiUser = apiUser;

    this.client = new GraphQLClient('https://api.indexer.xyz/graphql', {
      headers: {
        'x-api-key': this.apiKey,
        'x-api-user': this.apiUser,
      },
    });
  }

  // ============================================================================
  // Collection Methods
  // ============================================================================

  async searchCollections(text: string, offset: number = 0, limit: number = 30): Promise<Collection[]> {
    const query = `
      query collectionSearch($text: String, $offset: Int, $limit: Int) {
        stacks {
          collections_search(
            args: { text: $text }
            offset: $offset
            limit: $limit
          ) {
            id
            supply
            floor
            slug
            semantic_slug
            title
            usd_volume
            volume
            cover_url
            verified
          }
        }
      }
    `;

    const variables = { text, offset, limit };
    const response = await this.client.request<CollectionsSearchResponse>(query, variables);
    return response.stacks.collections_search;
  }

  async getCollectionInfo(slug: string): Promise<Collection | null> {
    const query = `
      query fetchCollectionInfo($slug: String) {
        stacks {
          collections(
            where: {
              _or: [{ semantic_slug: { _eq: $slug } }, { slug: { _eq: $slug } }]
            }
          ) {
            id
            title
            slug
            semantic_slug
            description
            floor
            volume
            usd_volume
            cover_url
            supply
            verified
            discord
            twitter
            website
          }
        }
      }
    `;

    const variables = { slug };
    const response = await this.client.request<CollectionInfoResponse>(query, variables);
    return response.stacks.collections[0] || null;
  }

  async getCollectionStats(slug: string): Promise<CollectionStats | null> {
    const query = `
      query fetchCollectionStats($slug: String!) {
        stacks {
          collection_stats(slug: $slug) {
            total_mint_volume
            total_mint_usd_volume
            total_mints
            total_sales
            total_usd_volume
            total_volume
            day_volume
            day_sales
            day_usd_volume
          }
        }
      }
    `;

    const variables = { slug };
    const response = await this.client.request<CollectionStatsResponse>(query, variables);
    return response.stacks.collection_stats[0] || null;
  }

  async getTrendingCollections(
    period: TrendingPeriod,
    trendingBy: TrendingBy,
    offset: number = 0,
    limit: number = 40
  ): Promise<CollectionTrending[]> {
    const query = `
      query fetchTrendingCollections(
        $period: TrendingPeriod!
        $trending_by: TrendingBy!
        $offset: Int = 0
        $limit: Int!
      ) {
        stacks {
          collections_trending(
            period: $period
            trending_by: $trending_by
            offset: $offset
            limit: $limit
          ) {
            collection_id
            current_trades_count
            current_usd_volume
            current_volume
            previous_trades_count
            previous_usd_volume
            previous_volume
            collection {
              id
              slug
              semantic_slug
              title
              supply
              cover_url
              floor
              usd_volume
              volume
              verified
            }
          }
        }
      }
    `;

    const variables = { period, trending_by: trendingBy, offset, limit };
    const response = await this.client.request<CollectionTrendingResponse>(query, variables);
    return response.stacks.collections_trending;
  }

  async getCollectionFloorHistory(
    slug: string,
    period: CollectionFloorPeriod,
    offset: number = 0,
    limit: number = 100
  ): Promise<CollectionFloorPoint[]> {
    const query = `
      query fetchCollectionFloorHistory(
        $slug: String!
        $period: CollectionFloorPeriod!
        $offset: Int!
        $limit: Int!
      ) {
        stacks {
          collection_floors(
            slug: $slug
            period: $period
            offset: $offset
            limit: $limit
          ) {
            time
            usd_value
            value
          }
        }
      }
    `;

    const variables = { slug, period, offset, limit };
    const response = await this.client.request<CollectionFloorHistoryResponse>(query, variables);
    return response.stacks.collection_floors;
  }

  async getCollectionActivity(
    collectionId: string,
    actionTypes?: ActionType[],
    offset: number = 0,
    limit: number = 30
  ): Promise<Action[]> {
    const query = `
      query fetchCollectionActivity(
        $where: recent_actions_bool_exp
        $offset: Int
        $limit: Int!
      ) {
        stacks {
          recent_actions(
            where: $where
            order_by: [{ block_time: desc }, { tx_index: desc }]
            offset: $offset
            limit: $limit
          ) {
            id
            type
            price
            usd_price
            sender
            receiver
            tx_id
            block_time
            market_name
            bought_on_tradeport
            nft {
              id
              name
              media_url
              media_type
              ranking
            }
          }
        }
      }
    `;

    const where: any = {
      collection_id: { _eq: collectionId },
    };

    if (actionTypes && actionTypes.length > 0) {
      where.type = { _in: actionTypes };
    }

    const variables = { where, offset, limit };
    const response = await this.client.request<CollectionActivityResponse>(query, variables);
    return response.stacks.recent_actions;
  }

  // ============================================================================
  // NFT Methods
  // ============================================================================

  async getNFTInfo(collectionId: string, tokenId: string): Promise<NFT | null> {
    const query = `
      query fetchNftInfo($collectionId: uuid!, $tokenId: String!) {
        stacks {
          nfts(
            where: {
              collection_id: { _eq: $collectionId }
              token_id: { _eq: $tokenId }
            }
          ) {
            name
            token_id
            media_type
            media_url
            ranking
            collection_id
            version
            owner
            burned
            chain_state
            properties
            staked
            staked_owner
            listings(where: { listed: { _eq: true } }, order_by: { price: asc }) {
              id
              listed
              price
              market_name
              seller
              block_time
            }
            bids(
              where: { status: { _eq: "active" } }
              order_by: { price: desc }
            ) {
              id
              price
              created_tx_id
              bidder
              receiver
              remaining_count
              status
              market_contract {
                name
              }
            }
            attributes {
              type
              value
              rarity
            }
          }
        }
      }
    `;

    const variables = { collectionId, tokenId };
    const response = await this.client.request<NFTInfoResponse>(query, variables);
    return response.stacks.nfts[0] || null;
  }

  async getNFTHistory(
    collectionId: string,
    tokenId: string,
    actionTypes?: ActionType[],
    offset: number = 0,
    limit: number = 15
  ): Promise<Action[]> {
    const query = `
      query fetchNftTransactionHistory(
        $collectionId: uuid!
        $tokenId: String!
        $actionTypes: [action_type!]
        $offset: Int
        $limit: Int!
      ) {
        stacks {
          actions(
            where: {
              collection_id: { _eq: $collectionId }
              nft: { token_id: { _eq: $tokenId } }
              type: { _in: $actionTypes }
            }
            order_by: [{ block_time: desc }, { tx_index: desc }]
            offset: $offset
            limit: $limit
          ) {
            id
            type
            price
            sender
            receiver
            tx_id
            block_time
            market_name
          }
        }
      }
    `;

    const defaultActionTypes: ActionType[] = [
      'list', 'relist', 'unlist', 'buy', 'solo-bid', 'accept-bid',
      'unlist-bid', 'collection-bid', 'accept-collection-bid',
      'cancel-collection-bid', 'transfer', 'transfer-hold',
      'mint', 'burn', 'stake', 'unstake', 'trade-hold'
    ];

    const variables = {
      collectionId,
      tokenId,
      actionTypes: actionTypes || defaultActionTypes,
      offset,
      limit,
    };

    const response = await this.client.request<NFTHistoryResponse>(query, variables);
    return response.stacks.actions;
  }

  // ============================================================================
  // Wallet Methods
  // ============================================================================

  async getWalletNFTs(
    walletAddress: string,
    collectionId?: string,
    offset: number = 0,
    limit: number = 30
  ): Promise<NFT[]> {
    const query = `
      query fetchWalletOwnership(
        $where: nfts_bool_exp
        $offset: Int
        $limit: Int!
      ) {
        stacks {
          nfts(where: $where, offset: $offset, limit: $limit) {
            id
            token_id
            name
            media_url
            media_type
            ranking
            owner
            delegated_owner
            burned
            staked
            version
            collection {
              id
              title
              slug
              floor
            }
            listings(where: { listed: { _eq: true } }, order_by: { price: asc }) {
              id
              price
            }
          }
        }
      }
    `;

    const where: any = {
      owner: { _eq: walletAddress },
    };

    if (collectionId) {
      where.collection_id = { _eq: collectionId };
    }

    const variables = { where, offset, limit };
    const response = await this.client.request<WalletNFTsResponse>(query, variables);
    return response.stacks.nfts;
  }

  async getWalletStats(walletAddress: string): Promise<WalletStats | null> {
    const query = `
      query fetchWalletStats($wallet: String!) {
        stacks {
          wallet_stats(address: $wallet) {
            holdings_listed_count
            holdings_count
            value
            usd_value
            bought_volume
            bought_usd_volume
            sold_volume
            sold_usd_volume
            realized_profit_loss
            realized_usd_profit_loss
            unrealized_profit_loss
            unrealized_usd_profit_loss
          }
        }
      }
    `;

    const variables = { wallet: walletAddress };
    const response = await this.client.request<WalletStatsResponse>(query, variables);
    return response.stacks.wallet_stats[0] || null;
  }

  async getWalletTrades(walletAddress: string): Promise<{ trades: WalletTrade[]; cryptoRates: any }> {
    const query = `
      query fetchWalletRealizedPnL($wallet: String!) {
        stacks {
          wallet_trades(address: $wallet) {
            acquired_at
            acquired_action_type
            acquired_price
            acquired_usd_price
            released_at
            released_action_type
            released_price
            released_usd_price
            collection {
              id
              slug
              title
              supply
            }
            nft {
              id
              token_id
              name
              media_url
              media_type
              ranking
            }
          }
          crypto_rates(
            where: { crypto: { _eq: "stacks" }, fiat: { _eq: "USD" } }
          ) {
            rate
          }
        }
      }
    `;

    const variables = { wallet: walletAddress };
    const response = await this.client.request<WalletTradesResponse>(query, variables);
    return {
      trades: response.stacks.wallet_trades,
      cryptoRates: response.stacks.crypto_rates,
    };
  }

  async getWalletPortfolioHistory(
    walletAddress: string,
    period: WalletHistory
  ): Promise<WalletPortfolioValue[]> {
    const query = `
      query fetchWalletPortfolioValues($wallet: String!, $period: WalletHistory!) {
        stacks {
          wallet_values(address: $wallet, history: $period) {
            time
            usd_value
            value
          }
        }
      }
    `;

    const variables = { wallet: walletAddress, period };
    const response = await this.client.request<WalletPortfolioResponse>(query, variables);
    return response.stacks.wallet_values;
  }
}
