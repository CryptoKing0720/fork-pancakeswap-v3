import { ethers, network, run } from "hardhat";
import config from "../config";
import { constants } from "@openzeppelin/test-helpers";
import { sleep } from "sleep-ts";

const verify = async (address: string, parameter: any[] = []) => {
  console.log(`Veryfing ${address} ...`);
  await run("verify:verify", {
    address: address,
    constructorArguments: parameter,
  });
  console.log("Success!");
};

const main = async () => {
  // Get network name: hardhat, testnet or mainnet.
  const { name } = network;

  if (name == "mainnet") {
    if (!process.env.KEY_MAINNET) {
      throw new Error("Missing private key, refer to README 'Deployment' section");
    }
    if (!config.Admin[name] || config.Admin[name] === constants.ZERO_ADDRESS) {
      throw new Error("Missing admin address, refer to README 'Deployment' section");
    }
    if (!config.Treasury[name] || config.Treasury[name] === constants.ZERO_ADDRESS) {
      throw new Error("Missing treasury address, refer to README 'Deployment' section");
    }
    if (!config.Syrup[name] || config.Syrup[name] === constants.ZERO_ADDRESS) {
      throw new Error("Missing syrup address, refer to README 'Deployment' section");
    }
    if (!config.Cake[name] || config.Cake[name] === constants.ZERO_ADDRESS) {
      throw new Error("Missing syrup address, refer to README 'Deployment' section");
    }
    if (!config.MasterChef[name] || config.MasterChef[name] === constants.ZERO_ADDRESS) {
      throw new Error("Missing master address, refer to README 'Deployment' section");
    }
  }

  console.log("Deploying to network:", name);

  let cake, syrup, masterchef, admin, treasury;
  let cake_addr, syrup_addr, masterchef_addr;
  if (name == "mainnet") {
    admin = config.Admin[name];
    treasury = config.Treasury[name];
    cake_addr = config.Cake[name];
    syrup_addr = config.Syrup[name];
    masterchef_addr = config.MasterChef[name];
  } else {
    console.log("Deploying mocks");
    const CakeContract = await ethers.getContractFactory("CakeToken");
    const SyrupContract = await ethers.getContractFactory("SyrupBar");
    const MasterChefContract = await ethers.getContractFactory("MasterChef");
    const currentBlock = await ethers.provider.getBlockNumber();

    if (name === "hardhat") {
      const [deployer] = await ethers.getSigners();
      admin = deployer.address;
      treasury = deployer.address;
    } else {
      admin = config.Admin[name];
      treasury = config.Treasury[name];
    }

    cake_addr = "";
    if (!cake_addr) {
      cake = await CakeContract.deploy();
      await cake.deployed();
      cake_addr = cake.address;
    }
    await sleep(10000);
    await verify(cake_addr);
    console.log("Cake deployed to:", cake_addr);

    syrup_addr = "";
    if (!syrup_addr) {
      syrup = await SyrupContract.deploy(cake_addr);
      await syrup.deployed();
      syrup_addr = syrup.address;
    }
    console.log("Syrup deployed to:", syrup_addr);
    await sleep(10000);
    await verify(syrup_addr, [cake_addr]);

    masterchef_addr = "";
    if (!masterchef_addr) {
      masterchef = await MasterChefContract.deploy(
        cake_addr,
        syrup_addr,
        admin,
        ethers.BigNumber.from("1"),
        currentBlock
      );
      await masterchef.deployed();
      masterchef_addr = masterchef.address;
    }
    console.log("MasterChef deployed to:", masterchef_addr);
    await sleep(10000);
    await verify(masterchef_addr, [cake_addr, syrup_addr, admin, ethers.BigNumber.from("1"), currentBlock]);
    console.log("Admin:", admin);
    console.log("Treasury:", treasury);
    console.log("Cake deployed to:", cake_addr);
    console.log("Syrup deployed to:", syrup_addr);
    console.log("MasterChef deployed to:", masterchef_addr);
  }

  console.log("Deploying Cake Vault...");

  let cakeVault_addr = "";
  if (!cakeVault_addr) {
    const CakeVaultContract = await ethers.getContractFactory("CakeVault");
    const cakeVault = await CakeVaultContract.deploy(cake_addr, syrup_addr, masterchef_addr, admin, treasury);
    await cakeVault.deployed();
    cakeVault_addr = cakeVault.address;
  }
  await sleep(10000);
  await verify(cakeVault_addr, [cake_addr, syrup_addr, masterchef_addr, admin, treasury]);

  console.log("CakeVault deployed to:", cakeVault_addr);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
