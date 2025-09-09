# Sablier EVM Token List - Claude Code Commands

This file defines custom slash commands that Claude Code can execute for managing the token list.

## Available Commands

### /process-token-request

**Purpose**: Automatically process token addition requests from GitHub issues

**Usage**: Called automatically when Claude is assigned to a token-request GitHub issue

**Implementation**: When assigned to a GitHub issue with "token-request" label, Claude should:

1. **Parse Issue Content**: Extract token details from the structured issue body:
   - Token Address (checksummed)
   - Token Name
   - Token Decimals
   - Token Symbol
   - Token Icon (GitHub-uploaded image)
   - Chain (Ethereum, Base, Arbitrum, etc.)
   - Etherscan/Explorer link
   - Official website
   - CoinGecko/CoinMarketCap page

2. **Validate for Duplicates**: Check all network files for existing tokens:
   - **Exact Duplicate Check**: Search for same address on same network
   - **Symbol Conflict Check**: Search for same symbol on same network with different address
   - **Cross-Network Check**: Search for same address on different networks (informational)
   - **Name Similarity Check**: Look for similar token names with different addresses

3. **Handle Logo Image** (if validation passes):
   - Download the token icon from GitHub user-attachments
   - Create a PR in `sablier-labs/sablier-labs.github.io` repo
   - Upload image to `public/tokens/{SYMBOL}.png`
   - Wait for merge or use the resulting URL

4. **Create Token Entry**:
   - Map chain name to appropriate JSON file (e.g., "Ethereum" → `src/tokens/ethereum-mainnet.json`)
   - Validate token address format (checksummed)
   - Create token object with structure:
     ```json
     {
       "address": "0x...",
       "chainId": 1,
       "decimals": 18,
       "logoURI": "https://files.sablier.com/tokens/SYMBOL.png",
       "name": "Token Name",
       "symbol": "SYMBOL"
     }
     ```

5. **Run the tests**:
  - Code check: Run `bun run check`. If it fails, run `bun run format`.
  - Build check: Run `bun run build`.
  - Test: Run `bun run test`.

6. **Submit PR** (if tests pass):
   - Add token to appropriate network file in alphabetical order
   - Commit message: `list {SYMBOL}`
   - Create PR with title: `Add {SYMBOL}: {Token Name}`
   - Link to original issue in PR description

7. **Request Review**:
   - Request review on the PR from maxdesalle

**Chain Mapping**:
- "Ethereum" → `ethereum-mainnet.json` (chainId: 1)
- "Base" → `base-mainnet.json` (chainId: 8453)
- "Arbitrum" → `arbitrum-mainnet.json` (chainId: 42161)
- "Polygon" → `polygon-mainnet.json` (chainId: 137)
- "Optimism" → `optimism-mainnet.json` (chainId: 10)
- And all other supported chains from `src/buildList.js`

## Workflow Example

Here's how the `/process-token-request` command processes issue #171 (SEED token):

### Input (GitHub Issue #171)
```
Title: Add SEED: SEED
Body:
- Token Address: 0x5eed99d066a8CaF10f3E4327c1b3D8b673485eED
- Token Name: SEED
- Token Symbol: SEED
- Token Decimals: 18
- Token Icon: [GitHub image attachment]
- Chain: Ethereum
- Etherscan link: https://etherscan.io/token/0x5eed99d066a8CaF10f3E4327c1b3D8b673485eED
- Official website: https://garden.finance
```

### Processing Steps
1. **Parse Issue**: Extract all token metadata
2. **Handle Logo**:
   - Download from GitHub attachment
   - Create PR in sablier-labs.github.io: `Add SEED token logo`
   - Upload to `public/tokens/SEED.png`
   - Result: `https://files.sablier.com/tokens/SEED.png`
3. **Create Token Entry**:
   ```json
   {
     "address": "0x5eed99d066a8CaF10f3E4327c1b3D8b673485eED",
     "chainId": 1,
     "decimals": 18,
     "logoURI": "https://files.sablier.com/tokens/SEED.png",
     "name": "Garden",
     "symbol": "SEED"
   }
   ```
4. **Submit PR**:
   - Add to `src/tokens/ethereum-mainnet.json` (alphabetically)
   - Commit: `list SEED`
   - PR title: `Add SEED: Garden`
5. **Close Issue**: Link to PR and mark as completed

### Output
- ✅ Logo PR created in sablier-labs.github.io
- ✅ Token addition PR created in evm-token-list
- ✅ Issue #171 closed with PR link
- ✅ Automatic processing complete

## Command Processing Rules

1. **Issue Detection**: Automatically trigger when assigned to issues with "token-request" label
2. **Multi-repo Workflow**: Handle both evm-token-list and sablier-labs.github.io repositories
3. **Image Processing**: Download, validate, and upload logo images
4. **Validation**: Verify address format, chain mapping, and required fields
5. **PR Creation**: Create well-formatted PRs with proper titles and descriptions
6. **Issue Management**: Comment and close issues with appropriate links

## Duplicate Detection & Handling

### Validation Logic
When processing a token request, Claude performs these checks in order:

1. **Exact Duplicate Check**:
   - Search all network files for same address on same network
   - **If found**: Immediately reject and close issue

2. **Symbol Conflict Check**:
   - Search same network for existing token with same symbol but different address
   - **If found**: Flag for verification and pause processing

3. **Cross-Network Check**:
   - Search all networks for same address on different networks
   - **If found**: Log information and proceed (legitimate cross-chain token)

4. **Name Similarity Check**:
   - Check for similar token names with different addresses
   - **If found**: Flag for review

### Behavior Matrix

| Scenario | Action | Issue Status | PR Created | Label Added | Comment |
|----------|--------|--------------|------------|-------------|---------|
| **Exact Duplicate** | Reject immediately | Close as "not planned" | ❌ No | `duplicate` | "❌ Token already exists on {network}" |
| **Symbol Conflict** | Request verification | Keep open | ❌ No | `needs-verification` | "⚠️ Symbol already in use by different token" |
| **Cross-Chain Token** | Proceed normally | Continue processing | ✅ Yes | None | "ℹ️ Cross-chain deployment detected" |
| **Name Similarity** | Request clarification | Keep open | ❌ No | `needs-verification` | "⚠️ Similar token name found" |

### Comment Templates

**Exact Duplicate**:
```
❌ **Duplicate Token Detected**

Token `{SYMBOL}` already exists on {network} with the same address:
- **Existing Address**: `{address}`
- **File Location**: `src/tokens/{network}.json`

This issue has been automatically closed as duplicate. If you believe this is an error, please comment with additional details.
```

**Symbol Conflict**:
```
⚠️ **Symbol Conflict Detected**

Symbol `{SYMBOL}` is already in use on {network} by a different token:
- **Your Address**: `{new_address}`
- **Existing Address**: `{existing_address}`
- **Existing Token**: {existing_name}

Please verify:
1. This is a legitimate different token, or
2. Choose a different symbol, or
3. Confirm this is the same token with updated details

A maintainer will review this request.
```

**Cross-Chain Notification**:
```
ℹ️ **Cross-Chain Token Detected**

This token already exists on: {other_networks}

This appears to be a legitimate cross-chain deployment. Processing will continue normally for {requested_network}.
```

## Edge Cases & Special Handling

### Address Variations
- **Case Sensitivity**: Convert addresses to lowercase for comparison, but preserve original checksumming in final entry
- **Checksum Validation**: Verify addresses are properly checksummed using EIP-55 standard
- **Zero Address**: Reject `0x0000000000000000000000000000000000000000` as invalid

### Symbol Normalization
- **Case Insensitive**: Compare symbols in uppercase (e.g., "usdc" matches "USDC")
- **Special Characters**: Handle symbols with dots, hyphens, or numbers (e.g., "USDC.e", "1INCH")
- **Unicode**: Basic support for unicode characters but flag for manual review

### Chain Name Mapping
- **Flexible Matching**: Handle variations like "Ethereum"/"Ethereum Mainnet"/"ETH"
- **Case Insensitive**: "ethereum" matches "Ethereum"
- **Common Typos**: "Ethareum" → "Ethereum", "Arbitium" → "Arbitrum"

### Network File Validation
- **File Existence**: Check if target network file exists before processing
- **JSON Integrity**: Validate file is valid JSON before modification
- **Backup Strategy**: Create backup of file before adding token

### Logo Processing
- **Image Validation**: Check file size, format (PNG/JPG), dimensions
- **Download Timeout**: 30-second timeout for image downloads
- **Fallback**: If logo processing fails, proceed without logo and notify

### Decimal Edge Cases
- **Range Validation**: Ensure decimals between 0-18 (practical ERC-20 range)
- **Type Validation**: Confirm decimals is integer, not string
- **Common Values**: Flag unusual decimal values (not 18, 6, 8) for review


## Error Handling

- **Invalid Address**: Request correction from issue author
- **Missing Chain**: Ask for clarification on target network
- **Image Upload Fail**: Proceed without logo and request manual upload
- **Network Not Supported**: List available networks for user selection
- **Validation Timeout**: Retry once, then proceed with manual review flag
- **JSON Parse Error**: Report file corruption and request maintainer intervention
- **Git Operation Fail**: Retry once, then create manual review issue
- **Rate Limiting**: Respect GitHub API limits, queue operations if needed
