// Uso: node scripts/verificar.ts <id> [red]
// Solo lee la cadena: no necesita claves.
import { existsSync, readFileSync } from "node:fs";
import { Contract, JsonRpcProvider } from "ethers";
import { archivoDeLiquidacion, leerDespliegue, REDES } from "./lib/despliegue.ts";
import {
  descargar,
  formatearMm,
  lluviaDecimasMm,
  lluviaPorMes,
  mesesDeVentana,
  sha256,
  urlParaVentana,
} from "./lib/power.ts";

const LIQUIDADO = 2n;

const [idTexto, red = "fuji"] = process.argv.slice(2);
const id = Number(idTexto);
if (!Number.isInteger(id) || id < 1) {
  console.error("Uso: node scripts/verificar.ts <id> [red]");
  process.exit(2);
}
if (!REDES[red]) {
  console.error(`Red desconocida: ${red}`);
  process.exit(2);
}

const despliegue = leerDespliegue(red);
const canon = new Contract(despliegue.direccion, despliegue.abi, new JsonRpcProvider(REDES[red].rpc));
const a = await canon.getFunction("alquiler")(id);
const c = a.condiciones;

if (a.estado !== LIQUIDADO) {
  console.error(`El contrato #${id} todavía no se liquidó (estado ${a.estado})`);
  process.exit(1);
}

const archivo = archivoDeLiquidacion(red, despliegue.direccion, id);
if (!existsSync(archivo)) {
  console.error(`No está la copia del dato en ${archivo}`);
  process.exit(1);
}

const meses = mesesDeVentana(Number(c.inicioVentana), Number(c.finVentana));
const bytes = readFileSync(archivo);
const guardado: unknown = JSON.parse(bytes.toString("utf8"));
const url = urlParaVentana(Number(c.latitudE4), Number(c.longitudE4), meses);
const { json: nuevo } = await descargar(url);

const valoresGuardados = lluviaPorMes(guardado, meses);
const valoresNuevos = lluviaPorMes(nuevo, meses);
const lluvia = lluviaDecimasMm(guardado, meses);

const controles: [string, boolean, string][] = [
  [
    "El archivo guardado tiene el hash publicado en la cadena",
    sha256(bytes) === a.hashDato,
    `${sha256(bytes)} contra ${a.hashDato}`,
  ],
  [
    "Sus valores coinciden con un pedido nuevo a NASA POWER",
    meses.every((mes) => valoresGuardados[mes] === valoresNuevos[mes]),
    meses.map((mes) => `${mes}: ${valoresGuardados[mes]} y ${valoresNuevos[mes]} mm`).join(", "),
  ],
  [
    "La suma de la ventana es la lluvia que recibió el contrato",
    BigInt(lluvia) === a.lluviaDecimasMm,
    `${formatearMm(lluvia)} contra ${formatearMm(a.lluviaDecimasMm)}`,
  ],
];

console.log(`Contrato #${id} en ${despliegue.direccion} (${red})`);
console.log(`Dato: ${url}`);
for (const [descripcion, ok, detalle] of controles) {
  console.log(`${ok ? "OK   " : "FALLA"} ${descripcion}: ${detalle}`);
}
process.exit(controles.every(([, ok]) => ok) ? 0 : 1);
