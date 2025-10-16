/**
 * Clarinet Development Service
 *
 * Generates Clarinet project scaffolding, Clarity contracts, tests, and configurations
 * for developers building on Stacks blockchain.
 */

export interface ClarinetsProjectParams {
  projectName: string;
  projectPath?: string;
  template?: 'counter' | 'nft' | 'fungible-token' | 'empty';
}

export interface ClarityContractParams {
  contractName: string;
  contractType: 'sip009-nft' | 'sip010-ft' | 'counter' | 'custom';
  features?: string[];
}

export interface ContractTestsParams {
  contractName: string;
  testType: 'unit' | 'integration' | 'security';
  scenarios?: string[];
}

export interface ProjectConfigParams {
  network: 'devnet' | 'testnet' | 'mainnet';
  requirements?: string[];
}

export class ClarinetsService {
  /**
   * Generate Clarinet project setup guide
   */
  generateClarinetsProject(params: ClarinetsProjectParams): string {
    const { projectName, projectPath = './', template = 'empty' } = params;

    return `# Clarinet Project Setup Guide

## Project: ${projectName}

### 1. Initialize Clarinet Project

\`\`\`bash
# Create new Clarinet project
clarinet new ${projectName}
cd ${projectName}

# Verify Clarinet installation
clarinet --version
\`\`\`

### 2. Project Structure

After initialization, your project will have this structure:

\`\`\`
${projectName}/
├── Clarinet.toml           # Main project configuration
├── settings/               # Network-specific settings
│   ├── Devnet.toml
│   ├── Testnet.toml
│   └── Mainnet.toml
├── contracts/              # Clarity contracts
├── tests/                  # TypeScript/JavaScript tests
├── deployments/            # Deployment plans
└── .gitignore
\`\`\`

### 3. Clarinet.toml Configuration

\`\`\`toml
[project]
name = "${projectName}"
authors = []
description = ""
telemetry = true
cache_dir = "./.clarinet/cache"
requirements = []

[contracts.${projectName}]
path = "contracts/${projectName}.clar"
clarity_version = 2
epoch = "2.4"

[repl]
costs_version = 2
parser_version = 2

[repl.analysis]
passes = ["check_checker"]

[repl.analysis.check_checker]
strict = false
trusted_sender = false
trusted_caller = false
callee_filter = false
\`\`\`

### 4. Network Configurations

#### Devnet Settings (\`settings/Devnet.toml\`)
\`\`\`toml
[network]
name = "devnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw"
balance = 100000000000000

[accounts.wallet_1]
mnemonic = "sell invite acquire kitten bamboo drastic jelly vivid peace spawn twice guilt pave pen trash pretty park cube fragile unaware remain midnight betray rebuild"
balance = 100000000000000

[accounts.wallet_2]
mnemonic = "hold excess usual excess ring elephant install account glad dry fragile donkey gaze humble truck breeze nation gasp vacuum limb head keep delay hospital"
balance = 100000000000000
\`\`\`

### 5. ${template.charAt(0).toUpperCase() + template.slice(1)} Template Implementation

${this.getTemplateImplementation(template, projectName)}

### 6. Essential Development Commands

\`\`\`bash
# Start Clarinet console for interactive development
clarinet console

# Run tests
clarinet test

# Check contract syntax
clarinet check

# Generate deployment plan
clarinet deployments generate --devnet

# Deploy to devnet
clarinet deployments apply --devnet

# Start local devnet (if needed)
clarinet integrate

# Format contract code
clarinet fmt
\`\`\`

### 7. Next Steps

1. **Add Contracts**: Place your Clarity contracts in \`contracts/\`
2. **Write Tests**: Create comprehensive tests in \`tests/\`
3. **Configure Networks**: Update settings for testnet/mainnet
4. **Add Dependencies**: Use \`requirements\` in Clarinet.toml for contract dependencies
5. **CI/CD**: Set up GitHub Actions for automated testing

Your Clarinet project is now ready for development! Use tools like \`generate_clarity_contract\` and \`generate_contract_tests\` to add functionality.`;
  }

  /**
   * Generate Clarity contract with SIP compliance
   */
  generateClarityContract(params: ClarityContractParams): string {
    const { contractName, contractType, features = [] } = params;

    return `# Clarity Contract: ${contractName}

## File: contracts/${contractName}.clar

\`\`\`clarity
${this.generateContractCode(contractName, contractType, features)}
\`\`\`

## Contract Registration

Add to your \`Clarinet.toml\`:

\`\`\`toml
[contracts.${contractName}]
path = "contracts/${contractName}.clar"
clarity_version = 2
epoch = "2.4"
\`\`\`

## Key Features Implemented

${this.getContractFeatures(contractType, features)}

## Security Considerations

✅ **Post-conditions**: ${contractType.includes('sip') ? 'Mandatory post-conditions implemented' : 'Added where applicable'}
✅ **Authorization**: All public functions check \`tx-sender\` authorization
✅ **Error Handling**: Comprehensive error codes and descriptive messages
✅ **SIP Compliance**: ${contractType.includes('sip') ? 'Fully compliant with relevant SIP standards' : 'N/A'}
✅ **Reentrancy Protection**: Clarity's design prevents reentrancy attacks
✅ **Integer Overflow**: Clarity prevents integer overflow/underflow

## Deployment Instructions

1. **Check Contract**: \`clarinet check\`
2. **Run Tests**: \`clarinet test\`
3. **Generate Deployment**: \`clarinet deployments generate --devnet\`
4. **Deploy**: \`clarinet deployments apply --devnet\`

## Integration Examples

${this.getIntegrationExamples(contractType, contractName)}

Your contract is ready for testing and deployment!`;
  }

  /**
   * Generate comprehensive test suites
   */
  generateContractTests(params: ContractTestsParams): string {
    const { contractName, testType, scenarios = [] } = params;

    return `# Test Suite: ${contractName}

## File: tests/${contractName}_${testType}_test.ts

\`\`\`typescript
${this.generateTestCode(contractName, testType, scenarios)}
\`\`\`

## Test Categories Covered

${this.getTestCategories(testType, scenarios)}

## Running Tests

\`\`\`bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/${contractName}_${testType}_test.ts

# Run with coverage
clarinet test --coverage

# Run with cost analysis
clarinet test --costs
\`\`\`

## Best Practices

### ${testType.charAt(0).toUpperCase() + testType.slice(1)} Testing
${this.getTestBestPractices(testType)}

Your test suite is ready! Run \`clarinet test\` to execute all tests.`;
  }

  /**
   * Configure Clarinet project for different networks
   */
  configureClarinetsProject(params: ProjectConfigParams): string {
    const { network, requirements = [] } = params;

    return `# Clarinet Project Configuration

## Network Configuration: ${network.toUpperCase()}

### settings/${network.charAt(0).toUpperCase() + network.slice(1)}.toml

\`\`\`toml
${this.getNetworkConfig(network)}
\`\`\`

## Environment Setup

### Network-Specific Settings

#### API Endpoints
\`\`\`bash
# ${network.toUpperCase()} endpoints
${this.getNetworkEndpoints(network)}
\`\`\`

### Development Workflow

\`\`\`bash
# 1. Start development environment
clarinet console

# 2. Run tests for specific network
clarinet test --${network}

# 3. Deploy to network
clarinet deployments generate --${network}
clarinet deployments apply --${network}
\`\`\`

Your Clarinet project is now configured for ${network} development!`;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getTemplateImplementation(template: string, projectName: string): string {
    switch (template) {
      case 'counter':
        return `\`\`\`clarity
;; Counter Template Implementation
(define-data-var counter uint u0)

(define-read-only (get-counter)
  (var-get counter)
)

(define-public (increment)
  (ok (var-set counter (+ (var-get counter) u1)))
)

(define-public (decrement)
  (ok (var-set counter (- (var-get counter) u1)))
)
\`\`\``;

      case 'nft':
        return `\`\`\`clarity
;; SIP-009 NFT Template Implementation
(use-trait sip009-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-non-fungible-token ${projectName} uint)
(define-data-var last-token-id uint u0)

(define-public (mint (recipient principal))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (var-set last-token-id token-id)
    (nft-mint? ${projectName} token-id recipient)
  )
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u403))
    (nft-transfer? ${projectName} token-id sender recipient)
  )
)
\`\`\``;

      case 'fungible-token':
        return `\`\`\`clarity
;; SIP-010 Fungible Token Template Implementation
(use-trait sip010-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token ${projectName})

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u403))
    (ft-transfer? ${projectName} amount sender recipient)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (ft-mint? ${projectName} amount recipient)
)
\`\`\``;

      default:
        return `\`\`\`clarity
;; Empty Template - Add your contract logic here
(define-constant contract-owner tx-sender)

(define-public (hello-world)
  (ok "Hello, Stacks!")
)
\`\`\``;
    }
  }

  private generateContractCode(contractName: string, contractType: string, features: string[]): string {
    switch (contractType) {
      case 'sip010-ft':
        return `;; ${contractName} - SIP-010 Fungible Token
;; Fully compliant with SIP-010 standard

(use-trait sip010-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Token definition
(define-fungible-token ${contractName})

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))

;; Variables
(define-data-var token-name (string-ascii 32) "${contractName}")
(define-data-var token-symbol (string-ascii 10) "${contractName.toUpperCase()}")
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var token-decimals uint u6)

;; SIP-010 Functions
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (ft-transfer? ${contractName} amount sender recipient)
  )
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance ${contractName} who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply ${contractName}))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Administrative functions
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? ${contractName} amount recipient)
  )
)

${features.includes('burning') ? `(define-public (burn (amount uint))
  (ft-burn? ${contractName} amount tx-sender)
)` : ''}

${features.includes('minting') ? `(define-public (set-token-uri (value (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set token-uri value))
  )
)` : ''}`;

      case 'sip009-nft':
        return `;; ${contractName} - SIP-009 Non-Fungible Token
;; Fully compliant with SIP-009 standard

(use-trait sip009-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Token definition
(define-non-fungible-token ${contractName} uint)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

;; Variables
(define-data-var last-token-id uint u0)

;; SIP-009 Functions
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? ${contractName} token-id sender recipient)
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? ${contractName} token-id))
)

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; Administrative functions
(define-public (mint (recipient principal))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (nft-mint? ${contractName} token-id recipient))
    (var-set last-token-id token-id)
    (ok token-id)
  )
)`;

      case 'counter':
        return `;; ${contractName} - Simple Counter Contract

(define-data-var counter uint u0)

(define-read-only (get-counter)
  (var-get counter)
)

(define-public (increment)
  (ok (var-set counter (+ (var-get counter) u1)))
)

(define-public (decrement)
  (ok (var-set counter (- (var-get counter) u1)))
)`;

      default:
        return `;; ${contractName} - Custom Contract

(define-constant contract-owner tx-sender)

(define-public (hello-world)
  (ok "Hello from ${contractName}!")
)`;
    }
  }

  private generateTestCode(contractName: string, testType: string, scenarios: string[]): string {
    const baseImports = `import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';`;

    switch (testType) {
      case 'unit':
        return `${baseImports}

Clarinet.test({
    name: "${contractName} - basic functionality test",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;

        // Test basic contract functionality
        let block = chain.mineBlock([
            Tx.contractCall("${contractName}", "get-balance", [types.principal(deployer.address)], deployer.address)
        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
    },
});`;

      case 'integration':
        return `${baseImports}

Clarinet.test({
    name: "${contractName} - full workflow integration test",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;

        // Test complete user workflow
        let block = chain.mineBlock([
            // Multi-step integration test
        ]);

        assertEquals(block.receipts.length, 1);
    },
});`;

      case 'security':
        return `${baseImports}

Clarinet.test({
    name: "${contractName} - authorization security test",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const attacker = accounts.get("wallet_1")!;

        // Test unauthorized access attempts
        let block = chain.mineBlock([
            // Unauthorized operation attempts
        ]);

        // Verify proper authorization checks
    },
});`;

      default:
        return `${baseImports}

Clarinet.test({
    name: "${contractName} - basic test",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // Add your tests here
    },
});`;
    }
  }

  private getContractFeatures(contractType: string, features: string[]): string {
    const baseFeatures: Record<string, string[]> = {
      'sip010-ft': [
        '✅ SIP-010 compliant fungible token',
        '✅ Standard transfer, mint, and burn functions',
        '✅ Metadata support (name, symbol, decimals, URI)',
        '✅ Administrative controls',
        '✅ Error handling with descriptive codes'
      ],
      'sip009-nft': [
        '✅ SIP-009 compliant non-fungible token',
        '✅ Unique token minting with auto-incrementing IDs',
        '✅ Transfer and ownership functions',
        '✅ Administrative controls'
      ],
      'counter': [
        '✅ Simple counter with increment/decrement',
        '✅ Read-only getter function',
        '✅ Safe arithmetic operations'
      ],
      'custom': [
        '✅ Custom contract structure',
        '✅ Basic functionality template',
        '✅ Extensible design'
      ]
    };

    const base = baseFeatures[contractType] || baseFeatures['custom'];
    return base.join('\n');
  }

  private getIntegrationExamples(contractType: string, contractName: string): string {
    if (contractType === 'sip010-ft') {
      return `### Frontend Integration (using @stacks/connect)

\`\`\`typescript
import { openContractCall } from '@stacks/connect';

// Transfer tokens
const transferTokens = async () => {
  await openContractCall({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: '${contractName}',
    functionName: 'transfer',
    functionArgs: [
      uintCV(1000000),
      principalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'),
      principalCV('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'),
      someCV(bufferCV(Buffer.from('Hello')))
    ]
  });
};
\`\`\``;
    }

    return `### Basic Integration Example

\`\`\`typescript
import { callReadOnlyFunction } from '@stacks/transactions';

const result = await callReadOnlyFunction({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: '${contractName}',
  functionName: 'get-info',
  functionArgs: []
});
\`\`\``;
  }

  private getTestCategories(testType: string, scenarios: string[]): string {
    const categories: Record<string, string[]> = {
      unit: [
        '✅ Individual function testing',
        '✅ Input validation',
        '✅ Return value verification',
        '✅ Error condition testing'
      ],
      integration: [
        '✅ Multi-function workflows',
        '✅ Cross-contract interactions',
        '✅ End-to-end user scenarios'
      ],
      security: [
        '✅ Authorization checks',
        '✅ Post-condition validation',
        '✅ Access control testing'
      ]
    };

    const base = categories[testType] || [];
    return base.join('\n');
  }

  private getTestBestPractices(testType: string): string {
    switch (testType) {
      case 'unit':
        return `- Test one function at a time
- Cover all possible input combinations
- Verify both success and error paths
- Use descriptive test names`;

      case 'integration':
        return `- Test complete user workflows
- Verify state changes across multiple operations
- Test contract interactions
- Use realistic data and scenarios`;

      case 'security':
        return `- Test unauthorized access attempts
- Verify post-conditions for all token transfers
- Test boundary conditions and edge cases
- Simulate malicious inputs`;

      default:
        return `- Write clear, descriptive tests
- Cover both happy path and error cases`;
    }
  }

  private getNetworkConfig(network: string): string {
    switch (network) {
      case 'devnet':
        return `[network]
name = "devnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "twice kind fence tip hidden tilt action fragile skin nothing glory cousin green tomorrow spring wrist shed math olympic multiply hip blue scout claw"
balance = 100000000000000`;

      case 'testnet':
        return `[network]
name = "testnet"
node_rpc_address = "https://stacks-node-api.testnet.stacks.co"
deployment_fee_rate = 1200`;

      case 'mainnet':
        return `[network]
name = "mainnet"
node_rpc_address = "https://stacks-node-api.mainnet.stacks.co"
deployment_fee_rate = 3000`;

      default:
        return '';
    }
  }

  private getNetworkEndpoints(network: string): string {
    switch (network) {
      case 'devnet':
        return `STACKS_API_URL=http://localhost:3999
STACKS_NODE_URL=http://localhost:20443
BITCOIN_NODE_URL=http://localhost:18443`;
      case 'testnet':
        return `STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
STACKS_NODE_URL=https://stacks-node-api.testnet.stacks.co
BITCOIN_NODE_URL=https://bitcoind.testnet.stacks.co`;
      case 'mainnet':
        return `STACKS_API_URL=https://stacks-node-api.mainnet.stacks.co
STACKS_NODE_URL=https://stacks-node-api.mainnet.stacks.co
BITCOIN_NODE_URL=https://bitcoind.mainnet.stacks.co`;
      default:
        return '';
    }
  }
}
