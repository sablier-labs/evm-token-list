const packageJson = require("../package.json");
const schema = require("@uniswap/token-lists/src/tokenlist.schema.json");
const { expect } = require("chai");
const { getAddress } = require("@ethersproject/address");
const Ajv = require("ajv");
const buildList = require("../src/buildList");

const ajv = new Ajv({ allErrors: true, format: "full", verbose: true });
const validator = ajv.compile(schema);
let defaultTokenList;

before(async function () {
  // https://stackoverflow.com/questions/44149096
  this.timeout(540000);
  defaultTokenList = await buildList();
});

describe("buildList", function () {
  it("validates", function () {
    const validated = validator(defaultTokenList);
    if (!validated) console.error(validator.errors);
    expect(validated).to.equal(true);
  });

  it("contains no duplicate addresses", function () {
    const map = {};
    for (let token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      expect(typeof map[key]).to.equal("undefined");
      map[key] = true;
    }
  });

  it("contains no duplicate symbols", function () {
    // manual override to approve certain tokens with duplicate symbols
    const approvedDuplicateSymbols = ["amp", "bank", "flx", "ichi", "rdnt", "slp", "usdc", "usds"];

    const map = {};
    for (let token of defaultTokenList.tokens) {
      let symbol = token.symbol.toLowerCase();
      if (approvedDuplicateSymbols.includes(symbol)) {
        continue;
      } else {
        const key = `${token.chainId}-${symbol}`;
        expect(typeof map[key]).to.equal("undefined", `duplicate symbol: ${symbol}   ${key} ${token.address}`);
        map[key] = true;
      }
    }
  });

  it("contains no duplicate names", function () {
    // manual override to approve certain tokens with duplicate names
    const approvedDuplicateNames = ["Radiant", "USD Coin"];

    const map = {};
    for (let token of defaultTokenList.tokens) {
      let name = token.name;
      if (approvedDuplicateNames.includes(name)) {
        continue;
      } else {
        const key = `${token.chainId}-${token.name.toLowerCase()}`;
        expect(typeof map[key]).to.equal("undefined", `duplicate name: ${token.name}`);
        map[key] = true;
      }
    }
  });

  it("all addresses are valid and checksummed", function () {
    for (let token of defaultTokenList.tokens) {
      expect(getAddress(token.address).toLowerCase()).to.eq(token.address.toLowerCase());
    }
  });

  it("version matches package.json", function () {
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(
      `${defaultTokenList.version.major}.${defaultTokenList.version.minor}.${defaultTokenList.version.patch}`,
    );
  });
});
