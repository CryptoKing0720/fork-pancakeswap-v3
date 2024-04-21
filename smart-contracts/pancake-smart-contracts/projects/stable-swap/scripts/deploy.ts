import { ethers, run, network } from "hardhat";
import config from "../config";
import { sleep } from "sleep-ts";

export type ContractJson = { abi: any; bytecode: string };
const verify = async (address: string, parameter: any[] = []) => {
  console.log(`Veryfing ${address} ...`);
  await run("verify:verify", {
    address: address,
    constructorArguments: parameter,
  });
  console.log("Success!");
};

const artifacts: { [name: string]: ContractJson } = {
  PancakeStableInfoFactory: require("../artifacts/contracts/utils/PancakeStableSwapTwoPoolInfo.sol/PancakeStableSwapTwoPoolInfo.json"),
  PancakeStableSwapFactory: require("../artifacts/contracts/PancakeStableSwapFactory.sol/PancakeStableSwapFactory.json"),
};
async function main() {
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  // Check if the network is supported.
  console.log(`Deploying to ${networkName} network...`);

  // Compile contracts.
  await run("compile");
  console.log("Compiled contracts...");
  const [owner] = await ethers.getSigners();

  let pancakeStableInfoFactory_address = "";
  let PancakeStableInfoFactory;
  if (!pancakeStableInfoFactory_address) {
    PancakeStableInfoFactory = await ethers.getContractFactory("PancakeStableSwapTwoPoolInfo");
    const pancakeStableInfoFactory = await PancakeStableInfoFactory.deploy();
    await pancakeStableInfoFactory.deployed();
    pancakeStableInfoFactory_address = pancakeStableInfoFactory.address;
  } else {
    PancakeStableInfoFactory = new ethers.Contract(
      pancakeStableInfoFactory_address,
      artifacts.PancakeStableInfoFactory.abi,
      owner
    );
  }
  console.log(`pancakeStableInfoFactory: ${pancakeStableInfoFactory_address}`);
  await sleep(10000);
  verify(pancakeStableInfoFactory_address);

  let pancakeStableSwapFactory_address = "";
  let PancakeStableSwapFactory;

  if (!pancakeStableSwapFactory_address) {
    PancakeStableSwapFactory = await ethers.getContractFactory("PancakeStableSwapFactory");
    const pancakeStableSwapFactory = await PancakeStableSwapFactory.deploy(
      config.LPFactory[networkName],
      config.SwapTwoPoolDeployer[networkName],
      config.SwapThreePoolDeployer[networkName]
    );
    await pancakeStableSwapFactory.deployed();
    pancakeStableSwapFactory_address = pancakeStableSwapFactory.address;
  } else {
    PancakeStableSwapFactory = new ethers.Contract(
      pancakeStableSwapFactory_address,
      artifacts.PancakeStableSwapFactory.abi,
      owner
    );
  }
  console.log(`pancakeStableSwapFactory_address: ${pancakeStableSwapFactory_address}`);
  await sleep(10000);
  await verify(pancakeStableSwapFactory_address, [
    config.LPFactory[networkName],
    config.SwapTwoPoolDeployer[networkName],
    config.SwapThreePoolDeployer[networkName],
  ]);

  console.log("pancakeStableSwapFactory deployed to:", pancakeStableSwapFactory_address);
  console.log("pancakeStableInfo deployed to:", pancakeStableInfoFactory_address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
