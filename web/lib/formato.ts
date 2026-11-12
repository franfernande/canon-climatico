import type { Tramo } from "./tipos";

/** La misma regla que el contrato: cada umbral pertenece al tramo de abajo. */
export function tramoDe(lluviaDecimasMm: number, umbrales: { bajo: number; alto: number }): Tramo {
  if (lluviaDecimasMm > umbrales.alto) return "alto";
  if (lluviaDecimasMm > umbrales.bajo) return "medio";
  return "bajo";
}

export function mm(decimas: number): string {
  return `${(decimas / 10).toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mm`;
}

export function mmEntero(decimas: number): string {
  return `${(decimas / 10).toLocaleString("es-AR", { maximumFractionDigits: 1 })} mm`;
}

export function avax(valor: string): string {
  return `${Number(valor).toLocaleString("es-AR", { maximumFractionDigits: 4 })} AVAX`;
}

export function corto(hex: string): string {
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}
