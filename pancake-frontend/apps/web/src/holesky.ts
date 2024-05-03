import { defineChain } from 'viem'

export const holesky = /*#__PURE__*/ defineChain({
  id: 17000,
  network: 'holesky',
  name: 'Holesky',
  nativeCurrency: { name: 'Holesky Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ethereum-holesky.publicnode.com'],
    },
    public: {
      http: ['https://ethereum-holesky.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://holesky.etherscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x078a7405434b3b658eF4fa954359E57C2e096987',
      blockCreated: 0,
    },
  },
  testnet: true,
})
