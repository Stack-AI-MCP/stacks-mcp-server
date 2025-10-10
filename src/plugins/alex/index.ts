import { z } from 'zod';
import { MCPTool, StacksPlugin, SwapQuote } from '../../types/index.js';
import { AlexService as ALEXSDKService } from './alex.service.js';
import { StacksWalletClient } from '../../wallet/StacksWalletClient.js';

export class ALEXService implements StacksPlugin {
  private alexSDK: ALEXSDKService;
  private wallet: StacksWalletClient;

  constructor(wallet: StacksWalletClient) {
    this.wallet = wallet;
    const network = wallet.getNetwork() as 'mainnet' | 'testnet';
    this.alexSDK = new ALEXSDKService(network);
  }

  getTools(): MCPTool[] {
    return [
      {
        name: 'alex-get-token-price',
        description: 'Get token price from ALEX',
        inputSchema: z.object({
          tokenAddress: z.string().describe('Token contract address')
        })
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'alex-get-token-price':
        return this.getTokenPrice(args.tokenAddress);
      default:
        throw new Error(`Unknown ALEX tool: ${name}`);
    }
  }

  private async getTokenPrice(tokenAddress: string): Promise<any> {
    return this.alexSDK.getTokenPrice(tokenAddress);
  }
}