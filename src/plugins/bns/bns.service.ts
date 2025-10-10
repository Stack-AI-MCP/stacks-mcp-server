import { DomainInfo, TransactionResult } from '../../types/index.js';
import {
  canRegisterName,
  getNameInfo,
  getOwner,
  getNamePrice,
  fetchUserOwnedNames,
  buildNameClaimFastTx,
  buildPreorderNameTx,
  buildRegisterNameTx,
  buildRenewNameTx,
  buildTransferNameTx,
  buildSetPrimaryNameTx
} from 'bns-v2-sdk';

type Network = 'mainnet' | 'testnet';

export class BNSService {
  private readonly network: Network;

  constructor(network: Network = 'mainnet') {
    this.network = network;
  }

  async registerDomain(domain: string, years: number, walletAddress: string): Promise<TransactionResult> {
    try {
      const fullyQualifiedName = domain.endsWith('.btc') ? domain : `${domain}.btc`;
      
      // Check if domain is available
      const available = await canRegisterName({
        fullyQualifiedName,
        network: this.network,
      });

      if (!available) {
        throw new Error(`Domain ${fullyQualifiedName} is not available for registration`);
      }

      // Get name price
      const price = await getNamePrice({
        fullyQualifiedName,
        network: this.network,
      });

      // Build registration transaction (using fast claim for demo)
      const txPayload = await buildNameClaimFastTx({
        fullyQualifiedName,
        stxToBurn: BigInt(price),
        sendTo: walletAddress,
        senderAddress: walletAddress,
        network: this.network,
      });

      return {
        txId: '', // This would be filled after broadcasting
        success: true,
        data: {
          domain: fullyQualifiedName,
          years,
          owner: walletAddress,
          price: price.toString(),
          txPayload,
          action: 'register',
          message: `Registration transaction built for ${fullyQualifiedName}. Price: ${price} microSTX`
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  async transferDomain(domain: string, recipient: string, walletAddress: string): Promise<TransactionResult> {
    try {
      const fullyQualifiedName = domain.endsWith('.btc') ? domain : `${domain}.btc`;
      
      // Verify ownership
      const owner = await getOwner({
        fullyQualifiedName,
        network: this.network,
      });

      if (owner !== walletAddress) {
        throw new Error(`Address ${walletAddress} does not own domain ${fullyQualifiedName}`);
      }

      // Build transfer transaction
      const txPayload = await buildTransferNameTx({
        fullyQualifiedName,
        newOwnerAddress: recipient,
        senderAddress: walletAddress,
        network: this.network,
      });

      return {
        txId: '', // This would be filled after broadcasting
        success: true,
        data: {
          domain: fullyQualifiedName,
          from: walletAddress,
          to: recipient,
          txPayload,
          action: 'transfer',
          message: `Transfer transaction built for ${fullyQualifiedName} from ${walletAddress} to ${recipient}`
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed'
      };
    }
  }

  async renewDomain(domain: string, years: number, walletAddress: string): Promise<TransactionResult> {
    try {
      const fullyQualifiedName = domain.endsWith('.btc') ? domain : `${domain}.btc`;
      
      // Verify ownership
      const owner = await getOwner({
        fullyQualifiedName,
        network: this.network,
      });

      if (owner !== walletAddress) {
        throw new Error(`Address ${walletAddress} does not own domain ${fullyQualifiedName}`);
      }

      // Get renewal price
      const price = await getNamePrice({
        fullyQualifiedName,
        network: this.network,
      });

      // Build renewal transaction
      const txPayload = await buildRenewNameTx({
        fullyQualifiedName,
        stxToBurn: BigInt(price),
        senderAddress: walletAddress,
        network: this.network,
      });

      return {
        txId: '', // This would be filled after broadcasting
        success: true,
        data: {
          domain: fullyQualifiedName,
          years,
          owner: walletAddress,
          price: price.toString(),
          txPayload,
          action: 'renew',
          message: `Renewal transaction built for ${fullyQualifiedName}. Price: ${price} microSTX`
        }
      };
    } catch (error) {
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Renewal failed'
      };
    }
  }

  async getDomainInfo(domain: string): Promise<DomainInfo> {
    try {
      const fullyQualifiedName = domain.endsWith('.btc') ? domain : `${domain}.btc`;
      
      // Get comprehensive name information
      const nameInfo = await getNameInfo({
        fullyQualifiedName,
        network: this.network,
      });

      return {
        name: fullyQualifiedName,
        owner: (nameInfo as any).address || '',
        resolver: (nameInfo as any).zonefile_hash || undefined,
        expiresAt: (nameInfo as any).expire_block || 0,
        registered: !!(nameInfo as any).address
      };
    } catch (error) {
      // Domain doesn't exist
      const fullyQualifiedName = domain.endsWith('.btc') ? domain : `${domain}.btc`;
      return {
        name: fullyQualifiedName,
        owner: '',
        expiresAt: 0,
        registered: false
      };
    }
  }

  async resolveDomain(domain: string): Promise<{ address: string | null }> {
    try {
      const fullyQualifiedName = domain.endsWith('.btc') ? domain : `${domain}.btc`;
      
      const owner = await getOwner({
        fullyQualifiedName,
        network: this.network,
      });

      return {
        address: owner || null
      };
    } catch (error) {
      return { address: null };
    }
  }

  async getDomainsByAddress(address: string): Promise<string[]> {
    try {
      const ownedNames = await fetchUserOwnedNames({
        senderAddress: address,
        network: this.network,
      });

      return (ownedNames as any).names || ownedNames.map((n: any) => n.name) || [];
    } catch (error) {
      console.error('Error fetching domains by address:', error);
      return [];
    }
  }
}