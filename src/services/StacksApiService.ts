// ============================================================================
// STACKS API SERVICE
// ============================================================================

export interface AccountInfo {
  balance: string;
  locked: string;
  unlock_height: number;
  nonce: number;
}

export interface ContractInfo {
  contract_id: string;
  block_height: number;
  source_code: string;
  abi: string;
}

export interface TransactionInfo {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  block_height?: number;
  block_hash?: string;
  burn_block_time?: number;
}

export interface TokenBalance {
  balance: string;
  total_sent: string;
  total_received: string;
}

export interface NFTHolding {
  asset_identifier: string;
  value: {
    hex: string;
    repr: string;
  };
  block_height: number;
  tx_id: string;
}

export interface NetworkInfo {
  peer_version: number;
  pox_consensus: string;
  burn_block_height: number;
  stable_pox_consensus: string;
  stable_burn_block_height: number;
  server_version: string;
  network_id: number;
  parent_network_id: number;
  stacks_tip_height: number;
  stacks_tip: string;
  stacks_tip_consensus_hash: string;
  genesis_block_time_iso: string;
  unanchored_tip_height: number;
  unanchored_tip: string;
  unanchored_tip_consensus_hash: string;
  exit_at_block_height?: number;
}

/**
 * Service for interacting with Stacks blockchain APIs
 * Provides access to Hiro API and direct Stacks node API
 */
export class StacksApiService {
  private hiroApiKey?: string;

  constructor(hiroApiKey?: string) {
    this.hiroApiKey = hiroApiKey || process.env.HIRO_API_KEY;
  }

  /**
   * Get the appropriate API URL for the network
   */
  getApiUrl(network: "mainnet" | "testnet" | "devnet"): string {
    switch (network) {
      case "mainnet":
        return process.env.STACKS_MAINNET_API_URL || 'https://api.hiro.so';
      case "testnet":
        return process.env.STACKS_TESTNET_API_URL || 'https://api.testnet.hiro.so';
      case "devnet":
        return process.env.STACKS_DEVNET_API_URL || 'http://localhost:20443';
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.hiroApiKey) {
      headers["X-API-Key"] = this.hiroApiKey;
    }

    return headers;
  }

  /**
   * Make an API request with proper error handling
   */
  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error("Unknown API error");
    }
  }

  // ============================================================================
  // ACCOUNT OPERATIONS
  // ============================================================================

  /**
   * Get account information including STX balance and nonce
   */
  async getAccountInfo(address: string, network: "mainnet" | "testnet" | "devnet"): Promise<AccountInfo> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/extended/v1/address/${address}/stx`;
    return this.makeRequest<AccountInfo>(url);
  }

  /**
   * Get account balances including all token holdings
   */
  async getAccountBalance(address: string, network: "mainnet" | "testnet" | "devnet"): Promise<any> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/extended/v1/address/${address}/balances`;
    return this.makeRequest(url);
  }

  /**
   * Get account transaction history
   */
  async getAccountTransactions(
    address: string, 
    network: "mainnet" | "testnet" | "devnet",
    limit = 50,
    offset = 0
  ): Promise<any> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`;
    return this.makeRequest(url);
  }

  // ============================================================================
  // CONTRACT OPERATIONS
  // ============================================================================

  /**
   * Get contract information and source code
   */
  async getContractInfo(contractId: string, network: "mainnet" | "testnet" | "devnet"): Promise<ContractInfo> {
    const apiUrl = this.getApiUrl(network);
    const [contractAddress, contractName] = contractId.split(".");
    const url = `${apiUrl}/extended/v1/contract/${contractAddress}/${contractName}`;
    return this.makeRequest<ContractInfo>(url);
  }

  /**
   * Get contract source code
   */
  async getContractSource(contractId: string, network: "mainnet" | "testnet" | "devnet"): Promise<string> {
    const contractInfo = await this.getContractInfo(contractId, network);
    return contractInfo.source_code;
  }

  /**
   * Call a read-only contract function
   */
  async callReadOnlyFunction(
    contractId: string,
    functionName: string,
    functionArgs: string[],
    network: "mainnet" | "testnet" | "devnet",
    senderAddress?: string
  ): Promise<any> {
    const apiUrl = this.getApiUrl(network);
    const [contractAddress, contractName] = contractId.split(".");
    const url = `${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;

    return this.makeRequest(url, {
      method: "POST",
      body: JSON.stringify({
        sender: senderAddress || contractAddress,
        arguments: functionArgs,
      }),
    });
  }

  // ============================================================================
  // TRANSACTION OPERATIONS
  // ============================================================================

  /**
   * Broadcast a signed transaction
   */
  async broadcastTransaction(txHex: string, network: "mainnet" | "testnet" | "devnet"): Promise<string> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/v2/transactions`;

    const response = await this.makeRequest<{ txid: string }>(url, {
      method: "POST",
      body: txHex,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    return response.txid;
  }

  /**
   * Get transaction status and details
   */
  async getTransactionStatus(txId: string, network: "mainnet" | "testnet" | "devnet"): Promise<TransactionInfo> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/extended/v1/tx/${txId}`;
    return this.makeRequest<TransactionInfo>(url);
  }

  /**
   * Get transactions in mempool
   */
  async getMempoolTransactions(network: "mainnet" | "testnet" | "devnet", limit = 100): Promise<any> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/extended/v1/tx/mempool?limit=${limit}`;
    return this.makeRequest(url);
  }

  // ============================================================================
  // NETWORK INFORMATION
  // ============================================================================

  /**
   * Get network status and information
   */
  async getNetworkInfo(network: "mainnet" | "testnet" | "devnet"): Promise<NetworkInfo> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/v2/info`;
    return this.makeRequest<NetworkInfo>(url);
  }

  /**
   * Get PoX (Proof of Transfer) information
   */
  async getPoxInfo(network: "mainnet" | "testnet" | "devnet"): Promise<any> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/v2/pox`;
    return this.makeRequest(url);
  }

  /**
   * Get current block height
   */
  async getCurrentBlockHeight(network: "mainnet" | "testnet" | "devnet"): Promise<number> {
    const networkInfo = await this.getNetworkInfo(network);
    return networkInfo.stacks_tip_height;
  }

  // ============================================================================
  // TOKEN OPERATIONS (SIP-010 FUNGIBLE TOKENS)
  // ============================================================================

  /**
   * Get SIP-010 fungible token balance for an address
   */
  async getFungibleTokenBalance(
    contractId: string,
    address: string,
    network: "mainnet" | "testnet" | "devnet"
  ): Promise<string> {
    try {
      const result = await this.callReadOnlyFunction(
        contractId,
        "get-balance",
        [`0x${Buffer.from(address, 'utf8').toString('hex')}`],
        network
      );

      if (result.okay && result.result) {
        return result.result.replace('u', '');
      }
      throw new Error(result.error || "Failed to get balance");
    } catch (error) {
      throw new Error(`Failed to get fungible token balance: ${error}`);
    }
  }

  /**
   * Get SIP-010 token information (name, symbol, decimals, etc.)
   */
  async getFungibleTokenInfo(
    contractId: string,
    network: "mainnet" | "testnet" | "devnet"
  ): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    uri?: string;
  }> {
    try {
      const [nameResult, symbolResult, decimalsResult, supplyResult, uriResult] = await Promise.all([
        this.callReadOnlyFunction(contractId, "get-name", [], network),
        this.callReadOnlyFunction(contractId, "get-symbol", [], network),
        this.callReadOnlyFunction(contractId, "get-decimals", [], network),
        this.callReadOnlyFunction(contractId, "get-total-supply", [], network),
        this.callReadOnlyFunction(contractId, "get-token-uri", [], network).catch(() => null),
      ]);

      return {
        name: nameResult.okay ? nameResult.result.replace(/"/g, '') : 'Unknown',
        symbol: symbolResult.okay ? symbolResult.result.replace(/"/g, '') : 'Unknown',
        decimals: decimalsResult.okay ? parseInt(decimalsResult.result.replace('u', '')) : 0,
        totalSupply: supplyResult.okay ? supplyResult.result.replace('u', '') : '0',
        uri: uriResult?.okay && uriResult.result !== 'none' ? uriResult.result : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to get fungible token info: ${error}`);
    }
  }

  // ============================================================================
  // NFT OPERATIONS (SIP-009 NON-FUNGIBLE TOKENS)
  // ============================================================================

  /**
   * Get NFT holdings for an address
   */
  async getNFTHoldings(address: string, network: "mainnet" | "testnet" | "devnet"): Promise<NFTHolding[]> {
    const apiUrl = this.getApiUrl(network);
    const url = `${apiUrl}/extended/v1/address/${address}/assets?limit=200`;
    const response = await this.makeRequest<{ results: NFTHolding[] }>(url);
    return response.results;
  }

  /**
   * Get SIP-009 NFT owner
   */
  async getNFTOwner(
    contractId: string,
    tokenId: number,
    network: "mainnet" | "testnet" | "devnet"
  ): Promise<string | null> {
    try {
      const result = await this.callReadOnlyFunction(
        contractId,
        "get-owner",
        [`0x${tokenId.toString(16).padStart(32, '0')}`],
        network
      );

      if (result.okay && result.result !== 'none') {
        return result.result.replace(/[()]/g, '').replace('some ', '');
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to get NFT owner: ${error}`);
    }
  }

  /**
   * Get SIP-009 NFT metadata URI
   */
  async getNFTTokenUri(
    contractId: string,
    tokenId: number,
    network: "mainnet" | "testnet" | "devnet"
  ): Promise<string | null> {
    try {
      const result = await this.callReadOnlyFunction(
        contractId,
        "get-token-uri",
        [`0x${tokenId.toString(16).padStart(32, '0')}`],
        network
      );

      if (result.okay && result.result !== 'none') {
        return result.result.replace(/[()]/g, '').replace('some ', '').replace(/"/g, '');
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to get NFT token URI: ${error}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if an address is valid
   */
  isValidStacksAddress(address: string): boolean {
    // Basic validation - Stacks addresses start with SP (mainnet) or ST (testnet)
    return /^S[PT][A-Z0-9]{39}$/.test(address);
  }

  /**
   * Convert microSTX to STX
   */
  microStxToStx(microStx: string | number): number {
    return Number(microStx) / 1000000;
  }

  /**
   * Convert STX to microSTX
   */
  stxToMicroStx(stx: string | number): number {
    return Math.floor(Number(stx) * 1000000);
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txId: string, network: "mainnet" | "testnet" | "devnet"): string {
    const baseUrl = network === "mainnet" 
      ? 'https://explorer.hiro.so'
      : 'https://explorer.hiro.so';
    const suffix = network === "testnet" ? "?chain=testnet" : "";
    return `${baseUrl}/txid/${txId}${suffix}`;
  }

  /**
   * Get explorer URL for address
   */
  getAddressExplorerUrl(address: string, network: "mainnet" | "testnet" | "devnet"): string {
    const baseUrl = network === "mainnet" 
      ? 'https://explorer.hiro.so'
      : 'https://explorer.hiro.so';
    const suffix = network === "testnet" ? "?chain=testnet" : "";
    return `${baseUrl}/address/${address}${suffix}`;
  }

  /**
   * Get explorer URL for contract
   */
  getContractExplorerUrl(contractId: string, network: "mainnet" | "testnet" | "devnet"): string {
    const baseUrl = network === "mainnet" 
      ? 'https://explorer.hiro.so'
      : 'https://explorer.hiro.so';
    const suffix = network === "testnet" ? "?chain=testnet" : "";
    return `${baseUrl}/txid/${contractId}${suffix}`;
  }
}