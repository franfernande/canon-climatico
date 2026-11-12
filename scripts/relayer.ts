import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { network } from "hardhat";
import { archivoDeLiquidacion, guardarDespliegue, leerDespliegue, linkTx } from "./lib/despliegue.ts";
import {
  descargar,
  formatearMm,
  FUENTE,
  lluviaDecimasMm,
  mesesDeVentana,
  sha256,
  urlParaVentana,
} from "./lib/power.ts";

const DEPOSITADO = 1n;

const { ethers, networkName } = await network.create();
const [relayer] = await ethers.getSigners();
const despliegue = leerDespliegue(networkName);
const canon = await ethers.getContractAt("CanonClimatico", despliegue.direccion, relayer);

const ultimoBloque = await ethers.provider.getBlock("latest");
if (!ultimoBloque) throw new Error("No se pudo leer el último bloque");
const ahora = BigInt(ultimoBloque.timestamp);

// IDS=1,2 liquida solo esos contratos. Sin IDS revisa todos.
const cantidad = Number(await canon.cantidad());
const ids = process.env.IDS
  ? process.env.IDS.split(",").map((id) => Number(id.trim()))
  : Array.from({ length: cantidad }, (_, i) => i + 1);

for (const id of ids) {
  const a = await canon.alquiler(id);
  const c = a.condiciones;

  if (a.estado !== DEPOSITADO) {
    console.log(`#${id}: no está depositado (estado ${a.estado}), lo salteo`);
    continue;
  }
  if (c.relayer !== relayer.address) {
    console.log(`#${id}: el relayer autorizado es ${c.relayer}, no ${relayer.address}`);
    continue;
  }
  if (c.finVentana > ahora) {
    console.log(`#${id}: la ventana todavía no cerró`);
    continue;
  }
  if (c.fuente !== FUENTE) {
    console.log(`#${id}: la fuente es "${c.fuente}" y este relayer solo sabe leer "${FUENTE}"`);
    continue;
  }

  const meses = mesesDeVentana(Number(c.inicioVentana), Number(c.finVentana));
  const url = urlParaVentana(Number(c.latitudE4), Number(c.longitudE4), meses);

  // ARCHIVO=ruta usa una respuesta ya guardada, por si NASA POWER no responde.
  let bytes: Uint8Array;
  let json: unknown;
  if (process.env.ARCHIVO) {
    bytes = readFileSync(process.env.ARCHIVO);
    json = JSON.parse(new TextDecoder().decode(bytes));
  } else {
    ({ bytes, json } = await descargar(url));
  }

  const archivo = archivoDeLiquidacion(networkName, despliegue.direccion, id);
  mkdirSync(dirname(archivo), { recursive: true });
  writeFileSync(archivo, bytes);

  const hash = sha256(bytes);
  const lluvia = lluviaDecimasMm(json, meses);
  const pct = await canon.porcentajeArrendatario(id, lluvia);

  console.log(`#${id}: ${meses.join(" + ")} = ${formatearMm(lluvia)}, vuelve ${pct} % al arrendatario`);
  console.log(`  dato:  ${url}`);
  console.log(`  copia: ${archivo} (SHA-256 ${hash})`);

  const tx = await canon.liquidar(id, lluvia, hash);
  await tx.wait();
  console.log(`  liquidar: ${linkTx(networkName, tx.hash)}`);

  despliegue.liquidaciones.push({ id, tx: tx.hash, lluviaDecimasMm: lluvia, hashDato: hash, archivo });
  guardarDespliegue(despliegue);
}
