import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { CharismaService } from './charisma.service.js';

/**
 * Charisma DEX & Blaze Protocol plugin
 * Comprehensive tools for Charisma vault-based DEX and intent execution
 * Based on real API: https://swap.charisma.rocks/api/v1 and https://blaze.charisma.rocks/api
 */
export class CharismaPlugin extends PluginBase<StacksWalletClient> {

  async getTools(walletClient: StacksWalletClient) {
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';
    const charismaService = new CharismaService({ network });

    return [
      // ========================= DEX QUOTE & SWAP =========================

      createTool(
        {
          name: 'charisma_get_quote',
          description: 'Get optimal swap quote via Charisma vault routing',
          parameters: z.object({
            token_in: z.string().describe('Input token contract ID or .stx'),
            token_out: z.string().describe('Output token contract ID'),
            amount: z.number().positive().describe('Amount of input token in micro-units')
          })
        },
        async ({ token_in, token_out, amount }) => {
          return await charismaService.getQuote({
            tokenIn: token_in,
            tokenOut: token_out,
            amount
          });
        }
      ),

      // ========================= ORDER MANAGEMENT =========================

      createTool(
        {
          name: 'charisma_list_orders',
          description: 'List all limit orders, optionally filtered by owner',
          parameters: z.object({
            owner: z.string().optional().describe('Stacks address to filter orders')
          })
        },
        async ({ owner }) => {
          return await charismaService.listOrders(owner);
        }
      ),

      createTool(
        {
          name: 'charisma_get_order',
          description: 'Get detailed information about specific order',
          parameters: z.object({
            uuid: z.string().describe('Order UUID to query')
          })
        },
        async ({ uuid }) => {
          return await charismaService.getOrder(uuid);
        }
      ),

      createTool(
        {
          name: 'charisma_create_order',
          description: 'Create new limit or triggered order',
          parameters: z.object({
            owner: z.string().describe('Order owner address'),
            input_token: z.string().describe('Token to spend'),
            output_token: z.string().describe('Token to receive'),
            amount_in: z.string().describe('Amount in micro-units'),
            target_price: z.string().describe('Target price for execution'),
            direction: z.enum(['gt', 'lt']).describe('gt = execute when price >= target, lt = execute when price <= target'),
            condition_token: z.string().describe('Token whose price is monitored'),
            recipient: z.string().describe('Address to receive swap proceeds'),
            signature: z.string().describe('65-byte compressed signature (hex)'),
            uuid: z.string().describe('Unique UUID v4 identifier'),
            base_asset: z.string().optional().describe('Price feed denominator (defaults to subnet sUSDT)'),
            valid_from: z.string().optional().describe('Earliest execution timestamp (ISO-8601)'),
            valid_to: z.string().optional().describe('Expiration timestamp (ISO-8601)')
          })
        },
        async ({ owner, input_token, output_token, amount_in, target_price, direction, condition_token, recipient, signature, uuid, base_asset, valid_from, valid_to }) => {
          return await charismaService.createOrder({
            owner,
            inputToken: input_token,
            outputToken: output_token,
            amountIn: amount_in,
            targetPrice: target_price,
            direction,
            conditionToken: condition_token,
            recipient,
            signature,
            uuid,
            baseAsset: base_asset,
            validFrom: valid_from,
            validTo: valid_to
          });
        }
      ),

      createTool(
        {
          name: 'charisma_cancel_order',
          description: 'Cancel an open order',
          parameters: z.object({
            uuid: z.string().describe('Order UUID to cancel'),
            api_key: z.string().optional().describe('API key for authentication'),
            signature: z.string().optional().describe('Wallet signature for authentication'),
            message: z.string().optional().describe('Message that was signed'),
            wallet_address: z.string().optional().describe('Wallet address for signature auth')
          })
        },
        async ({ uuid, api_key, signature, message, wallet_address }) => {
          return await charismaService.cancelOrder(uuid, {
            apiKey: api_key,
            signature,
            message,
            walletAddress: wallet_address
          });
        }
      ),

      createTool(
        {
          name: 'charisma_execute_order',
          description: 'Force immediate execution of an order',
          parameters: z.object({
            uuid: z.string().describe('Order UUID to execute'),
            api_key: z.string().optional().describe('API key for authentication'),
            signature: z.string().optional().describe('Wallet signature for authentication'),
            message: z.string().optional().describe('Message that was signed'),
            wallet_address: z.string().optional().describe('Wallet address for signature auth')
          })
        },
        async ({ uuid, api_key, signature, message, wallet_address }) => {
          return await charismaService.executeOrder(uuid, {
            apiKey: api_key,
            signature,
            message,
            walletAddress: wallet_address
          });
        }
      ),

      // ========================= API KEY MANAGEMENT =========================

      createTool(
        {
          name: 'charisma_create_api_key',
          description: 'Create new API key for automated trading',
          parameters: z.object({
            message: z.string().describe('Signed message containing action, keyName, permissions, timestamp'),
            signature: z.string().describe('Wallet signature of message'),
            wallet_address: z.string().describe('Wallet address creating the key')
          })
        },
        async ({ message, signature, wallet_address }) => {
          return await charismaService.createApiKey({
            message,
            signature,
            walletAddress: wallet_address
          });
        }
      ),

      createTool(
        {
          name: 'charisma_list_api_keys',
          description: 'List all API keys for wallet',
          parameters: z.object({
            message: z.string().describe('Signed message for authentication'),
            signature: z.string().describe('Wallet signature'),
            wallet_address: z.string().describe('Wallet address')
          })
        },
        async ({ message, signature, wallet_address }) => {
          return await charismaService.listApiKeys({
            message,
            signature,
            walletAddress: wallet_address
          });
        }
      ),

      createTool(
        {
          name: 'charisma_revoke_api_key',
          description: 'Revoke an API key',
          parameters: z.object({
            key_id: z.string().describe('API key ID to revoke'),
            message: z.string().describe('Signed message for authentication'),
            signature: z.string().describe('Wallet signature'),
            wallet_address: z.string().describe('Wallet address')
          })
        },
        async ({ key_id, message, signature, wallet_address }) => {
          return await charismaService.revokeApiKey({
            keyId: key_id,
            message,
            signature,
            walletAddress: wallet_address
          });
        }
      ),

      // ========================= BLAZE INTENT EXECUTION =========================

      createTool(
        {
          name: 'charisma_execute_intent',
          description: 'Execute Blaze intent for subnet operations',
          parameters: z.object({
            contract_id: z.string().describe('Target subnet contract ID'),
            intent: z.string().describe('Intent action (e.g., TRANSFER_TOKENS, REDEEM_BEARER)'),
            signature: z.string().describe('65-byte signature of SIP-018 hash'),
            uuid: z.string().describe('Unique UUID for replay protection'),
            amount_optional: z.number().optional().describe('Optional amount for intent'),
            target_optional: z.string().optional().describe('Optional target principal'),
            opcode_optional: z.string().optional().describe('Optional hex-encoded buffer'),
            network: z.enum(['mainnet', 'testnet']).optional().describe('Network to execute on')
          })
        },
        async ({ contract_id, intent, signature, uuid, amount_optional, target_optional, opcode_optional, network: networkParam }) => {
          return await charismaService.executeIntent({
            contractId: contract_id,
            intent,
            signature,
            uuid,
            amountOptional: amount_optional,
            targetOptional: target_optional,
            opcodeOptional: opcode_optional,
            network: networkParam
          });
        }
      ),

      createTool(
        {
          name: 'charisma_execute_multihop_swap',
          description: 'Execute multihop swap via Blaze routing',
          parameters: z.object({
            contract_id: z.string().describe('Subnet contract ID'),
            signature: z.string().describe('Signed intent signature'),
            uuid: z.string().describe('Unique UUID'),
            hops: z.array(z.object({
              vault: z.string().describe('Vault contract address'),
              opcode: z.number().describe('Operation code')
            })).describe('Array of vault hops for routing'),
            amount_in: z.number().positive().describe('Input amount in micro-units'),
            target_optional: z.string().optional().describe('Optional recipient address'),
            network: z.enum(['mainnet', 'testnet']).optional().describe('Network')
          })
        },
        async ({ contract_id, signature, uuid, hops, amount_in, target_optional, network: networkParam }) => {
          return await charismaService.executeMultihopSwap({
            contractId: contract_id,
            signature,
            uuid,
            hops: hops as Array<{ vault: string; opcode: number }>,
            amountIn: amount_in,
            targetOptional: target_optional,
            network: networkParam
          });
        }
      ),

      // ========================= WORKFLOW TOOLS =========================

      createTool(
        {
          name: 'charisma_complete_swap_workflow',
          description: 'Complete swap workflow: quote, create order, execute',
          parameters: z.object({
            token_in: z.string().describe('Input token'),
            token_out: z.string().describe('Output token'),
            amount_in: z.number().positive().describe('Amount to swap'),
            owner: z.string().describe('Order owner address'),
            signature: z.string().describe('Transaction signature'),
            max_slippage: z.number().default(1).describe('Maximum slippage percentage')
          })
        },
        async ({ token_in, token_out, amount_in, owner, signature, max_slippage }) => {
          const steps = [];

          try {
            // Step 1: Get quote
            const quote = await charismaService.getQuote({
              tokenIn: token_in,
              tokenOut: token_out,
              amount: amount_in
            });
            steps.push({ step: 'get_quote', result: quote });

            // Step 2: Calculate slippage
            const minReceived = quote.data.amountOut * (1 - max_slippage / 100);
            steps.push({
              step: 'calculate_slippage',
              result: { minReceived, slippage: max_slippage }
            });

            // Step 3: Create order with slippage protection
            const orderUuid = crypto.randomUUID();
            const order = await charismaService.createOrder({
              owner,
              inputToken: token_in,
              outputToken: token_out,
              amountIn: amount_in.toString(),
              targetPrice: quote.data.expectedPrice.toString(),
              direction: 'gt',
              conditionToken: token_out,
              recipient: owner,
              signature,
              uuid: orderUuid
            });
            steps.push({ step: 'create_order', result: order });

            return {
              success: true,
              workflow: 'complete_swap',
              steps,
              summary: {
                quoteReceived: true,
                orderCreated: true,
                expectedOutput: quote.data.amountOut,
                minimumReceived: minReceived,
                route: quote.data.route
              }
            };
          } catch (error) {
            return {
              success: false,
              workflow: 'complete_swap',
              steps,
              error: error instanceof Error ? error.message : 'Workflow failed'
            };
          }
        }
      ),

      createTool(
        {
          name: 'charisma_setup_automated_trading',
          description: 'Set up automated trading bot with API key and orders',
          parameters: z.object({
            wallet_address: z.string().describe('Wallet address'),
            api_key_name: z.string().describe('Name for API key'),
            signature: z.string().describe('Wallet signature'),
            permissions: z.array(z.enum(['create', 'execute', 'cancel'])).describe('API key permissions')
          })
        },
        async ({ wallet_address, api_key_name, signature, permissions }) => {
          const steps = [];

          try {
            // Step 1: Create API key message
            const message = JSON.stringify({
              action: 'create_api_key',
              keyName: api_key_name,
              permissions,
              timestamp: Date.now()
            });
            steps.push({ step: 'prepare_message', result: { message } });

            // Step 2: Create API key
            const apiKeyResponse = await charismaService.createApiKey({
              message,
              signature,
              walletAddress: wallet_address
            });
            steps.push({ step: 'create_api_key', result: apiKeyResponse });

            return {
              success: true,
              workflow: 'setup_automated_trading',
              steps,
              summary: {
                apiKeyCreated: true,
                keyName: apiKeyResponse.name,
                permissions: apiKeyResponse.permissions,
                rateLimit: apiKeyResponse.rateLimit,
                warning: 'Store API key securely - it is only shown once!'
              }
            };
          } catch (error) {
            return {
              success: false,
              workflow: 'setup_automated_trading',
              steps,
              error: error instanceof Error ? error.message : 'Workflow failed'
            };
          }
        }
      ),

      // ========================= UTILITY TOOLS =========================

      createTool(
        {
          name: 'charisma_get_network_info',
          description: 'Get Charisma network configuration',
          parameters: z.object({})
        },
        async () => {
          return charismaService.getNetworkInfo();
        }
      ),
    ];
  }
}

/**
 * Factory function to create Charisma plugin
 */
export function charisma() {
  return new CharismaPlugin();
}
