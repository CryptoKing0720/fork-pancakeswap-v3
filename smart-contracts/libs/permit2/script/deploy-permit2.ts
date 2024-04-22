import { ethers, network, run } from "hardhat";

const FEE_SETTER = "0x24ef62f5060D6BcAB0f0732B515137C508499126"

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

  // Deploy Permit2
  console.log("Deploying Permit2..");

  const Permit2 = await ethers.getContractFactory("Permit2");

  const permit2 = await Permit2.deploy(FEE_SETTER);

  await permit2.deployed();

  console.log("Permit2 deployed to:", permit2.address);
};

main();
