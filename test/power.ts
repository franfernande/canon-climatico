import { expect } from "chai";
import { readFileSync } from "node:fs";
import {
  ANTA,
  inicioDeMes,
  lluviaDecimasMm,
  mesesDeVentana,
  urlParaVentana,
  ventanaDeCampania,
} from "../scripts/lib/power.ts";

const historia: unknown = JSON.parse(readFileSync("sample-data/nasa-power-anta-2004-2025.json", "utf8"));

// Lluvia de diciembre y enero por campaña, en décimas de mm, como en la tabla del README.
const TABLA_README: Record<number, number> = {
  2004: 2402, 2005: 3359, 2006: 4193, 2007: 3934, 2008: 3045, 2009: 2609, 2010: 3449,
  2011: 3081, 2012: 2667, 2013: 3623, 2014: 2870, 2015: 3052, 2016: 2406, 2017: 3173,
  2018: 3052, 2019: 3719, 2020: 2481, 2021: 3448, 2022: 2544, 2023: 3236, 2024: 2432,
};

describe("Dato de NASA POWER", function () {
  it("la ventana de una campaña es diciembre y enero, en hora argentina", function () {
    const { inicio, fin } = ventanaDeCampania(2024);
    expect(new Date(inicio * 1000).toISOString()).to.equal("2024-12-01T03:00:00.000Z");
    expect(new Date(fin * 1000).toISOString()).to.equal("2025-02-01T03:00:00.000Z");
    expect(mesesDeVentana(inicio, fin)).to.deep.equal(["202412", "202501"]);
  });

  it("rechaza ventanas que no empiezan el día 1 de un mes", function () {
    const { fin } = ventanaDeCampania(2024);
    expect(() => mesesDeVentana(inicioDeMes(2024, 12) + 3600, fin)).to.throw("día 1");
  });

  it("arma la misma URL que el README, para los años de la ventana", function () {
    const { inicio, fin } = ventanaDeCampania(2024);
    expect(urlParaVentana(ANTA.latitudE4, ANTA.longitudE4, mesesDeVentana(inicio, fin))).to.equal(
      "https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR_SUM&community=AG" +
        "&longitude=-64.13&latitude=-25.12&start=2024&end=2025&format=JSON",
    );
  });

  it("reproduce la lluvia de las 21 campañas de la tabla", function () {
    for (const [anio, esperado] of Object.entries(TABLA_README)) {
      const { inicio, fin } = ventanaDeCampania(Number(anio));
      expect(lluviaDecimasMm(historia, mesesDeVentana(inicio, fin)), `campaña ${anio}`).to.equal(esperado);
    }
  });

  it("falla si falta un mes en la respuesta", function () {
    expect(() => lluviaDecimasMm(historia, ["203001"])).to.throw("203001");
  });
});
