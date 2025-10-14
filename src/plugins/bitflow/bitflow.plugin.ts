import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { BitflowService } from './bitflow.service.js';
import { KeeperType } from '@bitflowlabs/core-sdk';

/**
 * Bitflow Protocol DEX plugin
 * Comprehensive tools for Bitflow DeFi operations using official Bitflow SDK
 * Based on @bitflowlabs/core-sdk v2.4.0
 */
export class BitflowPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    // Pass environment variables explicitly to BitflowService SDK
    const sdkConfig = {
      BITFLOW_API_HOST: process.env.BITFLOW_API_HOST,
      BITFLOW_API_KEY: process.env.BITFLOW_API_KEY,
      BITFLOW_PROVIDER_ADDRESS: process.env.BITFLOW_PROVIDER_ADDRESS,
      READONLY_CALL_API_HOST: process.env.READONLY_CALL_API_HOST,
      READONLY_CALL_API_KEY: process.env.READONLY_CALL_API_KEY,
      KEEPER_API_KEY: process.env.KEEPER_API_KEY,
      KEEPER_API_HOST: process.env.KEEPER_API_HOST,
    };

    const bitflowService = new BitflowService(network, sdkConfig);

    return [
      // ========================= CORE SDK TOKEN OPERATIONS =========================
      
      createTool(
        {
          name: 'bitflow_get_available_tokens',
          description: 'Get all available tokens on Bitflow using official SDK',
          parameters: z.object({}),
        },
        async () => {
          return await bitflowService.getAvailableTokens();
        }
      ),

      createTool(
        {
          name: 'bitflow_get_possible_swaps',
          description: 'Get all possible swap options for a given token using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-stx)'),
          }),
        },
        async ({ token_x_id }) => {
          return await bitflowService.getPossibleSwaps(token_x_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_all_possible_token_y',
          description: 'Get all possible destination tokens for swapping using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-stx)'),
          }),
        },
        async ({ token_x_id }) => {
          return await bitflowService.getAllPossibleTokenY(token_x_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_all_possible_token_y_routes',
          description: 'Get all possible routes between two tokens using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-stx)'),
            token_y_id: z.string().describe('Destination token ID (e.g., token-usda)'),
          }),
        },
        async ({ token_x_id, token_y_id }) => {
          return await bitflowService.getAllPossibleTokenYRoutes(token_x_id, token_y_id);
        }
      ),

      // ========================= SWAP OPERATIONS =========================

      createTool(
        {
          name: 'bitflow_get_quote_for_route',
          description: 'Get price quote for token swap using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-stx)'),
            token_y_id: z.string().describe('Destination token ID (e.g., token-usda)'),
            amount: z.number().describe('Amount of source token to swap'),
          }),
        },
        async ({ token_x_id, token_y_id, amount }) => {
          return await bitflowService.getQuoteForRoute(token_x_id, token_y_id, amount);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_swap_params',
          description: 'Get swap parameters for transaction execution using official SDK',
          parameters: z.object({
            swap_execution_data: z.object({
              route: z.any().describe('Selected swap route from getAllPossibleTokenYRoutes'),
              amount: z.number().describe('Amount to swap'),
              tokenXDecimals: z.number().describe('Token X decimals'),
              tokenYDecimals: z.number().describe('Token Y decimals'),
            }).describe('Swap execution data object'),
            slippage_tolerance: z.number().optional().default(0.01).describe('Slippage tolerance (default: 0.01 = 1%)'),
          }),
        },
        async ({ swap_execution_data, slippage_tolerance }) => {
          const userAddress = walletClient.getAddress();
          // Ensure all required fields are present
          const validSwapData = {
            route: swap_execution_data.route,
            amount: swap_execution_data.amount,
            tokenXDecimals: swap_execution_data.tokenXDecimals,
            tokenYDecimals: swap_execution_data.tokenYDecimals
          };
          return await bitflowService.getSwapParams(validSwapData, userAddress, slippage_tolerance);
        }
      ),

      createTool(
        {
          name: 'bitflow_prepare_swap_execution',
          description: 'Prepare swap execution with all parameters (requires StacksProvider for actual execution)',
          parameters: z.object({
            swap_execution_data: z.object({
              route: z.any().describe('Selected swap route from getAllPossibleTokenYRoutes'),
              amount: z.number().describe('Amount to swap'),
              tokenXDecimals: z.number().describe('Token X decimals'),
              tokenYDecimals: z.number().describe('Token Y decimals'),
            }).describe('Swap execution data object'),
            slippage_tolerance: z.number().optional().default(0.01).describe('Slippage tolerance (default: 0.01 = 1%)'),
          }),
        },
        async ({ swap_execution_data, slippage_tolerance }) => {
          const userAddress = walletClient.getAddress();
          // Ensure all required fields are present
          const validSwapData = {
            route: swap_execution_data.route,
            amount: swap_execution_data.amount,
            tokenXDecimals: swap_execution_data.tokenXDecimals,
            tokenYDecimals: swap_execution_data.tokenYDecimals
          };
          return await bitflowService.prepareSwapExecution(validSwapData, userAddress, slippage_tolerance);
        }
      ),

      // ========================= KEEPER OPERATIONS =========================

      createTool(
        {
          name: 'bitflow_get_or_create_keeper_contract',
          description: 'Get or create keeper contract for automated trading using official SDK',
          parameters: z.object({
            keeper_type: z.nativeEnum(KeeperType).optional().default(KeeperType.MULTI_ACTION_V1).describe('Keeper type'),
            bitcoin_address: z.string().optional().describe('Bitcoin address for cross-chain operations'),
            deploy_contract: z.boolean().optional().default(true).describe('Whether to deploy contract'),
            all_actions_approved: z.boolean().optional().default(true).describe('Approve all actions'),
          }),
        },
        async ({ keeper_type, bitcoin_address, deploy_contract, all_actions_approved }) => {
          const userAddress = walletClient.getAddress();
          return await bitflowService.getOrCreateKeeperContract({
            stacksAddress: userAddress,
            keeperType: keeper_type,
            bitcoinAddress: bitcoin_address,
            deployContract: deploy_contract,
            allActionsApproved: all_actions_approved
          });
        }
      ),

      createTool(
        {
          name: 'bitflow_create_keeper_order',
          description: 'Create keeper order for automated execution using official SDK',
          parameters: z.object({
            contract_identifier: z.string().describe('Keeper contract identifier'),
            keeper_type: z.nativeEnum(KeeperType).describe('Keeper type (e.g., MULTI_ACTION_V1)'),
            action_type: z.string().describe('Action type (e.g., SWAP_XYK_SWAP_HELPER)'),
            funding_tokens: z.record(z.string()).optional().describe('Funding tokens and amounts'),
            token_x_id: z.string().optional().describe('Source token ID'),
            token_y_id: z.string().optional().describe('Destination token ID'),
            action_amount: z.string().optional().describe('Amount for the action'),
            min_received_amount: z.string().optional().describe('Minimum amount to receive'),
            auto_adjust: z.boolean().optional().default(false).describe('Auto-adjust minimum received'),
            fee_recipient: z.string().optional().describe('Fee recipient address'),
            bitcoin_tx_id: z.string().optional().describe('Bitcoin transaction ID for bridging'),
            stacks_tx_id: z.string().optional().describe('Stacks transaction ID'),
            bitcoin_address: z.string().optional().describe('Bitcoin address for cross-chain operations'),
            action_function_args: z.object({
              token_list: z.record(z.string()).optional(),
              xyk_pool_list: z.record(z.string()).optional(),
              stableswap_pool_list: z.record(z.string()).optional(),
              bool_list: z.record(z.string()).optional(),
            }).optional().describe('Action function arguments for complex operations'),
            action_post_conditions: z.array(z.any()).optional().describe('Action post conditions'),
            cancel_order_after: z.string().optional().describe('Cancel order after this timestamp (ISO string)'),
          }),
        },
        async ({ 
          contract_identifier, keeper_type, action_type, funding_tokens, token_x_id, token_y_id, 
          action_amount, min_received_amount, auto_adjust, fee_recipient, bitcoin_tx_id,
          stacks_tx_id, bitcoin_address, action_function_args, action_post_conditions, cancel_order_after
        }) => {
          const userAddress = walletClient.getAddress();
          return await bitflowService.createKeeperOrder({
            contractIdentifier: contract_identifier,
            stacksAddress: userAddress,
            keeperType: keeper_type,
            actionType: action_type,
            fundingTokens: funding_tokens,
            actionAggregatorTokens: token_x_id && token_y_id ? {
              tokenXId: token_x_id,
              tokenYId: token_y_id
            } : undefined,
            actionAmount: action_amount,
            minReceived: min_received_amount ? {
              amount: min_received_amount,
              autoAdjust: auto_adjust || false
            } : undefined,
            feeRecipient: fee_recipient,
            bitcoinTxId: bitcoin_tx_id,
            stacksTxId: stacks_tx_id,
            bitcoinAddress: bitcoin_address,
            actionFunctionArgs: action_function_args ? {
              tokenList: action_function_args.token_list,
              xykPoolList: action_function_args.xyk_pool_list,
              stableswapPoolList: action_function_args.stableswap_pool_list,
              boolList: action_function_args.bool_list
            } : undefined,
            actionPostConditions: action_post_conditions,
            cancelOrderAfter: cancel_order_after ? new Date(cancel_order_after) : undefined
          });
        }
      ),

      createTool(
        {
          name: 'bitflow_get_keeper_order',
          description: 'Get keeper order details by ID using official SDK',
          parameters: z.object({
            order_id: z.string().describe('Keeper order ID'),
          }),
        },
        async ({ order_id }) => {
          return await bitflowService.getKeeperOrder(order_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_keeper_user',
          description: 'Get user information with keeper contracts and orders using official SDK',
          parameters: z.object({
            stacks_address: z.string().optional().describe('Stacks address (defaults to wallet address)'),
          }),
        },
        async ({ stacks_address }) => {
          const userAddress = stacks_address || walletClient.getAddress();
          return await bitflowService.getKeeperUser(userAddress);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_keeper_quote',
          description: 'Get quote for keeper action using official SDK',
          parameters: z.object({
            action_amount: z.string().describe('Amount for the action'),
            keeper_type: z.nativeEnum(KeeperType).describe('Keeper type (e.g., MULTI_ACTION_V1)'),
            action_type: z.string().describe('Action type (e.g., SWAP_XYK_SWAP_HELPER)'),
            token_x_id: z.string().optional().describe('Source token ID'),
            token_y_id: z.string().optional().describe('Destination token ID'),
            min_received_amount: z.string().optional().describe('Minimum amount to receive'),
            auto_adjust: z.boolean().optional().default(true).describe('Auto-adjust minimum received'),
            fee_recipient: z.string().optional().describe('Fee recipient address'),
            bitcoin_address: z.string().optional().describe('Bitcoin address for cross-chain operations'),
          }),
        },
        async ({ 
          action_amount, keeper_type, action_type, token_x_id, token_y_id, 
          min_received_amount, auto_adjust, fee_recipient, bitcoin_address 
        }) => {
          const userAddress = walletClient.getAddress();
          return await bitflowService.getKeeperQuote({
            stacksAddress: userAddress,
            actionAmount: action_amount,
            keeperType: keeper_type,
            actionType: action_type,
            tokenXId: token_x_id,
            tokenYId: token_y_id,
            minReceived: min_received_amount ? {
              amount: min_received_amount,
              autoAdjust: auto_adjust || false
            } : undefined,
            feeRecipient: fee_recipient,
            bitcoinAddress: bitcoin_address
          });
        }
      ),

      createTool(
        {
          name: 'bitflow_create_group_order',
          description: 'Create group order for scheduled execution using official SDK',
          parameters: z.object({
            amount_per_order: z.number().describe('Amount per individual order'),
            number_of_orders: z.number().describe('Total number of orders'),
            execution_frequency: z.number().describe('Execution frequency in seconds'),
            keeper_type: z.nativeEnum(KeeperType).describe('Keeper type (e.g., MULTI_ACTION_V1)'),
            action_type: z.string().describe('Action type (e.g., SWAP_XYK_SWAP_HELPER)'),
            funding_tokens: z.record(z.string()).describe('Funding tokens and amounts'),
            token_x_id: z.string().optional().describe('Source token ID'),
            token_y_id: z.string().optional().describe('Destination token ID'),
            fee_recipient: z.string().optional().describe('Fee recipient address'),
            bitcoin_tx_id: z.string().optional().describe('Bitcoin transaction ID for bridging'),
            stacks_tx_id: z.string().optional().describe('Stacks transaction ID'),
            min_received_amount: z.string().optional().describe('Minimum amount to receive'),
            auto_adjust_min_received: z.boolean().optional().default(true).describe('Auto-adjust minimum received'),
            bitcoin_address: z.string().optional().describe('Bitcoin address for cross-chain operations'),
            next_execution_after: z.string().optional().describe('Next execution after timestamp (ISO string)'),
            price_range_amount: z.string().optional().describe('Price range amount'),
            price_range_min_price: z.string().optional().describe('Price range minimum price'),
            price_range_max_price: z.string().optional().describe('Price range maximum price'),
          }),
        },
        async ({ 
          amount_per_order, number_of_orders, execution_frequency, keeper_type, action_type,
          funding_tokens, token_x_id, token_y_id, fee_recipient, bitcoin_tx_id, stacks_tx_id,
          min_received_amount, auto_adjust_min_received, bitcoin_address, next_execution_after,
          price_range_amount, price_range_min_price, price_range_max_price
        }) => {
          const userAddress = walletClient.getAddress();
          return await bitflowService.createGroupOrder({
            stacksAddress: userAddress,
            amountPerOrder: amount_per_order,
            numberOfOrders: number_of_orders,
            executionFrequency: execution_frequency,
            keeperType: keeper_type,
            actionType: action_type,
            fundingTokens: funding_tokens,
            actionAggregatorTokens: token_x_id && token_y_id ? {
              tokenXId: token_x_id,
              tokenYId: token_y_id
            } : undefined,
            feeRecipient: fee_recipient,
            bitcoinTxId: bitcoin_tx_id,
            stacksTxId: stacks_tx_id,
            minReceived: min_received_amount ? {
              amount: min_received_amount,
              autoAdjust: auto_adjust_min_received || true
            } : undefined,
            bitcoinAddress: bitcoin_address,
            nextExecutionAfter: next_execution_after ? new Date(next_execution_after) : undefined,
            priceRange: (price_range_amount && price_range_min_price && price_range_max_price) ? {
              amount: price_range_amount,
              minPrice: price_range_min_price,
              maxPrice: price_range_max_price
            } : undefined
          });
        }
      ),

      createTool(
        {
          name: 'bitflow_get_group_order',
          description: 'Get group order details by ID using official SDK',
          parameters: z.object({
            group_order_id: z.string().describe('Group order ID'),
            include_orders: z.boolean().optional().describe('Include detailed order information (default: false)'),
          }),
        },
        async ({ group_order_id, include_orders }) => {
          return await bitflowService.getGroupOrder(group_order_id, include_orders);
        }
      ),

      createTool(
        {
          name: 'bitflow_cancel_keeper_order',
          description: 'Cancel keeper order using official SDK',
          parameters: z.object({
            order_id: z.string().describe('Keeper order ID to cancel'),
          }),
        },
        async ({ order_id }) => {
          return await bitflowService.cancelKeeperOrder(order_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_cancel_group_order',
          description: 'Cancel group order using official SDK',
          parameters: z.object({
            group_order_id: z.string().describe('Group order ID to cancel'),
          }),
        },
        async ({ group_order_id }) => {
          return await bitflowService.cancelGroupOrder(group_order_id);
        }
      ),

      // ========================= KEEPER TOKEN OPERATIONS =========================

      createTool(
        {
          name: 'bitflow_get_keeper_tokens',
          description: 'Get available tokens for keeper operations using official SDK',
          parameters: z.object({}),
        },
        async () => {
          return await bitflowService.getKeeperTokens();
        }
      ),

      createTool(
        {
          name: 'bitflow_get_keeper_possible_swaps',
          description: 'Get possible keeper swaps for a token using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-pbtc)'),
          }),
        },
        async ({ token_x_id }) => {
          return await bitflowService.getKeeperPossibleSwaps(token_x_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_all_keeper_possible_token_y',
          description: 'Get all possible keeper token Y options using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-pbtc)'),
          }),
        },
        async ({ token_x_id }) => {
          return await bitflowService.getAllKeeperPossibleTokenY(token_x_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_all_keeper_possible_token_y_routes',
          description: 'Get all possible keeper token Y routes using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-pbtc)'),
            token_y_id: z.string().describe('Destination token ID (e.g., token-sbtc)'),
          }),
        },
        async ({ token_x_id, token_y_id }) => {
          return await bitflowService.getAllKeeperPossibleTokenYRoutes(token_x_id, token_y_id);
        }
      ),

      createTool(
        {
          name: 'bitflow_get_keeper_quote_for_route',
          description: 'Get keeper quote for route using official SDK',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-pbtc)'),
            token_y_id: z.string().describe('Destination token ID (e.g., token-sbtc)'),
            amount: z.number().describe('Amount to swap'),
          }),
        },
        async ({ token_x_id, token_y_id, amount }) => {
          return await bitflowService.getKeeperQuoteForRoute(token_x_id, token_y_id, amount);
        }
      ),

      // ========================= UTILITY OPERATIONS =========================

      createTool(
        {
          name: 'bitflow_get_network_info',
          description: 'Get network configuration and SDK information',
          parameters: z.object({}),
        },
        async () => {
          return bitflowService.getNetworkInfo();
        }
      ),


      createTool(
        {
          name: 'bitflow_get_token_formats',
          description: 'Get supported token formats and examples for SDK usage',
          parameters: z.object({}),
        },
        async () => {
          return bitflowService.getTokenFormats();
        }
      ),

      createTool(
        {
          name: 'bitflow_get_contract_addresses',
          description: 'Get all Bitflow contract addresses for current network',
          parameters: z.object({}),
        },
        async () => {
          return {
            network,
            contracts: bitflowService.getContractAddresses()
          };
        }
      ),

      createTool(
        {
          name: 'bitflow_get_stableswap_pools',
          description: 'Get all StableSwap pool contract addresses',
          parameters: z.object({}),
        },
        async () => {
          return {
            network,
            stableSwapPools: bitflowService.getStableSwapPools()
          };
        }
      ),

      createTool(
        {
          name: 'bitflow_get_xyk_pools',
          description: 'Get all XYK pool contract addresses',
          parameters: z.object({}),
        },
        async () => {
          return {
            network,
            xykPools: bitflowService.getXYKPools()
          };
        }
      ),

      // ========================= COMPLETE WORKFLOWS =========================

      createTool(
        {
          name: 'bitflow_execute_btc_to_sbtc_keeper_order',
          description: 'Execute complete BTC to sBTC swap using Keeper system',
          parameters: z.object({
            bitcoin_tx_id: z.string().describe('Bitcoin transaction ID for bridging'),
            amount: z.string().describe('Amount of pBTC to swap to sBTC'),
            fee_recipient: z.string().optional().describe('Fee recipient address'),
            min_received_amount: z.string().optional().describe('Minimum sBTC amount to receive'),
            auto_adjust: z.boolean().optional().default(false).describe('Auto-adjust minimum received'),
          }),
        },
        async ({ bitcoin_tx_id, amount, fee_recipient, min_received_amount, auto_adjust }) => {
          const userAddress = walletClient.getAddress();
          
          try {
            // Step 1: Get or create keeper contract
            const keeperResult = await bitflowService.getOrCreateKeeperContract({
              stacksAddress: userAddress,
              keeperType: KeeperType.MULTI_ACTION_V1,
              deployContract: true,
              allActionsApproved: true
            });
            
            if (keeperResult.error) {
              throw new Error(`Failed to create keeper contract: ${keeperResult.error}`);
            }
            
            // Step 2: Create the swap order
            // Per Bitflow documentation: BTC→pBTC (Pontis bridge)→sBTC (Keeper swap)
            // Funding token is specifically Pontis pBTC as documented in BTC to sBTC example
            const PONTIS_PBTC_TOKEN = 'SP14NS8MVBRHXMM96BQY0727AJ59SWPV7RMHC0NCG.pontis-bridge-pBTC::bridge-token';
            const DEFAULT_FEE_RECIPIENT = 'SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M';
            
            const orderResult = await bitflowService.createKeeperOrder({
              contractIdentifier: keeperResult.keeperContract.contractIdentifier,
              stacksAddress: userAddress,
              keeperType: KeeperType.MULTI_ACTION_V1,
              actionType: 'SWAP_XYK_SWAP_HELPER',
              fundingTokens: {
                [PONTIS_PBTC_TOKEN]: amount
              },
              actionAggregatorTokens: {
                tokenXId: 'token-pbtc',
                tokenYId: 'token-sbtc'
              },
              minReceived: {
                amount: min_received_amount || '0',
                autoAdjust: auto_adjust
              },
              feeRecipient: fee_recipient || DEFAULT_FEE_RECIPIENT,
              actionAmount: amount,
              bitcoinTxId: bitcoin_tx_id
            });
            
            return {
              success: true,
              keeperContract: keeperResult.keeperContract,
              order: orderResult.keeperOrder,
              workflow: 'BTC to sBTC Bridge and Swap',
              network,
              userAddress
            };
            
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              network,
              userAddress
            };
          }
        }
      ),

      createTool(
        {
          name: 'bitflow_execute_token_swap_with_keeper',
          description: 'Execute token swap using Keeper system for automated execution',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID (e.g., token-stx)'),
            token_y_id: z.string().describe('Destination token ID (e.g., token-usda)'),
            amount: z.string().describe('Amount to swap'),
            funding_tokens: z.record(z.string()).describe('Funding tokens and amounts'),
            min_received_amount: z.string().optional().describe('Minimum amount to receive'),
            auto_adjust: z.boolean().optional().default(true).describe('Auto-adjust minimum received'),
            fee_recipient: z.string().optional().describe('Fee recipient address'),
          }),
        },
        async ({ token_x_id, token_y_id, amount, funding_tokens, min_received_amount, auto_adjust, fee_recipient }) => {
          const userAddress = walletClient.getAddress();
          
          try {
            // Get or create keeper contract
            const keeperResult = await bitflowService.getOrCreateKeeperContract({
              stacksAddress: userAddress,
              keeperType: KeeperType.MULTI_ACTION_V1,
              deployContract: true,
              allActionsApproved: true
            });
            
            if (keeperResult.error) {
              throw new Error(`Failed to create keeper contract: ${keeperResult.error}`);
            }
            
            // Create swap order
            const orderResult = await bitflowService.createKeeperOrder({
              contractIdentifier: keeperResult.keeperContract.contractIdentifier,
              stacksAddress: userAddress,
              keeperType: KeeperType.MULTI_ACTION_V1,
              actionType: 'SWAP_XYK_SWAP_HELPER',
              fundingTokens: funding_tokens,
              actionAggregatorTokens: {
                tokenXId: token_x_id,
                tokenYId: token_y_id
              },
              minReceived: {
                amount: min_received_amount || '0',
                autoAdjust: auto_adjust
              },
              feeRecipient: fee_recipient,
              actionAmount: amount
            });
            
            return {
              success: true,
              keeperContract: keeperResult.keeperContract,
              order: orderResult.keeperOrder,
              swapDetails: {
                from: token_x_id,
                to: token_y_id,
                amount: amount
              },
              network,
              userAddress
            };
            
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              network,
              userAddress
            };
          }
        }
      ),

      createTool(
        {
          name: 'bitflow_setup_dca_orders',
          description: 'Setup Dollar Cost Averaging (DCA) orders using group orders',
          parameters: z.object({
            token_x_id: z.string().describe('Source token ID'),
            token_y_id: z.string().describe('Destination token ID'),
            total_amount: z.string().describe('Total amount to DCA'),
            number_of_orders: z.number().describe('Number of DCA orders'),
            frequency_hours: z.number().describe('Frequency between orders in hours'),
            funding_tokens: z.record(z.string()).describe('Funding tokens and amounts'),
            fee_recipient: z.string().optional().describe('Fee recipient address'),
          }),
        },
        async ({ token_x_id, token_y_id, total_amount, number_of_orders, frequency_hours, funding_tokens, fee_recipient }) => {
          const userAddress = walletClient.getAddress();
          
          try {
            const amountPerOrder = Math.floor(Number(total_amount) / number_of_orders);
            const frequencySeconds = frequency_hours * 3600;
            
            const groupOrderResult = await bitflowService.createGroupOrder({
              stacksAddress: userAddress,
              amountPerOrder: amountPerOrder,
              numberOfOrders: number_of_orders,
              executionFrequency: frequencySeconds,
              keeperType: KeeperType.MULTI_ACTION_V1,
              actionType: 'SWAP_XYK_SWAP_HELPER',
              fundingTokens: funding_tokens,
              actionAggregatorTokens: {
                tokenXId: token_x_id,
                tokenYId: token_y_id
              },
              feeRecipient: fee_recipient,
              minReceived: {
                amount: '0',
                autoAdjust: true
              }
            });
            
            return {
              success: true,
              groupOrder: groupOrderResult.keeperGroupOrder,
              dcaDetails: {
                totalAmount: total_amount,
                amountPerOrder: amountPerOrder.toString(),
                numberOfOrders: number_of_orders,
                frequencyHours: frequency_hours,
                from: token_x_id,
                to: token_y_id
              },
              network,
              userAddress
            };
            
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              network,
              userAddress
            };
          }
        }
      ),
    ];
  }
}

/**
 * Factory function to create Bitflow plugin
 */
export function bitflow() {
  return new BitflowPlugin();
}