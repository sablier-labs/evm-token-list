import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { config } from "dotenv";
import axios from "axios";

// Load environment variables from .env file
config();

const TOKENS_DIR = "src/tokens";

// ANSI color codes
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

async function checkTokenDecimals(token, rpcUrl) {
  const { address, decimals: tokenDecimal } = token;

  try {
    // Make RPC call to get decimals from contract
    const response = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: address,
          data: "0x313ce567", // decimals() function selector
        },
        "latest",
      ],
      id: 1,
    });

    // Check if response has result
    if (!response.data.result) {
      throw new Error(JSON.stringify(response.data));
    }

    // Convert hex result to decimal
    const actualDecimals = parseInt(response.data.result, 16);

    // Check for valid conversion
    if (isNaN(actualDecimals)) {
      console.log(`\n${YELLOW}🟡 Invalid for ${address}, could be an RPC issue, manual check is recommended.${RESET}`);
      return true; // Continue processing other tokens
    }

    // Compare decimals
    if (tokenDecimal !== actualDecimals) {
      console.log(
        `\n${RED}🔴 Mismatch for ${address}. Set to ${tokenDecimal}. Should be ${actualDecimals}${RESET}`,
      );
      return false; // Indicate failure
    }

    return true; // Success
  } catch (error) {
    if (error.response?.data) {
      console.log(`\n${RED}🔴 ${JSON.stringify(error.response.data)}${RESET}`);
    } else {
      console.log(`\n${YELLOW}🟡 Invalid for ${address}, could be an RPC issue, manual check is recommended.${RESET}`);
    }
    return true; // Continue processing other tokens
  }
}

async function checkTokenFile(filePath) {
  const content = await readFile(filePath, "utf-8");
  const tokens = JSON.parse(content);

  // Extract network name for display
  const fileName = basename(filePath, ".json");
  const network = fileName.replace(/-/g, "_").toUpperCase();

  process.stdout.write(`${network} tokens list: `);

  // Extract chainId from first token
  const chainId = tokens[0]?.chainId;

  if (!chainId) {
    console.log(`${YELLOW}🟡 missing chainId in token file.${RESET}`);
    return true;
  }

  // Check if ROUTEMESH_API_KEY is set
  if (!process.env.ROUTEMESH_API_KEY) {
    console.log(`${YELLOW}🟡 missing ROUTEMESH_API_KEY.${RESET}`);
    return true;
  }

  // Generate RPC URL using RouteMesh
  const rpcUrl = `https://lb.routeme.sh/rpc/${chainId}/${process.env.ROUTEMESH_API_KEY}`;

  // Check decimals for each token
  for (const token of tokens) {
    // Indicate progress
    process.stdout.write(".");

    const success = await checkTokenDecimals(token, rpcUrl);
    if (!success) {
      return false; // Exit on first mismatch
    }
  }

  // Log success
  console.log(` ${GREEN}🟢 Valid${RESET}`);
  return true;
}

async function main() {
  const files = await readdir(TOKENS_DIR);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  for (const file of jsonFiles) {
    const filePath = join(TOKENS_DIR, file);
    const success = await checkTokenFile(filePath);

    if (!success) {
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
