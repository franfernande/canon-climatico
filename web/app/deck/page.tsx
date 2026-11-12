import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GraficoLluvia } from "@/components/GraficoLluvia";
import { TarjetaAlquiler } from "@/components/TarjetaAlquiler";
import { leerDatos, mm, mmEntero, tramoDe } from "@/lib/datos";
import type { Tramo } from "@/lib/tipos";
import s from "./deck.module.css";

export const metadata: Metadata = {
  title: "Canon Climático · Pitch",
  description: "Pitch de Canon Climático en siete slides, para el track Blockchain de Avalanche.",
};

const TOTAL = 7;

function Slide({ n, oscura = false, children }: { n: number; oscura?: boolean; children: ReactNode }) {
  return (
    <section className={oscura ? `${s.slide} ${s.oscura}` : s.slide} aria-label={`Slide ${n} de ${TOTAL}`}>
      {children}
      <footer className={s.pie}>
        <span>Canon Climático · Track Blockchain de Avalanche · Hackathon Argentina Space 2026</span>
        <span>
          {n} / {TOTAL}
        </span>
      </footer>
    </section>
  );
}

export default function Deck() {
  const datos = leerDatos();
  if (!datos) {
    return (
      <main className="contenedor">
        <p>Faltan los datos de la página. Corré <code>npm run web:datos</code> en la raíz del repo.</p>
      </main>
    );
  }

  const { umbrales, historia, alquileres, contrato, punto } = datos;
  const ejemplo = alquileres[0] ?? { pctMedio: 20, pctBajo: 50 };
  const cuantas = (tramo: Tramo) => historia.filter((c) => tramoDe(c.lluviaDecimasMm, umbrales) === tramo).length;
  const seca = historia.find((c) => c.campania === "2024/25");
  const masSecas = seca ? historia.filter((c) => c.lluviaDecimasMm < seca.lluviaDecimasMm).length : 0;
  const liquidados = alquileres.filter((a) => a.estado === "Liquidado").length;

  return (
    <main className={s.deck}>
      <Slide n={1} oscura>
        <p className={s.marca}>Canon Climático</p>
        <div className={s.columnas}>
          <div>
            <h1 className={s.titulo}>En Anta, si hay sequía, el arrendatario paga el alquiler igual.</h1>
            <ul className={s.lista}>
              <li>
                La soja y el poroto se siembran a secano. El lote se alquila a un valor fijo: anticipo al firmar y saldo
                en la cosecha.
              </li>
              {seca && (
                <li>
                  En 2024/25 llovieron <strong>{mm(seca.lluviaDecimasMm)}</strong> en diciembre y enero. Solo {masSecas}{" "}
                  de las {historia.length} campañas entre {historia[0].campania} y {historia[historia.length - 1].campania}{" "}
                  fueron más secas.
                </li>
              )}
              <li>
                Hay tres formas de compartir el riesgo y ninguna se ejecuta sola: aparcería, cláusula climática y teoría
                de la imprevisión.
              </li>
            </ul>
          </div>
          <div className={s.figura}>
            <GraficoLluvia historia={historia} umbrales={umbrales} destacadas={["2024/25"]} />
            <p className={s.epigrafe}>
              Lluvia de diciembre y enero en Anta ({punto.latitud.toLocaleString("es-AR")},{" "}
              {punto.longitud.toLocaleString("es-AR")}), por campaña. En rojo, las {cuantas("bajo")} de{" "}
              {mmEntero(umbrales.bajo)} o menos; con borde, 2024/25. Fuente: NASA POWER.
            </p>
          </div>
        </div>
      </Slide>

      <Slide n={2}>
        <p className={s.marca}>La solución</p>
        <h2 className={s.titulo}>El saldo del alquiler se reparte solo, según la lluvia que mide un satélite.</h2>
        <p className={s.bajada}>
          Cuando la lluvia de diciembre y enero en el lote queda por debajo del umbral acordado, el contrato le devuelve
          al arrendatario una parte del saldo que depositó. Si no, le paga el saldo completo al dueño.
        </p>
        <ol className={`tramos ${s.tramos}`}>
          <li className="tramo tramo--alto">
            <span className="tramo__lluvia">Más de {mmEntero(umbrales.alto)}</span>
            <span className="tramo__reparto">
              100 % al dueño · {cuantas("alto")} de {historia.length} campañas
            </span>
          </li>
          <li className="tramo tramo--medio">
            <span className="tramo__lluvia">
              {mmEntero(umbrales.bajo)} a {mmEntero(umbrales.alto)}
            </span>
            <span className="tramo__reparto">
              {100 - ejemplo.pctMedio} % al dueño, {ejemplo.pctMedio} % al arrendatario · {cuantas("medio")} campañas
            </span>
          </li>
          <li className="tramo tramo--bajo">
            <span className="tramo__lluvia">{mmEntero(umbrales.bajo)} o menos</span>
            <span className="tramo__reparto">
              {100 - ejemplo.pctBajo} % al dueño, {ejemplo.pctBajo} % al arrendatario · {cuantas("bajo")} campañas
            </span>
          </li>
        </ol>
        <ul className={`${s.lista} ${s.suave}`}>
          <li>El anticipo se paga como siempre, por fuera del contrato. Para el dueño, el saldo existe desde el primer día.</li>
          <li>Los porcentajes los fijan las partes al firmar. Los umbrales salen de la historia de la misma fuente.</li>
        </ul>
      </Slide>

      <Slide n={3}>
        <p className={s.marca}>Cómo funciona</p>
        <h2 className={s.titulo}>Del dato satelital al contrato en Avalanche.</h2>
        <div className={s.cajas}>
          <div className={s.caja}>
            <h3>NASA POWER</h3>
            <p>
              Lluvia mensual corregida (<code>PRECTOTCORR_SUM</code>) del punto del lote. Es gratis, no pide clave y
              cubre cualquier punto del planeta.
            </p>
          </div>
          <span className={s.flecha} aria-hidden="true">
            →
          </span>
          <div className={s.caja}>
            <h3>Relayer</h3>
            <p>
              Al cerrar la ventana pide el dato, guarda el JSON tal como llegó, calcula su SHA-256 y llama a{" "}
              <code>liquidar</code>. No puede ser el dueño ni el arrendatario.
            </p>
          </div>
          <span className={s.flecha} aria-hidden="true">
            →
          </span>
          <div className={s.caja}>
            <h3>Contrato en Fuji</h3>
            <p>
              Calcula el tramo y anota lo que le toca a cada parte. Cada una lo cobra con <code>retirar</code>, así
              ninguna puede trabar el cobro de la otra.
            </p>
          </div>
        </div>
        <ol className={s.flujo}>
          <li>
            <code>crear</code>
            <span>El dueño fija el punto, la ventana, los umbrales y el reparto.</span>
            <span className={s.donde}>Pantalla del dueño, con su wallet</span>
          </li>
          <li>
            <code>depositar</code>
            <span>El arrendatario pone el saldo y con eso acepta.</span>
            <span className={s.donde}>Pantalla del arrendatario, con su wallet</span>
          </li>
          <li>
            <code>liquidar</code>
            <span>El relayer publica la lluvia y el hash del dato.</span>
            <span className={s.donde}>Script del relayer, sin pantalla</span>
          </li>
          <li>
            <code>retirar</code>
            <span>Cada parte cobra lo que tiene anotado.</span>
            <span className={s.donde}>Pantalla de cobro, cada uno con su wallet</span>
          </li>
        </ol>
        <p className={s.nota}>
          Si a los 60 días del fin de la ventana nadie liquidó, cualquiera puede llamar a <code>reembolsar</code>, que
          reparte el saldo según el tramo medio.
        </p>
      </Slide>

      <Slide n={4}>
        <p className={s.marca}>Las 4 preguntas del track</p>
        <h2 className={s.titulo}>Por qué blockchain</h2>
        <div className={s.preguntas}>
          <div>
            <h3>¿Quién desconfía de quién?</h3>
            <p>
              El dueño teme no cobrar el saldo en un año malo. El arrendatario teme pagar el alquiler entero en una
              sequía, o que el dueño no le devuelva su parte.
            </p>
          </div>
          <div>
            <h3>¿Qué evento queda en la cadena?</h3>
            <p>
              Al cierre de la ventana, el contrato reparte el depósito según la lluvia. Las condiciones ya estaban
              escritas desde la firma.
            </p>
          </div>
          <div>
            <h3>¿Qué pasa si el dato miente?</h3>
            <p>
              Fuente, punto, ventana, umbrales y relayer quedan fijos y públicos al crear el contrato. El relayer
              publica la lluvia con el SHA-256 del JSON de NASA POWER, y cualquiera comprueba el hash, los valores y la
              suma. Una mentira queda a la vista y firmada por su dirección.
            </p>
          </div>
          <div>
            <h3>¿Quién paga y quién cobra?</h3>
            <p>
              El arrendatario paga una comisión por contrato, porque es quien compra la protección. Cobra Canon
              Climático. El monto es un supuesto que hay que validar con usuarios.
            </p>
          </div>
        </div>
        <p className={s.comparacion}>
          Con una cláusula en papel, el reparto depende de que dos partes con intereses opuestos se pongan de acuerdo
          después de la sequía. Con el contrato, la regla queda escrita al firmar y la plata ya está adentro.
        </p>
      </Slide>

      <Slide n={5}>
        <p className={s.marca}>Demo en Avalanche Fuji</p>
        <h2 className={s.titulo}>Cada parte firma desde su wallet</h2>
        <ol className={s.pantallas}>
          <li>
            <strong>1. Wallets</strong>
            <span>Se conecta Core o MetaMask, en la red Fuji.</span>
            <span className={s.botonFalso}>Conectar MetaMask</span>
          </li>
          <li>
            <strong>2. Pantalla del dueño</strong>
            <span>Elige campaña, saldo, umbrales y porcentajes.</span>
            <span className={s.botonFalso}>Firmar y crear el alquiler</span>
          </li>
          <li>
            <strong>3. Pantalla del arrendatario</strong>
            <span>Lee las condiciones en la cadena y las acepta.</span>
            <span className={s.botonFalso}>Depositar y aceptar</span>
          </li>
          <li>
            <strong>4. Pantalla de cobro</strong>
            <span>Después del relayer, cada uno retira lo suyo.</span>
            <span className={s.botonFalso}>Retirar</span>
          </li>
        </ol>
        {contrato && (
          <p className={s.contrato}>
            {liquidados} contratos liquidados en el contrato <a href={contrato.link}>{contrato.direccion}</a>, con la
            lluvia real de NASA POWER:
          </p>
        )}
        <div className={s.tarjetas}>
          {alquileres
            .filter((a) => a.estado === "Liquidado")
            .map((a) => (
              <TarjetaAlquiler key={a.id} a={a} />
            ))}
        </div>
        <p className={s.nota}>
          Cualquiera lo comprueba sin claves con <code>npm run verificar -- 1</code>: el hash, los valores y la suma.
        </p>
      </Slide>

      <Slide n={6}>
        <p className={s.marca}>Modelo</p>
        <h2 className={s.titulo}>Quién paga y quién cobra</h2>
        <div className={s.columnas}>
          <dl className={s.modelo}>
            <div>
              <dt>Quién lo usa</dt>
              <dd>El dueño del campo y el arrendatario, en zonas de secano con riesgo de sequía, como Anta.</dd>
            </div>
            <div>
              <dt>Quién paga</dt>
              <dd>
                El arrendatario, con una comisión por cada contrato liquidado. <em>Supuesto.</em>
              </dd>
            </div>
            <div>
              <dt>Por dónde llega</dt>
              <dd>
                Corredores rurales y administradoras de campos, que ya redactan estos contratos. <em>Supuesto.</em>
              </dd>
            </div>
            <div>
              <dt>Costo de operar</dt>
              <dd>El gas en Avalanche y un relayer. El dato es gratis.</dd>
            </div>
          </dl>
          <table className={s.tabla}>
            <caption>Contra qué compite</caption>
            <thead>
              <tr>
                <th scope="col">Lo que se usa hoy</th>
                <th scope="col">Dónde falla</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alquiler fijo con anticipo</td>
                <td>El arrendatario carga con todo el riesgo</td>
              </tr>
              <tr>
                <td>Aparcería</td>
                <td>Depende de lo que el arrendatario declare que cosechó</td>
              </tr>
              <tr>
                <td>Cláusula climática (CREA)</td>
                <td>El ajuste se acuerda después del evento</td>
              </tr>
              <tr>
                <td>Teoría de la imprevisión</td>
                <td>Es un reclamo, lento y caro</td>
              </tr>
              <tr>
                <td>Escribano o fideicomiso</td>
                <td>Un tercero custodia la plata, aplica la regla y cobra por hacerlo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Slide>

      <Slide n={7}>
        <p className={s.marca}>Próximos pasos y fuentes</p>
        <h2 className={s.titulo}>Lo que sigue</h2>
        <div className={s.columnas}>
          <div>
            <h3>Próximos pasos</h3>
            <ul className={s.lista}>
              <li>Expresar el saldo en quintales de soja, con el precio pizarra.</li>
              <li>Una segunda fuente de lluvia o varios relayers, con mediana y plazo de disputa.</li>
              <li>Medir la superficie sembrada con Sentinel-2, como plantea la cláusula de CREA.</li>
              <li>Que el dueño cargue la wallet del arrendatario y cada parte use la suya.</li>
              <li>Pagar en USDC.</li>
            </ul>
          </div>
          <div>
            <h3>Supuestos y límites</h3>
            <ul className={s.lista}>
              <li>Es un índice, no una medición del lote: la grilla de NASA POWER es de 0,5° × 0,625°.</li>
              <li>La ventana de diciembre y enero hay que confirmarla con productores.</li>
              <li>Que las partes acepten una stablecoin es un supuesto.</li>
              <li>En el MVP hay un solo relayer, y las wallets de la demo son fijas.</li>
            </ul>
          </div>
        </div>
        <div className={s.fuentes}>
          <p>
            Datos: NASA POWER, lluvia mensual corregida (PRECTOTCORR_SUM). «These data were obtained from the NASA
            Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.»
          </p>
          <p>
            <a href="https://www.contenidoscrea.org.ar/agricultura/desastre-agropecuario-clausulas-climaticas-contratos-arrendamientos-n5328137">
              Contenidos CREA
            </a>
            , cláusulas climáticas en contratos de arrendamiento ·{" "}
            <a href="https://news.agrofy.com.ar/noticia/214504/que-pasa-alquiler-zonas-inundadas-pago-hectarea-efectiva-y-ajuste-mensual-imagenes">
              Agrofy News
            </a>
            , pago por hectárea efectiva con imágenes satelitales ·{" "}
            <a href="https://build.avax.network/docs/primary-network">Documentación de Avalanche</a>
          </p>
          <p>
            Código: <a href="https://github.com/franfernande/canon-climatico">github.com/franfernande/canon-climatico</a>
          </p>
        </div>
      </Slide>
    </main>
  );
}
