import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: require("find-config")(".env") });

const pulseTestnet: NetworkUserConfig = {
	url: "https://rpc.v4.testnet.pulsechain.com",
	chainId: 943,
	accounts: [process.env.KEY_PULSE_TESTNET!],
};

const holesky: NetworkUserConfig = {
	url: "https://ethereum-holesky-rpc.publicnode.com",
	chainId: 17000,
	accounts: [process.env.KEY_TESTNET!],
};

const config: HardhatUserConfig = {
	solidity: "0.8.24",
	networks: {
		hardhat: {
			allowUnlimitedContractSize: true,
		},
		...(process.env.KEY_PULSE_TESTNET && { pulseTestnet }),
		...(process.env.KEY_TESTNET && { holesky }),
	},
};

export default config;
