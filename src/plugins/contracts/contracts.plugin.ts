import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { StacksApiService } from '../../services/StacksApiService.js';

/**
 * Smart Contract operations plugin
 * Provides tools for interacting with Stacks smart contracts
 */
export class ContractsPlugin extends PluginBase<StacksWalletClient> {
  
  async getTools(walletClient: StacksWalletClient) {
    const apiService = new StacksApiService();
    const network = walletClient.getNetwork() as 'mainnet' | 'testnet';

    return [
      // Get contract status
      createTool(
        {
          name: 'get_contract_status',
          description: 'Get the deployment status of a smart contract',
          parameters: z.object({
            contract_id: z.string().describe('Smart contract ID (format: address.contract-name)'),
          }),
        },
        async ({ contract_id }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v2/smart-contracts/status?contract_id=${contract_id}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get contract status: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get contract details
      createTool(
        {
          name: 'get_contract',
          description: 'Get detailed information about a smart contract including source code and ABI',
          parameters: z.object({
            contract_id: z.string().describe('Smart contract ID (format: address.contract-name)'),
          }),
        },
        async ({ contract_id }) => {
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/contract/${contract_id}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get contract: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // List contracts by trait
      createTool(
        {
          name: 'list_contracts_by_trait',
          description: 'List contracts that implement a specific trait',
          parameters: z.object({
            trait_abi: z.string().describe('Trait ABI definition in JSON format'),
            limit: z.number().optional().default(20).describe('Number of results to return'),
            offset: z.number().optional().default(0).describe('Result offset for pagination'),
          }),
        },
        async ({ trait_abi, limit, offset }) => {
          const params = new URLSearchParams({
            trait_abi,
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/contract/by_trait?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to list contracts by trait: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Get contract events
      createTool(
        {
          name: 'get_contract_events',
          description: 'Get events emitted by a smart contract',
          parameters: z.object({
            contract_id: z.string().describe('Smart contract ID (format: address.contract-name)'),
            limit: z.number().optional().default(20).describe('Number of events to return'),
            offset: z.number().optional().default(0).describe('Event offset for pagination'),
          }),
        },
        async ({ contract_id, limit, offset }) => {
          const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
          });
          
          const response = await fetch(`${apiService.getApiUrl(network)}/extended/v1/contract/${contract_id}/events?${params}`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get contract events: ${response.statusText}`);
          }
          
          return await response.json();
        }
      ),

      // Call read-only contract function
      createTool(
        {
          name: 'call_read_only_function',
          description: 'Call a read-only function on a smart contract',
          parameters: z.object({
            contract_address: z.string().describe('Contract deployer address'),
            contract_name: z.string().describe('Contract name'),
            function_name: z.string().describe('Function name to call'),
            function_args: z.array(z.string()).optional().default([]).describe('Function arguments in Clarity format'),
            sender: z.string().optional().describe('Sender address (defaults to wallet address)'),
          }),
        },
        async ({ contract_address, contract_name, function_name, function_args, sender }) => {
          const contractId = `${contract_address}.${contract_name}`;
          return await apiService.callReadOnlyFunction(
            contractId,
            function_name,
            function_args,
            network,
            sender || walletClient.getAddress()
          );
        }
      ),
    ];
  }
}

/**
 * Factory function to create contracts plugin
 */
export function contracts() {
  return new ContractsPlugin();
}