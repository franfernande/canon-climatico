import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

function clave(nombre: string): string {
  const valor = process.env[nombre]?.trim();
  if (!valor) {
    throw new Error(
      `Falta ${nombre} en .env. Copiá .env.example, pegá las tres claves privadas y guardá el archivo.`,
    );
  }
  return valor.startsWith("0x") ? valor : `0x${valor}`;
}

/** Vacío si no hay .env: así compile y test siguen andando sin claves de Fuji. */
function cuentasFuji(): string[] {
  // METAMASK_PRIVATE_KEY es un alias del relayer por si el .env usa ese nombre.
  if (!process.env.FUJI_PRIVATE_KEY?.trim() && process.env.METAMASK_PRIVATE_KEY?.trim()) {
    process.env.FUJI_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
  }
  const nombres = ["FUJI_PRIVATE_KEY", "FUJI_DUENO_KEY", "FUJI_ARRENDATARIO_KEY"] as const;
  if (nombres.every((n) => !process.env[n]?.trim())) return [];
  return nombres.map(clave);
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: { version: "0.8.28" },
  networks: {
    fuji: {
      type: "http",
      chainType: "l1",
      url: process.env.FUJI_RPC_URL?.trim() || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      // El orden importa: los scripts toman [relayer, dueño, arrendatario].
      accounts: cuentasFuji(),
    },
  },
});
