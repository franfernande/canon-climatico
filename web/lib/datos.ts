import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DatosWeb } from "./tipos";

export { avax, corto, mm, mmEntero, tramoDe } from "./formato";

export function leerDatos(): DatosWeb | null {
  const red = process.env.RED ?? "fuji";
  const ruta = path.join(process.cwd(), "data", `${red}.json`);
  if (!existsSync(ruta)) return null;
  return JSON.parse(readFileSync(ruta, "utf8")) as DatosWeb;
}
