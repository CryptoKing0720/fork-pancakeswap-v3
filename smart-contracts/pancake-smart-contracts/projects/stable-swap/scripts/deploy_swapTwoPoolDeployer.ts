import { ethers, run, network } from "hardhat";
import { sleep } from "sleep-ts";
import { ContractJson } from "./deploy";

const artifacts: { [name: string]: ContractJson } = {
  PancakeStableSwapTwoPoolDeployer: require("../artifacts/contracts/PancakeStableSwapTwoPoolDeployer.sol/PancakeStableSwapTwoPoolDeployer.json"),
};

const verify = async (address: string, parameter: any[] = []) => {
  console.log(`Veryfing ${address} ...`);
  await run("verify:verify", {
    address: address,
    constructorArguments: parameter,
  });
  console.log("Success!");
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
  let pancakeStableSwapTwoPoolDeployer_address = "";
  let PancakeStableSwapTwoPoolDeployer;
  if (!pancakeStableSwapTwoPoolDeployer_address) {
    PancakeStableSwapTwoPoolDeployer = await ethers.getContractFactory("PancakeStableSwapTwoPoolDeployer");
    const pancakeStableSwapTwoPoolDeployer = await PancakeStableSwapTwoPoolDeployer.deploy();
    await pancakeStableSwapTwoPoolDeployer.deployed();
    pancakeStableSwapTwoPoolDeployer_address = pancakeStableSwapTwoPoolDeployer.address;
  } else {
    PancakeStableSwapTwoPoolDeployer = new ethers.Contract(
      pancakeStableSwapTwoPoolDeployer_address,
      artifacts.PancakeStableSwapTwoPoolDeployer.abi,
      owner
    );
  }

  console.log("pancakeStableSwapTwoPoolDeployer deployed to:", pancakeStableSwapTwoPoolDeployer_address);
  await sleep(10000);
  await verify(pancakeStableSwapTwoPoolDeployer_address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
