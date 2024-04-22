import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { NetworkUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";
dotenv.config();

const pulseTestnet: NetworkUserConfig = {
	url: "https://rpc.v4.testnet.pulsechain.com",
	chainId: 943,
	accounts: [process.env.PRIVATE_KEY!],
};

const holesky: NetworkUserConfig = {
	url: "https://ethereum-holesky-rpc.publicnode.com",
	chainId: 17000,
	accounts: [process.env.PRIVATE_KEY!],
};

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: "0.8.17",
				settings: {
					optimizer: {
						enabled: true,
						runs: 10,
					},
					viaIR: true,
				},
			},
		],
	},
	networks: {
		hardhat: {},
		...{ pulseTestnet },
		...{ holesky },
	},
	etherscan: {
		apiKey: {
			holesky: "2VPQC6NNB1AEJI2P3GQA73C9UZ823EFY3F",
		},
	},
};

export default config;
