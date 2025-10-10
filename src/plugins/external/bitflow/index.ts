import { z } from 'zod';
import { MCPTool, StacksPlugin } from '../../../types/index.js';
import { StacksWalletClient } from '../../../wallet/StacksWalletClient.js';

export class BitFlowService implements StacksPlugin {
  private wallet: StacksWalletClient;

  constructor(wallet: StacksWalletClient) {
    this.wallet = wallet;
  }
  getTools(): MCPTool[] {
    return [
      {
        name: 'bitflow-get-pools',
        description: 'Get available liquidity pools from BitFlow',
        inputSchema: z.object({})
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'bitflow-get-pools':
        return this.getPools();
      default:
        throw new Error(`Unknown BitFlow tool: ${name}`);
    }
  }

  private async getPools(): Promise<any[]> {
    return [
      { pair: 'STX/USDA', tvl: '2000000', fee: '0.3%', apr: '8.5%' },
      { pair: 'sBTC/USDA', tvl: '5000000', fee: '0.3%', apr: '6.2%' },
      { pair: 'STX/sBTC', tvl: '3000000', fee: '0.3%', apr: '12.1%' }
    ];
  }
}