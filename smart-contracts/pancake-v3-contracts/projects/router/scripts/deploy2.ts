import { artifacts, ethers, network } from 'hardhat'
import { configs } from '@pancakeswap/common/config'
import { tryVerify, verifyContract } from '@pancakeswap/common/verify'
import { writeFileSync } from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  SmartRouter: require('../artifacts/contracts/SmartRouter.sol/SmartRouter.json'),
  SmartRouterHelper: require('../artifacts/contracts/libraries/SmartRouterHelper.sol/SmartRouterHelper.json'),
  MixedRouteQuoterV1: require('../artifacts/contracts/lens/MixedRouteQuoterV1.sol/MixedRouteQuoterV1.json'),
  QuoterV2: require('../artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'),
  TokenValidator: require('../artifacts/contracts/lens/TokenValidator.sol/TokenValidator.json'),
}

async function main() {
  // Remember to update the init code hash in SC for different chains before deploying
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@pancakeswap/v3-core/deployments/${networkName}.json`)
  const v3PeripheryDeployedContracts = await import(`@pancakeswap/v3-periphery/deployments/${networkName}.json`)

  const pancakeV3PoolDeployer_address = v3DeployedContracts.PancakeV3PoolDeployer
  const pancakeV3Factory_address = v3DeployedContracts.PancakeV3Factory
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager

  /** SmartRouterHelper */
  console.log('Deploying SmartRouterHelper...')
  let smartRouterHelper_address = ''
  let SmartRouterHelper
  if (!smartRouterHelper_address) {
    SmartRouterHelper = await ethers.getContractFactory('SmartRouterHelper')
    const smartRouterHelper = await SmartRouterHelper.deploy()
    await smartRouterHelper.deployed()
    smartRouterHelper_address = smartRouterHelper.address
  } else {
    SmartRouterHelper = new ethers.Contract(smartRouterHelper_address, artifacts.SmartRouterHelper.abi, owner)
  }
  console.log('SmartRouterHelper deployed to:', smartRouterHelper_address)
  await verifyContract(smartRouterHelper_address)

  /** SmartRouter */
  console.log('Deploying SmartRouter...')
  let smartRouter_address = ''
  let SmartRouter
  if (!smartRouter_address) {
    SmartRouter = await ethers.getContractFactory('SmartRouter', {
      libraries: {
        SmartRouterHelper: smartRouterHelper_address,
      },
    })
    const smartRouter = await SmartRouter.deploy(
      config.v2Factory,
      pancakeV3PoolDeployer_address,
      pancakeV3Factory_address,
      positionManager_address,
      config.stableFactory,
      config.stableInfo,
      config.WNATIVE
    )
    await smartRouter.deployed()
    smartRouter_address = smartRouter.address
  } else {
    SmartRouter = new ethers.Contract(smartRouter_address, artifacts.SmartRouter.abi, owner)
  }
  console.log('SmartRouter deployed to:', smartRouter_address)

  await verifyContract(smartRouter_address, [
    config.v2Factory,
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    positionManager_address,
    config.stableFactory,
    config.stableInfo,
    config.WNATIVE,
  ])

  /** MixedRouteQuoterV1 */
  let mixedRouteQuoterV1_address = ''
  let MixedRouteQuoterV1
  if (!mixedRouteQuoterV1_address) {
    MixedRouteQuoterV1 = await ethers.getContractFactory('MixedRouteQuoterV1', {
      libraries: {
        SmartRouterHelper: smartRouterHelper_address,
      },
    })
    const mixedRouteQuoterV1 = await MixedRouteQuoterV1.deploy(
      pancakeV3PoolDeployer_address,
      pancakeV3Factory_address,
      config.v2Factory,
      config.stableFactory,
      config.WNATIVE
    )
    await mixedRouteQuoterV1.deployed()
    mixedRouteQuoterV1_address = mixedRouteQuoterV1.address
  } else {
    MixedRouteQuoterV1 = new ethers.Contract(mixedRouteQuoterV1_address, artifacts.MixedRouteQuoterV1.abi, owner)
  }
  console.log('MixedRouteQuoterV1 deployed to:', mixedRouteQuoterV1_address)

  await verifyContract(mixedRouteQuoterV1_address, [
    pancakeV3PoolDeployer_address,
    pancakeV3Factory_address,
    config.v2Factory,
    config.stableFactory,
    config.WNATIVE,
  ])

  /** QuoterV2 */
  let quoterV2_address = ''
  let QuoterV2
  if (!quoterV2_address) {
    QuoterV2 = await ethers.getContractFactory('QuoterV2', {
      libraries: {
        SmartRouterHelper: smartRouterHelper_address,
      },
    })
    const quoterV2 = await QuoterV2.deploy(pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE)
    await quoterV2.deployed()
    quoterV2_address = quoterV2.address
  } else {
    QuoterV2 = new ethers.Contract(quoterV2_address, artifacts.QuoterV2.abi, owner)
  }
  console.log('QuoterV2 deployed to:', quoterV2_address)

  await verifyContract(quoterV2_address, [pancakeV3PoolDeployer_address, pancakeV3Factory_address, config.WNATIVE])

  /** TokenValidator */
  let tokenValidator_address = ''
  let TokenValidator
  if (!tokenValidator_address) {
    TokenValidator = await ethers.getContractFactory('TokenValidator', {
      libraries: {
        SmartRouterHelper: smartRouterHelper_address,
      },
    })
    const tokenValidator = await TokenValidator.deploy(config.v2Factory, positionManager_address)
    await tokenValidator.deployed()
    tokenValidator_address = tokenValidator.address
  } else {
    TokenValidator = new ethers.Contract(tokenValidator_address, artifacts.TokenValidator.abi, owner)
  }
  console.log('TokenValidator deployed to:', tokenValidator_address)

  await verifyContract(tokenValidator_address, [config.v2Factory, positionManager_address])

  const contracts = {
    SmartRouter: smartRouter_address,
    SmartRouterHelper: smartRouterHelper_address,
    MixedRouteQuoterV1: mixedRouteQuoterV1_address,
    QuoterV2: quoterV2_address,
    TokenValidator: tokenValidator_address,
  }

  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
