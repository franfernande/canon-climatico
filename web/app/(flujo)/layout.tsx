import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cabecera } from "@/components/flujo/Cabecera";
import { ProveedorWallet } from "@/components/flujo/Wallet";
import { leerDatos } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Canon Climático · Probar el flujo",
  description: "El dueño crea el alquiler, el arrendatario deposita y cada uno cobra, cada uno desde su wallet.",
};

export default function LayoutFlujo({ children }: { children: ReactNode }) {
  const datos = leerDatos();
  const cuentas = datos?.alquileres[0]?.cuentas;
  if (!datos || datos.red !== "fuji" || !datos.contrato?.abi || !cuentas) {
    return (
      <main className="contenedor">
        <h1>Canon Climático</h1>
        <p>
          Las pantallas con wallet funcionan en Fuji y necesitan el contrato desplegado con al menos un alquiler. Corré{" "}
          <code>npm run web:datos</code> en la raíz del repo.
        </p>
      </main>
    );
  }

  return (
    <ProveedorWallet
      config={{
        direccion: datos.contrato.direccion,
        abi: datos.contrato.abi,
        explorer: datos.explorer,
        modoDemo: Boolean(datos.contrato.modoDemo),
        fuente: datos.fuente,
        punto: datos.punto,
        cuentas,
      }}
    >
      <Cabecera />
      <main className="contenedor">{children}</main>
    </ProveedorWallet>
  );
}
