import * as fs from "fs";
import { ethers, network } from "hardhat";

async function main() {
	let net = network.name;
	const deployments = JSON.parse(
		await fs.readFileSync(`../pancake-v3-contracts/deployments/${net}.json`),
	);
	const factoryAddr = deployments.v2Factory;
	const abi = JSON.parse(
		await fs.readFileSync(
			`../pancake-smart-contracts/projects/exchange-protocol/artifacts/contracts/PancakeFactory.sol/PancakeFactory.json`,
		),
	);
	const PancakeFactory = await ethers.getContractAt(abi.abi, factoryAddr);
	const sig = await PancakeFactory.createPair(
		"0x94373a4919B3240D86eA41593D5eBa789FEF3848",
		"0x51B279055E4f264BbB38AAB6FB4f62E18Cc2a234",
	); // WETH - USDT
	console.log(sig?.hash);
}

main();
