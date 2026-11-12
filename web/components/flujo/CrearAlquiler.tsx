"use client";

import { parseEther } from "ethers";
import Link from "next/link";
import { useState } from "react";
import { nombreDeCampania, ventanaDeCampania } from "@/lib/cadena";
import { EstadoTransaccion, Direccion, useFlujo, useTransaccion } from "./Wallet";
import s from "./flujo.module.css";

// Con el modo demo se usan campañas pasadas: las que tienen dato de NASA POWER en la historia.
const CAMPANIAS = Array.from({ length: 21 }, (_, i) => 2024 - i);
const SIETE_DIAS = 7 * 24 * 3600;

export function CrearAlquiler() {
  const { config, contrato, cuenta, rol, firmante } = useFlujo();
  const tx = useTransaccion();
  const [anio, setAnio] = useState(2014);
  const [saldo, setSaldo] = useState("0.005");
  const [bajo, setBajo] = useState("255");
  const [alto, setAlto] = useState("305");
  const [pctMedio, setPctMedio] = useState("20");
  const [pctBajo, setPctBajo] = useState("50");
  const [creado, setCreado] = useState<number | null>(null);

  let saldoWei = 0n;
  try {
    saldoWei = parseEther(saldo || "0");
  } catch {}
  const problemas = [
    saldoWei <= 0n && "El saldo tiene que ser un número mayor que cero.",
    !(Number(bajo) < Number(alto)) && "El umbral bajo tiene que ser menor que el alto.",
    !(Number(pctMedio) <= Number(pctBajo) && Number(pctBajo) <= 100) &&
      "El porcentaje del tramo medio no puede superar al del tramo bajo, ni este a 100.",
    [bajo, alto, pctMedio, pctBajo].some((v) => !(Number(v) >= 0)) && "Los umbrales y porcentajes van sin signo.",
  ].filter(Boolean) as string[];

  async function crear() {
    setCreado(null);
    const { inicio, fin } = ventanaDeCampania(anio);
    const condiciones = {
      arrendatario: config.cuentas.arrendatario,
      relayer: config.cuentas.relayer,
      saldo: saldoWei,
      latitudE4: Math.round(config.punto.latitud * 10_000),
      longitudE4: Math.round(config.punto.longitud * 10_000),
      fuente: config.fuente,
      inicioVentana: inicio,
      finVentana: fin,
      plazoDeposito: Math.floor(Date.now() / 1000) + SIETE_DIAS,
      umbralBajo: Math.round(Number(bajo) * 10),
      umbralAlto: Math.round(Number(alto) * 10),
      pctMedio: Number(pctMedio),
      pctBajo: Number(pctBajo),
    };
    const recibo = await tx.enviar(async () => {
      // Primero se simula contra la cadena: si el contrato lo rechaza, no se abre la wallet.
      await contrato.getFunction("crear").staticCall(condiciones, { from: cuenta });
      const conFirma = contrato.connect(await firmante()) as typeof contrato;
      return conFirma.getFunction("crear")(condiciones);
    });
    const evento = recibo?.logs.map((log) => contrato.interface.parseLog(log)).find((e) => e?.name === "Creado");
    if (evento) setCreado(Number(evento.args.id));
  }

  const linkArrendatario = creado ? `${typeof window === "undefined" ? "" : window.location.origin}/alquiler/${creado}` : "";

  return (
    <>
      <p className={s.etiqueta}>Pantalla del dueño</p>
      <h1 className={s.titulo}>Crear el alquiler</h1>
      <p className={s.bajada}>
        El dueño escribe las condiciones y las firma. Desde ese momento quedan públicas en la cadena y nadie las puede
        cambiar.
      </p>

      <div className={s.columnas}>
        <section className={s.panel} aria-labelledby="fijas">
          <h2 id="fijas">Lo que queda fijo en esta prueba</h2>
          <dl className={s.datos}>
            <div>
              <dt>Dueño (firma)</dt>
              <dd>
                <Direccion valor={config.cuentas.dueno} />
              </dd>
            </div>
            <div>
              <dt>Arrendatario</dt>
              <dd>
                <Direccion valor={config.cuentas.arrendatario} />
              </dd>
            </div>
            <div>
              <dt>Relayer</dt>
              <dd>
                <Direccion valor={config.cuentas.relayer} />
              </dd>
            </div>
            <div>
              <dt>Lote</dt>
              <dd>
                Anta, Salta ({config.punto.latitud.toLocaleString("es-AR")}, {config.punto.longitud.toLocaleString("es-AR")})
              </dd>
            </div>
            <div>
              <dt>Dato</dt>
              <dd>{config.fuente}</dd>
            </div>
            <div>
              <dt>Plazo para depositar</dt>
              <dd>7 días desde la firma</dd>
            </div>
          </dl>
        </section>

        <section className={s.panel} aria-labelledby="condiciones">
          <h2 id="condiciones">Las condiciones</h2>
          <div className={s.formulario}>
            <label>
              Campaña (lluvia de diciembre y enero)
              <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
                {CAMPANIAS.map((a) => (
                  <option key={a} value={a}>
                    {nombreDeCampania(a)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Saldo que deposita el arrendatario (AVAX)
              <input inputMode="decimal" value={saldo} onChange={(e) => setSaldo(e.target.value.replace(",", "."))} />
            </label>
            <label>
              Umbral bajo (mm)
              <input inputMode="decimal" value={bajo} onChange={(e) => setBajo(e.target.value)} />
            </label>
            <label>
              Umbral alto (mm)
              <input inputMode="decimal" value={alto} onChange={(e) => setAlto(e.target.value)} />
            </label>
            <label>
              Vuelve al arrendatario en el tramo medio (%)
              <input inputMode="numeric" value={pctMedio} onChange={(e) => setPctMedio(e.target.value)} />
            </label>
            <label>
              Vuelve al arrendatario en el tramo bajo (%)
              <input inputMode="numeric" value={pctBajo} onChange={(e) => setPctBajo(e.target.value)} />
            </label>
          </div>

          <ol className="tramos">
            <li className="tramo tramo--alto">
              <span className="tramo__lluvia">Más de {alto} mm</span>
              <span className="tramo__reparto">100 % al dueño</span>
            </li>
            <li className="tramo tramo--medio">
              <span className="tramo__lluvia">
                {bajo} a {alto} mm
              </span>
              <span className="tramo__reparto">
                {100 - Number(pctMedio)} % al dueño, {pctMedio} % al arrendatario
              </span>
            </li>
            <li className="tramo tramo--bajo">
              <span className="tramo__lluvia">{bajo} mm o menos</span>
              <span className="tramo__reparto">
                {100 - Number(pctBajo)} % al dueño, {pctBajo} % al arrendatario
              </span>
            </li>
          </ol>
        </section>
      </div>

      <div className={s.acciones}>
        {problemas.map((p) => (
          <p key={p} className={s.error}>
            {p}
          </p>
        ))}
        {rol !== "dueño" && (
          <p className={s.aviso}>
            Para firmar, conectá la wallet del dueño (<Direccion valor={config.cuentas.dueno} />).
          </p>
        )}
        <button
          type="button"
          className={s.boton}
          disabled={rol !== "dueño" || problemas.length > 0 || tx.ocupado}
          onClick={crear}
        >
          Firmar y crear el alquiler
        </button>
        <EstadoTransaccion {...tx} />
        {creado && (
          <div className={s.resultado}>
            <p>
              <strong>Alquiler #{creado} creado.</strong> Mandale este link al arrendatario para que lea las condiciones y
              deposite:
            </p>
            <p>
              <Link href={`/alquiler/${creado}`}>{linkArrendatario}</Link>{" "}
              <button
                type="button"
                className={s.botonSecundario}
                onClick={() => navigator.clipboard.writeText(linkArrendatario)}
              >
                Copiar
              </button>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
