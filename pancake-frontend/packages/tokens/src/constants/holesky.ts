import { ChainId } from '@pancakeswap/chains'
import { WETH9 } from '@pancakeswap/sdk'
import { USDC, USDT } from './common'

export const holeskyTokens = {
  weth: WETH9[ChainId.HOLESKY],
  usdc: USDC[ChainId.HOLESKY],
  usdt: USDT[ChainId.HOLESKY],
}
