import bn from 'bignumber.js'
import { Contract, ContractFactory, utils, BigNumber } from 'ethers'
import { ethers, upgrades, network } from 'hardhat'
import { linkLibraries } from '../util/linkLibraries'
import { tryVerify } from '@pancakeswap/common/verify'
import { configs } from '@pancakeswap/common/config'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  QuoterV2: require('../artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'),
  TickLens: require('../artifacts/contracts/lens/TickLens.sol/TickLens.json'),
  V3Migrator: require('../artifacts/contracts/V3Migrator.sol/V3Migrator.json'),
  PancakeInterfaceMulticall: require('../artifacts/contracts/lens/PancakeInterfaceMulticall.sol/PancakeInterfaceMulticall.json'),
  // eslint-disable-next-line global-require
  SwapRouter: require('../artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
  // eslint-disable-next-line global-require
  NFTDescriptor: require('../artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json'),
  // eslint-disable-next-line global-require
  NFTDescriptorEx: require('../artifacts/contracts/NFTDescriptorEx.sol/NFTDescriptorEx.json'),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptor: require('../artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'),
  // eslint-disable-next-line global-require
  NonfungibleTokenPositionDescriptorOffChain: require('../artifacts/contracts/NonfungibleTokenPositionDescriptorOffChain.sol/NonfungibleTokenPositionDescriptorOffChain.json'),
  // eslint-disable-next-line global-require
  NonfungiblePositionManager: require('../artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
}

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
function encodePriceSqrt(reserve1: any, reserve0: any) {
  return BigNumber.from(
    // eslint-disable-next-line new-cap
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      // eslint-disable-next-line new-cap
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

function isAscii(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str)
}
function asciiStringToBytes32(str: string): string {
  if (str.length > 32 || !isAscii(str)) {
    throw new Error('Invalid label, must be less than 32 characters')
  }

  return '0x' + Buffer.from(str, 'ascii').toString('hex').padEnd(64, '0')
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const deployedContracts = await import(`@pancakeswap/v3-core/deployments/${networkName}.json`)

  const pancakeV3PoolDeployer_address = deployedContracts.PancakeV3PoolDeployer
  const pancakeV3Factory_address = deployedContracts.PancakeV3Factory

  let SwapRouter_address = ''
  let SwapRouter
  if (!SwapRouter_address) {
    SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner)
    const swapRouter = await SwapRouter.deploy(pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE)
    await swapRouter.deployed()
    SwapRouter_address = swapRouter.address
  } else {
    SwapRouter = new ethers.Contract(SwapRouter_address, artifacts.SwapRouter.abi, owner)
  }

  // await tryVerify(swapRouter, [pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE])
  console.log('swapRouter', SwapRouter_address)
  // const NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, owner)
  // const nftDescriptor = await NFTDescriptor.deploy()
  // await tryVerify(nftDescriptor)
  // console.log('nftDescriptor', nftDescriptor.address)

  // const NFTDescriptorEx = new ContractFactory(artifacts.NFTDescriptorEx.abi, artifacts.NFTDescriptorEx.bytecode, owner)
  // const nftDescriptorEx = await NFTDescriptorEx.deploy()
  // await tryVerify(nftDescriptorEx)
  // console.log('nftDescriptorEx', nftDescriptorEx.address)

  // const linkedBytecode = linkLibraries(
  //   {
  //     bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
  //     linkReferences: {
  //       'NFTDescriptor.sol': {
  //         NFTDescriptor: [
  //           {
  //             length: 20,
  //             start: 1261,
  //           },
  //         ],
  //       },
  //     },
  //   },
  //   {
  //     NFTDescriptor: nftDescriptor.address,
  //   }
  // )

  // const NonfungibleTokenPositionDescriptor = new ContractFactory(
  //   artifacts.NonfungibleTokenPositionDescriptor.abi,
  //   linkedBytecode,
  //   owner
  // )
  // const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
  //   config.WNATIVE,
  //   asciiStringToBytes32(config.nativeCurrencyLabel),
  //   nftDescriptorEx.address
  // )

  // await tryVerify(nonfungibleTokenPositionDescriptor, [
  //   config.WNATIVE,
  //   asciiStringToBytes32(config.nativeCurrencyLabel),
  //   nftDescriptorEx.address,
  // ])
  // console.log('nonfungibleTokenPositionDescriptor', nonfungibleTokenPositionDescriptor.address)

  // off chain version
  let NonfungibleTokenPositionDescriptor_address = ''
  let NonfungibleTokenPositionDescriptor
  if (!NonfungibleTokenPositionDescriptor_address) {
    NonfungibleTokenPositionDescriptor = new ContractFactory(
      artifacts.NonfungibleTokenPositionDescriptorOffChain.abi,
      artifacts.NonfungibleTokenPositionDescriptorOffChain.bytecode,
      owner
    )
    const baseTokenUri = 'https://nft.pancakeswap.com/v3/'
    const nonfungibleTokenPositionDescriptor = await upgrades.deployProxy(NonfungibleTokenPositionDescriptor, [
      baseTokenUri,
    ])
    await nonfungibleTokenPositionDescriptor.deployed()
    NonfungibleTokenPositionDescriptor_address = nonfungibleTokenPositionDescriptor.address
  } else {
    NonfungibleTokenPositionDescriptor = new ethers.Contract(
      NonfungibleTokenPositionDescriptor_address,
      artifacts.NonfungibleTokenPositionDescriptor.abi,
      owner
    )
  }
  console.log('nonfungibleTokenPositionDescriptor', NonfungibleTokenPositionDescriptor_address)

  // await tryVerify(nonfungibleTokenPositionDescriptor)

  let NonfungiblePositionManager_address = ''
  let NonfungiblePositionManager

  if (!NonfungiblePositionManager_address) {
    NonfungiblePositionManager = new ContractFactory(
      artifacts.NonfungiblePositionManager.abi,
      artifacts.NonfungiblePositionManager.bytecode,
      owner
    )
    const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
      pancakeV3PoolDeployer_address,
      pancakeV3Factory_address,
      config.WNATIVE,
      NonfungibleTokenPositionDescriptor_address
    )
    await nonfungiblePositionManager.deployed()
    NonfungiblePositionManager_address = nonfungiblePositionManager.address
  } else {
    NonfungiblePositionManager = new ethers.Contract(
      NonfungiblePositionManager_address,
      artifacts.NonfungiblePositionManager.abi,
      owner
    )
  }

  // await tryVerify(nonfungiblePositionManager, [
  //   pancakeV3PoolDeployer_address,
  //   pancakeV3Factory_address,
  //   config.WNATIVE,
  //   nonfungibleTokenPositionDescriptor.address,
  // ])
  console.log('nonfungiblePositionManager', NonfungiblePositionManager_address)

  let PancakeInterfaceMulticall
  let PancakeInterfaceMulticall_address = ''

  if (!PancakeInterfaceMulticall_address) {
    PancakeInterfaceMulticall = new ContractFactory(
      artifacts.PancakeInterfaceMulticall.abi,
      artifacts.PancakeInterfaceMulticall.bytecode,
      owner
    )
    const pancakeInterfaceMulticall = await PancakeInterfaceMulticall.deploy()
    await pancakeInterfaceMulticall.deployed()
    PancakeInterfaceMulticall_address = pancakeInterfaceMulticall.address
  } else {
    PancakeInterfaceMulticall = new ethers.Contract(
      PancakeInterfaceMulticall_address,
      artifacts.PancakeInterfaceMulticall.abi,
      owner
    )
  }
  console.log('PancakeInterfaceMulticall', PancakeInterfaceMulticall_address)

  // await tryVerify(pancakeInterfaceMulticall)

  let V3Migrator_address = ''
  let V3Migrator

  if (!V3Migrator_address) {
    V3Migrator = new ContractFactory(artifacts.V3Migrator.abi, artifacts.V3Migrator.bytecode, owner)
    const v3Migrator = await V3Migrator.deploy(
      pancakeV3PoolDeployer_address,
      pancakeV3Factory_address,
      config.WNATIVE,
      NonfungiblePositionManager_address
    )
    await v3Migrator.deployed()
    V3Migrator_address = v3Migrator.address
  } else {
    V3Migrator = new ethers.Contract(V3Migrator_address, artifacts.V3Migrator.abi, owner)
  }

  console.log('V3Migrator', V3Migrator_address)

  // await tryVerify(v3Migrator, [
  //   pancakeV3PoolDeployer_address,
  //   pancakeV3Factory_address,
  //   config.WNATIVE,
  //   nonfungiblePositionManager.address,
  // ])

  let TickLens_address = ''
  let TickLens

  if (!TickLens_address) {
    TickLens = new ContractFactory(artifacts.TickLens.abi, artifacts.TickLens.bytecode, owner)
    const tickLens = await TickLens.deploy()
    await tickLens.deployed()
    TickLens_address = tickLens.address
  } else {
    TickLens = new ethers.Contract(TickLens_address, artifacts.TickLens.abi, owner)
  }

  console.log('TickLens', TickLens_address)

  // await tryVerify(tickLens)
  let QuoterV2_address = ''
  let QuoterV2
  if (!QuoterV2_address) {
    let QuoterV2 = new ContractFactory(artifacts.QuoterV2.abi, artifacts.QuoterV2.bytecode, owner)
    const quoterV2 = await QuoterV2.deploy(pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE)
    await quoterV2.deployed()
    QuoterV2_address = quoterV2.address
  } else {
    QuoterV2 = new ethers.Contract(QuoterV2_address, artifacts.QuoterV2.abi, owner)
  }
  console.log('QuoterV2', QuoterV2_address)

  // await tryVerify(quoterV2, [pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE])

  const contracts = {
    SwapRouter: SwapRouter_address,
    V3Migrator: V3Migrator_address,
    QuoterV2: QuoterV2_address,
    TickLens: TickLens_address,
    // NFTDescriptor: nftDescriptor.address,
    // NFTDescriptorEx: nftDescriptorEx.address,
    NonfungibleTokenPositionDescriptor: NonfungibleTokenPositionDescriptor_address,
    NonfungiblePositionManager: NonfungiblePositionManager_address,
    PancakeInterfaceMulticall: PancakeInterfaceMulticall_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
