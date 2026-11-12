import { configVariable, defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: { version: "0.8.28" },
  networks: {
    fuji: {
      type: "http",
      chainType: "l1",
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      // El orden importa: los scripts toman [relayer, dueño, arrendatario].
      accounts: [
        configVariable("FUJI_PRIVATE_KEY"),
        configVariable("FUJI_DUENO_KEY"),
        configVariable("FUJI_ARRENDATARIO_KEY"),
      ],
    },
  },
});
