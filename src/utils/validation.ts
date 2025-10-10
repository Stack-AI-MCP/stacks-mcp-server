// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Stacks address validation utilities
 */
export class StacksAddressValidator {
  /**
   * Validate Stacks address format
   */
  static isValid(address: string): boolean {
    // Stacks addresses: SP (mainnet) or ST (testnet) + 39 characters (base58)
    return /^S[PT][A-HJKMNP-Z0-9]{39}$/.test(address);
  }

  /**
   * Get network from address prefix
   */
  static getNetwork(address: string): 'mainnet' | 'testnet' | 'unknown' {
    if (!this.isValid(address)) return 'unknown';
    
    const prefix = address.substring(0, 2);
    switch (prefix) {
      case 'SP': return 'mainnet';
      case 'ST': return 'testnet';
      default: return 'unknown';
    }
  }

  /**
   * Validate address matches expected network
   */
  static isValidForNetwork(address: string, network: 'mainnet' | 'testnet'): boolean {
    if (!this.isValid(address)) return false;
    return this.getNetwork(address) === network;
  }

  /**
   * Normalize address (trim whitespace, validate format)
   */
  static normalize(address: string): string {
    const normalized = address.trim();
    if (!this.isValid(normalized)) {
      throw new Error(`Invalid Stacks address format: ${normalized}`);
    }
    return normalized;
  }
}

/**
 * Contract ID validation utilities
 */
export class ContractValidator {
  /**
   * Validate contract ID format (address.contract-name)
   */
  static isValidContractId(contractId: string): boolean {
    const parts = contractId.split('.');
    if (parts.length !== 2) return false;
    
    const [address, contractName] = parts;
    return StacksAddressValidator.isValid(address) && this.isValidContractName(contractName);
  }

  /**
   * Validate contract name format
   */
  static isValidContractName(name: string): boolean {
    // Contract names: 1-40 characters, alphanumeric + hyphens, must start with alpha
    return /^[a-zA-Z][a-zA-Z0-9-]{0,39}$/.test(name);
  }

  /**
   * Parse contract ID into components
   */
  static parseContractId(contractId: string): { address: string; contractName: string } {
    if (!this.isValidContractId(contractId)) {
      throw new Error(`Invalid contract ID format: ${contractId}`);
    }
    
    const [address, contractName] = contractId.split('.');
    return { address, contractName };
  }

  /**
   * Validate function name
   */
  static isValidFunctionName(name: string): boolean {
    // Function names: alphanumeric + hyphens + underscores, 1-128 chars
    return /^[a-zA-Z0-9_-]{1,128}$/.test(name);
  }
}

/**
 * Transaction validation utilities
 */
export class TransactionValidator {
  /**
   * Validate transaction ID format
   */
  static isValidTxId(txId: string): boolean {
    // Transaction IDs: 0x + 64 hex characters
    return /^0x[a-fA-F0-9]{64}$/.test(txId);
  }

  /**
   * Validate STX amount (in microSTX)
   */
  static isValidSTXAmount(amount: number | string): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER;
  }

  /**
   * Validate memo field (max 34 bytes)
   */
  static isValidMemo(memo: string): boolean {
    return Buffer.from(memo, 'utf8').length <= 34;
  }

  /**
   * Validate private key format
   */
  static isValidPrivateKey(privateKey: string): boolean {
    // Remove 0x prefix if present
    const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    // Private keys: exactly 64 hex characters
    return /^[a-fA-F0-9]{64}$/.test(key);
  }

  /**
   * Validate BTC address for stacking
   */
  static isValidBTCAddress(address: string): boolean {
    // Basic validation for common BTC address formats
    // Legacy (P2PKH): starts with 1
    // Script (P2SH): starts with 3  
    // Bech32 (P2WPKH/P2WSH): starts with bc1
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
           /^bc1[a-z0-9]{39,59}$/.test(address);
  }
}

/**
 * Network validation utilities
 */
export class NetworkValidator {
  static readonly SUPPORTED_NETWORKS = ['mainnet', 'testnet', 'devnet'] as const;
  
  /**
   * Validate network name
   */
  static isValidNetwork(network: string): network is 'mainnet' | 'testnet' | 'devnet' {
    return this.SUPPORTED_NETWORKS.includes(network as any);
  }

  /**
   * Normalize network name
   */
  static normalize(network: string): 'mainnet' | 'testnet' | 'devnet' {
    const normalized = network.toLowerCase().trim();
    if (!this.isValidNetwork(normalized)) {
      throw new Error(`Unsupported network: ${network}. Supported: ${this.SUPPORTED_NETWORKS.join(', ')}`);
    }
    return normalized;
  }
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize string input (remove dangerous characters, trim)
   */
  static sanitizeString(input: string, maxLength = 1000): string {
    return input
      .trim()
      .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
      .substring(0, maxLength);
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: string | number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }
    
    if (num < min || num > max) {
      throw new Error(`Number must be between ${min} and ${max}`);
    }
    
    return num;
  }

  /**
   * Sanitize array input (remove duplicates, limit size)
   */
  static sanitizeArray<T>(input: T[], maxLength = 100): T[] {
    return Array.from(new Set(input)).slice(0, maxLength);
  }
}

/**
 * Comprehensive validation for common MCP tool inputs
 */
export class MCPInputValidator {
  /**
   * Validate account operation inputs
   */
  static validateAccountInput(params: {
    address: string;
    network?: string;
    includeTokens?: boolean;
    includeTransactions?: boolean;
  }) {
    return {
      address: StacksAddressValidator.normalize(params.address),
      network: params.network ? NetworkValidator.normalize(params.network) : 'testnet',
      includeTokens: Boolean(params.includeTokens),
      includeTransactions: Boolean(params.includeTransactions),
    };
  }

  /**
   * Validate token operation inputs
   */
  static validateTokenInput(params: {
    contractAddress: string;
    contractName: string;
    network?: string;
    address?: string;
  }) {
    const contractId = `${params.contractAddress}.${params.contractName}`;
    
    if (!ContractValidator.isValidContractId(contractId)) {
      throw new Error(`Invalid contract ID: ${contractId}`);
    }

    return {
      contractAddress: StacksAddressValidator.normalize(params.contractAddress),
      contractName: InputSanitizer.sanitizeString(params.contractName, 40),
      network: params.network ? NetworkValidator.normalize(params.network) : 'testnet',
      address: params.address ? StacksAddressValidator.normalize(params.address) : undefined,
    };
  }

  /**
   * Validate stacking operation inputs
   */
  static validateStackingInput(params: {
    amount: number;
    cycles: number;
    btcAddress: string;
    network?: string;
  }) {
    if (!TransactionValidator.isValidSTXAmount(params.amount)) {
      throw new Error('Invalid STX amount');
    }

    if (!Number.isInteger(params.cycles) || params.cycles < 1 || params.cycles > 12) {
      throw new Error('Cycles must be an integer between 1 and 12');
    }

    if (!TransactionValidator.isValidBTCAddress(params.btcAddress)) {
      throw new Error('Invalid Bitcoin address format');
    }

    return {
      amount: InputSanitizer.sanitizeNumber(params.amount),
      cycles: InputSanitizer.sanitizeNumber(params.cycles, 1, 12),
      btcAddress: InputSanitizer.sanitizeString(params.btcAddress, 100),
      network: params.network ? NetworkValidator.normalize(params.network) : 'testnet',
    };
  }
}

/**
 * Validation error types
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public network?: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AddressError extends Error {
  constructor(message: string, public address?: string) {
    super(message);
    this.name = 'AddressError';
  }
}