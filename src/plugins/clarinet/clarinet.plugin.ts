import { z } from 'zod';
import { PluginBase } from '../../core/PluginBase.js';
import { createTool } from '../../core/ToolBase.js';
import type { StacksWalletClient } from '../../wallet/StacksWalletClient.js';
import { ClarinetsService } from './clarinet.service.js';

/**
 * Clarinet Development Plugin
 *
 * Tools for Clarity smart contract development:
 * - Project scaffolding with Clarinet
 * - SIP-compliant contract generation
 * - Comprehensive test suite generation
 * - Multi-network configuration
 */
export class ClarinetsPlugin extends PluginBase<StacksWalletClient> {
  async getTools(walletClient: StacksWalletClient) {
    const clarinetsService = new ClarinetsService();

    return [
      // ========================= PROJECT SCAFFOLDING =========================

      createTool(
        {
          name: 'clarinet_generate_project',
          description: 'Generate a complete Clarinet project setup with proper structure, configuration, and starter contracts',
          parameters: z.object({
            project_name: z.string().describe('Name of the Clarinet project to create'),
            project_path: z.string().optional().describe('Path where to create the project (default: current directory)'),
            template: z.enum(['counter', 'nft', 'fungible-token', 'empty']).optional().describe('Project template to use')
          })
        },
        async ({ project_name, project_path, template }) => {
          return clarinetsService.generateClarinetsProject({
            projectName: project_name,
            projectPath: project_path,
            template
          });
        }
      ),

      // ========================= CONTRACT GENERATION =========================

      createTool(
        {
          name: 'clarinet_generate_contract',
          description: 'Generate a complete Clarity contract with SIP compliance, security best practices, and comprehensive functionality',
          parameters: z.object({
            contract_name: z.string().describe('Name of the contract to generate'),
            contract_type: z.enum(['sip009-nft', 'sip010-ft', 'counter', 'custom']).describe('Type of contract to generate'),
            features: z.array(z.string()).optional().describe('Additional features to include (e.g., ["minting", "burning", "metadata"])')
          })
        },
        async ({ contract_name, contract_type, features }) => {
          return clarinetsService.generateClarityContract({
            contractName: contract_name,
            contractType: contract_type,
            features
          });
        }
      ),

      // ========================= TEST GENERATION =========================

      createTool(
        {
          name: 'clarinet_generate_tests',
          description: 'Generate comprehensive test suites for Clarity contracts including unit tests, integration tests, and security tests',
          parameters: z.object({
            contract_name: z.string().describe('Name of the contract to generate tests for'),
            test_type: z.enum(['unit', 'integration', 'security']).describe('Type of tests to generate'),
            scenarios: z.array(z.string()).optional().describe('Specific test scenarios to include')
          })
        },
        async ({ contract_name, test_type, scenarios }) => {
          return clarinetsService.generateContractTests({
            contractName: contract_name,
            testType: test_type,
            scenarios
          });
        }
      ),

      // ========================= PROJECT CONFIGURATION =========================

      createTool(
        {
          name: 'clarinet_configure_project',
          description: 'Configure Clarinet project settings for different networks, add dependencies, and set up development environment',
          parameters: z.object({
            network: z.enum(['devnet', 'testnet', 'mainnet']).describe('Network configuration to set up'),
            requirements: z.array(z.string()).optional().describe('Additional requirements or dependencies')
          })
        },
        async ({ network, requirements }) => {
          return clarinetsService.configureClarinetsProject({
            network,
            requirements
          });
        }
      ),
    ];
  }
}

/**
 * Factory function to create Clarinet plugin
 */
export function clarinet() {
  return new ClarinetsPlugin();
}
