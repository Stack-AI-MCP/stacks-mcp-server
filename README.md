# Stacks AI ~ MCP Server

![Stacks AI Banner](docs/images/stacksAIBanner.png)

Comprehensive Model Context Protocol (MCP) server for the Stacks Bitcoin Layer 2 DeFi ecosystem. Part of the **Stacks AI** project, providing unified access to 6 major DeFi protocols with over 144+ professional tools for lending, trading, staking, and governance operations.

[![Protocol Coverage](https://img.shields.io/badge/Protocols-7-blue)](stacks-mcp-server/README.md#supported-protocols)
[![Tools](https://img.shields.io/badge/Tools-144+-green)](stacks-mcp-server/README.md#tool-categories)
[![Networks](https://img.shields.io/badge/Networks-Mainnet%20%7C%20Testnet%20%7C%20Devnet-orange)](stacks-mcp-server/README.md#network-endpoints)
[![MCP](https://img.shields.io/badge/MCP-Compliant-purple)](stacks-mcp-server/README.md#mcp-protocol-compliance)

---

## Table of Contents

- [Overview](#overview)
  - [Stacks AI Ecosystem](#stacks-ai-ecosystem)
  - [Architecture Overview](#architecture-overview)
- [Supported Protocols](#supported-protocols)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Usage Examples](#usage-examples)
- [Architecture](#architecture)
  - [Plugin System](#plugin-based-system)
  - [Core Components](#core-components)
  - [Transaction Flow](#transaction-flow)
- [API Integration](#api-integration)
- [Development](#development)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [MCP Protocol Compliance](#mcp-protocol-compliance)
- [Troubleshooting](#troubleshooting)
- [Project Statistics](#project-statistics)

---

## Overview

Stacks AI MCP Server enables AI agents and applications to interact with the entire Stacks DeFi ecosystem through a standardized protocol interface. It integrates with all major Bitcoin DeFi protocols on Stacks, enabling natural language interactions with Bitcoin DeFi.

### Stacks AI Ecosystem

The Stacks AI project consists of two main components:

1. **MCP Server** (this repository) - Backend protocol integration exposing Bitcoin DeFi operations
2. **Frontend** (separate repository) - Chat-based user interface with Stacks wallet integration

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[Web Browser]
        B[Stacks AI Frontend<br/>Next.js Chat Interface]
        C[Wallet Connection<br/>Leather/Xverse]
    end

    subgraph "AI Processing Layer"
        D[Claude Desktop]
        E[AI Agent Processing]
        F[Natural Language<br/>Understanding]
    end

    subgraph "Backend Layer"
        G[Stacks AI MCP Server<br/>144+ Tools]
        H[Plugin System<br/>6 DeFi Protocols]
        I[Wallet Authentication<br/>Transaction Signing]
    end

    subgraph "Blockchain Layer"
        J[Stacks Network<br/>Bitcoin L2]
        K[Smart Contracts<br/>Clarity]
        L[Protocol APIs<br/>REST/SDK]
    end

    A --> B
    B --> C
    B --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L

    C --> I

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style D fill:#ffe1f5
    style G fill:#fff4e1
    style H fill:#e1ffe1
    style J fill:#f5e1ff
```

### Architecture Overview

![Stacks AI Architecture](docs/images/stacksAiArchitecture.png)

```mermaid
graph TB
    subgraph "AI Layer"
        A[Claude Desktop/Cursor/VS Code]
        B[Natural Language Input]
    end

    subgraph "MCP Server"
        C[MCP Protocol Handler]
        D[Plugin Manager]
        E[Wallet Client]
        F[Config Manager]
    end

    subgraph "Protocol Plugins"
        G1[ALEX Plugin<br/>34 Tools]
        G2[Bitflow Plugin<br/>29 Tools]
        G3[Arkadiko Plugin<br/>28 Tools]
        G4[Charisma Plugin<br/>14 Tools]
        G5[Velar Plugin<br/>18 Tools]
        G6[Granite Plugin<br/>21 Tools]
        G7[Stacks Core Plugin<br/>40+ Tools]
    end

    subgraph "Blockchain Layer"
        H1[Stacks Network]
        H2[ALEX API]
        H3[Velar SDK]
        H4[Protocol Contracts]
        H5[Hiro API]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    D --> G1
    D --> G2
    D --> G3
    D --> G4
    D --> G5
    D --> G6
    D --> G7

    G1 --> H2
    G1 --> H1
    G2 --> H1
    G3 --> H1
    G4 --> H1
    G5 --> H3
    G5 --> H1
    G6 --> H1
    G7 --> H5
    G7 --> H4

    style A fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#ffe1f5
    style G1 fill:#e1ffe1
    style G2 fill:#e1ffe1
    style G3 fill:#e1ffe1
    style G4 fill:#e1ffe1
    style G5 fill:#e1ffe1
    style G6 fill:#e1ffe1
    style G7 fill:#e1ffe1
    style H1 fill:#f5e1ff
```

## Supported Protocols

### Protocol Integration Map

![Stacks AI Protocols](docs/images/stacksAiProtocols.png)

```mermaid
graph TB
    subgraph "Stacks AI MCP Server"
        Core[Core Engine]
    end

    subgraph "DeFi Protocols"
        ALEX[ALEX Protocol<br/>AMM & DEX<br/>34 Tools]
        Bitflow[Bitflow Protocol<br/>Stable DEX<br/>29 Tools]
        Arkadiko[Arkadiko Protocol<br/>Lending & USDA<br/>28 Tools]
        Charisma[Charisma Protocol<br/>Composable Vaults<br/>14 Tools]
        Velar[Velar Protocol<br/>Multi-chain DEX<br/>18 Tools]
        Granite[Granite Protocol<br/>BTC Lending<br/>21 Tools]
    end

    subgraph "Core Operations"
        Contracts[Smart Contracts<br/>Deploy & Interact]
        Transactions[Transactions<br/>Query & Track]
        PoX[PoX Stacking<br/>STX Rewards]
        Tokens[Token Operations<br/>Transfer & Balance]
        NFT[NFT Operations<br/>Mint & Transfer]
        Blocks[Blockchain Data<br/>Blocks & Events]
    end

    Core --> ALEX
    Core --> Bitflow
    Core --> Arkadiko
    Core --> Charisma
    Core --> Velar
    Core --> Granite
    Core --> Contracts
    Core --> Transactions
    Core --> PoX
    Core --> Tokens
    Core --> NFT
    Core --> Blocks

    ALEX --> |Swaps, Liquidity| StacksNet[Stacks Network]
    Bitflow --> |Stable Swaps, DCA| StacksNet
    Arkadiko --> |Vaults, Loans| StacksNet
    Charisma --> |Blaze Intents| StacksNet
    Velar --> |Cross-chain Swaps| StacksNet
    Granite --> |sBTC Lending| StacksNet

    Contracts --> StacksNet
    Transactions --> StacksNet
    PoX --> StacksNet
    Tokens --> StacksNet
    NFT --> StacksNet
    Blocks --> StacksNet

    style Core fill:#e1f5ff
    style ALEX fill:#e1ffe1
    style Bitflow fill:#e1ffe1
    style Arkadiko fill:#e1ffe1
    style Charisma fill:#e1ffe1
    style Velar fill:#e1ffe1
    style Granite fill:#e1ffe1
    style StacksNet fill:#f5e1ff
```

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

## Quick Start

### Prerequisites

- Claude Desktop application (or Cursor/VS Code with MCP support)
- Node.js 18 or higher
- pnpm package manager
- Stacks wallet (private key or mnemonic)

### Installation

1. **Clone and build the server**
   ```bash
   git clone <repository-url>
   cd stacks-mcp-server
   pnpm install
   pnpm build
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your wallet credentials and network preferences.

3. **Automated Setup (Recommended)**

   Use the automated setup script to configure your preferred AI application:

   ```bash
   # Interactive mode - choose which application to configure
   pnpm setup

   # Configure Claude Desktop only
   pnpm setup:claude

   # Configure Cursor editor only
   pnpm setup:cursor

   # Configure VS Code only
   pnpm setup:code

   # Configure multiple applications
   ./setup-mcp.sh --claude --cursor --code
   ```

   The setup script will:
   - Read your `.env` configuration
   - Generate the appropriate MCP configuration
   - Install it in the correct location for your chosen application(s)
   - Provide restart instructions

4. **Manual Configuration (Alternative)**

   If you prefer manual setup, you can configure the applications directly:

   **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Cursor Editor**: `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-specific)
   **VS Code**: `~/Library/Application Support/Code/User/mcp.json` (global) or `.vscode/mcp.json` (project-specific)

   The configuration format should look like:
   ```json
   {
     "mcpServers": {
       "stacks-mcp": {
         "command": "node",
         "args": ["/absolute/path/to/stacks-mcp-server/dist/index.js"],
         "env": {
           "WALLET_PRIVATE_KEY": "0x1234...",
           "STACKS_NETWORK": "testnet",
           "STACKS_MAINNET_API_URL": "https://api.hiro.so",
           "STACKS_TESTNET_API_URL": "https://api.testnet.hiro.so",
           "HIRO_API_KEY": "your_hiro_api_key"
         }
       }
     }
   }
   ```

5. **Restart your AI application**

   Close and reopen Claude Desktop, Cursor, or VS Code to load the MCP server.

### Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_PRIVATE_KEY` | Either | Stacks wallet private key (64 hex chars, with or without 0x) |
| `WALLET_MNEMONIC` | Either | Stacks wallet mnemonic phrase (12 or 24 words) |
| `STACKS_NETWORK` | Yes | Network selection: `mainnet`, `testnet`, or `devnet` |
| `STACKS_MAINNET_API_URL` | No | Custom mainnet API endpoint (default: Hiro API) |
| `STACKS_TESTNET_API_URL` | No | Custom testnet API endpoint (default: Hiro API) |
| `HIRO_API_KEY` | No | Hiro API key for higher rate limits |
| `BITFLOW_API_KEY` | No | BitFlow protocol API key (contact BitFlow team) |

### Network Endpoints

- **Testnet**: `https://api.testnet.hiro.so` (development use)
- **Mainnet**: `https://api.hiro.so` (production use with real Bitcoin)
- **Devnet**: `http://localhost:20443` (local development with Clarinet)

## Usage Examples

### Token Operations
```
"Transfer 100 STX to ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
"Check my STX balance"
"Send 50 ALEX tokens to alice.btc"
"What's my USDA balance?"
```

### Smart Contracts
```
"Deploy a new Clarity contract from /path/to/contract.clar"
"Call the transfer function on contract SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token"
"Get contract info for ALEX token"
"Read the get-balance function for my address"
```

### Stacking (PoX) Operations
```
"Stack 1000 STX for 6 cycles"
"Check my current stacking status"
"What's the minimum STX to stack?"
"Show me the current PoX cycle information"
"Delegate 500 STX to pool SP000..."
```

### ALEX DEX Trading
```
"Swap 100 STX for ALEX on ALEX DEX"
"Get the best price for 1000 ALEX to USDA"
"What's the current STX/ALEX exchange rate?"
"Add liquidity to the STX-ALEX pool"
"Check my liquidity positions on ALEX"
```

### Arkadiko Protocol
```
"Open a vault with 1000 STX collateral"
"Mint 500 USDA from my vault"
"Check my vault health and liquidation price"
"Repay 100 USDA to my vault"
"Close vault #123 and withdraw collateral"
```

### Charisma Protocol
```
"Create a new composable vault for STX-ALEX yield"
"Deposit 1000 STX into vault #456"
"Check my vault balance and APY"
"Execute Blaze intent: swap STX for best stablecoin"
```

### Velar Protocol
```
"Swap 500 STX for USDA on Velar"
"Add liquidity to STX-USDA pool on Velar"
"Check Velar pool statistics for STX pairs"
"What's the TVL on Velar protocol?"
```

### Granite Lending
```
"Supply 0.1 sBTC to Granite lending pool"
"Borrow USDA against my sBTC collateral"
"Check my borrowing capacity on Granite"
"Repay my USDA loan on Granite"
```

### NFT Operations
```
"Mint an NFT with metadata from ipfs://QmHash"
"Transfer my NFT #123 from collection SP2C2Y... to SP3D03X..."
"Show me all NFTs in my wallet"
"Get NFT collection info for Megapont"
```

### Network Analytics
```
"Show me the latest Stacks block"
"What's the current mempool fee rate?"
"Get transaction details for 0x..."
"Show network statistics for the last 24 hours"
"Check the current Bitcoin block height"
```

## Protocol Integration Status

### ✅ Fully Integrated (Production Ready)
- **Stacks Core**: Contracts, Transactions, PoX, Tokens, NFTs, Blocks, Mempool, Events
- **ALEX Protocol**: AMM, Orderbook, Launchpad, Liquidity Pools
- **Arkadiko Protocol**: Vaults, USDA Stablecoin, DEX, Governance
- **Charisma Protocol**: Composable Vaults, Blaze Intent Protocol
- **Velar Protocol**: Multi-chain DEX, Liquidity, Price Feeds
- **Granite Protocol**: BTC Lending, sBTC Collateral

### ⏸️ Requires API Keys
- **BitFlow Protocol**: Stable DEX operations (requires BitFlow team API access)
  - Contact BitFlow via their documentation for API key access
  - Can be re-enabled after obtaining keys by uncommenting in `src/index.ts`

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

### Plugin System Architecture

![Stacks AI Plugin Architecture](docs/images/stacksAiPluginArchitecture.png)

```mermaid
graph LR
    subgraph "Plugin Base"
        A[PluginBase<br/>Abstract Class]
        B[Tool Factory]
        C[Validation Layer]
    end

    subgraph "Protocol Plugin"
        D[Plugin Implementation]
        E[Service Layer]
        F[API Integration]
        G[Contract Interface]
    end

    subgraph "Tool Registration"
        H[Tool Definition]
        I[Parameter Schema]
        J[Tool Handler]
    end

    A --> D
    B --> H
    C --> I
    D --> E
    E --> F
    E --> G
    H --> J
    I --> J

    style A fill:#e1f5ff
    style D fill:#ffe1e1
    style E fill:#e1ffe1
    style H fill:#fff4e1
```

### Core Components

![Stacks AI Components](docs/images/StacksAiComponents.png)

```mermaid
graph TB
    subgraph "Core Layer"
        A[PluginBase<br/>Abstract base class]
        B[ToolBase<br/>Tool factory]
        C[StacksWalletClient<br/>Wallet interface]
        D[Config Manager<br/>Environment config]
    end

    subgraph "Service Layer"
        E[Protocol Services<br/>Business logic]
        F[API Clients<br/>External APIs]
        G[Contract Handlers<br/>Smart contracts]
    end

    subgraph "Integration Layer"
        H[Hiro API<br/>Blockchain data]
        I[Protocol APIs<br/>ALEX, Velar, etc.]
        J[Stacks Network<br/>Contract calls]
    end

    A --> E
    B --> E
    C --> E
    D --> E

    E --> F
    E --> G

    F --> H
    F --> I
    G --> J

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#e1f5ff
    style E fill:#e1ffe1
    style F fill:#e1ffe1
    style G fill:#e1ffe1
    style H fill:#ffe1f5
    style I fill:#ffe1f5
    style J fill:#ffe1f5
```

### Transaction Flow

![Stacks AI Transaction Flow](docs/images/stacksAiTransactionFlow.png)

```mermaid
sequenceDiagram
    participant AI as AI Agent
    participant MCP as MCP Server
    participant Plugin as Protocol Plugin
    participant Service as Service Layer
    participant Wallet as Wallet Client
    participant Network as Stacks Network

    AI->>MCP: Natural Language Request
    MCP->>Plugin: Route to Tool Handler
    Plugin->>Service: Validate & Prepare
    Service->>Service: Build Contract Call
    Service->>Plugin: Return Contract Call Data
    Plugin->>MCP: Return Unsigned Transaction
    MCP->>AI: Transaction Details

    Note over AI,Wallet: User/Client Signs Transaction

    AI->>Wallet: Sign Transaction
    Wallet->>Network: Broadcast Transaction
    Network->>Wallet: Transaction ID
    Wallet->>AI: Confirmation
    AI->>MCP: Query Transaction Status
    MCP->>Network: Check Status
    Network->>MCP: Transaction Result
    MCP->>AI: Final Status
```

### Data Flow

![Stacks AI Data Flow](docs/images/stacksAIDataFlow.png)

```mermaid
graph LR
    subgraph "Input"
        A[Natural Language] --> B[MCP Request]
    end

    subgraph "Processing"
        B --> C[Tool Router]
        C --> D[Parameter Validation]
        D --> E[Service Execution]
        E --> F[API/Contract Call]
    end

    subgraph "Output"
        F --> G[Response Formatting]
        G --> H[MCP Response]
        H --> I[AI-Readable Result]
    end

    style A fill:#e1f5ff
    style C fill:#ffe1e1
    style E fill:#e1ffe1
    style F fill:#fff4e1
    style I fill:#f5e1ff
```

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

### Integration Architecture

```mermaid
graph TB
    subgraph "MCP Server"
        A[Tool Handler]
        B[Service Layer]
    end

    subgraph "External APIs"
        C[Hiro API<br/>Blockchain Data]
        D[ALEX API<br/>DEX Analytics]
        E[Velar SDK<br/>Multi-chain DEX]
        F[Bitflow SDK<br/>Stable DEX]
    end

    subgraph "Blockchain"
        G[Stacks Network<br/>Contract Calls]
        H[Protocol Contracts<br/>Read/Write]
        I[Pyth Oracles<br/>Price Feeds]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    G --> H
    G --> I

    style A fill:#e1f5ff
    style B fill:#ffe1e1
    style C fill:#e1ffe1
    style D fill:#e1ffe1
    style E fill:#e1ffe1
    style F fill:#e1ffe1
    style G fill:#fff4e1
    style H fill:#f5e1ff
    style I fill:#f5e1ff
```

### API Integration Patterns

Each protocol plugin follows a consistent integration pattern:

```mermaid
sequenceDiagram
    participant Tool as MCP Tool
    participant Service as Protocol Service
    participant API as External API
    participant Contract as Smart Contract
    participant Cache as Response Cache

    Tool->>Service: Execute Operation
    Service->>Service: Validate Parameters

    alt Read Operation
        Service->>Cache: Check Cache
        alt Cache Hit
            Cache->>Service: Return Cached Data
        else Cache Miss
            Service->>API: Fetch Data
            API->>Service: Return Data
            Service->>Cache: Update Cache
        end
    else Write Operation
        Service->>Contract: Build Contract Call
        Contract->>Service: Return Call Data
    end

    Service->>Tool: Return Result
```

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

### Development Workflow

```mermaid
graph LR
    subgraph "Development"
        A[Write Plugin Code] --> B[Add Unit Tests]
        B --> C[Type Check]
        C --> D[Run Tests]
    end

    subgraph "Integration"
        D --> E[Register Plugin]
        E --> F[Build Server]
        F --> G[Test with MCP Client]
    end

    subgraph "Deployment"
        G --> H[Configure AI App]
        H --> I[Test End-to-End]
        I --> J[Deploy to Production]
    end

    style A fill:#e1f5ff
    style D fill:#e1ffe1
    style F fill:#fff4e1
    style I fill:#ffe1f5
    style J fill:#f5e1ff
```

### Testing Strategy

```mermaid
graph TB
    subgraph "Unit Tests"
        A[Service Logic Tests]
        B[Parameter Validation]
        C[Mock API Responses]
    end

    subgraph "Integration Tests"
        D[Clarinet Contract Tests]
        E[Plugin Integration]
        F[End-to-End Flows]
    end

    subgraph "Manual Testing"
        G[Claude Desktop Testing]
        H[Real Network Operations]
        I[Protocol Verification]
    end

    A --> D
    B --> D
    C --> D
    D --> G
    E --> G
    F --> G
    G --> I
    H --> I

    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#e1ffe1
    style E fill:#e1ffe1
    style F fill:#e1ffe1
    style G fill:#fff4e1
    style H fill:#fff4e1
    style I fill:#f5e1ff
```

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

### MCP Communication Flow

![Stacks AI MCP Flow](docs/images/stacksAiMcpFlow.png)

```mermaid
sequenceDiagram
    participant Client as MCP Client<br/>(Claude/Cursor)
    participant Server as Stacks AI<br/>MCP Server
    participant Plugin as Protocol Plugin
    participant Network as Stacks Network

    Client->>Server: initialize
    Server->>Client: serverInfo + capabilities

    Client->>Server: tools/list
    Server->>Plugin: getAllTools()
    Plugin->>Server: 144+ Tool Definitions
    Server->>Client: Tool List

    Client->>Server: tools/call<br/>(tool: swap_tokens)
    Server->>Plugin: validateParameters()
    Plugin->>Plugin: buildContractCall()
    Plugin->>Server: Contract Call Data
    Server->>Client: Success Response

    Note over Client,Network: Client signs & broadcasts transaction

    Client->>Server: tools/call<br/>(tool: check_transaction)
    Server->>Network: Query Transaction
    Network->>Server: Transaction Status
    Server->>Client: Status Response
```

### Tool Schema Example

Each tool follows a consistent schema pattern:

```mermaid
graph LR
    subgraph "Tool Definition"
        A[Tool Name] --> B[Description]
        B --> C[Parameter Schema]
        C --> D[Handler Function]
    end

    subgraph "Parameter Schema"
        E[Required Params] --> F[Optional Params]
        F --> G[Type Validation]
        G --> H[Custom Validators]
    end

    subgraph "Handler Execution"
        I[Receive Parameters] --> J[Validate Input]
        J --> K[Execute Service]
        K --> L[Format Response]
    end

    D --> I

    style A fill:#e1f5ff
    style C fill:#e1ffe1
    style D fill:#fff4e1
    style I fill:#ffe1f5
    style L fill:#f5e1ff
```

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

Special thanks to:

- Stacks Foundation for the Bitcoin L2 infrastructure
- Hiro Systems for comprehensive blockchain APIs
- ALEX, Bitflow, Arkadiko, Charisma, Velar, and Granite teams for protocol documentation
- Model Context Protocol team for the MCP specification

## Support

For issues, questions, or contributions:
- Create an issue in the repository
- Review documentation in `/docs` directory
- Check protocol-specific documentation for integration details

## Project Statistics

### Coverage Overview

```mermaid
pie title "Tool Distribution by Category"
    "ALEX Protocol" : 34
    "Bitflow Protocol" : 29
    "Arkadiko Protocol" : 28
    "Velar Protocol" : 18
    "Granite Protocol" : 21
    "Charisma Protocol" : 14
    "Core Operations" : 40
```

### Protocol Integration Status

| Protocol | Status | Tools | API Type | Features |
|----------|--------|-------|----------|----------|
| ALEX | Production | 34 | REST API + Contracts | AMM, Orderbook, Launchpad |
| Bitflow | Pending API Key | 29 | SDK + REST API | StableSwap, Keeper, DCA |
| Arkadiko | Production | 28 | Smart Contracts | Vaults, USDA, Governance |
| Charisma | Production | 14 | REST API + Contracts | Composable Vaults, Blaze |
| Velar | Production | 18 | SDK + REST API | Multi-chain DEX |
| Granite | Production | 21 | Smart Contracts | BTC Lending, Flash Loans |
| Stacks Core | Production | 40+ | Hiro API | Contracts, Tx, PoX, NFTs |

### System Architecture Stats

- **Total Protocols**: 7 (6 DeFi + Stacks Core)
- **Total Tools**: 144+
- **Plugin System**: Modular, extensible
- **Network Support**: Mainnet, Testnet, Devnet
- **Wallet Support**: Private Key, Mnemonic
- **AI Platforms**: Claude Desktop, Cursor, VS Code
- **Testing**: Unit + Integration (Clarinet)
- **Type Safety**: Full TypeScript with Zod validation

## Technology Stack

```mermaid
graph TB
    subgraph "Core Technologies"
        A[TypeScript 5.x]
        B[Node.js 20+]
        C[Model Context Protocol]
        D[Zod Schema Validation]
    end

    subgraph "Stacks Technologies"
        E[Stacks.js SDK]
        F[Clarity Smart Contracts]
        G[Hiro API]
        H[Clarinet Testing]
    end

    subgraph "Protocol SDKs"
        I[Velar SDK]
        J[Bitflow SDK]
        K[BNS SDK]
        L[Protocol APIs]
    end

    subgraph "Development Tools"
        M[pnpm Package Manager]
        N[ESLint + Prettier]
        O[Jest Testing]
        P[Git + GPG Signing]
    end

    A --> E
    B --> E
    C --> E
    D --> E

    E --> I
    E --> J
    E --> K
    F --> G
    G --> H

    style A fill:#e1f5ff
    style C fill:#ffe1f5
    style E fill:#e1ffe1
    style F fill:#fff4e1
```

## Key Features

- **Comprehensive Protocol Coverage**: All major Stacks DeFi protocols in one unified interface
- **Real Implementation**: No mocks, all tools interact with actual protocols and smart contracts
- **Type Safety**: Full TypeScript with runtime Zod validation for reliability
- **Modular Architecture**: Plugin-based system allows easy addition of new protocols
- **Multiple Networks**: Support for mainnet, testnet, and local devnet
- **Professional Standards**: GPG-signed commits, comprehensive documentation, no mock data
- **AI-First Design**: Natural language interactions with Bitcoin DeFi
- **Security Focused**: Safe transaction handling with user-controlled signing

## Version

Current version: 1.0.0

Last updated: October 2025

---

## Summary

**Stacks AI MCP Server** is the first comprehensive Model Context Protocol server for the Bitcoin DeFi ecosystem, built on Stacks Layer 2. With 144+ professional tools across 7 protocol integrations, it enables AI agents and applications to interact with Bitcoin DeFi through natural language interfaces.

The server implements real protocol integration without mocks, uses a modular plugin architecture for extensibility, and follows professional development standards including full TypeScript type safety, GPG-signed commits, and comprehensive testing.

This project demonstrates how AI can make Bitcoin DeFi accessible to everyone through conversational interfaces, bridging the gap between complex blockchain operations and natural language interactions.
