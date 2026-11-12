import { network } from "hardhat";
import { guardarDespliegue, leerDespliegue, linkTx } from "./lib/despliegue.ts";
import { ANTA, FUENTE, nombreDeCampania, ventanaDeCampania } from "./lib/power.ts";

// Las dos campañas del video: 2024/25 fue seca y 2023/24, normal.
const CAMPANIAS = [2024, 2023];
const SALDO = "0.1";
const GAS_POR_TX = "0.01";
const UN_DIA = 24 * 3600;

const { ethers, networkName } = await network.create();
const [relayer, dueno, arrendatario] = await ethers.getSigners();
const direcciones = new Set([relayer.address, dueno.address, arrendatario.address]);
if (direcciones.size !== 3) {
  throw new Error("El relayer, el dueño y el arrendatario tienen que ser tres cuentas distintas");
}

const despliegue = leerDespliegue(networkName);
const canon = await ethers.getContractAt("CanonClimatico", despliegue.direccion);
const saldo = ethers.parseEther(SALDO);
const gas = ethers.parseEther(GAS_POR_TX) * BigInt(CAMPANIAS.length);

async function fondear(cuenta: typeof dueno, minimo: bigint, rol: string) {
  const balance = await ethers.provider.getBalance(cuenta.address);
  if (balance >= minimo) return;
  const tx = await relayer.sendTransaction({ to: cuenta.address, value: minimo - balance });
  await tx.wait();
  console.log(`Fondeado el ${rol} con ${ethers.formatEther(minimo - balance)} AVAX: ${linkTx(networkName, tx.hash)}`);
}

await fondear(dueno, gas, "dueño");
await fondear(arrendatario, saldo * BigInt(CAMPANIAS.length) + gas, "arrendatario");

const ultimoBloque = await ethers.provider.getBlock("latest");
if (!ultimoBloque) throw new Error("No se pudo leer el último bloque");

for (const anio of CAMPANIAS) {
  const { inicio, fin } = ventanaDeCampania(anio);
  const txCrear = await canon.connect(dueno).crear({
    arrendatario: arrendatario.address,
    relayer: relayer.address,
    saldo,
    latitudE4: ANTA.latitudE4,
    longitudE4: ANTA.longitudE4,
    fuente: FUENTE,
    inicioVentana: inicio,
    finVentana: fin,
    plazoDeposito: ultimoBloque.timestamp + 7 * UN_DIA,
    umbralBajo: 2550,
    umbralAlto: 3050,
    pctMedio: 20,
    pctBajo: 50,
  });
  const recibo = await txCrear.wait();
  const creado = recibo?.logs
    .map((log) => canon.interface.parseLog(log))
    .find((evento) => evento?.name === "Creado");
  if (!creado) throw new Error("La transacción de crear no emitió Creado");
  const id = Number(creado.args.id);

  const txDepositar = await canon.connect(arrendatario).depositar(id, { value: saldo });
  await txDepositar.wait();

  despliegue.alquileres.push({
    id,
    campania: nombreDeCampania(anio),
    txCrear: txCrear.hash,
    txDepositar: txDepositar.hash,
  });
  guardarDespliegue(despliegue);

  console.log(`Contrato #${id}, campaña ${nombreDeCampania(anio)}, saldo ${SALDO} AVAX`);
  console.log(`  crear:     ${linkTx(networkName, txCrear.hash)}`);
  console.log(`  depositar: ${linkTx(networkName, txDepositar.hash)}`);
}
