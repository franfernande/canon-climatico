"use client";

import { formatEther } from "ethers";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type AlquilerEnCadena, campaniaDeVentana, explicarError, leerAlquiler, proveedorDeLectura } from "@/lib/cadena";
import { avax } from "@/lib/formato";
import { Direccion, useFlujo } from "./Wallet";
import s from "./flujo.module.css";

export function Proceso() {
  const { config, contrato, cuenta } = useFlujo();
  const [saldos, setSaldos] = useState<Record<string, string>>({});
  const [alquileres, setAlquileres] = useState<AlquilerEnCadena[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const lector = proveedorDeLectura();
      const cuentas = Object.values(config.cuentas);
      const montos = await Promise.all(cuentas.map((c) => lector.getBalance(c)));
      setSaldos(Object.fromEntries(cuentas.map((c, i) => [c, formatEther(montos[i])])));
      const cantidad = Number(await contrato.getFunction("cantidad")());
      const ids = Array.from({ length: cantidad }, (_, i) => cantidad - i);
      setAlquileres(await Promise.all(ids.map((id) => leerAlquiler(contrato, id))));
      setError(null);
    } catch (e) {
      setError(explicarError(e));
    }
  }, [config.cuentas, contrato]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 10_000);
    return () => clearInterval(t);
  }, [cargar]);

  const wallets = [
    { rol: "Dueño", direccion: config.cuentas.dueno, hace: "Crea el alquiler con las condiciones y cobra su parte." },
    { rol: "Arrendatario", direccion: config.cuentas.arrendatario, hace: "Lee las condiciones, deposita el saldo y cobra su parte." },
    { rol: "Relayer", direccion: config.cuentas.relayer, hace: "Publica la lluvia de NASA POWER al cerrar la ventana. En la demo firma desde su wallet." },
  ];

  return (
    <>
      <h1 className={s.titulo}>Probar el flujo con wallets</h1>
      <p className={s.bajada}>
        Cada parte firma desde su propia wallet. El contrato guarda la plata y la reparte según la lluvia: nadie tiene
        que confiar en el otro.
      </p>

      <ol className={s.listaPasos}>
        <li>
          <strong>Conectá la wallet</strong> con el botón de arriba (Core o MetaMask, en la red Fuji).
        </li>
        <li>
          <strong>El dueño crea el alquiler</strong> en <Link href="/crear">Crear</Link>: el saldo, la campaña y los
          tramos. Le queda un link para mandarle al arrendatario.
        </li>
        <li>
          <strong>El arrendatario abre ese link</strong>, lee las condiciones y deposita el saldo. Con eso las acepta.
        </li>
        <li>
          <strong>El relayer publica la lluvia</strong> y cada uno cobra lo suyo en <Link href="/cobrar">Cobrar</Link>.
        </li>
      </ol>

      <section aria-labelledby="wallets">
        <h2 id="wallets">Las tres wallets de la demo</h2>
        <p className={s.nota}>
          En esta versión de prueba las direcciones están fijas y no se pueden cambiar: para hacer cada paso, elegí en tu
          wallet la cuenta que corresponde. En el producto, el dueño cargaría la dirección del arrendatario y cada uno
          usaría la suya.
        </p>
        <div className={s.tabla}>
          {wallets.map((w) => (
            <div key={w.rol} className={cuenta?.toLowerCase() === w.direccion.toLowerCase() ? s.filaActiva : s.fila}>
              <strong>{w.rol}</strong>
              <Direccion valor={w.direccion} />
              <span>{saldos[w.direccion] ? avax(saldos[w.direccion]) : "…"}</span>
              <span className={s.suave}>{w.hace}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="alquileres" id="alquileres">
        <h2>Alquileres en el contrato</h2>
        {error && <p className={s.error}>{error}</p>}
        {!alquileres ? (
          <p className={s.espera}>Leyendo el contrato en Fuji…</p>
        ) : (
          <div className={s.tabla}>
            {alquileres.map((a) => (
              <div key={a.id} className={s.fila}>
                <strong>#{a.id}</strong>
                <span>Campaña {campaniaDeVentana(a.inicioVentana)}</span>
                <span className={`estado estado--${a.estado.toLowerCase()}`}>{a.estado}</span>
                <span>{avax(formatEther(a.saldo))}</span>
                <Link href={`/alquiler/${a.id}`}>Abrir</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
