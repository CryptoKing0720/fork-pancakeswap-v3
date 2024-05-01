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
	v2Factory: "0x56397BF4D4d464de4be02ad4F083A799a5b93E1d",
	v3Factory: "0x2e45f3F5Fcec0EDc7e80ea351a64D570537939C8",
	v3Deployer: "0x6DD316020F2F51d2286B142aC39C07565e647803",
	v2InitCodeHash:
		"0x1a0b41a049b1487cb82e0d5b68774e23e55b72d08a9b108bc598a5fdf423c464",
	v3InitCodeHash:
		"0x6ce8eb472fa82df5469c6ab6d485f17c3ad13c8cd7af59b3d4a8026c5ce0f7e2",
	stableFactory: "0x552B6687010dc759F6b293A2aE4Cb3ea63e3Be9A",
	stableInfo: "0x2404ED95dEE3C38D1248389dB45F27412d10Fdfd",
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
