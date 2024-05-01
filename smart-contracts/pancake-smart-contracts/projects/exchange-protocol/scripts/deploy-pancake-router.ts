import { ethers, network, run } from "hardhat";

import config from "../config";

async function main() {
  await run("compile");
  console.log("Compiled contracts.");

  const networkName = network.name;

  // Sanity checks
  if (networkName === "mainnet") {
    if (!process.env.KEY_MAINNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
  } else if (!process.env.KEY_TESTNET) {
    throw new Error("Missing private key, refer to README 'Deployment' section");
  }

  console.log("Deploying to network:", networkName);

  // Deploy PancakeRouter
  console.log("Deploying PancakeRouter..");

  const PancakeRouter = await ethers.getContractFactory("PancakeRouter");

  const pancakeRouter = await PancakeRouter.deploy(
    config.PancakeFactory[networkName],
    "0x94373a4919B3240D86eA41593D5eBa789FEF3848"
  );

  await pancakeRouter.deployed();

  console.log("PancakeRouter deployed to:", pancakeRouter.address);
}

main();
