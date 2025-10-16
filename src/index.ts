#!/usr/bin/env node
import 'reflect-metadata';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { getOnChainTools } from './adapters/mcp/adapter.js';
import { StacksWalletClient } from './wallet/StacksWalletClient.js';
import { contracts } from './plugins/contracts/contracts.plugin.js';
import { transactions } from './plugins/transactions/transactions.plugin.js';
import { pox } from './plugins/pox/pox.plugin.js';
import { search } from './plugins/search/search.plugin.js';
import { tokens } from './plugins/tokens/tokens.plugin.js';
import { nft } from './plugins/nft/nft.plugin.js';
import { blocks } from './plugins/blocks/blocks.plugin.js';
import { mempool } from './plugins/mempool/mempool.plugin.js';
import { stackpool } from './plugins/stackpool/stackpool.plugin.js';
import { events } from './plugins/events/events.plugin.js';
import { alex } from './plugins/alex/index.js';
// import { bitflow } from './plugins/bitflow/bitflow.plugin.js'; // Disabled until API keys are obtained
import { arkadiko } from './plugins/arkadiko/index.js';
import { charisma } from './plugins/charisma/index.js';
import { velar } from './plugins/velar/index.js';
import { granite } from './plugins/granite/index.js';
import { clarinet } from './plugins/clarinet/index.js';

// Load environment variables
dotenv.config();

/**
 * Stacks MCP Server
 * Provides comprehensive Stacks blockchain operations through the Model Context Protocol
 * Built using VeChain MCP architecture pattern
 */
async function main() {
  // Validate required environment variables
  const network = (process.env.STACKS_NETWORK || 'testnet') as 'mainnet' | 'testnet';
  
  if (!process.env.WALLET_MNEMONIC && !process.env.WALLET_PRIVATE_KEY) {
    console.error('Error: Either WALLET_MNEMONIC or WALLET_PRIVATE_KEY must be set');
    process.exit(1);
  }

  console.error('🚀 Initializing Stacks MCP Server...');
  console.error(`📡 Network: ${network}`);

  // Create Stacks wallet client
  let walletClient: StacksWalletClient;
  
  if (process.env.WALLET_PRIVATE_KEY) {
    walletClient = new StacksWalletClient({
      privateKey: process.env.WALLET_PRIVATE_KEY,
      network,
    });
  } else if (process.env.WALLET_MNEMONIC) {
    walletClient = await StacksWalletClient.fromMnemonic(
      process.env.WALLET_MNEMONIC,
      network
    );
  } else {
    throw new Error('Either WALLET_MNEMONIC or WALLET_PRIVATE_KEY must be set');
  }

  console.error(`💼 Wallet: ${walletClient.getAddress()}`);

  // Get tools from plugins using VeChain MCP adapter pattern
  const toolsPromise = getOnChainTools({
    wallet: walletClient,
    plugins: [
      contracts(),     // Smart contract operations
      transactions(),  // Transaction operations
      pox(),          // PoX/Stacking operations
      search(),       // Search and account operations
      tokens(),       // Fungible token operations
      nft(),          // Non-fungible token operations
      blocks(),       // Block and network operations
      mempool(),      // Mempool operations and fee estimation
      stackpool(),    // Stacking pool delegations and burnchain rewards
      events(),       // Transaction events and detailed analysis
      alex(),         // ALEX Protocol DEX and AMM
      // bitflow(),      // Bitflow Protocol stable DEX - DISABLED: Requires API keys from BitFlow team
      arkadiko(),     // Arkadiko Protocol vaults, DEX, and governance
      charisma(),     // Charisma DEX and Blaze protocol
      velar(),        // Velar Protocol multi-chain DEX
      granite(),      // Granite Protocol BTC lending
      clarinet(),     // Clarinet development tools for Clarity contracts
    ],
  });

  // Create MCP server
  const server = new Server(
    {
      name: 'stacks-mcp-server',
      version: '1.0.0',
      description: 'Comprehensive MCP server for Stacks Bitcoin Layer 2 DeFi ecosystem'
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool list requests
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const { listOfTools } = await toolsPromise;
    const tools = listOfTools();
    console.error(`📋 Available tools: ${tools.length}`);
    return {
      tools,
    };
  });

  // Handle tool execution requests
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { toolHandler } = await toolsPromise;
    console.error(`🔧 Executing tool: ${request.params.name}`);
    
    try {
      const result = await toolHandler(request.params.name, request.params.arguments);
      console.error(`✅ Tool ${request.params.name} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Tool ${request.params.name} failed:`, error);
      throw new Error(`Tool ${request.params.name} failed: ${error}`);
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✨ Stacks MCP Server running on stdio');
  console.error('🎯 Ready to receive requests from Claude Desktop');
  console.error('📚 Available tool categories:');
  console.error('   • Contracts: Smart contract operations and events');
  console.error('   • Transactions: Transaction queries and STX transfers');
  console.error('   • PoX: Stacking operations and cycle information');
  console.error('   • Search: Universal search and account operations');
  console.error('   • Tokens: Fungible token operations and metadata');
  console.error('   • NFT: Non-fungible token operations and ownership');
  console.error('   • Blocks: Block queries and network information');
  console.error('   • Mempool: Mempool statistics and fee estimation');
  console.error('   • StackPool: Pool delegations and burnchain rewards');
  console.error('   • Events: Transaction events and detailed analysis');
  console.error('   • ALEX: DEX, AMM, and liquidity operations');
  // console.error('   • Bitflow: Stable DEX with keeper-based automation'); // DISABLED
  console.error('   • Arkadiko: Vaults, stablecoins, DEX, and governance');
  console.error('   • Charisma: Vault-based DEX and Blaze intent protocol');
  console.error('   • Velar: Multi-chain Bitcoin Layer-2 DEX');
  console.error('   • Granite: BTC-native lending with sBTC collateral');
  console.error('   • Clarinet: Development tools for Clarity smart contracts');
}

main().catch((error) => {
  console.error('💥 Fatal error in main():', error);
  process.exit(1);
});