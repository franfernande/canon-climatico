import { createHash } from "node:crypto";

export const FUENTE = "NASA POWER PRECTOTCORR_SUM";
const PARAMETRO = "PRECTOTCORR_SUM";

// Argentina usa UTC−3 todo el año. Las ventanas se definen en hora local.
const OFFSET_ARGENTINA_S = -3 * 3600;

export const ANTA = { latitudE4: -251200, longitudE4: -641300 };

/** Segundos Unix de las 00:00 (hora argentina) del primer día del mes. `mes` va de 1 a 12. */
export function inicioDeMes(anio: number, mes: number): number {
  return Date.UTC(anio, mes - 1, 1) / 1000 - OFFSET_ARGENTINA_S;
}

/** Ventana de diciembre y enero de la campaña que empieza en `anio` (2024 es la 2024/25). */
export function ventanaDeCampania(anio: number): { inicio: number; fin: number } {
  return { inicio: inicioDeMes(anio, 12), fin: inicioDeMes(anio + 1, 2) };
}

export function nombreDeCampania(anio: number): string {
  return `${anio}/${String((anio + 1) % 100).padStart(2, "0")}`;
}

/**
 * Meses (`AAAAMM`) que cubre la ventana [inicio, fin). El dato es mensual, así que la ventana
 * tiene que empezar y terminar a las 00:00 del primer día de un mes.
 */
export function mesesDeVentana(inicio: number, fin: number): string[] {
  const desde = new Date((inicio + OFFSET_ARGENTINA_S) * 1000);
  const hasta = new Date((fin + OFFSET_ARGENTINA_S) * 1000);
  if (
    inicio !== inicioDeMes(desde.getUTCFullYear(), desde.getUTCMonth() + 1) ||
    fin !== inicioDeMes(hasta.getUTCFullYear(), hasta.getUTCMonth() + 1) ||
    fin <= inicio
  ) {
    throw new Error("La ventana tiene que empezar y terminar el día 1 de un mes, a las 00:00 de Argentina");
  }

  const meses: string[] = [];
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

export function urlPower(latitudE4: number, longitudE4: number, anioDesde: number, anioHasta: number): string {
  const latitud = latitudE4 / 10_000;
  const longitud = longitudE4 / 10_000;
  return (
    "https://power.larc.nasa.gov/api/temporal/monthly/point" +
    `?parameters=${PARAMETRO}&community=AG&longitude=${longitud}&latitude=${latitud}` +
    `&start=${anioDesde}&end=${anioHasta}&format=JSON`
  );
}

export function urlParaVentana(latitudE4: number, longitudE4: number, meses: string[]): string {
  const anioDesde = Number(meses[0].slice(0, 4));
  const anioHasta = Number(meses[meses.length - 1].slice(0, 4));
  return urlPower(latitudE4, longitudE4, anioDesde, anioHasta);
}

type RespuestaPower = {
  header?: { fill_value?: number };
  properties?: { parameter?: Record<string, Record<string, number>> };
};

/** Lluvia de cada mes, en milímetros, tal como viene en la respuesta. */
export function lluviaPorMes(respuesta: unknown, meses: string[]): Record<string, number> {
  const r = respuesta as RespuestaPower;
  const serie = r.properties?.parameter?.[PARAMETRO];
  if (!serie) throw new Error(`La respuesta no trae ${PARAMETRO}`);
  const relleno = r.header?.fill_value ?? -999;

  const valores: Record<string, number> = {};
  for (const mes of meses) {
    const v = serie[mes];
    if (typeof v !== "number" || v === relleno || v < 0) {
      throw new Error(`NASA POWER no tiene dato para ${mes}`);
    }
    valores[mes] = v;
  }
  return valores;
}

/**
 * Suma la lluvia de los meses y la redondea a décimas de milímetro. Trabaja en centésimas
 * enteras para que el resultado no dependa del redondeo de punto flotante.
 */
export function lluviaDecimasMm(respuesta: unknown, meses: string[]): number {
  const valores = lluviaPorMes(respuesta, meses);
  const centesimas = meses.reduce((total, mes) => total + Math.round(valores[mes] * 100), 0);
  return Math.floor((centesimas + 5) / 10);
}

export function sha256(bytes: Uint8Array): `0x${string}` {
  return `0x${createHash("sha256").update(bytes).digest("hex")}`;
}

export async function descargar(url: string): Promise<{ bytes: Uint8Array; json: unknown }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NASA POWER respondió ${res.status} para ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { bytes, json: JSON.parse(new TextDecoder().decode(bytes)) };
}

export function formatearMm(decimas: number | bigint): string {
  return `${(Number(decimas) / 10).toFixed(1).replace(".", ",")} mm`;
}
