import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const TOKENS_DIR = "src/tokens";

async function sortTokenFile(filePath) {
  const content = await readFile(filePath, "utf-8");
  const tokens = JSON.parse(content);

  // Sort tokens alphabetically by symbol (case-insensitive)
  tokens.sort((a, b) => a.symbol.toLowerCase().localeCompare(b.symbol.toLowerCase()));

  // Write back with 2-space indentation and trailing newline
  await writeFile(filePath, JSON.stringify(tokens, null, 2) + "\n", "utf-8");

  return tokens.length;
}

async function main() {
  const files = await readdir(TOKENS_DIR);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  console.log(`Found ${jsonFiles.length} token files to sort...\n`);

  for (const file of jsonFiles) {
    const filePath = join(TOKENS_DIR, file);
    const count = await sortTokenFile(filePath);
    console.log(`✓ Sorted ${count} tokens in ${file}`);
  }

  console.log(`\n✓ All ${jsonFiles.length} files sorted successfully`);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
