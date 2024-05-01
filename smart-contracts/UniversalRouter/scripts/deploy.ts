import * as dotenv from "dotenv";
dotenv.config();
import { ethers, network } from "hardhat";
import { RouterParametersStruct } from "../typechain-types/contracts/UniversalRouter";

const routerParam: RouterParametersStruct = {
	permit2: "0x9ee5B737d8642D9866FB1740922303A37664aeDa",
	weth9: "0x94373a4919B3240D86eA41593D5eBa789FEF3848",
	seaportV1_5: "0x0000000000000000000000000000000000000000",
	seaportV1_4: "0x0000000000000000000000000000000000000000",
	openseaConduit: "0x0000000000000000000000000000000000000000",
	x2y2: "0x0000000000000000000000000000000000000000",
	looksRareV2: "0x0000000000000000000000000000000000000000",
	routerRewardsDistributor: "0x0000000000000000000000000000000000000000",
	looksRareRewardsDistributor: "0x0000000000000000000000000000000000000000",
	looksRareToken: "0x0000000000000000000000000000000000000000",
	v2Factory: "0xE8dE10Cdc768BABCb9667709b099D0B8FC21b4EA",
	v3Factory: "0x74920B7c55EA0D01E54bAD7B9BD5611313a83E18",
	v3Deployer: "0x83a6aD5085f481f375E5779ed670cb796C233A29",
	v2InitCodeHash:
		"0xa5934690703a592a07e841ca29d5e5c79b5e22ed4749057bb216dc31100be1c0",
	v3InitCodeHash:
		"0x6ce8eb472fa82df5469c6ab6d485f17c3ad13c8cd7af59b3d4a8026c5ce0f7e2",
	stableFactory: "0xB5804FcCdca5A4Ed00C1c3896e900a674C98FaFe",
	stableInfo: "0xEE6316A147a13b6AdE349aB893f419CfC40DD07E",
	pancakeNFTMarket: "0x0000000000000000000000000000000000000000",
};

async function main() {
	const networkName = network.name;
	console.log(`Deploying UniversalRouter to ${networkName} ...`);
	const UniswapRouterFactory = await ethers.getContractFactory(
		"UniversalRouter",
	);
	const uniswapRouter = await UniswapRouterFactory.deploy(routerParam);
	console.log(
		"UniversalRouter deployed to: ",
		await uniswapRouter.getAddress(),
	);
}

main();
