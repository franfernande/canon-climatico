import { spawn } from "node:child_process";
import path from "node:path";

// Corre el mismo relayer de la terminal (scripts/relayer.ts) en la PC que sirve la página, con
// la clave del .env de la raíz. La clave nunca llega al navegador.
const RAIZ = path.resolve(process.cwd(), "..");
const EN_CURSO = new Set<number>();

function correr(comando: string, env: Record<string, string>): Promise<string> {
  return new Promise((resolve) => {
    const hijo = spawn(comando, { cwd: RAIZ, shell: true, env: { ...process.env, ...env } });
    let salida = "";
    hijo.stdout.on("data", (d: Buffer) => (salida += d.toString()));
    hijo.stderr.on("data", (d: Buffer) => (salida += d.toString()));
    const corte = setTimeout(() => hijo.kill(), 180_000);
    hijo.on("close", () => {
      clearTimeout(corte);
      resolve(salida);
    });
  });
}

/** Saca los colores de la terminal y las líneas que agrega npm. */
function limpiar(salida: string): string {
  return salida
    .replace(/\x1b\[[0-9;]*m/g, "")
    .split(/\r?\n/)
    .filter((linea) => linea.trim() && !linea.startsWith("> "))
    .join("\n");
}

export async function POST(_req: Request, ctx: RouteContext<"/api/relayer/[id]">) {
  if (process.env.NODE_ENV === "production" && process.env.RELAYER_DESDE_WEB !== "1") {
    return Response.json(
      { ok: false, error: "El relayer desde la página está apagado en producción. Corré npm run dev, o definí RELAYER_DESDE_WEB=1." },
      { status: 403 },
    );
  }
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: "Número de alquiler inválido." }, { status: 400 });
  if (EN_CURSO.has(id)) return Response.json({ ok: false, error: "El relayer ya está corriendo para este alquiler." }, { status: 409 });

  EN_CURSO.add(id);
  try {
    const salida = limpiar(await correr("npm run relayer:fuji", { IDS: String(id) }));
    const tx = salida.match(/liquidar:\s+(\S+)/)?.[1] ?? null;
    if (!tx) {
      const error = /Falta FUJI_/.test(salida)
        ? "Falta el .env con las claves de Fuji en la raíz del repo, en la PC que sirve la página."
        : "El relayer no liquidó. Mirá su salida.";
      return Response.json({ ok: false, error, salida });
    }
    // Actualiza la foto que muestra la página principal; si falla, la liquidación igual quedó hecha.
    await correr("npm run web:datos", {});
    return Response.json({ ok: true, tx, salida });
  } finally {
    EN_CURSO.delete(id);
  }
}
