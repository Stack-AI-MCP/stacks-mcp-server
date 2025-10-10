import { z } from 'zod';
import { MCPTool, StacksPlugin, SwapQuote } from '../../types/index.js';
import { ALEXService as ALEXSDKService } from './alex.service.js';
import { StacksWalletClient } from '../../wallet/StacksWalletClient.js';

export class ALEXService implements StacksPlugin {
  private alexSDK: ALEXSDKService;
  private wallet: StacksWalletClient;

  constructor(wallet: StacksWalletClient) {
    this.wallet = wallet;
    this.alexSDK = new ALEXSDKService();
  }

  getTools(): MCPTool[] {
    return [
      {
        name: 'alex-get-swap-quote',
        description: 'Get swap quote from ALEX AMM',
        inputSchema: z.object({
          tokenIn: z.string().describe('Input token symbol'),
          tokenOut: z.string().describe('Output token symbol'),
          amountIn: z.string().describe('Amount to swap')
        })
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'alex-get-swap-quote':
        return this.getSwapQuote(args.tokenIn, args.tokenOut, args.amountIn);
      default:
        throw new Error(`Unknown ALEX tool: ${name}`);
    }
  }

  private async getSwapQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<SwapQuote> {
    return this.alexSDK.getSwapQuote(tokenIn, tokenOut, amountIn);
  }
}