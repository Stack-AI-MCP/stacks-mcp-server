import {
  getAddressFromPrivateKey,
  makeSTXTokenTransfer,
  makeContractCall,
  broadcastTransaction,
  PostConditionMode,
  AnchorMode,
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
  someCV,
  noneCV,
  bufferCV
} from '@stacks/transactions';
import { StacksNetwork, STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { 
  StackingClient
} from '@stacks/stacking';
import { getPublicKeyFromPrivate } from '@stacks/encryption';
import { generateWallet, Account } from '@stacks/wallet-sdk';
import type { WalletClientBase } from '../core/types.js';

export interface StacksWalletConfig {
  privateKey?: string;
  mnemonic?: string;
  network: 'mainnet' | 'testnet';
}

export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
  data?: any;
}

export interface Balance {
  stx: string;
  locked: string;
  raw: {
    stx: string;
    locked: string;
  };
}

/**
 * Stacks-specific wallet client implementation
 * Handles Stacks blockchain operations with real private keys
 */
export class StacksWalletClient implements WalletClientBase {
  private privateKey: string;
  private publicKey: string;
  private address: string;
  private network: StacksNetwork;
  private networkType: 'mainnet' | 'testnet';
  private apiUrl: string;

  constructor(config: StacksWalletConfig) {
    this.networkType = config.network;
    this.network = config.network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    this.apiUrl = config.network === 'mainnet' 
      ? 'https://api.hiro.so' 
      : 'https://api.testnet.hiro.so';

    // Initialize wallet from private key or mnemonic
    if (config.privateKey) {
      // Remove 0x prefix if present
      const pkHex = config.privateKey.startsWith('0x') 
        ? config.privateKey.slice(2) 
        : config.privateKey;
      this.privateKey = pkHex;
      
      // Derive real public key from private key using Stacks.js
      this.publicKey = getPublicKeyFromPrivate(this.privateKey);
      this.address = getAddressFromPrivateKey(this.privateKey, this.network);
    } else if (config.mnemonic) {
      throw new Error('Use StacksWalletClient.fromMnemonic() for mnemonic initialization');
    } else {
      throw new Error('Either privateKey or mnemonic must be provided');
    }

    console.error(`🔑 Stacks Wallet initialized: ${this.address} on ${config.network}`);
  }

  /**
   * Create wallet instance from mnemonic using proper BIP39/BIP44 derivation
   */
  static async fromMnemonic(mnemonic: string, network: 'mainnet' | 'testnet'): Promise<StacksWalletClient> {
    try {
      // Generate wallet from mnemonic using wallet-sdk
      const wallet = await generateWallet({
        secretKey: mnemonic,
        password: '' // Use empty password for simplicity, can be enhanced later
      });

      // Get the first account (index 0) following BIP44 path m/44'/5757'/0'/0/0
      const account = wallet.accounts[0];
      
      // Create wallet instance using the derived private key
      return new StacksWalletClient({
        privateKey: account.stxPrivateKey,
        network
      });
    } catch (error) {
      throw new Error(`Failed to create wallet from mnemonic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getAddress(): string {
    return this.address;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  getPrivateKey(): string {
    return this.privateKey;
  }

  getNetwork(): string {
    return this.networkType;
  }

  getExplorerUrl(txHash: string): string {
    return this.networkType === 'mainnet' 
      ? `https://explorer.hiro.so/txid/${txHash}`
      : `https://explorer.hiro.so/txid/${txHash}?chain=testnet`;
  }

  async getBalance(address?: string): Promise<Balance> {
    try {
      const targetAddress = address || this.address;
      const response = await fetch(`${this.apiUrl}/extended/v1/address/${targetAddress}/balances`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        stx: (parseInt(data.stx.balance) / 1000000).toFixed(6), // Convert microSTX to STX
        locked: (parseInt(data.stx.locked) / 1000000).toFixed(6),
        raw: {
          stx: data.stx.balance,
          locked: data.stx.locked,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNonce(address?: string): Promise<number> {
    try {
      const targetAddress = address || this.address;
      const response = await fetch(`${this.apiUrl}/extended/v1/address/${targetAddress}/nonces`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch nonce: ${response.statusText}`);
      }

      const data = await response.json();
      return Number(data.possible_next_nonce);
    } catch (error) {
      throw new Error(`Failed to get nonce: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Send STX tokens to another address
   */
  async transferSTX(recipient: string, amount: number, memo?: string): Promise<TransactionResult> {
    try {
      const amountInMicroSTX = Math.floor(amount * 1000000); // Convert STX to microSTX
      const nonce = await this.getNonce();

      const txOptions = {
        recipient,
        amount: amountInMicroSTX, // Use number, not BigInt
        senderKey: this.privateKey,
        network: this.networkType, // Use string not network object
        memo: memo,
        nonce: nonce,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow
      };

      const transaction = await makeSTXTokenTransfer(txOptions);
      const broadcastResponse = await broadcastTransaction({ transaction });

      if ('error' in broadcastResponse) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }

      console.error(`💸 STX Transfer sent: ${broadcastResponse.txid}`);
      console.error(`🔍 Explorer: ${this.getExplorerUrl(broadcastResponse.txid)}`);

      return {
        txId: broadcastResponse.txid,
        success: true,
        data: {
          from: this.address,
          to: recipient,
          amount: amount,
          memo,
          explorerUrl: this.getExplorerUrl(broadcastResponse.txid)
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'STX transfer failed'
      };
    }
  }

  /**
   * Call a smart contract function
   */
  async callContract(
    contractAddress: string,
    contractName: string,
    functionName: string,
    functionArgs: any[] = [],
    postConditionMode: PostConditionMode = PostConditionMode.Allow
  ): Promise<TransactionResult> {
    try {
      const nonce = await this.getNonce();

      const txOptions = {
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderKey: this.privateKey,
        network: this.networkType,
        nonce: nonce,
        postConditionMode,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction({ transaction });

      if ('error' in broadcastResponse) {
        throw new Error(`Contract call failed: ${broadcastResponse.error}`);
      }

      console.error(`📝 Contract call sent: ${broadcastResponse.txid}`);
      console.error(`🔍 Explorer: ${this.getExplorerUrl(broadcastResponse.txid)}`);

      return {
        txId: broadcastResponse.txid,
        success: true,
        data: {
          contractAddress,
          contractName,
          functionName,
          explorerUrl: this.getExplorerUrl(broadcastResponse.txid)
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Contract call failed'
      };
    }
  }

  /**
   * Call a read-only contract function
   */
  async callReadOnlyFunction(
    contractAddress: string,
    contractName: string,
    functionName: string,
    functionArgs: any[] = [],
    senderAddress?: string
  ): Promise<any> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        senderAddress: senderAddress || this.address,
        network: this.network,
      });

      return cvToJSON(result);
    } catch (error) {
      throw new Error(`Read-only function call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stack STX tokens using real StackingClient
   */
  async stackSTX(
    amountInSTX: number,
    cycles: number,
    btcAddress: string,
    rewardCycle?: number
  ): Promise<TransactionResult> {
    try {
      // Convert STX to microSTX
      const amountMicroStx = BigInt(Math.floor(amountInSTX * 1000000));
      
      // Initialize stacking client with proper parameters object
      const stackingClient = new StackingClient({ 
        address: this.address,
        network: this.network 
      });
      
      // Check stacking eligibility first
      const eligibility = await stackingClient.canStack({ 
        poxAddress: btcAddress, 
        cycles 
      });
      
      if (!eligibility.eligible) {
        return {
          txId: '',
          success: false,
          error: `Not eligible for stacking: ${eligibility.reason}`
        };
      }

      // Get current block height for stacking
      const poxInfo = await stackingClient.getPoxInfo();
      const burnBlockHeight = poxInfo.current_burnchain_block_height || 0;

      // Use provided reward cycle or calculate the next one
      const startBurnHeight = rewardCycle 
        ? rewardCycle * poxInfo.reward_cycle_length + poxInfo.first_burnchain_block_height
        : burnBlockHeight;

      // Build and broadcast stacking transaction
      const stackingResult = await stackingClient.stack({
        amountMicroStx,
        poxAddress: btcAddress,
        cycles,
        burnBlockHeight: startBurnHeight,
        privateKey: this.privateKey
      });

      console.error(`🔥 STX Stacking transaction sent: ${stackingResult.txid}`);
      console.error(`🔍 Explorer: ${this.getExplorerUrl(stackingResult.txid)}`);

      return {
        txId: stackingResult.txid,
        success: true,
        data: {
          amount: amountInSTX,
          cycles,
          btcAddress,
          startBurnHeight,
          rewardCycle: rewardCycle || 'auto-calculated',
          explorerUrl: this.getExplorerUrl(stackingResult.txid)
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Stacking failed'
      };
    }
  }

  /**
   * Get stacking information for an address
   */
  async getStackingInfo(address?: string): Promise<any> {
    try {
      const targetAddress = address || this.address;
      const stackingClient = new StackingClient({ 
        address: targetAddress,
        network: this.network 
      });
      
      // Get PoX info and stacker status
      const [poxInfo, stackerInfo] = await Promise.all([
        stackingClient.getPoxInfo(),
        stackingClient.getStatus()
      ]);

      return {
        address: targetAddress,
        poxInfo,
        stackerInfo,
        network: this.networkType
      };
    } catch (error) {
      throw new Error(`Error fetching stacking info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account information including STX balance, nonce, and tokens
   */
  async getAccountInfo(address?: string): Promise<any> {
    try {
      const targetAddress = address || this.address;
      const [balanceResponse, nonceResponse] = await Promise.all([
        fetch(`${this.apiUrl}/extended/v1/address/${targetAddress}/balances`),
        fetch(`${this.apiUrl}/extended/v1/address/${targetAddress}/nonces`)
      ]);

      if (!balanceResponse.ok || !nonceResponse.ok) {
        throw new Error('Failed to fetch account info');
      }

      const [balanceData, nonceData] = await Promise.all([
        balanceResponse.json(),
        nonceResponse.json()
      ]);

      return {
        address: targetAddress,
        balance: balanceData.stx.balance,
        locked: balanceData.stx.locked,
        nonce: nonceData.possible_next_nonce,
        fungibleTokens: balanceData.fungible_tokens || {},
        nonFungibleTokens: balanceData.non_fungible_tokens || {},
        network: this.networkType
      };
    } catch (error) {
      throw new Error(`Error fetching account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/extended/v1/tx/${txId}`);
      
      if (!response.ok) {
        throw new Error(`Transaction not found: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        network: this.networkType,
        explorerUrl: this.getExplorerUrl(txId)
      };
    } catch (error) {
      throw new Error(`Error fetching transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer fungible tokens to another address
   */
  async transferFungibleToken(
    contractAddress: string,
    contractName: string,
    assetName: string,
    recipient: string,
    amount: number,
    memo?: string
  ): Promise<TransactionResult> {
    try {
      const nonce = await this.getNonce();
      
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'transfer',
        functionArgs: [
          uintCV(amount),
          principalCV(this.address),
          principalCV(recipient),
          memo ? someCV(bufferCV(Buffer.from(memo, 'utf8'))) : noneCV()
        ],
        senderKey: this.privateKey,
        network: this.networkType,
        nonce,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction({ transaction });

      if ('error' in broadcastResponse) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }

      console.error(`🪙 Fungible Token Transfer sent: ${broadcastResponse.txid}`);
      console.error(`🔍 Explorer: ${this.getExplorerUrl(broadcastResponse.txid)}`);

      return {
        txId: broadcastResponse.txid,
        success: true,
        data: {
          contract: `${contractAddress}.${contractName}`,
          asset: assetName,
          amount,
          from: this.address,
          to: recipient,
          memo
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Fungible token transfer failed'
      };
    }
  }

  /**
   * Transfer NFT to another address
   */
  async transferNFT(
    contractAddress: string,
    contractName: string,
    assetName: string,
    tokenId: number,
    recipient: string
  ): Promise<TransactionResult> {
    try {
      const nonce = await this.getNonce();
      
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'transfer',
        functionArgs: [
          uintCV(tokenId),
          principalCV(this.address),
          principalCV(recipient)
        ],
        senderKey: this.privateKey,
        network: this.networkType,
        nonce,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction({ transaction });

      if ('error' in broadcastResponse) {
        throw new Error(`Transaction failed: ${broadcastResponse.error}`);
      }

      console.error(`🖼️ NFT Transfer sent: ${broadcastResponse.txid}`);
      console.error(`🔍 Explorer: ${this.getExplorerUrl(broadcastResponse.txid)}`);

      return {
        txId: broadcastResponse.txid,
        success: true,
        data: {
          contract: `${contractAddress}.${contractName}`,
          asset: assetName,
          tokenId,
          from: this.address,
          to: recipient
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'NFT transfer failed'
      };
    }
  }
}