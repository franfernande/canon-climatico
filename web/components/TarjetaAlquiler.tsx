import { avax, corto, mm, mmEntero, tramoDe } from "@/lib/datos";
import type { AlquilerWeb } from "@/lib/tipos";

const NOMBRE_TRAMO = { alto: "Tramo alto", medio: "Tramo medio", bajo: "Tramo bajo" };

export function TarjetaAlquiler({ a }: { a: AlquilerWeb }) {
  const umbrales = { bajo: a.umbralBajo, alto: a.umbralAlto };
  const tramo = a.lluviaDecimasMm === null ? null : tramoDe(a.lluviaDecimasMm, umbrales);
  const pctDueno = a.reparto ? 100 - a.reparto.pctArrendatario : null;

  return (
    <article className="tarjeta">
      <header className="tarjeta__cabecera">
        <h3>
          Campaña {a.campania} <span className="tarjeta__id">contrato #{a.id}</span>
        </h3>
        <span className={`estado estado--${a.estado.toLowerCase()}`}>{a.estado}</span>
      </header>

      {a.lluviaDecimasMm !== null && tramo && a.reparto && pctDueno !== null ? (
        <>
          <p className="tarjeta__lluvia">
            <strong>{mm(a.lluviaDecimasMm)}</strong>
            <span className={`chip chip--${tramo}`}>{NOMBRE_TRAMO[tramo]}</span>
          </p>
          <p className="tarjeta__regla">
            {tramo === "alto" && `Más de ${mmEntero(a.umbralAlto)}: el saldo va completo al dueño.`}
            {tramo === "medio" &&
              `Entre ${mmEntero(a.umbralBajo)} y ${mmEntero(a.umbralAlto)}: vuelve ${a.pctMedio} % al arrendatario.`}
            {tramo === "bajo" && `${mmEntero(a.umbralBajo)} o menos: vuelve ${a.pctBajo} % al arrendatario.`}
          </p>
          <div className="reparto" role="img" aria-label={`Dueño ${pctDueno} %, arrendatario ${a.reparto.pctArrendatario} %`}>
            <span className="reparto__dueno" style={{ flexGrow: pctDueno }} />
            {a.reparto.pctArrendatario > 0 && (
              <span className="reparto__arrendatario" style={{ flexGrow: a.reparto.pctArrendatario }} />
            )}
          </div>
          <dl className="reparto__montos">
            <div>
              <dt>Dueño</dt>
              <dd>{avax(a.reparto.alDuenoAvax)}</dd>
            </div>
            <div>
              <dt>Arrendatario</dt>
              <dd>{avax(a.reparto.alArrendatarioAvax)}</dd>
            </div>
          </dl>
        </>
      ) : a.estado === "Reembolsado" && a.reparto ? (
        <p className="tarjeta__espera">
          El relayer no liquidó a tiempo y el saldo se repartió según el tramo medio: {avax(a.reparto.alDuenoAvax)} al
          dueño y {avax(a.reparto.alArrendatarioAvax)} al arrendatario.
        </p>
      ) : (
        <p className="tarjeta__espera">
          {a.estado === "Depositado"
            ? `Saldo de ${avax(a.saldoAvax)} en custodia, hasta que el relayer publique la lluvia.`
            : `Saldo pactado: ${avax(a.saldoAvax)}.`}
        </p>
      )}

      <ul className="tarjeta__links">
        {a.links.crear && (
          <li>
            <a href={a.links.crear}>Firma del dueño</a>
          </li>
        )}
        {a.links.depositar && (
          <li>
            <a href={a.links.depositar}>Depósito del arrendatario</a>
          </li>
        )}
        {a.links.liquidar && (
          <li>
            <a href={a.links.liquidar}>Liquidación</a>
          </li>
        )}
      </ul>

      {a.hashDato && (
        <div className="tarjeta__dato">
          <p>
            Hash del dato en la cadena: <code title={a.hashDato}>{corto(a.hashDato)}</code>
          </p>
          {a.dato?.coincideHash && <p className="ok">El JSON publicado da el mismo hash.</p>}
          {a.dato && (
            <ul className="tarjeta__links tarjeta__links--dato">
              <li>
                <a href={a.dato.ruta} download>
                  JSON del relayer
                </a>
              </li>
              <li>
                <a href={a.dato.url}>Pedirlo de nuevo a NASA POWER</a>
              </li>
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
