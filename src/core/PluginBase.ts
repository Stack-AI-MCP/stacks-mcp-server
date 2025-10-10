import type { ToolBase } from './ToolBase.js';
import type { WalletClientBase } from './types.js';

/**
 * Abstract base class for plugins that provide tools
 * Based on VeChain MCP PluginBase pattern
 */
export abstract class PluginBase<TWalletClient extends WalletClientBase = WalletClientBase> {
  /**
   * Returns the tools provided by this plugin
   */
  abstract getTools(walletClient: TWalletClient): ToolBase[] | Promise<ToolBase[]>;
  
  /**
   * Indicates if the plugin supports the given wallet client
   */
  supportsWalletClient(walletClient: TWalletClient): boolean {
    return true;
  }
}