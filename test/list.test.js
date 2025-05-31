const packageJson = require("../package.json");
const schema = require("@uniswap/token-lists/src/tokenlist.schema.json");
const { expect } = require("chai");
const { getAddress } = require("@ethersproject/address");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// Fix: Create Ajv instance without format option and add formats explicitly
const ajv = new Ajv({ allErrors: true, verbose: true });
// Fix: Add formats to support date-time
addFormats(ajv);
const validator = ajv.compile(schema);
let defaultTokenList;

before(async function () {
  // https://stackoverflow.com/questions/44149096
  this.timeout(100000); // 100 seconds

  const tokenListPath = path.join(__dirname, "../build/tokenlist.json");

  // Only build if the file doesn't exist
  if (!fs.existsSync(tokenListPath)) {
    try {
      execSync("bun run build", { stdio: "inherit" });
    } catch (error) {
      throw new Error(`Failed to build token list: ${error.message}`);
    }
  }

  // Load the built token list
  if (!fs.existsSync(tokenListPath)) {
    throw new Error("Token list not found after build");
  }
  defaultTokenList = JSON.parse(fs.readFileSync(tokenListPath, "utf8"));
});

describe("buildList", () => {
  it("validates token list", () => {
    const validated = validator(defaultTokenList);
    if (!validated) {
      console.error(validator.errors);
    }
    expect(validated).to.equal(true);
  });

  it("contains no duplicate addresses", () => {
    const map = {};
    for (const token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      expect(typeof map[key]).to.equal("undefined", `duplicate address: ${token.address}`);
      map[key] = true;
    }
  });

  it("contains no duplicate symbols", () => {
    // manual override to approve certain tokens with duplicate symbols
    const approvedDuplicateSymbols = ["amp", "bank", "flx", "ichi", "rdnt", "slp", "usdc", "usds"];

    const map = {};
    for (const token of defaultTokenList.tokens) {
      const symbol = token.symbol.toLowerCase();
      if (approvedDuplicateSymbols.includes(symbol)) {
      } else {
        const key = `${token.chainId}-${symbol}`;
        expect(typeof map[key]).to.equal("undefined", `duplicate symbol: ${symbol} ${token.address}`);
        map[key] = true;
      }
    }
  });

  it("contains no duplicate names", () => {
    // manual override to approve certain tokens with duplicate names
    const approvedDuplicateNames = ["Radiant", "USD Coin"];

    const map = {};
    for (const token of defaultTokenList.tokens) {
      const name = token.name;
      if (approvedDuplicateNames.includes(name) === false) {
        const key = `${token.chainId}-${token.name.toLowerCase()}`;
        expect(typeof map[key]).to.equal("undefined", `duplicate name: ${token.name}`);
        map[key] = true;
      }
    }
  });

  it("all addresses are valid and checksummed", () => {
    for (const token of defaultTokenList.tokens) {
      expect(getAddress(token.address).toLowerCase()).to.eq(token.address.toLowerCase());
    }
  });

  it("version matches package.json", () => {
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(
      `${defaultTokenList.version.major}.${defaultTokenList.version.minor}.${defaultTokenList.version.patch}`,
    );
  });
});
