"use client";

import { formatEther } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { proveedorDeLectura } from "@/lib/cadena";
import { avax } from "@/lib/formato";
import { Direccion, useFlujo } from "./Wallet";
import s from "./flujo.module.css";

type Leido = { custodia: bigint; partes: { wallet: bigint; pendiente: bigint }[] };

/** Saldos leídos de Fuji cada 4 segundos, para ver el antes y el después de cada movimiento. */
export function Saldos() {
  const { config, contrato } = useFlujo();
  const [v, setV] = useState<Leido | null>(null);

  const cargar = useCallback(async () => {
    try {
      const lector = proveedorDeLectura();
      const custodia = await lector.getBalance(config.direccion);
      const partes = await Promise.all(
        [config.cuentas.dueno, config.cuentas.arrendatario].map(async (d) => ({
          wallet: await lector.getBalance(d),
          pendiente: (await contrato.getFunction("pendiente")(d)) as bigint,
        })),
      );
      setV({ custodia, partes });
    } catch {
      // Si falla una lectura, queda el último valor y se reintenta en la próxima vuelta.
    }
  }, [config, contrato]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 4000);
    return () => clearInterval(t);
  }, [cargar]);

  const monto = (wei: bigint | undefined) => (wei === undefined ? "…" : avax(formatEther(wei)));
  const partes = [
    { rol: "dueño", direccion: config.cuentas.dueno },
    { rol: "arrendatario", direccion: config.cuentas.arrendatario },
  ];

  return (
    <section className={s.saldos} aria-label="Saldos en Fuji">
      <div>
        <span className={s.suave}>En custodia en el contrato</span>
        <strong>{monto(v?.custodia)}</strong>
        <Direccion valor={config.direccion} />
      </div>
      {partes.map((p, i) => (
        <div key={p.rol}>
          <span className={s.suave}>Wallet del {p.rol}</span>
          <strong>{monto(v?.partes[i].wallet)}</strong>
          <span className={s.suave}>Para cobrar: {monto(v?.partes[i].pendiente)}</span>
          <Direccion valor={p.direccion} />
        </div>
      ))}
    </section>
  );
}
