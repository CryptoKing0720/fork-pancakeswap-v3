import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import '@nomiclabs/hardhat-truffle5'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'dotenv/config'
import 'hardhat-tracer'
// import '@nomiclabs/hardhat-etherscan'
import 'solidity-docgen'
import '@nomicfoundation/hardhat-verify'
require('dotenv').config({ path: require('find-config')('.env') })

// const bscTestnet: NetworkUserConfig = {
//   url: 'https://rpc.ankr.com/bsc_testnet_chapel',
//   chainId: 97,
//   accounts: [process.env.KEY_TESTNET!],
// }

// const goerli: NetworkUserConfig = {
//   url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_API_KEY}`,
//   chainId: 5,
//   // accounts: [process.env.KEY_GOERLI!],
// }

// const bscMainnet: NetworkUserConfig = {
//   url: 'https://bsc-dataseed.binance.org/',
//   chainId: 56,
//   // accounts: [process.env.KEY_MAINNET!],
// }

const bscTestnet: NetworkUserConfig = {
  url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
}

const bscMainnet: NetworkUserConfig = {
  url: 'https://bsc-dataseed.binance.org/',
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
}

const goerli: NetworkUserConfig = {
  url: 'https://rpc.ankr.com/eth_goerli',
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
}

const eth: NetworkUserConfig = {
  url: 'https://eth.llamarpc.com',
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
}

const pulseTestnet: NetworkUserConfig = {
  url: 'https://rpc.v4.testnet.pulsechain.com',
  chainId: 943,
  accounts: [process.env.KEY_PULSE_TESTNET!],
}

const sepolia: NetworkUserConfig = {
  url: 'https://eth-sepolia.public.blastapi.io',
  chainId: 11155111,
  accounts: [process.env.KEY_TESTNET!],
}

const holesky: NetworkUserConfig = {
  url: 'https://ethereum-holesky-rpc.publicnode.com',
  chainId: 17000,
  accounts: [process.env.KEY_TESTNET!],
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: bscTestnet.url || '',
      },
    },
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_PULSE_TESTNET && { pulseTestnet }),
    ...(process.env.KEY_TESTNET && { sepolia }),
    ...(process.env.KEY_TESTNET && { holesky }),
    // goerli: goerli,
    // mainnet: bscMainnet,
  },
  etherscan: {
    apiKey: {
      bsctestnet: process.env.BSCSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      pulseTestnet: '0000000000000000000000000000000000',
      mumbai: process.env.MUMBAI_API_KEY,
      holesky: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: 'bsctestnet',
        chainId: 97,
        urls: {
          apiURL: 'https://api-testnet.bscscan.com/api',
          browserURL: 'https://testnet.bscscan.com',
        },
      },
      {
        network: 'bsc',
        chainId: 56,
        urls: {
          apiURL: 'https://api.bscscan.com/api',
          browserURL: 'https://bscscan.com',
        },
      },
      {
        network: 'pulseTestnet',
        chainId: 943,
        urls: {
          apiURL: 'https://api.scan.pulsechain.com/api',
          browserURL: 'https://rpc.v4.testnet.pulsechain.com',
        },
      },
      {
        network: 'mumbai',
        chainId: 80001,
        urls: {
          apiURL: 'https://api-testnet.polygonscan.com/api',
          browserURL: 'https://mumbai.polygonscan.com/',
        },
      },
      {
        network: 'holesky',
        chainId: 17000,
        urls: {
          apiURL: 'https://api-holesky.etherscan.io/api',
          browserURL: 'https://holesky.etherscan.io',
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.4.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
    overrides: {
      '@pancakeswap/v3-core/contracts/libraries/FullMath.sol': {
        version: '0.7.6',
        settings: {},
      },
      '@pancakeswap/v3-core/contracts/libraries/TickBitmap.sol': {
        version: '0.7.6',
        settings: {},
      },
      '@pancakeswap/v3-core/contracts/libraries/TickMath.sol': {
        version: '0.7.6',
        settings: {},
      },
      '@pancakeswap/v3-periphery/contracts/libraries/PoolAddress.sol': {
        version: '0.7.6',
        settings: {},
      },
      'contracts/libraries/PoolTicksCounter.sol': {
        version: '0.7.6',
        settings: {},
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  // abiExporter: {
  //   path: "./data/abi",
  //   clear: true,
  //   flat: false,
  // },
  docgen: {
    pages: 'files',
  },
}

export default config
