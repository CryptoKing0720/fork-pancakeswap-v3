import { ethers, run, network } from "hardhat";
import { ContractJson } from "./deploy";
import { sleep } from "sleep-ts";

const artifacts: { [name: string]: ContractJson } = {
  PancakeStableSwapThreePoolDeployer: require("../artifacts/contracts/PancakeStableSwapThreePoolDeployer.sol/PancakeStableSwapThreePoolDeployer.json"),
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

  let pancakeStableSwapThreePoolDeployer_address = "";
  let PancakeStableSwapThreePoolDeployer;
  if (!pancakeStableSwapThreePoolDeployer_address) {
    PancakeStableSwapThreePoolDeployer = await ethers.getContractFactory("PancakeStableSwapThreePoolDeployer");
    const pancakeStableSwapThreePoolDeployer = await PancakeStableSwapThreePoolDeployer.deploy();
    await pancakeStableSwapThreePoolDeployer.deployed();
    pancakeStableSwapThreePoolDeployer_address = pancakeStableSwapThreePoolDeployer.address;
  } else {
    PancakeStableSwapThreePoolDeployer = new ethers.Contract(
      pancakeStableSwapThreePoolDeployer_address,
      artifacts.PancakeStableSwapThreePoolDeployer.abi,
      owner
    );
  }

  console.log("pancakeStableSwapThreePoolDeployer deployed to:", pancakeStableSwapThreePoolDeployer_address);
  sleep(10000);
  await verify(pancakeStableSwapThreePoolDeployer_address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
