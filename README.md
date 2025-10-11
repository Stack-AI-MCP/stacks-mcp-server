# Stacks MCP Server

Comprehensive Model Context Protocol (MCP) server for the Stacks Bitcoin Layer 2 DeFi ecosystem. Provides unified access to 6 major DeFi protocols with over 100 professional tools for lending, trading, staking, and governance operations.

## Overview

This MCP server enables AI agents and applications to interact with the entire Stacks DeFi ecosystem through a standardized protocol interface. Built for the Stacks Vibe Coding Hackathon, it integrates with all major Bitcoin DeFi protocols on Stacks.

## Supported Protocols

### ALEX Protocol
Automated Market Maker (AMM) and DEX with multi-hop routing capabilities.

**Features:**
- Multi-hop token swaps (1-4 pool routing)
- Liquidity pool operations
- Price feeds and market statistics
- TVL and volume analytics
- Flash loan integration
- 34 tools covering all AMM operations

### Bitflow Protocol
Stable-focused DEX with keeper-based automation system.

**Features:**
- StableSwap and XYK pools
- Keeper-based automated execution
- BTC to sBTC bridge operations
- DCA (Dollar Cost Averaging) orders
- Group order management
- 29 tools for stable swaps and automation

### Arkadiko Protocol
Multi-collateral lending platform with stablecoin minting.

**Features:**
- Collateralized debt positions (CDPs)
- USDA stablecoin minting
- Vault management and liquidations
- DEX operations and liquidity provision
- Governance proposals and voting
- DIKO token staking
- 28 tools for comprehensive DeFi operations

### Charisma Protocol
Vault-based DEX with Blaze intent execution protocol.

**Features:**
- Composable vault routing
- Limit and triggered orders
- Blaze intent protocol execution
- Multihop swap routing
- API key management for automation
- 14 tools for advanced trading strategies

### Velar Protocol
Multi-chain Bitcoin Layer-2 DEX.

**Features:**
- SDK-based swap routing
- Token pair management
- Price feeds and historical data
- Pool analytics and liquidity tracking
- Cross-chain token support
- 18 tools combining SDK and API operations

### Granite Protocol
Bitcoin-native lending protocol with sBTC collateral.

**Features:**
- BTC-backed stablecoin borrowing
- Liquidity provision with yield
- LP token staking for rewards
- Liquidation operations
- Flash loans for advanced strategies
- Governance proposals
- 21 tools for complete lending operations

## Installation

### Prerequisites

- Node.js 20.x or higher
- pnpm package manager
- Stacks wallet with private key or mnemonic

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd stacks-mcp-server
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```bash
# Required
STACKS_NETWORK=testnet
WALLET_PRIVATE_KEY=your_private_key_here

# Optional
HIRO_API_KEY=your_api_key_here
```

## Configuration

### Required Environment Variables

- `STACKS_NETWORK`: Network to connect to (`mainnet`, `testnet`, or `devnet`)
- `WALLET_PRIVATE_KEY` or `WALLET_MNEMONIC`: Wallet credentials (provide one)

### Optional Environment Variables

- `HIRO_API_KEY`: API key for higher rate limits with Hiro APIs
- `STACKS_MAINNET_API_URL`: Custom mainnet API endpoint
- `STACKS_TESTNET_API_URL`: Custom testnet API endpoint
- `STACKS_DEVNET_API_URL`: Custom devnet API endpoint
- `MCP_SERVER_HOST`: Server host for HTTP mode (default: localhost)
- `MCP_SERVER_PORT`: Server port for HTTP mode (default: 3000)
- `NODE_ENV`: Environment mode (development, production, test)
- `LOG_LEVEL`: Logging level (info, debug, error)
- `DEBUG`: Enable debug mode (true/false)
- `DISABLE_TELEMETRY`: Disable telemetry (true/false)

See `.env.example` for detailed configuration options.

## Usage

### Development Mode

Run the server with auto-reload:
```bash
pnpm dev
```

### Production Build

Build and run the server:
```bash
pnpm build
pnpm start
```

### Testing

Run all tests:
```bash
pnpm test
```

Run Clarinet integration tests:
```bash
pnpm test:clarinet
```

Run tests in watch mode:
```bash
pnpm test:watch
```

### Type Checking

Verify TypeScript types:
```bash
pnpm type-check
```

### Linting

Check code quality:
```bash
pnpm lint
```

## Architecture

### Plugin-Based System

The server uses a modular plugin architecture where each DeFi protocol is implemented as an independent plugin:

```
src/plugins/
├── alex/          # ALEX Protocol integration
├── bitflow/       # Bitflow Protocol integration
├── arkadiko/      # Arkadiko Protocol integration
├── charisma/      # Charisma Protocol integration
├── velar/         # Velar Protocol integration
├── granite/       # Granite Protocol integration
├── contracts/     # Smart contract operations
├── transactions/  # Transaction management
├── pox/           # PoX stacking operations
├── tokens/        # Token operations
├── nft/           # NFT operations
└── ...            # Additional core plugins
```

### Core Components

- **PluginBase**: Abstract base class for all protocol plugins
- **ToolBase**: Factory for creating MCP tools with validation
- **StacksWalletClient**: Unified wallet interface for transaction signing
- **Services**: Protocol-specific business logic and API integration
- **Config**: Centralized configuration management

### Transaction Flow

1. Tool receives parameters from AI agent/application
2. Service layer validates and prepares contract call parameters
3. Contract call data returned to caller
4. Caller handles transaction signing and broadcasting
5. Transaction confirmation tracked via Stacks API

## Tool Categories

### Core Stacks Operations

- Contract deployment and interaction
- Transaction queries and tracking
- STX transfers and stacking
- Account and balance management
- Block and network information
- Mempool statistics and fee estimation

### DeFi Protocol Operations

- Token swaps and liquidity provision
- Lending and borrowing operations
- Vault and collateral management
- Staking and reward claiming
- Governance voting and proposals
- Flash loan execution

### Read Operations

All protocols support comprehensive read operations:
- Price feeds and market data
- Pool statistics and analytics
- Position tracking and health
- Historical data and trends
- Protocol parameters and state

### Write Operations

All protocols support transaction execution:
- Swap execution with routing
- Liquidity addition and removal
- Borrow and repay operations
- Collateral management
- Staking and unstaking
- Proposal creation and voting

## API Integration

The server integrates with multiple data sources:

- **Hiro Stacks API**: Core blockchain data and transactions
- **ALEX API**: DEX statistics and market data
- **Velar SDK & API**: Token swaps and pool information
- **Bitflow SDK**: StableSwap operations and keeper automation
- **Pyth Network**: Price oracle data for Granite
- **Direct Contract Calls**: Real-time on-chain data

## Security Considerations

### Private Key Management

- Never commit `.env` files to version control
- Use environment-specific wallets (testnet for development)
- Rotate keys regularly in production environments
- Consider using hardware wallets for high-value operations

### Transaction Safety

- All transactions return unsigned contract call parameters
- Client applications must handle transaction signing
- Post-conditions can be added for additional security
- Test all operations on testnet before mainnet deployment

### Rate Limiting

- Use HIRO_API_KEY for higher rate limits
- Implement client-side request throttling
- Cache frequently accessed data when possible
- Monitor API usage to avoid rate limit issues

## Development

### Adding New Tools

1. Create service class with protocol integration:
```typescript
export class NewProtocolService {
  async someOperation(params: OperationParams) {
    // Implementation
  }
}
```

2. Create plugin extending PluginBase:
```typescript
export class NewProtocolPlugin extends PluginBase<StacksWalletClient> {
  async getTools(walletClient: StacksWalletClient) {
    const service = new NewProtocolService();

    return [
      createTool(
        {
          name: 'protocol_operation',
          description: 'Operation description',
          parameters: z.object({
            param: z.string().describe('Parameter description')
          })
        },
        async ({ param }) => {
          return await service.someOperation({ param });
        }
      )
    ];
  }
}
```

3. Register plugin in main index:
```typescript
import { newProtocol } from './plugins/new-protocol/index.js';

plugins: [
  // ... existing plugins
  newProtocol(),
]
```

### Code Standards

- TypeScript for type safety
- Zod for runtime validation
- No mock data in production code
- Comprehensive error handling
- Professional documentation
- GPG-signed commits

## MCP Protocol Compliance

This server implements the Model Context Protocol specification:

- **Tool Discovery**: ListToolsRequest returns all available tools
- **Tool Execution**: CallToolRequest executes tools with validation
- **Standard Transport**: Uses stdio for communication with MCP clients
- **Structured Responses**: All responses follow MCP format
- **Error Handling**: Proper error codes and messages

## Troubleshooting

### Common Issues

**Server fails to start:**
- Verify `.env` file exists and contains required variables
- Check that wallet credentials are valid
- Ensure Node.js version is 20.x or higher

**Transaction failures:**
- Verify sufficient STX balance for fees
- Check that wallet has required token approvals
- Confirm network selection matches wallet network

**API rate limiting:**
- Add HIRO_API_KEY to `.env` for higher limits
- Implement request throttling in client applications
- Use caching for frequently accessed data

**Type errors during build:**
- Run `pnpm install` to ensure dependencies are current
- Clear `node_modules` and reinstall if issues persist
- Verify TypeScript version is 5.x

## Contributing

Contributions are welcome. Please ensure:

- All tests pass (`pnpm test`)
- Type checking succeeds (`pnpm type-check`)
- Code follows existing patterns
- Documentation is updated
- Commits are GPG-signed

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built for the Stacks Vibe Coding Hackathon. Special thanks to:

- Stacks Foundation for the Bitcoin L2 infrastructure
- Hiro Systems for comprehensive blockchain APIs
- ALEX, Bitflow, Arkadiko, Charisma, Velar, and Granite teams for protocol documentation
- Model Context Protocol team for the MCP specification

## Support

For issues, questions, or contributions:
- Create an issue in the repository
- Review documentation in `/docs` directory
- Check protocol-specific documentation for integration details

## Version

Current version: 1.0.0

Last updated: October 2024
