import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Contract, JsonRpcProvider } from "ethers";
import { FUJI } from "@/lib/cadena";
import { leerDatos } from "@/lib/datos";

// En local, guarda en el repo la respuesta de NASA POWER con la que el relayer liquidó desde la
// página, como hace scripts/relayer.ts, para que npm run verificar la encuentre. Solo la guarda si
// su SHA-256 es el hash publicado en la cadena.
const RAIZ = path.resolve(process.cwd(), "..");
const LIQUIDADO = 2n;

export async function POST(req: Request, ctx: RouteContext<"/api/dato/[id]">) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "En la versión publicada no hay repo donde guardar el dato." }, { status: 403 });
  }
  const id = Number((await ctx.params).id);
  const tx = new URL(req.url).searchParams.get("tx") ?? "";
  const datos = leerDatos();
  if (!Number.isInteger(id) || id < 1 || !/^0x[0-9a-fA-F]{64}$/.test(tx) || !datos?.contrato?.abi) {
    return Response.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }

  const bytes = new Uint8Array(await req.arrayBuffer());
  const hash = `0x${createHash("sha256").update(bytes).digest("hex")}`;
  const canon = new Contract(datos.contrato.direccion, datos.contrato.abi, new JsonRpcProvider(FUJI.rpc));
  const a = await canon.getFunction("alquiler")(id);
  if (a.estado !== LIQUIDADO || a.hashDato !== hash) {
    return Response.json({ ok: false, error: "El archivo no tiene el hash publicado en la cadena." }, { status: 400 });
  }

  const archivo = `sample-data/${datos.red}/${datos.contrato.direccion.toLowerCase()}/${id}.json`;
  mkdirSync(path.dirname(path.join(RAIZ, archivo)), { recursive: true });
  writeFileSync(path.join(RAIZ, archivo), bytes);

  const rutaDespliegue = path.join(RAIZ, "deployments", `${datos.red}.json`);
  if (existsSync(rutaDespliegue)) {
    const d = JSON.parse(readFileSync(rutaDespliegue, "utf8"));
    if (!d.liquidaciones.some((l: { id: number }) => l.id === id)) {
      d.liquidaciones.push({ id, tx, lluviaDecimasMm: Number(a.lluviaDecimasMm), hashDato: hash, archivo });
      writeFileSync(rutaDespliegue, `${JSON.stringify(d, null, 2)}\n`);
    }
  }

  // Regenera los datos de la página principal; si falla, el archivo igual quedó guardado.
  await new Promise((resolve) => spawn("npm run web:datos", { cwd: RAIZ, shell: true }).on("close", resolve));
  return Response.json({ ok: true, archivo });
}
