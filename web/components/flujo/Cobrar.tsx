"use client";

import { formatEther } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { explicarError, proveedorDeLectura } from "@/lib/cadena";
import { avax } from "@/lib/formato";
import { Direccion, EstadoTransaccion, useFlujo, useTransaccion } from "./Wallet";
import s from "./flujo.module.css";

type Cuenta = { pendiente: bigint; saldo: bigint };

export function Cobrar() {
  const { config, contrato, cuenta, firmante } = useFlujo();
  const tx = useTransaccion();
  const [cuentas, setCuentas] = useState<Record<string, Cuenta>>({});
  const [error, setError] = useState<string | null>(null);
  const partes = [
    { rol: "Dueño", direccion: config.cuentas.dueno },
    { rol: "Arrendatario", direccion: config.cuentas.arrendatario },
  ];

  const cargar = useCallback(async () => {
    try {
      const lector = proveedorDeLectura();
      const direcciones = [config.cuentas.dueno, config.cuentas.arrendatario];
      const leidas = await Promise.all(
        direcciones.map(async (d) => ({
          pendiente: (await contrato.getFunction("pendiente")(d)) as bigint,
          saldo: await lector.getBalance(d),
        })),
      );
      setCuentas(Object.fromEntries(direcciones.map((d, i) => [d, leidas[i]])));
      setError(null);
    } catch (e) {
      setError(explicarError(e));
    }
  }, [config.cuentas, contrato]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 5000);
    return () => clearInterval(t);
  }, [cargar]);

  async function retirar() {
    await tx.enviar(async () => {
      await contrato.getFunction("retirar").staticCall({ from: cuenta });
      const conFirma = contrato.connect(await firmante()) as typeof contrato;
      return conFirma.getFunction("retirar")();
    });
    await cargar();
  }

  return (
    <>
      <p className={s.etiqueta}>Pantalla de cobro</p>
      <h1 className={s.titulo}>Cobrar</h1>
      <p className={s.bajada}>
        Al liquidar, el contrato no manda la plata: anota cuánto le toca a cada uno. Cada parte la cobra cuando quiere,
        así ninguna puede trabar el cobro de la otra.
      </p>
      {error && <p className={s.error}>{error}</p>}

      <div className={s.columnas}>
        {partes.map((p) => {
          const c = cuentas[p.direccion];
          const esta = cuenta?.toLowerCase() === p.direccion.toLowerCase();
          return (
            <section key={p.rol} className={esta ? s.panelActivo : s.panel} aria-label={p.rol}>
              <h2>{p.rol}</h2>
              <p>
                <Direccion valor={p.direccion} />
              </p>
              <dl className={s.datos}>
                <div>
                  <dt>Para cobrar en el contrato</dt>
                  <dd className={s.monto}>{c ? avax(formatEther(c.pendiente)) : "…"}</dd>
                </div>
                <div>
                  <dt>Saldo de la wallet</dt>
                  <dd>{c ? avax(formatEther(c.saldo)) : "…"}</dd>
                </div>
              </dl>
              {esta ? (
                <button
                  type="button"
                  className={s.boton}
                  disabled={!c || c.pendiente === 0n || tx.ocupado}
                  onClick={retirar}
                >
                  {c && c.pendiente > 0n ? `Retirar ${avax(formatEther(c.pendiente))}` : "No hay nada para cobrar"}
                </button>
              ) : (
                <p className={s.nota}>Para cobrar, conectá esta wallet.</p>
              )}
            </section>
          );
        })}
      </div>
      <EstadoTransaccion {...tx} />
    </>
  );
}
