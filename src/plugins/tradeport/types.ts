/**
 * TradePort API Type Definitions
 * Based on GraphQL schema for Stacks NFT marketplace data
 */

// ============================================================================
// Collection Types
// ============================================================================

export interface Collection {
  id: string;
  slug: string;
  semantic_slug?: string;
  title: string;
  description?: string;
  cover_url?: string;
  supply?: number;
  floor?: string;
  volume?: string;
  usd_volume?: string;
  verified?: boolean;
  discord?: string;
  twitter?: string;
  website?: string;
}

export interface CollectionStats {
  total_mint_volume: string;
  total_mint_usd_volume: string;
  total_mints: number;
  total_sales: number;
  total_usd_volume: string;
  total_volume: string;
  day_volume: string;
  day_sales: number;
  day_usd_volume: string;
}

export interface CollectionFloorPoint {
  time: string;
  value: string;
  usd_value: string;
}

export interface CollectionTrending {
  collection_id: string;
  current_trades_count: number;
  current_usd_volume: string;
  current_volume: string;
  previous_trades_count: number;
  previous_usd_volume: string;
  previous_volume: string;
  collection: Collection;
}

// ============================================================================
// NFT Types
// ============================================================================

export interface NFT {
  id: string;
  token_id: string;
  name: string;
  media_type?: string;
  media_url?: string;
  ranking?: number;
  collection_id: string;
  version?: number;
  owner?: string;
  delegated_owner?: string;
  burned?: boolean;
  chain_state?: string;
  properties?: Record<string, unknown>;
  staked?: boolean;
  staked_owner?: string;
  collection?: Collection;
  listings?: Listing[];
  bids?: Bid[];
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  type: string;
  value: string;
  rarity?: number;
}

export interface Listing {
  id: string;
  listed: boolean;
  price: string;
  price_str?: string;
  market_name: string;
  seller: string;
  block_time: string;
}

export interface Bid {
  id: string;
  nonce?: string;
  bidder: string;
  receiver?: string;
  price: string;
  price_str?: string;
  remaining_count?: number;
  status: string;
  type?: string;
  created_tx_id?: string;
  market_contract?: {
    key?: string;
    name: string;
  };
  nft?: NFT;
  collection?: Collection;
}

// ============================================================================
// Action/Activity Types
// ============================================================================

export type ActionType =
  | 'list'
  | 'relist'
  | 'unlist'
  | 'buy'
  | 'solo-bid'
  | 'accept-bid'
  | 'unlist-bid'
  | 'collection-bid'
  | 'accept-collection-bid'
  | 'cancel-collection-bid'
  | 'transfer'
  | 'transfer-hold'
  | 'mint'
  | 'burn'
  | 'stake'
  | 'unstake'
  | 'trade-hold';

export interface Action {
  id: string;
  type: ActionType;
  price?: string;
  usd_price?: string;
  sender?: string;
  receiver?: string;
  tx_id: string;
  block_time: string;
  market_name?: string;
  bought_on_tradeport?: boolean;
  tx_index?: number;
  nft?: NFT;
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface WalletStats {
  holdings_listed_count: number;
  holdings_count: number;
  value: string;
  usd_value: string;
  bought_volume: string;
  bought_usd_volume: string;
  sold_volume: string;
  sold_usd_volume: string;
  realized_profit_loss: string;
  realized_usd_profit_loss: string;
  unrealized_profit_loss: string;
  unrealized_usd_profit_loss: string;
}

export interface WalletTrade {
  acquired_at: string;
  acquired_action_type: ActionType;
  acquired_price: string;
  acquired_usd_price: string;
  released_at?: string;
  released_action_type?: ActionType;
  released_price?: string;
  released_usd_price?: string;
  collection: Collection;
  nft: NFT;
}

export interface WalletPortfolioValue {
  time: string;
  value: string;
  usd_value: string;
}

export interface CryptoRate {
  rate: number;
}

// ============================================================================
// Query Response Types
// ============================================================================

export interface CollectionsSearchResponse {
  stacks: {
    collections_search: Collection[];
  };
}

export interface CollectionInfoResponse {
  stacks: {
    collections: Collection[];
  };
}

export interface CollectionStatsResponse {
  stacks: {
    collection_stats: CollectionStats[];
  };
}

export interface CollectionTrendingResponse {
  stacks: {
    collections_trending: CollectionTrending[];
  };
}

export interface CollectionFloorHistoryResponse {
  stacks: {
    collection_floors: CollectionFloorPoint[];
  };
}

export interface CollectionActivityResponse {
  stacks: {
    recent_actions: Action[];
  };
}

export interface NFTInfoResponse {
  stacks: {
    nfts: NFT[];
  };
}

export interface NFTHistoryResponse {
  stacks: {
    actions: Action[];
  };
}

export interface WalletNFTsResponse {
  stacks: {
    nfts: NFT[];
  };
}

export interface WalletStatsResponse {
  stacks: {
    wallet_stats: WalletStats[];
  };
}

export interface WalletTradesResponse {
  stacks: {
    wallet_trades: WalletTrade[];
    crypto_rates: CryptoRate[];
  };
}

export interface WalletPortfolioResponse {
  stacks: {
    wallet_values: WalletPortfolioValue[];
  };
}

// ============================================================================
// Query Parameter Types
// ============================================================================

export type TrendingPeriod = 'days_1' | 'days_7' | 'days_30';
export type TrendingBy = 'volume' | 'usd_volume' | 'trades_count';
export type CollectionFloorPeriod = 'hours_1' | 'hours_24' | 'days_7' | 'days_30' | 'all';
export type WalletHistory = 'hours_24' | 'days_7' | 'days_30' | 'all';
