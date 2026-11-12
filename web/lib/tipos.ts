export type Tramo = "alto" | "medio" | "bajo";

export type Campania = {
  anio: number;
  campania: string;
  lluviaDecimasMm: number;
};

export type AlquilerWeb = {
  id: number;
  campania: string;
  estado: "Creado" | "Depositado" | "Liquidado" | "Cancelado";
  saldoAvax: string;
  umbralBajo: number;
  umbralAlto: number;
  pctMedio: number;
  pctBajo: number;
  lluviaDecimasMm: number | null;
  reparto: { pctArrendatario: number; alDuenoAvax: string; alArrendatarioAvax: string } | null;
  hashDato: string | null;
  /** La respuesta de NASA POWER que usó el relayer, servida por la página. */
  dato: { ruta: string; url: string; coincideHash: boolean } | null;
  cuentas: { dueno: string; arrendatario: string; relayer: string };
  links: { crear: string | null; depositar: string | null; liquidar: string | null };
};

export type DatosWeb = {
  red: string;
  generado: string;
  explorer: string;
  fuente: string;
  punto: { latitud: number; longitud: number };
  umbrales: { bajo: number; alto: number };
  historia: Campania[];
  contrato: { direccion: string; link: string; linkDespliegue: string } | null;
  alquileres: AlquilerWeb[];
};
