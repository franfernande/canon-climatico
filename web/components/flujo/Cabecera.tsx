"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelWallet } from "./Wallet";
import s from "./flujo.module.css";

const PASOS = [
  { href: "/proceso", texto: "1. Wallets", activo: (r: string) => r === "/proceso" },
  { href: "/crear", texto: "2. Crear (dueño)", activo: (r: string) => r === "/crear" },
  { href: "/proceso#alquileres", texto: "3. Depositar (arrendatario)", activo: (r: string) => r.startsWith("/alquiler") },
  { href: "/cobrar", texto: "4. Cobrar", activo: (r: string) => r === "/cobrar" },
];

export function Cabecera() {
  const ruta = usePathname();
  return (
    <header className={s.cabecera}>
      <div className={s.cabeceraFila}>
        <Link href="/" className={s.marca}>
          AgroRenta
        </Link>
        <PanelWallet />
      </div>
      <nav aria-label="Pasos del alquiler" className={s.pasos}>
        {PASOS.map((p) => (
          <Link key={p.href} href={p.href} className={p.activo(ruta) ? s.pasoActivo : s.paso}>
            {p.texto}
          </Link>
        ))}
      </nav>
    </header>
  );
}
