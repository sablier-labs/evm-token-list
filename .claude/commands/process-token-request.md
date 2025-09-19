---
allowed-tools:
  Bash(git add:*), Bash(git checkout:*), Bash(git commit:*), Bash(git config:*), Bash(git fetch:*), Bash(git pull:*),
  Bash(git push:*), Bash(git rev-parse:*), Bash(git status:*), Bash(git switch:*), Bash(bun:*),
  mcp__github__create_issue_comment(*), mcp__github__update_issue(*), mcp__github__create_pull_request(*)

description: Process token addition requests from GitHub issues.
---

When assigned to a GitHub issue with "token-request" label, Claude should:

### Step 1: Parse Issue Content

Extract token details from the structured issue body:

- Token Address (checksummed): use lowercase only for comparisons; preserve checksummed address in final JSON.
- Token Name
- Token Decimals
- Token Symbol
- Token Icon (GitHub-uploaded image)
- Chain (Ethereum, Base, Arbitrum, etc.)
- Etherscan/Explorer link
- Official website
- CoinGecko/CoinMarketCap page

If any required field is missing (address, symbol, decimals, chain), comment and halt.

### Step 2: Validation & Checks (in order)

1. **Address validation (hard fail)**:

- Ensure `0x` + 40 hex chars
- Verify EIP-55 checksum. Reject if invalid
- For internal comparisons, use `addr_lc = address.lower()`
- For storage, use `addr_eip55 = EIP55(address)`

If invalid:

- `mcp__github__create_issue_comment` with a short error message and what to fix
- Stop (do not proceed)

2. **Exact Duplicate Check (same network)**:

- Search the target network file for the same `addr_lc`
- If found `mcp__github__create_issue_comment` posting

```
❌ **Duplicate Token Detected**

Token `{SYMBOL}` already exists on {network} with the same address:

- **Existing Address**: `{address}`
- **File**: `src/tokens/{network-file}.json`

This issue has been automatically closed as duplicate. If you believe this is an error, please comment with details.
```

- `mcp__github__update_issue` with `state: "closed"`
- Stop

### Step 3: Add Logo Image

- Download the token icon from GitHub user-attachments
- Enforce:
  - PNG preferred (JPG allowed if PNG unavailable).
  - Square image; 250×250 exactly if available
  - Reject SVG
- Create a PR in https://github.com/sablier-labs/sablier-labs.github.io repo uploading to `tokens/{SYMBOL}.png`
- Do not block the token listing on this merge. If upload/PR fails:
  - Proceed with `https://files.sablier.com/tokens/SYMBOL.png` as the logoURI
  - `mcp__github__create_issue_comment` to inform

### Step 4: Create Token Entry

- Map chain name to appropriate JSON file (e.g., "Ethereum" → `src/tokens/ethereum-mainnet.json`)
- If JSON file does not exist, create it with a JSON array `[]`.
- Ensure decimals between 0-18 and is an integer and not string. Flag unusual decimal values (not 18, 6, 8) with a
  comment and continue
- Create token object, with structure:

```json
{
  "address": "0xChecksummedAddress",
  "chainId": 1,
  "decimals": 18,
  "logoURI": "https://files.sablier.com/tokens/SYMBOL.png",
  "name": "Token Name",
  "symbol": "SYMBOL"
}
```

- Keep array sorted by symbol (case-insensitive) and do not duplicate entries

### Step 5: Run Checks

- `bun run check`
  - If it fails, `bun run format && bun run check`
- `bun run build`
- `bun run test`

If any fail: comment on the issue with the failing task name and the last error line; add `needs-review` then stop

### Step 6: Submit PR (on success)

- Commit: `list {SYMBOL}`
  - `git add -A && git commit -m "list {SYMBOL}"`
- Create PR via MCP:
  ```
  Use mcp__github__create_pull_request with:
  - owner: "sablier-labs"
  - repo: "evm-token-list"
  - title: "Add {SYMBOL}: {Token Name}"
  - head: current branch name (e.g., "claude/issue-{issue_number}-{timestamp}")
  - base: "main"
  - body: "Closes #{issue_number}\n\nAdds {Token Name} ({SYMBOL}) to {network} network.\n\n**Token Details:**\n- Address: {address}\n- Decimals: {decimals}\n- Chain: {chain}"
  ```
- Add "Closes #{issue_number}" to auto close on merge.

### Step 7: Request Review

- Request review from @maxdesalle (via your GitHub workflow or by mentioning in PR body)

## Error Handling (standardized)

- **Invalid Address / Checksum**: comment exact problem, stop
- **Image Upload Fail**: Proceed without logo, request manual upload and continue
- **JSON Parse Error**: comment indicating file corruption and add `needs-review`
- **Git Operation Fail**: Retry once, and if fails, comment and add `needs-review`
- **Rate Limiting**: Retry once, and if fails, comment and add `needs-review`
