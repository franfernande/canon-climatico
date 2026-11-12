import type { Metadata } from "next";
import type { ReactNode } from "react";
import { leerDatos, mmEntero } from "@/lib/datos";
import s from "./deck.module.css";

export const metadata: Metadata = {
  title: "AgroRenta · Pitch",
  description: "Pitch de AgroRenta, para el track Blockchain de Avalanche.",
};

const TOTAL = 5;

// La portada no lleva número: las slides del pitch son 5, dentro de las 5 a 7 que pide el track.
function Slide({ n, oscura = false, children }: { n: number | null; oscura?: boolean; children: ReactNode }) {
  return (
    <section
      className={oscura ? `${s.slide} ${s.oscura}` : s.slide}
      aria-label={n === null ? "Portada" : `Slide ${n} de ${TOTAL}`}
    >
      {children}
      {n !== null && (
        <footer className={s.pie}>
          <span>AgroRenta · Hackathon Argentina Space 2026</span>
          <span>
            {n} / {TOTAL}
          </span>
        </footer>
      )}
    </section>
  );
}

/** Un satélite mide la lluvia de una nube sobre un lote sembrado, marcado en Anta. */
function Ilustracion() {
  const franjas = 10;
  const horizonte = 290;
  return (
    <svg viewBox="0 0 520 440" className={s.ilustracion} role="img" aria-label="Un satélite mide la lluvia sobre un lote sembrado en Anta">
      {Array.from({ length: franjas }, (_, i) => {
        const arriba = (k: number) => 140 + (k * 240) / franjas;
        const abajo = (k: number) => (k * 520) / franjas;
        return (
          <polygon
            key={i}
            points={`${arriba(i)},${horizonte} ${arriba(i + 1)},${horizonte} ${abajo(i + 1)},440 ${abajo(i)},440`}
            fill={i % 2 === 0 ? "#3f6b35" : "#6b5235"}
          />
        );
      })}
      <polygon points="418,96 268,330 342,330" fill="var(--bajo)" opacity="0.2" />
      <g fill="#8a929c">
        <circle cx="170" cy="150" r="34" />
        <circle cx="215" cy="132" r="44" />
        <circle cx="258" cy="155" r="30" />
        <rect x="170" y="150" width="88" height="34" />
      </g>
      <g stroke="#8cc4ff" strokeWidth="4" strokeLinecap="round">
        {[150, 175, 200, 225, 250].map((x, i) => (
          <line key={x} x1={x + 8} y1={198 + (i % 2) * 14} x2={x} y2={222 + (i % 2) * 14} />
        ))}
        {[160, 190, 220, 245].map((x, i) => (
          <line key={x} x1={x + 8} y1={246 + (i % 2) * 10} x2={x} y2={268 + (i % 2) * 10} />
        ))}
      </g>
      <g transform="rotate(-25 420 72)">
        <rect x="346" y="64" width="56" height="16" fill="#2f5d8a" stroke="#8fb3d9" strokeWidth="2" />
        <rect x="438" y="64" width="56" height="16" fill="#2f5d8a" stroke="#8fb3d9" strokeWidth="2" />
        <path d="M365 64v16M384 64v16M457 64v16M476 64v16" stroke="#8fb3d9" strokeWidth="1.5" />
        <rect x="404" y="56" width="32" height="32" rx="3" fill="#c9ccd1" />
        <path d="M420 88v10" stroke="#c9ccd1" strokeWidth="3" />
        <circle cx="420" cy="101" r="5" fill="#c9ccd1" />
      </g>
      <path
        d="M305 362c-14-18-22-30-22-42a22 22 0 1 1 44 0c0 12-8 24-22 42z"
        fill="var(--bajo)"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="305" cy="320" r="8" fill="#fff" />
      <text x="336" y="326" fill="#e4e6e9" fontSize="16" fontWeight="700">
        Anta, Salta
      </text>
    </svg>
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

  const { umbrales, historia, alquileres } = datos;
  const ejemplo = alquileres[0] ?? { pctMedio: 20, pctBajo: 50 };

  return (
    <main className={s.deck}>
      <Slide n={null} oscura>
        <div className={s.portada}>
          <div>
            <p className={s.marca}>Hackathon Argentina Space 2026 · Track Blockchain</p>
            <h1 className={s.portadaTitulo}>AgroRenta</h1>
            <p className={s.portadaSubtitulo}>
              El alquiler rural que se ajusta con la lluvia.
            </p>
            <ul className={s.portadaDatos}>
              <li>Alquiler de campo en Anta, Salta</li>
              <li>Lluvia de NASA POWER</li>
              <li>Contrato en Avalanche Fuji</li>
            </ul>
          </div>
          <Ilustracion />
        </div>
      </Slide>

      <Slide n={1} oscura>
        <p className={s.marca}>El problema</p>
        <div className={s.problema}>
          <div>
            <h2 className={s.titulo}>Si hay sequía, el arrendatario paga el alquiler igual.</h2>
            <p className={s.contexto}>
              En Anta, Salta, la soja se siembra sin riego. El campo se alquila a valor fijo: anticipo al firmar y saldo
              en la cosecha.
            </p>
          </div>
          <div>
            <p className={s.subtitulo}>Hoy hay tres salidas</p>
            <ul className={s.salidas}>
              <li>
                <strong>Aparcería</strong>
                <span className={s.falla}>Depende de lo que se declare cosechado</span>
              </li>
              <li>
                <strong>Cláusula climática</strong>
                <span className={s.falla}>Se negocia después de la sequía</span>
              </li>
              <li>
                <strong>Teoría de la imprevisión</strong>
                <span className={s.falla}>Es un juicio lento y caro</span>
              </li>
            </ul>
          </div>
        </div>
        <p className={s.conclusion}>Ninguna se ejecuta sola.</p>
      </Slide>

      <Slide n={2}>
        <p className={s.marca}>La solución</p>
        <h2 className={s.titulo}>El saldo va a un contrato y se reparte solo, según la lluvia.</h2>
        <ol className={`tramos ${s.tramos}`}>
          <li className="tramo tramo--alto">
            <span className="tramo__lluvia">Más de {mmEntero(umbrales.alto)}</span>
            <span className="tramo__reparto">Todo al dueño</span>
          </li>
          <li className="tramo tramo--medio">
            <span className="tramo__lluvia">
              {mmEntero(umbrales.bajo)} a {mmEntero(umbrales.alto)}
            </span>
            <span className="tramo__reparto">Vuelve el {ejemplo.pctMedio} % al arrendatario</span>
          </li>
          <li className="tramo tramo--bajo">
            <span className="tramo__lluvia">{mmEntero(umbrales.bajo)} o menos</span>
            <span className="tramo__reparto">Vuelve el {ejemplo.pctBajo} % al arrendatario</span>
          </li>
        </ol>
        <p className={s.nota}>
          Lluvia de diciembre y enero en el lote. Umbrales calculados con {historia.length} campañas de NASA POWER.
        </p>
      </Slide>

      <Slide n={3}>
        <p className={s.marca}>Cómo funciona</p>
        <h2 className={s.titulo}>Tres pasos, sin intermediarios</h2>
        <div className={s.cajas}>
          <div className={s.caja}>
            <h3>1. Firma</h3>
            <p>El dueño fija las condiciones y el arrendatario deposita el saldo en el contrato.</p>
          </div>
          <span className={s.flecha} aria-hidden="true">
            →
          </span>
          <div className={s.caja}>
            <h3>2. Dato</h3>
            <p>Al cerrar enero, el relayer publica la lluvia de NASA POWER y el hash del dato.</p>
          </div>
          <span className={s.flecha} aria-hidden="true">
            →
          </span>
          <div className={s.caja}>
            <h3>3. Reparto</h3>
            <p>El contrato aplica los tramos y cada parte cobra lo suyo desde su wallet.</p>
          </div>
        </div>
      </Slide>

      <Slide n={4}>
        <p className={s.marca}>Las 4 preguntas del track</p>
        <h2 className={s.titulo}>Por qué blockchain</h2>
        <div className={s.preguntas}>
          <div>
            <h3>¿Quién desconfía de quién?</h3>
            <p>El dueño teme no cobrar; el arrendatario, pagar entero en una sequía.</p>
          </div>
          <div>
            <h3>¿Qué queda en la cadena?</h3>
            <p>Las condiciones al firmar y el reparto al cerrar la ventana.</p>
          </div>
          <div>
            <h3>¿Y si el dato miente?</h3>
            <p>El hash del dato queda publicado: cualquiera lo verifica, y la mentira queda firmada.</p>
          </div>
          <div>
            <h3>¿Quién paga?</h3>
            <p>El arrendatario, con una comisión por contrato.</p>
          </div>
        </div>
        <p className={s.comparacion}>
          Con una cláusula en papel, el ajuste se negocia después. Con el contrato, la regla y la plata están desde la
          firma.
        </p>
      </Slide>

      <Slide n={5}>
        <p className={s.marca}>Modelo de negocio</p>
        <h2 className={s.titulo}>Quién paga y quién cobra</h2>
        <div className={s.preguntas}>
          <div>
            <h3>Paga</h3>
            <p>El arrendatario: una comisión por contrato, porque compra la protección.</p>
          </div>
          <div>
            <h3>Cobra</h3>
            <p>AgroRenta.</p>
          </div>
          <div>
            <h3>Canal</h3>
            <p>Corredores rurales y administradoras de campos, que ya redactan estos contratos.</p>
          </div>
          <div>
            <h3>Costo</h3>
            <p>El gas en Avalanche y un relayer. El dato es gratis.</p>
          </div>
        </div>
        <p className={s.nota}>El monto de la comisión y el canal son supuestos a validar con usuarios.</p>
        <p className={s.fuentes}>
          Datos: NASA POWER, lluvia mensual corregida (PRECTOTCORR_SUM). «These data were obtained from the NASA Langley
          Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.» · Código:{" "}
          <a href="https://github.com/franfernande/canon-climatico">github.com/franfernande/canon-climatico</a>
        </p>
      </Slide>
    </main>
  );
}
