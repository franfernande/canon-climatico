"use client";

import { formatEther } from "ethers";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  type AlquilerEnCadena,
  campaniaDeVentana,
  explicarError,
  fecha,
  leerAlquiler,
  proveedorDeLectura,
  reparto,
} from "@/lib/cadena";
import { avax, mm, mmEntero, tramoDe } from "@/lib/formato";
import { Direccion, EstadoTransaccion, useFlujo, useTransaccion } from "./Wallet";
import s from "./flujo.module.css";

const NOMBRE_TRAMO = { alto: "Tramo alto", medio: "Tramo medio", bajo: "Tramo bajo" };

export function VistaAlquiler({ id }: { id: number }) {
  const { config, contrato, cuenta, firmante } = useFlujo();
  const tx = useTransaccion();
  const [a, setA] = useState<AlquilerEnCadena | null>(null);
  const [saldoArrendatario, setSaldoArrendatario] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const leido = await leerAlquiler(contrato, id);
      setA(leido);
      setSaldoArrendatario(await proveedorDeLectura().getBalance(leido.arrendatario));
      setError(null);
    } catch (e) {
      setError(explicarError(e));
    }
  }, [contrato, id]);

  // Se relee cada 5 segundos: cuando el relayer liquida, la pantalla cambia sola.
  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 5000);
    return () => clearInterval(t);
  }, [cargar]);

  if (!Number.isInteger(id) || id < 1) return <p className={s.error}>Ese número de alquiler no es válido.</p>;
  if (!a) return <p className={error ? s.error : s.espera}>{error ?? "Leyendo el alquiler en Fuji…"}</p>;

  const esArrendatario = cuenta?.toLowerCase() === a.arrendatario.toLowerCase();
  const vencido = Date.now() / 1000 > a.plazoDeposito;
  const umbrales = { bajo: a.umbralBajo, alto: a.umbralAlto };

  async function depositar() {
    if (!a) return;
    await tx.enviar(async () => {
      await contrato.getFunction("depositar").staticCall(id, { from: cuenta, value: a.saldo });
      const conFirma = contrato.connect(await firmante()) as typeof contrato;
      return conFirma.getFunction("depositar")(id, { value: a.saldo });
    });
    await cargar();
  }

  return (
    <>
      <p className={s.etiqueta}>Pantalla del arrendatario</p>
      <div className={s.encabezado}>
        <h1 className={s.titulo}>
          Alquiler #{id} · campaña {campaniaDeVentana(a.inicioVentana)}
        </h1>
        <span className={`estado estado--${a.estado.toLowerCase()}`}>{a.estado}</span>
      </div>
      <p className={s.bajada}>
        Estas son las condiciones tal como están en el contrato. Nadie las puede cambiar: al depositar, el arrendatario
        las acepta.
      </p>

      <div className={s.columnas}>
        <section className={s.panel} aria-labelledby="partes">
          <h2 id="partes">Las condiciones</h2>
          <dl className={s.datos}>
            <div>
              <dt>Dueño</dt>
              <dd>
                <Direccion valor={a.dueno} />
              </dd>
            </div>
            <div>
              <dt>Arrendatario</dt>
              <dd>
                <Direccion valor={a.arrendatario} />
              </dd>
            </div>
            <div>
              <dt>Relayer (informa la lluvia)</dt>
              <dd>
                <Direccion valor={a.relayer} />
              </dd>
            </div>
            <div>
              <dt>Saldo a depositar</dt>
              <dd>
                <strong>{avax(formatEther(a.saldo))}</strong>
              </dd>
            </div>
            <div>
              <dt>Lote</dt>
              <dd>
                {(a.latitudE4 / 10_000).toLocaleString("es-AR")}, {(a.longitudE4 / 10_000).toLocaleString("es-AR")}
              </dd>
            </div>
            <div>
              <dt>Dato</dt>
              <dd>{a.fuente}</dd>
            </div>
            <div>
              <dt>Ventana de lluvia</dt>
              <dd>
                {fecha(a.inicioVentana)} al {fecha(a.finVentana - 1)}
              </dd>
            </div>
            <div>
              <dt>Plazo para depositar</dt>
              <dd>{fecha(a.plazoDeposito)}</dd>
            </div>
            <div>
              <dt>Contrato</dt>
              <dd>
                <Direccion valor={config.direccion} />
              </dd>
            </div>
          </dl>
        </section>

        <section className={s.panel} aria-labelledby="reparto">
          <h2 id="reparto">Cómo se reparte el saldo</h2>
          <ol className="tramos">
            <li className="tramo tramo--alto">
              <span className="tramo__lluvia">Más de {mmEntero(a.umbralAlto)}</span>
              <span className="tramo__reparto">100 % al dueño</span>
            </li>
            <li className="tramo tramo--medio">
              <span className="tramo__lluvia">
                {mmEntero(a.umbralBajo)} a {mmEntero(a.umbralAlto)}
              </span>
              <span className="tramo__reparto">
                {100 - a.pctMedio} % al dueño, {a.pctMedio} % al arrendatario
              </span>
            </li>
            <li className="tramo tramo--bajo">
              <span className="tramo__lluvia">{mmEntero(a.umbralBajo)} o menos</span>
              <span className="tramo__reparto">
                {100 - a.pctBajo} % al dueño, {a.pctBajo} % al arrendatario
              </span>
            </li>
          </ol>
        </section>
      </div>

      <section className={s.acciones} aria-live="polite">
        {a.estado === "Creado" && (
          <>
            <h2>Depositar y aceptar</h2>
            {vencido ? (
              <p className={s.error}>Venció el plazo para depositar. El dueño puede cancelar el alquiler.</p>
            ) : (
              <>
                <p>
                  El arrendatario manda el saldo al contrato, no al dueño. El contrato lo guarda hasta que el relayer
                  publique la lluvia.
                </p>
                {!esArrendatario && (
                  <p className={s.aviso}>
                    Para depositar, conectá la wallet del arrendatario (<Direccion valor={a.arrendatario} />).
                  </p>
                )}
                {saldoArrendatario !== null && saldoArrendatario <= a.saldo && (
                  <p className={s.aviso}>
                    La wallet del arrendatario tiene {avax(formatEther(saldoArrendatario))}: no alcanza para el saldo y
                    el gas. Cargá AVAX de prueba en el faucet.
                  </p>
                )}
                <button
                  type="button"
                  className={s.boton}
                  disabled={!esArrendatario || tx.ocupado}
                  onClick={depositar}
                >
                  Depositar {avax(formatEther(a.saldo))} y aceptar
                </button>
              </>
            )}
            <EstadoTransaccion {...tx} />
          </>
        )}

        {a.estado === "Depositado" && (
          <>
            <EstadoTransaccion {...tx} />
            <h2>El saldo está en custodia</h2>
            <p>
              El contrato tiene {avax(formatEther(a.saldo))}. Cuando cierre la ventana, el relayer le pide la lluvia a
              NASA POWER y la publica. En la demo se corre en la terminal:
            </p>
            <pre className={s.codigo}>
              $env:IDS=&quot;{id}&quot;; npm run relayer:fuji
            </pre>
            <p className={s.nota}>Esta pantalla se actualiza sola cuando llega la liquidación.</p>
          </>
        )}

        {a.estado === "Liquidado" && (
          <Liquidacion a={a} umbrales={umbrales} />
        )}

        {(a.estado === "Cancelado" || a.estado === "Reembolsado") && (
          <p>
            {a.estado === "Cancelado"
              ? "El dueño canceló el alquiler porque nadie depositó a tiempo."
              : "El relayer no liquidó a tiempo y el saldo se repartió según el tramo medio."}{" "}
            <Link href="/cobrar">Ir a cobrar</Link>
          </p>
        )}
      </section>
    </>
  );
}

function Liquidacion({ a, umbrales }: { a: AlquilerEnCadena; umbrales: { bajo: number; alto: number } }) {
  const tramo = tramoDe(a.lluviaDecimasMm, umbrales);
  const r = reparto(a);
  const pctDueno = 100 - r.pctArrendatario;
  return (
    <>
      <h2>Liquidado con la lluvia de NASA POWER</h2>
      <p className="tarjeta__lluvia">
        <strong>{mm(a.lluviaDecimasMm)}</strong>
        <span className={`chip chip--${tramo}`}>{NOMBRE_TRAMO[tramo]}</span>
      </p>
      <div className="reparto" role="img" aria-label={`Dueño ${pctDueno} %, arrendatario ${r.pctArrendatario} %`}>
        <span className="reparto__dueno" style={{ flexGrow: pctDueno }} />
        {r.pctArrendatario > 0 && <span className="reparto__arrendatario" style={{ flexGrow: r.pctArrendatario }} />}
      </div>
      <dl className="reparto__montos">
        <div>
          <dt>Dueño</dt>
          <dd>{avax(formatEther(r.alDueno))}</dd>
        </div>
        <div>
          <dt>Arrendatario</dt>
          <dd>{avax(formatEther(r.alArrendatario))}</dd>
        </div>
      </dl>
      <p className={s.nota}>
        Hash del dato en la cadena: <code>{a.hashDato}</code>
      </p>
      <p>
        La plata ya está anotada para cada uno. <Link href="/cobrar">Ir a cobrar</Link>
      </p>
    </>
  );
}
