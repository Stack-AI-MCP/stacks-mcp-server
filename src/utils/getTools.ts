import type { ToolBase } from '../core/ToolBase.js';
import type { PluginBase } from '../core/PluginBase.js';
import type { WalletClientBase } from '../core/types.js';

export interface GetToolsParams<TWalletClient extends WalletClientBase> {
  wallet: TWalletClient;
  plugins: PluginBase<TWalletClient>[];
}

/**
 * Discovers and collects tools from all plugins
 * Based on VeChain MCP getTools pattern
 */
export async function getTools<TWalletClient extends WalletClientBase>({
  wallet,
  plugins,
}: GetToolsParams<TWalletClient>): Promise<ToolBase[]> {
  const tools: ToolBase[] = [];

  for (const plugin of plugins) {
    if (plugin.supportsWalletClient(wallet)) {
      const pluginTools = await plugin.getTools(wallet);
      tools.push(...pluginTools);
    }
  }

  return tools;
}