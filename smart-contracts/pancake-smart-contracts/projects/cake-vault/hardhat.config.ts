import type { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-truffle5";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
require("dotenv").config({ path: require("find-config")(".env") });

const bscTestnet: NetworkUserConfig = {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
};

const bscMainnet: NetworkUserConfig = {
  url: "https://bsc-dataseed.binance.org/",
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
};

const pulseTestnet: NetworkUserConfig = {
  url: "https://rpc.v4.testnet.pulsechain.com",
  chainId: 943,
  accounts: [process.env.KEY_PULSE_TESTNET!],
};

const sepolia: NetworkUserConfig = {
  url: "https://eth-sepolia.public.blastapi.io",
  chainId: 11155111,
  accounts: [process.env.KEY_TESTNET!],
};

const holesky: NetworkUserConfig = {
  url: "https://ethereum-holesky-rpc.publicnode.com",
  chainId: 17000,
  accounts: [process.env.KEY_TESTNET!],
};

const config = {
  defaultNetwork: "holesky",
  networks: {
    hardhat: {},
    sepolia: sepolia,
    ...{ holesky },
    // pulseTestnet: pulseTestnet,
    // testnet: bscTestnet,
    // mainnet: bscMainnet,
  },
  etherscan: {
    apiKey: {
      bsctestnet: process.env.BSCSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      pulseTestnet: "0000000000000000000000000000000000",
      mumbai: process.env.MUMBAI_API_KEY,
      holesky: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "bsctestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com",
        },
      },
      {
        network: "pulseTestnet",
        chainId: 943,
        urls: {
          apiURL: "https://api.scan.pulsechain.com/api",
          browserURL: "https://rpc.v4.testnet.pulsechain.com",
        },
      },
      {
        network: "mumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com/",
        },
      },
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api",
          browserURL: "https://holesky.etherscan.io",
        },
      },
    ],
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 99999,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  abiExporter: {
    path: "./data/abi",
    clear: true,
    flat: false,
  },
};

export default config;
