import { mm, mmEntero, tramoDe } from "@/lib/datos";
import type { Campania } from "@/lib/tipos";

const ANCHO = 640;
const ALTO = 300;
const MARGEN = { arriba: 16, derecha: 96, abajo: 36, izquierda: 8 };
const MAXIMO_MM = 450;

type Props = {
  historia: Campania[];
  umbrales: { bajo: number; alto: number };
  destacadas: string[];
};

export function GraficoLluvia({ historia, umbrales, destacadas }: Props) {
  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const paso = anchoUtil / historia.length;
  const y = (decimas: number) => MARGEN.arriba + altoUtil * (1 - decimas / 10 / MAXIMO_MM);
  const base = y(0);
  const barras = historia.map((c, i) => ({
    c,
    i,
    tramo: tramoDe(c.lluviaDecimasMm, umbrales),
    destacada: destacadas.includes(c.campania),
    x: MARGEN.izquierda + i * paso + paso * 0.15,
    ancho: paso * 0.7,
  }));

  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-labelledby="grafico-titulo grafico-desc">
        <title id="grafico-titulo">Lluvia de diciembre y enero por campaña en Anta</title>
        <desc id="grafico-desc">
          {`Barras de ${historia[0].campania} a ${historia[historia.length - 1].campania}, con los umbrales de ${mmEntero(umbrales.bajo)} y ${mmEntero(umbrales.alto)}.`}
        </desc>

        {barras.map((b) => (
          <g key={b.c.anio} className={`barra barra--${b.tramo}${b.destacada ? " barra--destacada" : ""}`}>
            <rect x={b.x} y={y(b.c.lluviaDecimasMm)} width={b.ancho} height={base - y(b.c.lluviaDecimasMm)} rx={2}>
              <title>{`${b.c.campania}: ${mm(b.c.lluviaDecimasMm)}`}</title>
            </rect>
            {b.i % 2 === 0 && (
              <text x={b.x + b.ancho / 2} y={ALTO - 10} textAnchor="middle" className="grafico__eje">
                {String(b.c.anio % 100).padStart(2, "0")}
              </text>
            )}
          </g>
        ))}

        {[umbrales.bajo, umbrales.alto].map((u) => (
          <g key={u} className="grafico__umbral">
            <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(u)} y2={y(u)} />
            <text x={ANCHO - MARGEN.derecha + 8} y={y(u) + 4}>
              {mmEntero(u)}
            </text>
          </g>
        ))}
        <line className="grafico__base" x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={base} y2={base} />
      </svg>
      <figcaption>
        Lluvia de diciembre más enero en cada campaña, de 2004/05 a 2024/25. El eje muestra el año en que empieza.
        {destacadas.length > 0 && ` Con borde, las campañas de los contratos: ${destacadas.join(" y ")}.`}
      </figcaption>
      <details>
        <summary>Ver los valores</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Campaña</th>
              <th scope="col">Lluvia</th>
            </tr>
          </thead>
          <tbody>
            {historia.map((c) => (
              <tr key={c.anio}>
                <td>{c.campania}</td>
                <td>{mm(c.lluviaDecimasMm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
