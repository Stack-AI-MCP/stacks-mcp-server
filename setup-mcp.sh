#!/bin/bash

# Stacks Bitcoin DeFi MCP Setup Script
# Automatically configures Claude Desktop and/or Cursor with Stacks MCP server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
DIST_PATH="$SCRIPT_DIR/dist/index.js"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [--claude] [--cursor] [--code] [--help]"
    echo ""
    echo "Options:"
    echo "  --claude    Configure Claude Desktop"
    echo "  --cursor    Configure Cursor editor"
    echo "  --code      Configure VS Code"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --claude                Configure Claude Desktop only"
    echo "  $0 --cursor                Configure Cursor only"
    echo "  $0 --code                  Configure VS Code only"
    echo "  $0 --claude --cursor       Configure multiple applications"
    echo "  $0                         Interactive mode (ask which to configure)"
}

# Function to check if .env file exists and load it
load_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error ".env file not found at $ENV_FILE"
        print_status "Please copy .env.example to .env and configure your settings:"
        echo "  cp .env.example .env"
        exit 1
    fi

    print_status "Loading environment variables from .env file..."
    source "$ENV_FILE"
}

# Function to check if the project is built
check_build() {
    if [[ ! -f "$DIST_PATH" ]]; then
        print_error "Built server not found at $DIST_PATH"
        print_status "Please build the project first:"
        echo "  pnpm build"
        exit 1
    fi
    print_success "Found built server at $DIST_PATH"
}

# Function to create MCP configuration JSON
create_mcp_config() {
    local config_json=""

    # Start building the JSON configuration
    config_json=$(cat << EOF
{
  "mcpServers": {
    "stacks-mcp": {
      "command": "node",
      "args": ["$DIST_PATH"],
      "env": {
EOF
    )

    # Add wallet configuration (prefer mnemonic if available)
    if [[ -n "$WALLET_MNEMONIC" ]]; then
        config_json+='\n        "WALLET_MNEMONIC": "'"$WALLET_MNEMONIC"'",'
    elif [[ -n "$WALLET_PRIVATE_KEY" ]]; then
        config_json+='\n        "WALLET_PRIVATE_KEY": "'"$WALLET_PRIVATE_KEY"'",'
    else
        print_error "Neither WALLET_MNEMONIC nor WALLET_PRIVATE_KEY found in .env file"
        exit 1
    fi

    # Add network configuration
    config_json+='\n        "STACKS_NETWORK": "'"${STACKS_NETWORK:-testnet}"'"'

    # Add optional configurations if they exist
    [[ -n "$STACKS_MAINNET_API_URL" ]] && config_json+=',\n        "STACKS_MAINNET_API_URL": "'"$STACKS_MAINNET_API_URL"'"'
    [[ -n "$STACKS_TESTNET_API_URL" ]] && config_json+=',\n        "STACKS_TESTNET_API_URL": "'"$STACKS_TESTNET_API_URL"'"'
    [[ -n "$STACKS_DEVNET_API_URL" ]] && config_json+=',\n        "STACKS_DEVNET_API_URL": "'"$STACKS_DEVNET_API_URL"'"'
    [[ -n "$HIRO_API_KEY" ]] && config_json+=',\n        "HIRO_API_KEY": "'"$HIRO_API_KEY"'"'
    [[ -n "$BITFLOW_API_HOST" ]] && config_json+=',\n        "BITFLOW_API_HOST": "'"$BITFLOW_API_HOST"'"'
    [[ -n "$BITFLOW_API_KEY" ]] && config_json+=',\n        "BITFLOW_API_KEY": "'"$BITFLOW_API_KEY"'"'
    [[ -n "$BITFLOW_PROVIDER_ADDRESS" ]] && config_json+=',\n        "BITFLOW_PROVIDER_ADDRESS": "'"$BITFLOW_PROVIDER_ADDRESS"'"'
    [[ -n "$READONLY_CALL_API_HOST" ]] && config_json+=',\n        "READONLY_CALL_API_HOST": "'"$READONLY_CALL_API_HOST"'"'
    [[ -n "$READONLY_CALL_API_KEY" ]] && config_json+=',\n        "READONLY_CALL_API_KEY": "'"$READONLY_CALL_API_KEY"'"'
    [[ -n "$KEEPER_API_HOST" ]] && config_json+=',\n        "KEEPER_API_HOST": "'"$KEEPER_API_HOST"'"'
    [[ -n "$KEEPER_API_KEY" ]] && config_json+=',\n        "KEEPER_API_KEY": "'"$KEEPER_API_KEY"'"'
    [[ -n "$CHARISMA_API_KEY" ]] && config_json+=',\n        "CHARISMA_API_KEY": "'"$CHARISMA_API_KEY"'"'

    # Close the JSON structure
    config_json+='\n      }\n    }\n  }\n}'

    echo -e "$config_json"
}

# Function to configure Claude Desktop
configure_claude() {
    local claude_config_dir="$HOME/Library/Application Support/Claude"
    local claude_config_file="$claude_config_dir/claude_desktop_config.json"

    print_status "Configuring Claude Desktop..."

    # Create directory if it doesn't exist
    if [[ ! -d "$claude_config_dir" ]]; then
        print_status "Creating Claude configuration directory..."
        mkdir -p "$claude_config_dir"
    fi

    # Generate configuration
    local config_json=$(create_mcp_config)

    # Write configuration file
    echo -e "$config_json" > "$claude_config_file"

    print_success "Claude Desktop configured successfully!"
    print_status "Configuration written to: $claude_config_file"
    print_warning "Please restart Claude Desktop for changes to take effect."
}

# Function to configure Cursor
configure_cursor() {
    local cursor_config_dir="$HOME/.cursor"
    local cursor_config_file="$cursor_config_dir/mcp.json"

    print_status "Configuring Cursor editor..."

    # Create directory if it doesn't exist
    if [[ ! -d "$cursor_config_dir" ]]; then
        print_status "Creating Cursor configuration directory..."
        mkdir -p "$cursor_config_dir"
    fi

    # Generate configuration
    local config_json=$(create_mcp_config)

    # Write configuration file
    echo -e "$config_json" > "$cursor_config_file"

    print_success "Cursor editor configured successfully!"
    print_status "Configuration written to: $cursor_config_file"
    print_warning "Please restart Cursor for changes to take effect."
}

# Function to configure VS Code
configure_code() {
    local code_config_dir="$HOME/Library/Application Support/Code/User"
    local code_config_file="$code_config_dir/mcp.json"

    print_status "Configuring VS Code..."

    # Create directory if it doesn't exist
    if [[ ! -d "$code_config_dir" ]]; then
        print_status "Creating VS Code configuration directory..."
        mkdir -p "$code_config_dir"
    fi

    # Generate configuration
    local config_json=$(create_mcp_config)

    # Write configuration file
    echo -e "$config_json" > "$code_config_file"

    print_success "VS Code configured successfully!"
    print_status "Configuration written to: $code_config_file"
    print_warning "Please restart VS Code for changes to take effect."
}

# Function for interactive mode
interactive_mode() {
    echo ""
    echo "Stacks Bitcoin DeFi MCP Setup"
    echo "============================="
    echo ""
    echo "Which application(s) would you like to configure?"
    echo "1) Claude Desktop only"
    echo "2) Cursor editor only"
    echo "3) VS Code only"
    echo "4) Claude Desktop and Cursor"
    echo "5) Claude Desktop and VS Code"
    echo "6) Cursor and VS Code"
    echo "7) All three applications"
    echo "8) Exit"
    echo ""

    while true; do
        read -p "Enter your choice (1-8): " choice
        case $choice in
            1)
                configure_claude
                break
                ;;
            2)
                configure_cursor
                break
                ;;
            3)
                configure_code
                break
                ;;
            4)
                configure_claude
                echo ""
                configure_cursor
                break
                ;;
            5)
                configure_claude
                echo ""
                configure_code
                break
                ;;
            6)
                configure_cursor
                echo ""
                configure_code
                break
                ;;
            7)
                configure_claude
                echo ""
                configure_cursor
                echo ""
                configure_code
                break
                ;;
            8)
                print_status "Setup cancelled."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-8."
                ;;
        esac
    done
}

# Main execution
main() {
    local configure_claude_flag=false
    local configure_cursor_flag=false
    local configure_code_flag=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --claude)
                configure_claude_flag=true
                shift
                ;;
            --cursor)
                configure_cursor_flag=true
                shift
                ;;
            --code)
                configure_code_flag=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Check prerequisites
    load_env_file
    check_build

    echo ""
    print_status "Stacks Bitcoin DeFi MCP Setup"
    print_status "=============================="

    # Execute based on flags
    if [[ "$configure_claude_flag" == true || "$configure_cursor_flag" == true || "$configure_code_flag" == true ]]; then
        local first_config=true

        if [[ "$configure_claude_flag" == true ]]; then
            configure_claude
            first_config=false
        fi

        if [[ "$configure_cursor_flag" == true ]]; then
            [[ "$first_config" == false ]] && echo ""
            configure_cursor
            first_config=false
        fi

        if [[ "$configure_code_flag" == true ]]; then
            [[ "$first_config" == false ]] && echo ""
            configure_code
        fi
    else
        # No flags provided, enter interactive mode
        interactive_mode
    fi

    echo ""
    print_success "Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Restart your configured application(s)"
    echo "2. Start chatting with natural language Bitcoin DeFi commands!"
    echo ""
    print_status "Example commands to try:"
    echo '  "Check my STX balance"'
    echo '  "Swap 100 STX for ALEX on ALEX DEX"'
    echo '  "Show me my Arkadiko vault health"'
    echo '  "Stack 1000 STX for 6 cycles"'
    echo '  "What are the current PoX cycle details?"'
    echo ""
}

# Run main function with all arguments
main "$@"
