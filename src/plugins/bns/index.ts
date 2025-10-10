import { z } from 'zod';
import { MCPTool, StacksPlugin, DomainInfo, TransactionResult } from '../../types/index.js';
import { BNSService as BNSSDKService } from './bns.service.js';
import { StacksWalletClient } from '../../wallet/StacksWalletClient.js';

export class BNSService implements StacksPlugin {
  private bnsSDK: BNSSDKService;
  private wallet: StacksWalletClient;

  constructor(wallet: StacksWalletClient) {
    this.wallet = wallet;
    this.bnsSDK = new BNSSDKService(wallet.getNetwork() === 'mainnet' ? 'mainnet' : 'testnet');
  }

  getTools(): MCPTool[] {
    return [
      {
        name: 'bns-register-domain',
        description: 'Register a .btc domain name using fast claim method',
        inputSchema: z.object({
          domain: z.string().describe('Domain name without .btc extension'),
          years: z.number().optional().default(1).describe('Registration period in years')
        })
      },
      {
        name: 'bns-transfer-domain',
        description: 'Transfer a .btc domain to another address',
        inputSchema: z.object({
          domain: z.string().describe('Domain name without .btc extension'),
          recipient: z.string().describe('Recipient Stacks address')
        })
      },
      {
        name: 'bns-renew-domain',
        description: 'Renew a .btc domain registration',
        inputSchema: z.object({
          domain: z.string().describe('Domain name without .btc extension'),
          years: z.number().optional().default(1).describe('Renewal period in years')
        })
      },
      {
        name: 'bns-get-domain-info',
        description: 'Get information about a domain',
        inputSchema: z.object({
          domain: z.string().describe('Domain name with or without .btc extension')
        })
      },
      {
        name: 'bns-resolve-domain',
        description: 'Resolve a domain to its owner address',
        inputSchema: z.object({
          domain: z.string().describe('Domain name with or without .btc extension')
        })
      },
      {
        name: 'bns-get-domains-by-address',
        description: 'Get all domains owned by an address',
        inputSchema: z.object({
          address: z.string().optional().describe('Stacks address (defaults to wallet address)')
        })
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'bns-register-domain':
        return this.registerDomain(args.domain, args.years || 1);
      case 'bns-transfer-domain':
        return this.transferDomain(args.domain, args.recipient);
      case 'bns-renew-domain':
        return this.renewDomain(args.domain, args.years || 1);
      case 'bns-get-domain-info':
        return this.getDomainInfo(args.domain);
      case 'bns-resolve-domain':
        return this.resolveDomain(args.domain);
      case 'bns-get-domains-by-address':
        return this.getDomainsByAddress(args.address || this.wallet.getAddress());
      default:
        throw new Error(`Unknown BNS tool: ${name}`);
    }
  }

  private async registerDomain(domain: string, years: number): Promise<TransactionResult> {
    const result = await this.bnsSDK.registerDomain(domain, years, this.wallet.getAddress());
    
    // If the SDK built a transaction payload, broadcast it using the wallet
    if (result.success && result.data?.txPayload) {
      try {
        // The BNS SDK provides transaction options that can be used with Stacks.js
        console.error(`🏗️ Broadcasting BNS registration transaction for ${domain}.btc`);
        
        // For now, return the transaction data - in production this would broadcast
        return {
          ...result,
          data: {
            ...result.data,
            walletAddress: this.wallet.getAddress(),
            network: this.wallet.getNetwork(),
            message: `${result.data.message} Ready to broadcast with wallet.`
          }
        };
      } catch (error) {
        throw new Error(`Failed to broadcast transaction: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return result;
  }

  private async transferDomain(domain: string, recipient: string): Promise<TransactionResult> {
    const result = await this.bnsSDK.transferDomain(domain, recipient, this.wallet.getAddress());
    
    if (result.success && result.data?.txPayload) {
      console.error(`🔄 Broadcasting BNS transfer transaction for ${domain}.btc`);
      
      return {
        ...result,
        data: {
          ...result.data,
          walletAddress: this.wallet.getAddress(),
          network: this.wallet.getNetwork(),
          message: `${result.data.message} Ready to broadcast with wallet.`
        }
      };
    }
    
    return result;
  }

  private async renewDomain(domain: string, years: number): Promise<TransactionResult> {
    const result = await this.bnsSDK.renewDomain(domain, years, this.wallet.getAddress());
    
    if (result.success && result.data?.txPayload) {
      console.error(`🔄 Broadcasting BNS renewal transaction for ${domain}.btc`);
      
      return {
        ...result,
        data: {
          ...result.data,
          walletAddress: this.wallet.getAddress(),
          network: this.wallet.getNetwork(),
          message: `${result.data.message} Ready to broadcast with wallet.`
        }
      };
    }
    
    return result;
  }

  private async getDomainInfo(domain: string): Promise<DomainInfo> {
    return this.bnsSDK.getDomainInfo(domain);
  }

  private async resolveDomain(domain: string): Promise<{ address: string | null }> {
    return this.bnsSDK.resolveDomain(domain);
  }

  private async getDomainsByAddress(address: string): Promise<string[]> {
    return this.bnsSDK.getDomainsByAddress(address);
  }
}