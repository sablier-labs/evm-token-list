import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));
const { version } = packageJson;

import abstractMainnet from "./tokens/abstract-mainnet.json" with { type: "json" };
import arbitrumMainnet from "./tokens/arbitrum-mainnet.json" with { type: "json" };
import avalancheMainnet from "./tokens/avalanche-mainnet.json" with { type: "json" };
import baseMainnet from "./tokens/base-mainnet.json" with { type: "json" };
import baseSepolia from "./tokens/base-sepolia.json" with { type: "json" };
import berachainMainnet from "./tokens/berachain-mainnet.json" with { type: "json" };
import blastMainnet from "./tokens/blast-mainnet.json" with { type: "json" };
import bscMainnet from "./tokens/bsc-mainnet.json" with { type: "json" };
import chilizMainnet from "./tokens/chiliz-mainnet.json" with { type: "json" };
import ethereumMainnet from "./tokens/ethereum-mainnet.json" with { type: "json" };
import ethereumSepolia from "./tokens/ethereum-sepolia.json" with { type: "json" };
import gnosisMainnet from "./tokens/gnosis-mainnet.json" with { type: "json" };
import hyperevmMainnet from "./tokens/hyperevm-mainnet.json" with { type: "json" };
import formMainnet from "./tokens/form-mainnet.json" with { type: "json" };
import iotexMainnet from "./tokens/iotex-mainnet.json" with { type: "json" };
import optimismMainnet from "./tokens/optimism-mainnet.json" with { type: "json" };
import lightlinkMainnet from "./tokens/lightlink-mainnet.json" with { type: "json" };
import lineaMainnet from "./tokens/linea-mainnet.json" with { type: "json" };
import morphMainnet from "./tokens/morph-mainnet.json" with { type: "json" };
import modeMainnet from "./tokens/mode-mainnet.json" with { type: "json" };
import polygonMainnet from "./tokens/polygon-mainnet.json" with { type: "json" };
import roninMainnet from "./tokens/ronin-mainnet.json" with { type: "json" };
import roninTestnet from "./tokens/ronin-testnet.json" with { type: "json" };
import scrollMainnet from "./tokens/scroll-mainnet.json" with { type: "json" };
import seiMainnet from "./tokens/sei-mainnet.json" with { type: "json" };
import sophonMainnet from "./tokens/sophon-mainnet.json" with { type: "json" };
import sonicMainnet from "./tokens/sonic-mainnet.json" with { type: "json" };
import superseedMainnet from "./tokens/superseed-mainnet.json" with { type: "json" };
import tangleMainnet from "./tokens/tangle-mainnet.json" with { type: "json" };
import unichainMainnet from "./tokens/unichain-mainnet.json" with { type: "json" };
import xdcMainnet from "./tokens/xdc-mainnet.json" with { type: "json" };
import zksyncMainnet from "./tokens/zksync-mainnet.json" with { type: "json" };

export default function buildList() {
  const parsed = version.split(".");
  const l1List = {
    keywords: ["sablier", "default"],
    logoURI: "https://files.sablier.com/icon-180x180.png",
    name: "Sablier EVM Token List",
    tags: {},
    timestamp: new Date().toISOString(),
    tokens: [
      ...ethereumMainnet,
      ...abstractMainnet,
      ...avalancheMainnet,
      ...arbitrumMainnet,
      ...baseMainnet,
      ...baseSepolia,
      ...berachainMainnet,
      ...blastMainnet,
      ...bscMainnet,
      ...chilizMainnet,
      ...ethereumSepolia,
      ...formMainnet,
      ...gnosisMainnet,
      ...hyperevmMainnet,
      ...iotexMainnet,
      ...lightlinkMainnet,
      ...lineaMainnet,
      ...modeMainnet,
      ...morphMainnet,
      ...optimismMainnet,
      ...polygonMainnet,
      ...roninMainnet,
      ...roninTestnet,
      ...seiMainnet,
      ...scrollMainnet,
      ...sonicMainnet,
      ...sophonMainnet,
      ...superseedMainnet,
      ...tangleMainnet,
      ...unichainMainnet,
      ...xdcMainnet,
      ...zksyncMainnet,
    ]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
  };

  return l1List;
}
