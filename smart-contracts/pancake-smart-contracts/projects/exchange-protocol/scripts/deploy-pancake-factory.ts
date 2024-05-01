import { ethers, network, run } from "hardhat";

const FEE_SETTER = "0x0BaE72613E5f73fF0c094484b12c4EE11Ed072De";

const deploy = async (): Promise<string> => {
  // Compile contracts
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

  // Deploy PancakeFactory
  console.log("Deploying PancakeFactory..");

  const PancakeFactory = await ethers.getContractFactory("PancakeFactory");

  const pancackeFactory = await PancakeFactory.deploy(FEE_SETTER);

  await pancackeFactory.deployed();

  console.log("PancackeFactory deployed to:", pancackeFactory.address);
  return pancackeFactory.address;
};

const verify = async (address: string, parameter: any[] = []) => {
  console.log(`Veryfing ${address} ...`);
  await run("verify:verify", {
    address: address,
    constructorArguments: parameter,
  });
  console.log("Success!");
};

const main = async () => {
  const contractAddr = await deploy();
  await verify(contractAddr, [FEE_SETTER]);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
