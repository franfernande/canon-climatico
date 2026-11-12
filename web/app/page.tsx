import { GraficoLluvia } from "@/components/GraficoLluvia";
import { TarjetaAlquiler } from "@/components/TarjetaAlquiler";
import { corto, leerDatos, mm, mmEntero } from "@/lib/datos";

export default function Inicio() {
  const datos = leerDatos();
  if (!datos) {
    return (
      <main className="contenedor">
        <h1>Canon Climático</h1>
        <p>Faltan los datos de la página. Corré <code>npm run web:datos</code> en la raíz del repo.</p>
      </main>
    );
  }

  const { umbrales, historia, alquileres, contrato } = datos;
  const ejemplo = alquileres[0] ?? { pctMedio: 20, pctBajo: 50 };
  const valores = historia.map((c) => c.lluviaDecimasMm).sort((a, b) => a - b);
  const mediana = valores[Math.floor(valores.length / 2)];

  return (
    <>
      <header className="portada">
        <div className="contenedor">
          <p className="portada__marca">Canon Climático</p>
          <h1>El saldo del alquiler se reparte solo, según la lluvia que mide un satélite.</h1>
          <p className="portada__datos">
            Lote en Anta, Salta ({datos.punto.latitud.toLocaleString("es-AR")}, {datos.punto.longitud.toLocaleString("es-AR")})
            · lluvia de diciembre y enero · NASA POWER · Avalanche Fuji
          </p>
          <p className="portada__accion">
            <a href="/proceso">Probar el flujo con wallets: crear, depositar y cobrar →</a>
          </p>
        </div>
      </header>

      <main className="contenedor">
        <section aria-labelledby="regla">
          <h2 id="regla">La regla, escrita al firmar</h2>
          <ol className="tramos">
            <li className="tramo tramo--alto">
              <span className="tramo__lluvia">Más de {mmEntero(umbrales.alto)}</span>
              <span className="tramo__reparto">100 % al dueño</span>
            </li>
            <li className="tramo tramo--medio">
              <span className="tramo__lluvia">
                {mmEntero(umbrales.bajo)} a {mmEntero(umbrales.alto)}
              </span>
              <span className="tramo__reparto">
                {100 - ejemplo.pctMedio} % al dueño, {ejemplo.pctMedio} % al arrendatario
              </span>
            </li>
            <li className="tramo tramo--bajo">
              <span className="tramo__lluvia">{mmEntero(umbrales.bajo)} o menos</span>
              <span className="tramo__reparto">
                {100 - ejemplo.pctBajo} % al dueño, {ejemplo.pctBajo} % al arrendatario
              </span>
            </li>
          </ol>
        </section>

        <section aria-labelledby="historia">
          <h2 id="historia">21 campañas de lluvia en el lote</h2>
          <p>
            Entre {mm(valores[0])} y {mm(valores[valores.length - 1])}, con una mediana de {mm(mediana)}. Los umbrales
            salen de esta misma historia.
          </p>
          <GraficoLluvia historia={historia} umbrales={umbrales} destacadas={alquileres.map((a) => a.campania)} />
        </section>

        <section aria-labelledby="contratos">
          <h2 id="contratos">Contratos en Avalanche</h2>
          {contrato ? (
            <p>
              Contrato <a href={contrato.link}>{corto(contrato.direccion)}</a> en {datos.red === "fuji" ? "Fuji C-Chain" : datos.red}.
              {contrato.modoDemo &&
                " Está en modo demo para poder usar campañas pasadas: en producción no se puede depositar después de que empieza la ventana."}
            </p>
          ) : (
            <p className="aviso">El contrato todavía no está desplegado en Fuji.</p>
          )}
          <div className="tarjetas">
            {alquileres.map((a) => (
              <TarjetaAlquiler key={a.id} a={a} />
            ))}
          </div>
        </section>

        <section aria-labelledby="verificar">
          <h2 id="verificar">Cómo comprobar el dato</h2>
          <ol className="pasos">
            <li>Bajá el JSON que usó el relayer y calculá su SHA-256: tiene que dar el hash de la cadena.</li>
            <li>Pedí el mismo dato a NASA POWER: los valores de diciembre y enero tienen que ser iguales.</li>
            <li>Sumá los dos meses: tiene que dar la lluvia con la que se liquidó.</li>
          </ol>
          <p>
            En PowerShell: <code>Get-FileHash 1.json -Algorithm SHA256</code>. En el repo,{" "}
            <code>npm run verificar -- 1</code> hace los tres pasos.
          </p>
        </section>
      </main>

      <footer className="pie">
        <div className="contenedor">
          <p>
            Datos: NASA POWER, lluvia mensual corregida (PRECTOTCORR_SUM). «These data were obtained from the NASA Langley
            Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.»
          </p>
          <p>Track Blockchain de Avalanche · Hackathon Argentina Space 2026 · Salta</p>
        </div>
      </footer>
    </>
  );
}
