import { expect } from "chai";
import { network } from "hardhat";
import { readFileSync } from "node:fs";
import {
  ANTA,
  FUENTE,
  lluviaDecimasMm,
  mesesDeVentana,
  sha256,
  ventanaDeCampania,
} from "../scripts/lib/power.ts";

const { ethers, networkHelpers } = await network.create();

const SALDO = ethers.parseEther("1");
const UN_DIA = 24 * 3600;
const ESTADO = { Creado: 0n, Depositado: 1n, Liquidado: 2n, Cancelado: 3n, Reembolsado: 4n };
const PLAZO_LIQUIDACION = 60 * UN_DIA;

const archivo = readFileSync("sample-data/nasa-power-anta-2004-2025.json");
const historia: unknown = JSON.parse(archivo.toString("utf8"));
const HASH = sha256(archivo);

function lluviaDe(anio: number): number {
  const { inicio, fin } = ventanaDeCampania(anio);
  return lluviaDecimasMm(historia, mesesDeVentana(inicio, fin));
}

async function condiciones(arrendatario: string, relayer: string, anio = 2024) {
  const { inicio, fin } = ventanaDeCampania(anio);
  const ahora = await networkHelpers.time.latest();
  return {
    arrendatario,
    relayer,
    saldo: SALDO,
    latitudE4: ANTA.latitudE4,
    longitudE4: ANTA.longitudE4,
    fuente: FUENTE,
    inicioVentana: inicio,
    finVentana: fin,
    plazoDeposito: ahora + 7 * UN_DIA,
    umbralBajo: 2550,
    umbralAlto: 3050,
    pctMedio: 20,
    pctBajo: 50,
  };
}

// Los tests usan campañas pasadas, así que el contrato se despliega en modo demo.
async function desplegado() {
  const [dueno, arrendatario, relayer, otro] = await ethers.getSigners();
  const canon = await ethers.deployContract("CanonClimatico", [true]);
  return { canon, dueno, arrendatario, relayer, otro };
}

async function desplegadoEnProduccion() {
  const [dueno, arrendatario, relayer] = await ethers.getSigners();
  const canon = await ethers.deployContract("CanonClimatico", [false]);
  return { canon, dueno, arrendatario, relayer };
}

/** Un contrato de una campaña futura, depositado: la ventana todavía no cerró. */
async function depositadoCampaniaFutura() {
  const f = await desplegado();
  const ahora = await networkHelpers.time.latest();
  const proximaCampania = new Date(ahora * 1000).getUTCFullYear() + 1;
  const c = await condiciones(f.arrendatario.address, f.relayer.address, proximaCampania);
  await f.canon.connect(f.dueno).crear(c);
  await f.canon.connect(f.arrendatario).depositar(1, { value: SALDO });
  return { ...f, c };
}

async function creado() {
  const f = await desplegado();
  const c = await condiciones(f.arrendatario.address, f.relayer.address);
  await f.canon.connect(f.dueno).crear(c);
  return { ...f, c };
}

async function depositado() {
  const f = await creado();
  await f.canon.connect(f.arrendatario).depositar(1, { value: SALDO });
  return f;
}

describe("CanonClimatico", function () {
  describe("crear", function () {
    it("guarda las condiciones y emite Creado", async function () {
      const { canon, dueno, arrendatario, relayer } = await networkHelpers.loadFixture(desplegado);
      const c = await condiciones(arrendatario.address, relayer.address);

      await expect(canon.connect(dueno).crear(c))
        .to.emit(canon, "Creado")
        .withArgs(1n, dueno.address, arrendatario.address, relayer.address, SALDO);

      const a = await canon.alquiler(1);
      expect(await canon.cantidad()).to.equal(1n);
      expect(a.dueno).to.equal(dueno.address);
      expect(a.estado).to.equal(ESTADO.Creado);
      expect(a.condiciones.fuente).to.equal(FUENTE);
      expect(a.condiciones.latitudE4).to.equal(BigInt(ANTA.latitudE4));
      expect(a.condiciones.umbralBajo).to.equal(2550n);
    });

    it("rechaza condiciones inválidas", async function () {
      const { canon, dueno, arrendatario, relayer } = await networkHelpers.loadFixture(desplegado);
      const base = await condiciones(arrendatario.address, relayer.address);
      const ahora = await networkHelpers.time.latest();

      const casos: [Partial<typeof base>, string][] = [
        [{ arrendatario: ethers.ZeroAddress }, "arrendatario"],
        [{ arrendatario: dueno.address }, "arrendatario"],
        [{ relayer: ethers.ZeroAddress }, "relayer"],
        [{ relayer: dueno.address }, "relayer"],
        [{ relayer: arrendatario.address }, "relayer"],
        [{ saldo: 0n }, "saldo"],
        [{ finVentana: base.inicioVentana }, "ventana"],
        [{ plazoDeposito: ahora }, "plazo"],
        [{ umbralBajo: 3050 }, "umbrales"],
        [{ pctMedio: 60 }, "porcentajes"],
        [{ pctBajo: 101 }, "porcentajes"],
      ];
      for (const [cambio, motivo] of casos) {
        await expect(canon.connect(dueno).crear({ ...base, ...cambio }), motivo)
          .to.be.revertedWithCustomError(canon, "CondicionesInvalidas")
          .withArgs(motivo);
      }
    });

    it("falla al leer un contrato que no existe", async function () {
      const { canon } = await networkHelpers.loadFixture(desplegado);
      await expect(canon.alquiler(9)).to.be.revertedWithCustomError(canon, "NoExiste").withArgs(9n);
    });
  });

  describe("depositar", function () {
    it("el arrendatario acepta enviando el saldo exacto", async function () {
      const { canon, arrendatario } = await networkHelpers.loadFixture(creado);
      const tx = canon.connect(arrendatario).depositar(1, { value: SALDO });

      await expect(tx).to.emit(canon, "Depositado").withArgs(1n, SALDO);
      await expect(tx).to.changeEtherBalances(ethers, [arrendatario, canon], [-SALDO, SALDO]);
      expect((await canon.alquiler(1)).estado).to.equal(ESTADO.Depositado);
    });

    it("rechaza un monto distinto del saldo", async function () {
      const { canon, arrendatario } = await networkHelpers.loadFixture(creado);
      await expect(canon.connect(arrendatario).depositar(1, { value: SALDO - 1n }))
        .to.be.revertedWithCustomError(canon, "MontoIncorrecto")
        .withArgs(SALDO, SALDO - 1n);
    });

    it("solo puede depositar el arrendatario", async function () {
      const { canon, otro } = await networkHelpers.loadFixture(creado);
      await expect(canon.connect(otro).depositar(1, { value: SALDO })).to.be.revertedWithCustomError(
        canon,
        "SoloArrendatario",
      );
    });

    it("no acepta depósitos después del plazo", async function () {
      const { canon, arrendatario, c } = await networkHelpers.loadFixture(creado);
      await networkHelpers.time.increaseTo(c.plazoDeposito + 1);
      await expect(canon.connect(arrendatario).depositar(1, { value: SALDO })).to.be.revertedWithCustomError(
        canon,
        "PlazoVencido",
      );
    });
  });

  describe("liquidar con la lluvia real de NASA POWER", function () {
    it("2024/25: 243,2 mm, el saldo se reparte mitad y mitad", async function () {
      const { canon, dueno, arrendatario, relayer } = await networkHelpers.loadFixture(depositado);
      const lluvia = lluviaDe(2024);
      expect(lluvia).to.equal(2432);

      const tx = canon.connect(relayer).liquidar(1, lluvia, HASH);
      await expect(tx).to.emit(canon, "Liquidado").withArgs(1n, lluvia, HASH, SALDO / 2n, SALDO / 2n);
      // Liquidar solo anota: la plata sigue en el contrato hasta que cada uno la retira.
      await expect(tx).to.changeEtherBalances(ethers, [dueno, arrendatario, canon], [0n, 0n, 0n]);
      expect(await canon.pendiente(dueno.address)).to.equal(SALDO / 2n);
      expect(await canon.pendiente(arrendatario.address)).to.equal(SALDO / 2n);

      await expect(canon.connect(dueno).retirar())
        .to.emit(canon, "Retirado")
        .withArgs(dueno.address, SALDO / 2n);
      await expect(canon.connect(arrendatario).retirar()).to.changeEtherBalances(
        ethers,
        [arrendatario, canon],
        [SALDO / 2n, -(SALDO / 2n)],
      );

      const a = await canon.alquiler(1);
      expect(a.estado).to.equal(ESTADO.Liquidado);
      expect(a.lluviaDecimasMm).to.equal(2432n);
      expect(a.hashDato).to.equal(HASH);
    });

    it("2023/24: 323,6 mm, todo el saldo va al dueño", async function () {
      const { canon, dueno, arrendatario, relayer } = await networkHelpers.loadFixture(depositado);
      expect(lluviaDe(2023)).to.equal(3236);

      await canon.connect(relayer).liquidar(1, lluviaDe(2023), HASH);
      expect(await canon.pendiente(dueno.address)).to.equal(SALDO);
      expect(await canon.pendiente(arrendatario.address)).to.equal(0n);
    });

    it("2014/15: 287,0 mm, 80 % al dueño y 20 % al arrendatario", async function () {
      const { canon, dueno, arrendatario, relayer } = await networkHelpers.loadFixture(depositado);
      const alArrendatario = (SALDO * 20n) / 100n;

      await canon.connect(relayer).liquidar(1, lluviaDe(2014), HASH);
      expect(await canon.pendiente(dueno.address)).to.equal(SALDO - alArrendatario);
      expect(await canon.pendiente(arrendatario.address)).to.equal(alArrendatario);
    });

    it("2022/23 queda en el tramo bajo por 0,6 mm", async function () {
      const { canon } = await networkHelpers.loadFixture(depositado);
      expect(lluviaDe(2022)).to.equal(2544);
      expect(await canon.porcentajeArrendatario(1, lluviaDe(2022))).to.equal(50n);
    });

    it("cada umbral pertenece al tramo de abajo", async function () {
      const { canon } = await networkHelpers.loadFixture(depositado);
      expect(await canon.porcentajeArrendatario(1, 2550)).to.equal(50n);
      expect(await canon.porcentajeArrendatario(1, 2551)).to.equal(20n);
      expect(await canon.porcentajeArrendatario(1, 3050)).to.equal(20n);
      expect(await canon.porcentajeArrendatario(1, 3051)).to.equal(0n);
    });

    it("reparte las 21 campañas como la tabla del README: 12, 4 y 5", async function () {
      const { canon } = await networkHelpers.loadFixture(depositado);
      const tramos = { alto: 0, medio: 0, bajo: 0 };
      for (let anio = 2004; anio <= 2024; anio++) {
        const pct = await canon.porcentajeArrendatario(1, lluviaDe(anio));
        if (pct === 0n) tramos.alto++;
        else if (pct === 20n) tramos.medio++;
        else tramos.bajo++;
      }
      expect(tramos).to.deep.equal({ alto: 12, medio: 4, bajo: 5 });
    });
  });

  describe("liquidar: controles", function () {
    it("solo puede liquidar el relayer fijado al crear", async function () {
      const { canon, dueno, arrendatario, otro } = await networkHelpers.loadFixture(depositado);
      for (const firmante of [dueno, arrendatario, otro]) {
        await expect(canon.connect(firmante).liquidar(1, 2432, HASH)).to.be.revertedWithCustomError(
          canon,
          "SoloRelayer",
        );
      }
    });

    it("se liquida una sola vez", async function () {
      const { canon, relayer } = await networkHelpers.loadFixture(depositado);
      await canon.connect(relayer).liquidar(1, 2432, HASH);
      await expect(canon.connect(relayer).liquidar(1, 3236, HASH))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Liquidado);
    });

    it("exige el hash del dato", async function () {
      const { canon, relayer } = await networkHelpers.loadFixture(depositado);
      await expect(canon.connect(relayer).liquidar(1, 2432, ethers.ZeroHash)).to.be.revertedWithCustomError(
        canon,
        "HashVacio",
      );
    });

    it("no liquida sin depósito", async function () {
      const { canon, relayer } = await networkHelpers.loadFixture(creado);
      await expect(canon.connect(relayer).liquidar(1, 2432, HASH))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Creado);
    });

    it("no liquida antes de que cierre la ventana", async function () {
      const { canon, relayer, c } = await networkHelpers.loadFixture(depositadoCampaniaFutura);

      await expect(canon.connect(relayer).liquidar(1, 2432, HASH)).to.be.revertedWithCustomError(
        canon,
        "VentanaAbierta",
      );

      await networkHelpers.time.increaseTo(c.finVentana);
      await expect(canon.connect(relayer).liquidar(1, 2432, HASH)).to.emit(canon, "Liquidado");
    });
  });

  describe("modo demo", function () {
    it("fuera del modo demo no se puede depositar después de que empieza la ventana", async function () {
      const { canon, dueno, arrendatario, relayer } = await networkHelpers.loadFixture(desplegadoEnProduccion);
      expect(await canon.modoDemo()).to.equal(false);

      const ahora = await networkHelpers.time.latest();
      const proximaCampania = new Date(ahora * 1000).getUTCFullYear() + 1;
      const c = await condiciones(arrendatario.address, relayer.address, proximaCampania);

      await expect(canon.connect(dueno).crear({ ...c, plazoDeposito: c.inicioVentana + 1 }))
        .to.be.revertedWithCustomError(canon, "CondicionesInvalidas")
        .withArgs("plazo despues del inicio");
      await expect(canon.connect(dueno).crear({ ...c, plazoDeposito: c.inicioVentana })).to.emit(canon, "Creado");
    });

    it("en modo demo acepta campañas pasadas", async function () {
      const { canon } = await networkHelpers.loadFixture(creado);
      expect(await canon.modoDemo()).to.equal(true);
      expect((await canon.alquiler(1)).estado).to.equal(ESTADO.Creado);
    });
  });

  describe("retirar", function () {
    it("no se puede retirar dos veces", async function () {
      const { canon, dueno, relayer } = await networkHelpers.loadFixture(depositado);
      await canon.connect(relayer).liquidar(1, lluviaDe(2024), HASH);
      await canon.connect(dueno).retirar();
      expect(await canon.pendiente(dueno.address)).to.equal(0n);
      await expect(canon.connect(dueno).retirar()).to.be.revertedWithCustomError(canon, "NadaParaRetirar");
    });

    it("un dueño que rechaza pagos no traba el cobro del arrendatario", async function () {
      const { canon, arrendatario, relayer } = await networkHelpers.loadFixture(desplegado);
      const duenoContrato = await ethers.deployContract("RechazaPagos");
      const c = await condiciones(arrendatario.address, relayer.address);
      await duenoContrato.crear(await canon.getAddress(), c);
      await canon.connect(arrendatario).depositar(1, { value: SALDO });

      // Año seco: la liquidación funciona aunque el dueño no pueda recibir plata.
      await expect(canon.connect(relayer).liquidar(1, lluviaDe(2024), HASH)).to.emit(canon, "Liquidado");
      await expect(canon.connect(arrendatario).retirar()).to.changeEtherBalances(
        ethers,
        [arrendatario],
        [SALDO / 2n],
      );

      // El único perjudicado es el dueño, y su parte sigue anotada.
      await expect(duenoContrato.retirar(await canon.getAddress())).to.be.revertedWithCustomError(
        canon,
        "TransferenciaFallida",
      );
      expect(await canon.pendiente(await duenoContrato.getAddress())).to.equal(SALDO / 2n);
    });
  });

  describe("reembolsar", function () {
    it("si nadie liquida en 60 días, cualquiera reparte según el tramo medio", async function () {
      const { canon, dueno, arrendatario, relayer, otro, c } =
        await networkHelpers.loadFixture(depositadoCampaniaFutura);

      await networkHelpers.time.increaseTo(c.finVentana + PLAZO_LIQUIDACION - 10);
      await expect(canon.connect(otro).reembolsar(1)).to.be.revertedWithCustomError(
        canon,
        "PlazoLiquidacionVigente",
      );

      await networkHelpers.time.increaseTo(c.finVentana + PLAZO_LIQUIDACION);
      const alArrendatario = (SALDO * 20n) / 100n;
      await expect(canon.connect(otro).reembolsar(1))
        .to.emit(canon, "Reembolsado")
        .withArgs(1n, SALDO - alArrendatario, alArrendatario);

      expect((await canon.alquiler(1)).estado).to.equal(ESTADO.Reembolsado);
      expect(await canon.pendiente(dueno.address)).to.equal(SALDO - alArrendatario);
      expect(await canon.pendiente(arrendatario.address)).to.equal(alArrendatario);

      // Después del reembolso el relayer ya no puede liquidar.
      await expect(canon.connect(relayer).liquidar(1, 2432, HASH))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Reembolsado);
    });

    it("no reembolsa un contrato ya liquidado", async function () {
      const { canon, relayer, otro } = await networkHelpers.loadFixture(depositado);
      await canon.connect(relayer).liquidar(1, 2432, HASH);
      await expect(canon.connect(otro).reembolsar(1))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Liquidado);
    });

    it("no reembolsa un contrato sin depósito", async function () {
      const { canon, otro } = await networkHelpers.loadFixture(creado);
      await expect(canon.connect(otro).reembolsar(1))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Creado);
    });
  });

  describe("cancelar", function () {
    it("el dueño cierra el contrato si el plazo vence sin depósito", async function () {
      const { canon, dueno, arrendatario, c } = await networkHelpers.loadFixture(creado);
      await expect(canon.connect(dueno).cancelar(1)).to.be.revertedWithCustomError(canon, "PlazoVigente");

      await networkHelpers.time.increaseTo(c.plazoDeposito + 1);
      await expect(canon.connect(dueno).cancelar(1)).to.emit(canon, "Cancelado").withArgs(1n);
      await expect(canon.connect(arrendatario).depositar(1, { value: SALDO }))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Cancelado);
    });

    it("solo cancela el dueño", async function () {
      const { canon, otro, c } = await networkHelpers.loadFixture(creado);
      await networkHelpers.time.increaseTo(c.plazoDeposito + 1);
      await expect(canon.connect(otro).cancelar(1)).to.be.revertedWithCustomError(canon, "SoloDueno");
    });

    it("no cancela un contrato con el saldo depositado", async function () {
      const { canon, dueno, c } = await networkHelpers.loadFixture(depositado);
      await networkHelpers.time.increaseTo(c.plazoDeposito + 1);
      await expect(canon.connect(dueno).cancelar(1))
        .to.be.revertedWithCustomError(canon, "EstadoInvalido")
        .withArgs(ESTADO.Depositado);
    });
  });
});
