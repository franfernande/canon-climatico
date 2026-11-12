import { network } from "hardhat";
import { guardarDespliegue, linkDireccion, linkTx, rutaDespliegue } from "./lib/despliegue.ts";

const { ethers, networkName } = await network.create();
const [relayer] = await ethers.getSigners();

// Modo demo: deja usar campañas pasadas. Con MODO_DEMO=false el contrato exige que el plazo
// para depositar venza antes de que empiece la ventana.
const modoDemo = process.env.MODO_DEMO?.trim().toLowerCase() !== "false";

console.log(`Desplegando CanonClimatico en ${networkName} desde ${relayer.address}`);
console.log(`Modo demo: ${modoDemo ? "sí (acepta campañas pasadas)" : "no"}`);
const canon = await ethers.deployContract("CanonClimatico", [modoDemo], relayer);
await canon.waitForDeployment();

const tx = canon.deploymentTransaction();
const recibo = await tx?.wait();
if (!tx || !recibo) throw new Error("No se pudo confirmar el despliegue");

const direccion = await canon.getAddress();
const { chainId } = await ethers.provider.getNetwork();

guardarDespliegue({
  red: networkName,
  chainId: Number(chainId),
  direccion,
  txDespliegue: tx.hash,
  bloque: recibo.blockNumber,
  modoDemo,
  abi: JSON.parse(canon.interface.formatJson()),
  alquileres: [],
  liquidaciones: [],
  retiros: [],
});

console.log(`Contrato:  ${direccion}`);
console.log(`Explorer:  ${linkDireccion(networkName, direccion)}`);
console.log(`Tx:        ${linkTx(networkName, tx.hash)}`);
console.log(`Guardado en ${rutaDespliegue(networkName)}`);
