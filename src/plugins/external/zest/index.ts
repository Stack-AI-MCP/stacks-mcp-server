import { z } from 'zod';
import { MCPTool, StacksPlugin } from '../../../types/index.js';
import { StacksWalletClient } from '../../../wallet/StacksWalletClient.js';

export class ZestService implements StacksPlugin {
  private wallet: StacksWalletClient;

  constructor(wallet: StacksWalletClient) {
    this.wallet = wallet;
  }
  getTools(): MCPTool[] {
    return [
      {
        name: 'zest-get-pools',
        description: 'Get available lending pools from Zest Protocol',
        inputSchema: z.object({})
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'zest-get-pools':
        return this.getPools();
      default:
        throw new Error(`Unknown Zest tool: ${name}`);
    }
  }

  private async getPools(): Promise<any[]> {
    return [
      {
        id: 'pool-stx',
        asset: 'STX',
        tvl: '5000000',
        apy: '8.5%',
        utilization: '75%',
        borrowRate: '12.3%',
        protocol: 'Zest'
      },
      {
        id: 'pool-sbtc',
        asset: 'sBTC',
        tvl: '2000000',
        apy: '6.2%',
        utilization: '60%',
        borrowRate: '9.8%',
        protocol: 'Zest'
      },
      {
        id: 'pool-usda',
        asset: 'USDA',
        tvl: '8000000',
        apy: '5.1%',
        utilization: '85%',
        borrowRate: '7.5%',
        protocol: 'Zest'
      }
    ];
  }
}