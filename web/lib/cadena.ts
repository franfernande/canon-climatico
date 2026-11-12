import { type Contract, JsonRpcProvider } from "ethers";
import { tramoDe } from "./formato";

export const FUJI = {
  chainId: 43113,
  chainIdHex: "0xa869",
  nombre: "Avalanche Fuji C-Chain",
  rpc: "https://api.avax-test.network/ext/bc/C/rpc",
};

/** Igual que PLAZO_LIQUIDACION en el contrato: después, cualquiera puede llamar a reembolsar. */
export const PLAZO_LIQUIDACION_S = 60 * 24 * 3600;

export const ESTADOS = ["Creado", "Depositado", "Liquidado", "Cancelado", "Reembolsado"] as const;
export type EstadoAlquiler = (typeof ESTADOS)[number];

// Argentina usa UTC−3 todo el año. Las ventanas se definen en hora local, como en scripts/lib/power.ts.
const OFFSET_ARGENTINA_S = -3 * 3600;

function inicioDeMes(anio: number, mes: number): number {
  return Date.UTC(anio, mes - 1, 1) / 1000 - OFFSET_ARGENTINA_S;
}

/** Ventana de diciembre y enero de la campaña que empieza en `anio` (2014 es la 2014/15). */
export function ventanaDeCampania(anio: number): { inicio: number; fin: number } {
  return { inicio: inicioDeMes(anio, 12), fin: inicioDeMes(anio + 1, 2) };
}

export function nombreDeCampania(anio: number): string {
  return `${anio}/${String((anio + 1) % 100).padStart(2, "0")}`;
}

// Lo mismo que scripts/lib/power.ts, para que el relayer pueda liquidar desde el navegador.
const PARAMETRO = "PRECTOTCORR_SUM";

/** Meses (`AAAAMM`) que cubre la ventana [inicio, fin), que empieza y termina el día 1 de un mes. */
export function mesesDeVentana(inicio: number, fin: number): string[] {
  const meses: string[] = [];
  const desde = new Date((inicio + OFFSET_ARGENTINA_S) * 1000);
  let anio = desde.getUTCFullYear();
  let mes = desde.getUTCMonth() + 1;
  while (inicioDeMes(anio, mes) < fin) {
    meses.push(`${anio}${String(mes).padStart(2, "0")}`);
    mes++;
    if (mes === 13) {
      mes = 1;
      anio++;
    }
  }
  return meses;
}

export function urlParaVentana(latitudE4: number, longitudE4: number, meses: string[]): string {
  return (
    "https://power.larc.nasa.gov/api/temporal/monthly/point" +
    `?parameters=${PARAMETRO}&community=AG&longitude=${longitudE4 / 10_000}&latitude=${latitudE4 / 10_000}` +
    `&start=${meses[0].slice(0, 4)}&end=${meses[meses.length - 1].slice(0, 4)}&format=JSON`
  );
}

export function lluviaPorMes(respuesta: unknown, meses: string[]): Record<string, number> {
  const r = respuesta as { header?: { fill_value?: number }; properties?: { parameter?: Record<string, Record<string, number>> } };
  const serie = r.properties?.parameter?.[PARAMETRO];
  if (!serie) throw new Error(`La respuesta de NASA POWER no trae ${PARAMETRO}.`);
  const relleno = r.header?.fill_value ?? -999;
  return Object.fromEntries(
    meses.map((mes) => {
      const v = serie[mes];
      if (typeof v !== "number" || v === relleno || v < 0) throw new Error(`NASA POWER no tiene dato para ${mes}.`);
      return [mes, v];
    }),
  );
}

/** Suma en centésimas enteras y redondea a décimas de milímetro, con los medios hacia arriba. */
export function lluviaDecimasMm(valores: Record<string, number>): number {
  const centesimas = Object.values(valores).reduce((total, v) => total + Math.round(v * 100), 0);
  return Math.floor((centesimas + 5) / 10);
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
  return `0x${Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function campaniaDeVentana(inicio: number): string {
  return nombreDeCampania(new Date((inicio + OFFSET_ARGENTINA_S) * 1000).getUTCFullYear());
}

const FECHA = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function fecha(segundos: number): string {
  return FECHA.format(new Date(segundos * 1000));
}

let lector: JsonRpcProvider | null = null;

/** Lee la cadena por el RPC público de Fuji, sin wallet. */
export function proveedorDeLectura(): JsonRpcProvider {
  lector ??= new JsonRpcProvider(FUJI.rpc, FUJI.chainId, { staticNetwork: true });
  return lector;
}

export type AlquilerEnCadena = {
  id: number;
  dueno: string;
  estado: EstadoAlquiler;
  lluviaDecimasMm: number;
  hashDato: string;
  arrendatario: string;
  relayer: string;
  saldo: bigint;
  latitudE4: number;
  longitudE4: number;
  fuente: string;
  inicioVentana: number;
  finVentana: number;
  plazoDeposito: number;
  umbralBajo: number;
  umbralAlto: number;
  pctMedio: number;
  pctBajo: number;
};

export async function leerAlquiler(contrato: Contract, id: number): Promise<AlquilerEnCadena> {
  const a = await contrato.getFunction("alquiler")(id);
  const c = a.condiciones;
  return {
    id,
    dueno: a.dueno,
    estado: ESTADOS[Number(a.estado)],
    lluviaDecimasMm: Number(a.lluviaDecimasMm),
    hashDato: a.hashDato,
    arrendatario: c.arrendatario,
    relayer: c.relayer,
    saldo: c.saldo,
    latitudE4: Number(c.latitudE4),
    longitudE4: Number(c.longitudE4),
    fuente: c.fuente,
    inicioVentana: Number(c.inicioVentana),
    finVentana: Number(c.finVentana),
    plazoDeposito: Number(c.plazoDeposito),
    umbralBajo: Number(c.umbralBajo),
    umbralAlto: Number(c.umbralAlto),
    pctMedio: Number(c.pctMedio),
    pctBajo: Number(c.pctBajo),
  };
}

/** El mismo reparto que el contrato: el arrendatario recibe su porcentaje y el dueño, el resto. */
export function reparto(a: AlquilerEnCadena): { pctArrendatario: number; alDueno: bigint; alArrendatario: bigint } {
  const tramo = tramoDe(a.lluviaDecimasMm, { bajo: a.umbralBajo, alto: a.umbralAlto });
  const pctArrendatario = tramo === "alto" ? 0 : tramo === "medio" ? a.pctMedio : a.pctBajo;
  const alArrendatario = (a.saldo * BigInt(pctArrendatario)) / 100n;
  return { pctArrendatario, alDueno: a.saldo - alArrendatario, alArrendatario };
}

const MOTIVOS: Record<string, string> = {
  arrendatario: "el arrendatario no puede faltar ni ser el mismo dueño",
  relayer: "el relayer no puede ser el dueño ni el arrendatario",
  saldo: "el saldo tiene que ser mayor que cero",
  ventana: "la ventana tiene que terminar después de empezar",
  plazo: "el plazo para depositar tiene que ser futuro",
  umbrales: "el umbral bajo tiene que ser menor que el alto",
  porcentajes: "el porcentaje del tramo medio no puede superar al del tramo bajo, ni este a 100",
};

const ERRORES: Record<string, (args: readonly unknown[]) => string> = {
  CondicionesInvalidas: ([motivo]) => `El contrato rechazó las condiciones: ${MOTIVOS[String(motivo)] ?? motivo}.`,
  NoExiste: ([id]) => `No existe el alquiler #${id}.`,
  EstadoInvalido: ([estado]) => `El alquiler ya está en estado «${ESTADOS[Number(estado)]}».`,
  SoloDueno: () => "Solo el dueño puede hacer esto.",
  SoloArrendatario: () => "Solo la wallet del arrendatario puede depositar.",
  SoloRelayer: () => "Solo el relayer puede liquidar.",
  MontoIncorrecto: () => "El monto no es exactamente el saldo pactado.",
  PlazoVencido: () => "Venció el plazo para depositar.",
  NadaParaRetirar: () => "Esta wallet no tiene nada para cobrar.",
};

export function explicarError(e: unknown): string {
  const err = e as {
    code?: string | number;
    revert?: { name: string; args: readonly unknown[] };
    shortMessage?: string;
    info?: { error?: { code?: number; message?: string } };
  };
  if (err.code === "ACTION_REJECTED" || err.code === 4001 || err.info?.error?.code === 4001) {
    return "Rechazaste la firma en la wallet.";
  }
  if (err.revert) return ERRORES[err.revert.name]?.(err.revert.args) ?? `El contrato rechazó la operación (${err.revert.name}).`;
  if (err.code === "INSUFFICIENT_FUNDS" || /insufficient funds/i.test(err.info?.error?.message ?? "")) {
    return "La wallet no tiene AVAX suficiente para el monto y el gas. Cargá AVAX de prueba en el faucet.";
  }
  return err.shortMessage ?? err.info?.error?.message ?? (e instanceof Error ? e.message : String(e));
}
