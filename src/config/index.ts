// ============================================================================
// CONFIGURATION SYSTEM
// ============================================================================

export interface StacksConfig {
  hiro_api: {
    apiKey?: string;
    mainnetUrl: string;
    testnetUrl: string;
  };
  stacks_network: {
    mainnet: string;
    testnet: string;
    devnet: string;
  };
  stacks_explorer: {
    mainnet: string;
    testnet: string;
  };
  wallet: {
    defaultNetwork: 'mainnet' | 'testnet' | 'devnet';
  };
}

/**
 * Configuration for Stacks MCP Server
 * Supports environment variables for deployment flexibility
 */
export const config: StacksConfig = {
  hiro_api: {
    apiKey: process.env.HIRO_API_KEY,
    mainnetUrl: process.env.STACKS_MAINNET_API_URL || 'https://api.hiro.so',
    testnetUrl: process.env.STACKS_TESTNET_API_URL || 'https://api.testnet.hiro.so',
  },
  
  stacks_network: {
    mainnet: process.env.STACKS_MAINNET_API_URL || 'https://api.hiro.so',
    testnet: process.env.STACKS_TESTNET_API_URL || 'https://api.testnet.hiro.so',
    devnet: process.env.STACKS_DEVNET_API_URL || 'http://localhost:20443',
  },

  stacks_explorer: {
    mainnet: process.env.STACKS_EXPLORER_MAINNET_URL || 'https://explorer.hiro.so',
    testnet: process.env.STACKS_EXPLORER_TESTNET_URL || 'https://explorer.hiro.so',
  },

  wallet: {
    defaultNetwork: (process.env.STACKS_DEFAULT_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet',
  },
};

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  const requiredEnvVars = [
    // Core network settings are optional with defaults
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing optional environment variables: ${missingVars.join(', ')}`);
    console.warn('Using default configuration values');
  }

  // Log current configuration (without sensitive data)
  console.log('🔧 Stacks MCP Server Configuration:');
  console.log(`   Default Network: ${config.wallet.defaultNetwork}`);
  console.log(`   Mainnet API: ${config.stacks_network.mainnet}`);
  console.log(`   Testnet API: ${config.stacks_network.testnet}`);
  console.log(`   Devnet API: ${config.stacks_network.devnet}`);
  console.log(`   Hiro API Key: ${config.hiro_api.apiKey ? '✅ Configured' : '❌ Not configured'}`);
}

/**
 * Get network configuration for a specific network
 */
export function getNetworkConfig(network: 'mainnet' | 'testnet' | 'devnet') {
  return {
    apiUrl: config.stacks_network[network],
    explorerUrl: config.stacks_explorer[network] || config.stacks_explorer.mainnet,
  };
}

/**
 * Environment detection utilities
 */
export const Environment = {
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
  
  getLogLevel: () => process.env.LOG_LEVEL || 'info',
  
  // MCP Server specific
  getServerPort: () => parseInt(process.env.MCP_SERVER_PORT || '3000'),
  getServerHost: () => process.env.MCP_SERVER_HOST || 'localhost',
  
  // Development helpers
  enableDebugLogs: () => process.env.DEBUG === 'true' || Environment.isDevelopment(),
  enableTelemetry: () => process.env.DISABLE_TELEMETRY !== 'true',
};

/**
 * Create environment template for development
 */
export function createEnvTemplate(): string {
  return `# Stacks MCP Server Environment Configuration
# Copy this to .env and customize as needed

# Network Configuration (Optional - defaults provided)
STACKS_DEFAULT_NETWORK=testnet
STACKS_MAINNET_API_URL=https://api.hiro.so
STACKS_TESTNET_API_URL=https://api.testnet.hiro.so
STACKS_DEVNET_API_URL=http://localhost:20443

# Hiro API Configuration (Optional but recommended for rate limits)
HIRO_API_KEY=your_hiro_api_key_here

# Explorer URLs (Optional - defaults provided)
STACKS_EXPLORER_MAINNET_URL=https://explorer.hiro.so
STACKS_EXPLORER_TESTNET_URL=https://explorer.hiro.so

# MCP Server Configuration
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# Development Configuration
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
DISABLE_TELEMETRY=false

# Wallet Configuration (For development/testing)
# WARNING: Never commit real private keys or mnemonics!
# WALLET_PRIVATE_KEY=your_test_private_key_here
# WALLET_MNEMONIC=your_test_mnemonic_here
`;
}

// Initialize and validate configuration on module load
validateConfig();