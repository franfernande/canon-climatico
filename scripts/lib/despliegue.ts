import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { JsonFragment } from "ethers";

export const REDES: Record<string, { rpc: string; explorer: string }> = {
  fuji: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    explorer: "https://explorer-test.avax.network/c-chain",
  },
  localhost: {
    rpc: "http://127.0.0.1:8545",
    explorer: "",
  },
};

export type Despliegue = {
  red: string;
  chainId: number;
  direccion: string;
  txDespliegue: string;
  bloque: number;
  modoDemo?: boolean;
  abi: JsonFragment[];
  alquileres: { id: number; campania: string; txCrear: string; txDepositar: string }[];
  liquidaciones: { id: number; tx: string; lluviaDecimasMm: number; hashDato: string; archivo: string }[];
  retiros?: { rol: "dueño" | "arrendatario"; cuenta: string; montoWei: string; tx: string }[];
};

export function rutaDespliegue(red: string): string {
  return `deployments/${red}.json`;
}

export function leerDespliegue(red: string): Despliegue {
  const ruta = rutaDespliegue(red);
  if (!existsSync(ruta)) {
    throw new Error(`No hay despliegue en ${ruta}. Corré primero: npm run deploy:${red}`);
  }
  return JSON.parse(readFileSync(ruta, "utf8")) as Despliegue;
}

export function guardarDespliegue(d: Despliegue): void {
  const ruta = rutaDespliegue(d.red);
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, `${JSON.stringify(d, null, 2)}\n`);
}

/** Dónde queda la respuesta de NASA POWER que usó el relayer para liquidar ese contrato. */
export function archivoDeLiquidacion(red: string, direccion: string, id: number): string {
  return `sample-data/${red}/${direccion.toLowerCase()}/${id}.json`;
}

export function linkTx(red: string, hash: string): string {
  return `${REDES[red]?.explorer ?? ""}/tx/${hash}`;
}

export function linkDireccion(red: string, direccion: string): string {
  return `${REDES[red]?.explorer ?? ""}/address/${direccion}`;
}
