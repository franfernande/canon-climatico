// Uso: node scripts/exportar-web.ts [red]
// Junta lo que muestra la página: la historia de lluvia, el contrato leído de la cadena y la
// respuesta de NASA POWER que usó el relayer. Escribe web/data/<red>.json.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Contract, formatEther, JsonRpcProvider } from "ethers";
import type { AlquilerWeb, Campania, DatosWeb } from "../web/lib/tipos.ts";
import { archivoDeLiquidacion, leerDespliegue, linkDireccion, linkTx, REDES, rutaDespliegue } from "./lib/despliegue.ts";
import {
  ANTA,
  FUENTE,
  lluviaDecimasMm,
  mesesDeVentana,
  nombreDeCampania,
  sha256,
  urlParaVentana,
  ventanaDeCampania,
} from "./lib/power.ts";

const ESTADOS = ["Creado", "Depositado", "Liquidado", "Cancelado", "Reembolsado"] as const;
const UMBRALES_EJEMPLO = { bajo: 2550, alto: 3050 };
const OFFSET_ARGENTINA_S = -3 * 3600;

const red = process.argv[2] ?? "fuji";
if (!REDES[red]) {
  console.error(`Red desconocida: ${red}`);
  process.exit(2);
}

const respuestaHistoria: unknown = JSON.parse(readFileSync("sample-data/nasa-power-anta-2004-2025.json", "utf8"));
const historia: Campania[] = [];
for (let anio = 2004; anio <= 2024; anio++) {
  const { inicio, fin } = ventanaDeCampania(anio);
  historia.push({
    anio,
    campania: nombreDeCampania(anio),
    lluviaDecimasMm: lluviaDecimasMm(respuestaHistoria, mesesDeVentana(inicio, fin)),
  });
}

let contrato: DatosWeb["contrato"] = null;
const alquileres: AlquilerWeb[] = [];

if (existsSync(rutaDespliegue(red))) {
  const d = leerDespliegue(red);
  const canon = new Contract(d.direccion, d.abi, new JsonRpcProvider(REDES[red].rpc));
  contrato = {
    modoDemo: Boolean(await canon.getFunction("modoDemo")()),
    direccion: d.direccion,
    link: linkDireccion(red, d.direccion),
    linkDespliegue: linkTx(red, d.txDespliegue),
    abi: d.abi,
  };

  const cantidad = Number(await canon.getFunction("cantidad")());
  for (let id = 1; id <= cantidad; id++) {
    const a = await canon.getFunction("alquiler")(id);
    const c = a.condiciones;
    const estado = ESTADOS[Number(a.estado)];
    const registro = d.alquileres.find((x) => x.id === id);
    const liquidacion = d.liquidaciones.find((x) => x.id === id);
    const anioCampania = new Date((Number(c.inicioVentana) + OFFSET_ARGENTINA_S) * 1000).getUTCFullYear();

    let reparto: AlquilerWeb["reparto"] = null;
    if (estado === "Liquidado" || estado === "Reembolsado") {
      // Un reembolso reparte según el tramo medio, sin lluvia publicada.
      const pct: bigint =
        estado === "Reembolsado"
          ? BigInt(c.pctMedio)
          : await canon.getFunction("porcentajeArrendatario")(id, a.lluviaDecimasMm);
      const alArrendatario = (c.saldo * pct) / 100n;
      reparto = {
        pctArrendatario: Number(pct),
        alDuenoAvax: formatEther(c.saldo - alArrendatario),
        alArrendatarioAvax: formatEther(alArrendatario),
      };
    }

    let dato: AlquilerWeb["dato"] = null;
    const archivo = archivoDeLiquidacion(red, d.direccion, id);
    if (estado === "Liquidado" && existsSync(archivo)) {
      const ruta = `/datos/${red}/${d.direccion.toLowerCase()}/${id}.json`;
      const destino = `web/public${ruta}`;
      mkdirSync(dirname(destino), { recursive: true });
      copyFileSync(archivo, destino);
      const meses = mesesDeVentana(Number(c.inicioVentana), Number(c.finVentana));
      dato = {
        ruta,
        url: urlParaVentana(Number(c.latitudE4), Number(c.longitudE4), meses),
        coincideHash: sha256(readFileSync(archivo)) === a.hashDato,
      };
    }

    alquileres.push({
      id,
      campania: nombreDeCampania(anioCampania),
      estado,
      saldoAvax: formatEther(c.saldo),
      umbralBajo: Number(c.umbralBajo),
      umbralAlto: Number(c.umbralAlto),
      pctMedio: Number(c.pctMedio),
      pctBajo: Number(c.pctBajo),
      lluviaDecimasMm: estado === "Liquidado" ? Number(a.lluviaDecimasMm) : null,
      reparto,
      hashDato: estado === "Liquidado" ? a.hashDato : null,
      dato,
      cuentas: { dueno: a.dueno, arrendatario: c.arrendatario, relayer: c.relayer },
      links: {
        crear: registro ? linkTx(red, registro.txCrear) : null,
        depositar: registro ? linkTx(red, registro.txDepositar) : null,
        liquidar: liquidacion ? linkTx(red, liquidacion.tx) : null,
      },
    });
  }
}

const primero = alquileres[0];
const datos: DatosWeb = {
  red,
  generado: new Date().toISOString(),
  explorer: REDES[red].explorer,
  fuente: FUENTE,
  punto: { latitud: ANTA.latitudE4 / 10_000, longitud: ANTA.longitudE4 / 10_000 },
  umbrales: primero ? { bajo: primero.umbralBajo, alto: primero.umbralAlto } : UMBRALES_EJEMPLO,
  historia,
  contrato,
  alquileres,
};

const salida = `web/data/${red}.json`;
mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, `${JSON.stringify(datos, null, 2)}\n`);
console.log(`Escrito ${salida}: ${historia.length} campañas, ${alquileres.length} contratos`);
