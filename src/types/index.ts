import { z } from 'zod';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodObject<any>;
}

export interface StacksPlugin {
  getTools(): MCPTool[];
  handleToolCall(name: string, args: any): Promise<any>;
}

export interface WalletContext {
  address: string;
  network: 'mainnet' | 'testnet';
  publicKey?: string;
}

export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
  data?: any;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string;
}

export interface SwapQuote {
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  route?: string[];
  protocol: string;
}

export interface LiquidityPosition {
  poolId: string;
  token0: TokenInfo;
  token1: TokenInfo;
  amount0: string;
  amount1: string;
  lpTokens: string;
  apr?: number;
}

export interface OrderbookOrder {
  id: string;
  type: 'buy' | 'sell';
  price: string;
  amount: string;
  filled: string;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface DomainInfo {
  name: string;
  owner: string;
  resolver?: string;
  expiresAt: number;
  registered: boolean;
}