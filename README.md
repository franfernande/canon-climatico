# Canon Climático

Alquiler de campo con un saldo que se ajusta solo según la lluvia que mide un satélite.

El arrendatario deposita el saldo del alquiler en un contrato en Avalanche al firmar. Cuando termina la ventana de siembra, el contrato toma la lluvia acumulada en el lote y reparte ese saldo entre el dueño y el arrendatario, según tramos que acordaron de antemano.

Track Blockchain de Avalanche · Hackathon Argentina Space 2026 · Salta, 11 al 13 de noviembre.
Categoría principal: RWA (activos del mundo real), cruzada con Geoespacial.

> Estado: el contrato, los tests, el relayer, el verificador y la página de la demo están listos y probados en una red local. Falta desplegar en Fuji, publicar la página y hacer el deck y el video.

Requisitos, pautas y recursos del track, tal como los publicó la organización: [docs/hackathon/](docs/hackathon/README.md).

## El problema

En Anta, al este de Salta, la soja y el poroto se siembran a secano. La forma más común de alquilar un lote es un valor fijo por hectárea expresado en quintales de soja. El dueño suele pedir un anticipo, alrededor del 50 %, al firmar o antes de la siembra. El saldo se paga en la cosecha, entre mayo y julio. Si hay sequía, el arrendatario paga igual.

Para compartir ese riesgo hay tres salidas, y ninguna se ejecuta sola:

- **Aparcería.** El dueño cobra un porcentaje de la cosecha, así que depende de lo que el arrendatario declare que cosechó.
- **Cláusula climática.** El modelo que difunde [Contenidos CREA](https://www.contenidoscrea.org.ar/agricultura/desastre-agropecuario-clausulas-climaticas-contratos-arrendamientos-n5328137) dice que, ante un evento extremo, «las partes de mutuo acuerdo establecerán las hectáreas reales» que se pagan. El ajuste se negocia después de la sequía, cuando dueño y arrendatario tienen intereses opuestos.
- **Teoría de la imprevisión.** Es una renegociación o un juicio, lento y caro.

## La idea

Cuando la lluvia de diciembre y enero en el lote queda por debajo del umbral acordado, el contrato le devuelve al arrendatario una parte del saldo que depositó. Si no, le paga el saldo completo al dueño.

- El anticipo se paga como siempre, por fuera del contrato.
- El saldo se deposita en el contrato al firmar. Para el arrendatario es lo mismo que hoy le piden para hacerle descuento por pagar por adelantado. La diferencia es que, en un año seco, le vuelve una parte.
- Para el dueño, el saldo existe desde el primer día. No tiene que cobrarlo en un año malo ni enfrentar un reclamo.

## Cómo funciona

```
FIRMA                          VENTANA DE SIEMBRA            CIERRE
El dueño crea el contrato ───► diciembre y enero ──────────► El relayer pide a NASA POWER la lluvia
con el punto, la ventana,                                    del punto, guarda el JSON y su hash
los umbrales y el reparto                                    y llama a liquidar()
El arrendatario deposita                                     El contrato reparte el saldo
el saldo (así acepta)                                        según el tramo
```

## El dato

Fuente: [NASA POWER](https://power.larc.nasa.gov/), lluvia mensual corregida (`PRECTOTCORR_SUM`). Es gratis, no pide clave y cubre cualquier punto del planeta. El punto de ejemplo está en Anta, en latitud −25,12 y longitud −64,13.

Para reproducir los números:

```
https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR_SUM&community=AG&longitude=-64.13&latitude=-25.12&start=2004&end=2025&format=JSON
```

La respuesta declara `"units": "mm/day"`, pero cada valor mensual es el total del mes en milímetros: la lluvia diaria de diciembre de 2024 suma los mismos 47,24 mm que trae el dato mensual.

La lluvia de diciembre más enero, en 21 campañas (2004/05 a 2024/25), va de 240,2 mm a 419,3 mm, con una mediana de 305,2 mm.

Tramos del ejemplo, con umbrales calculados sobre la historia de esa misma fuente:

| Lluvia de diciembre y enero | Campañas entre 2004/05 y 2024/25 | Reparto del saldo (ejemplo) |
| --- | --- | --- |
| Más de 305 mm | 12 | 100 % para el dueño |
| Más de 255 mm y hasta 305 mm | 4 | 80 % para el dueño y 20 % para el arrendatario |
| 255 mm o menos | 5 | 50 % para cada uno |

Los porcentajes los fijan las partes al firmar. Los de la tabla son solo un ejemplo.

El umbral sale de la historia de la misma fuente porque las fuentes no coinciden entre sí. Cuando comparamos día por día NASA POWER con Open-Meteo en Salta capital, entre el 28 de octubre y el 8 de noviembre de 2026, con un umbral de 10 mm, una fuente marcaba tres días de lluvia y la otra ninguno. Si se compara cada fuente contra su propio pasado, esa diferencia deja de importar.

<details>
<summary>Lluvia de diciembre y enero por campaña (NASA POWER, Anta)</summary>

| Campaña | mm | Campaña | mm | Campaña | mm |
| --- | --- | --- | --- | --- | --- |
| 2004/05 | 240,2 | 2011/12 | 308,1 | 2018/19 | 305,2 |
| 2005/06 | 335,9 | 2012/13 | 266,7 | 2019/20 | 371,9 |
| 2006/07 | 419,3 | 2013/14 | 362,3 | 2020/21 | 248,1 |
| 2007/08 | 393,4 | 2014/15 | 287,0 | 2021/22 | 344,8 |
| 2008/09 | 304,5 | 2015/16 | 305,2 | 2022/23 | 254,4 |
| 2009/10 | 260,9 | 2016/17 | 240,6 | 2023/24 | 323,6 |
| 2010/11 | 344,9 | 2017/18 | 317,3 | 2024/25 | 243,2 |

</details>

## Por qué blockchain

1. **¿Quién desconfía de quién?** El dueño teme no cobrar el saldo en un año malo. El arrendatario teme pagar el alquiler entero en una sequía, o que el dueño no le devuelva su parte.
2. **¿Qué evento queda en la cadena?** Al cierre de la ventana, el contrato reparte el depósito según la lluvia.
3. **¿Qué pasa si el dato miente?** La fuente, el punto, la ventana, los umbrales y la dirección del relayer se fijan al crear el contrato y quedan públicos. El arrendatario los acepta al depositar. El relayer publica la lluvia junto con el hash SHA-256 de la respuesta de NASA POWER que guardó, y cualquiera puede comprobar tres cosas: que el archivo publicado tiene ese hash, que sus valores coinciden con un pedido nuevo a NASA POWER y que diciembre más enero da la lluvia que recibió el contrato. El hash no impide que el relayer mienta, pero deja la mentira a la vista y firmada por su dirección. En el MVP hay un solo relayer. Más adelante habrá dos fuentes o varios relayers, con un plazo para disputar.
4. **¿Quién paga y quién cobra?** El arrendatario paga una comisión por contrato, porque es quien compra la protección. Cobra Canon Climático. El monto es un supuesto que hay que validar con usuarios.

La comparación para la slide: con una cláusula en papel, el reparto depende de que dos partes con intereses opuestos se pongan de acuerdo después de la sequía. Con el contrato, la regla queda escrita al firmar y la plata ya está adentro.

## Contra qué compite

| Lo que se usa hoy | Dónde falla |
| --- | --- |
| Alquiler fijo con anticipo | El arrendatario carga con todo el riesgo |
| Aparcería (porcentaje de la cosecha) | Depende de lo que el arrendatario declare que cosechó |
| Cláusula climática del modelo CREA | Las hectáreas o el ajuste se acuerdan después del evento |
| Teoría de la imprevisión | Es un reclamo, lento y caro |
| Depósito en garantía con un tercero (escribano o fideicomiso) | El tercero custodia la plata, aplica la regla y cobra por hacerlo |

## Modelo de negocio

- **Quién lo usa:** el dueño del campo y el arrendatario, en zonas de secano con riesgo de sequía, como Anta.
- **Quién paga:** el arrendatario, con una comisión por cada contrato liquidado. Es un supuesto.
- **Por dónde llega:** corredores rurales y administradoras de campos, que ya redactan estos contratos. También es un supuesto.
- **Costo de operar:** el gas en Avalanche y un relayer. El dato es gratis.

## Diseño del contrato

`CanonClimatico.sol`, en Solidity, desplegado en Avalanche Fuji C-Chain (chain ID 43113).

Cada contrato de alquiler guarda:

- el dueño, el arrendatario y el relayer autorizado a liquidar;
- el saldo a depositar;
- el punto del lote, con latitud y longitud multiplicadas por 10.000;
- la fuente del dato, como texto (por ejemplo, `NASA POWER PRECTOTCORR_SUM`);
- el inicio y el fin de la ventana;
- el plazo para depositar;
- los dos umbrales, en décimas de milímetro (255 mm se guarda como `2550`);
- el porcentaje que vuelve al arrendatario en el tramo medio y en el tramo bajo (en el tramo alto no vuelve nada);
- el estado: creado, depositado, liquidado o cancelado.

| Función | Quién la llama | Qué hace |
| --- | --- | --- |
| `crear(...)` | El dueño | Abre el contrato con todos los parámetros |
| `depositar(id)` | El arrendatario | Envía exactamente el saldo antes del plazo. Con eso acepta las condiciones |
| `liquidar(id, lluviaDecimasMm, hashDato)` | El relayer | Solo después del fin de la ventana y una única vez. Calcula el tramo y transfiere a cada parte |
| `cancelar(id)` | El dueño | Si el plazo venció sin depósito, cierra el contrato |

Eventos: `Creado`, `Depositado`, `Liquidado(id, lluvia, hashDato, alDueno, alArrendatario)` y `Cancelado`.

En la demo se paga con AVAX de prueba. En producción se pagaría con USDC.

En producción, el plazo para depositar vence antes de que empiece la ventana, para que nadie deposite sabiendo cómo vino el año. En la demo se usan campañas pasadas, así que ese plazo se configura más largo.

## Relayer

`scripts/relayer.ts`, con [ethers v6](https://docs.ethers.org/v6/):

1. Lee del contrato el punto y la ventana.
2. Pide a NASA POWER la lluvia mensual de esos años para el punto.
3. Guarda la respuesta tal como llegó en `sample-data/`.
4. Calcula el SHA-256 de esos bytes.
5. Suma la lluvia de los meses de la ventana y la redondea a décimas de milímetro, con los medios hacia arriba (286,95 mm queda en 287,0).
6. Llama a `liquidar` en Fuji.

Dos pedidos iguales a NASA POWER devuelven la misma lluvia pero no los mismos bytes, porque la respuesta trae el tiempo de proceso del servidor en el campo `times`. Por eso el hash se compara contra el archivo guardado, y los valores contra un pedido nuevo. `scripts/verificar.ts` hace las dos cosas.

## Demo (video de 1 a 3 minutos)

| Tiempo | Qué se muestra |
| --- | --- |
| 0:00 a 0:20 | El problema: un lote en Anta y la sequía de 2024/25 |
| 0:20 a 1:10 | Dos contratos con datos reales en el explorer de Fuji. En 2024/25 llovieron 243,2 mm y el saldo se reparte mitad y mitad. En 2023/24 llovieron 323,6 mm y todo va al dueño |
| 1:10 a 1:40 | Por qué blockchain, y la verificación: el hash del JSON guardado coincide con el de la transacción, y sus valores con un pedido nuevo a NASA POWER |

La campaña 2022/23 dio 254,4 mm, a 0,6 mm del umbral bajo. No la usamos en la demo. Sirve para explicar por qué el umbral se escribe en décimas y con la fuente.

## Alcance del MVP

Entra:

- Un contrato en Fuji con `crear`, `depositar` y `liquidar`.
- El relayer, con el dato real guardado en `sample-data/`.
- Una página con el lote, la lluvia contra los umbrales y los links a las transacciones.

Queda afuera:

- Expresar el monto en quintales de soja con el precio pizarra.
- Varias fuentes o varios relayers.
- Login.
- Medir la superficie efectivamente sembrada con imágenes satelitales.

## Estructura

```
contracts/CanonClimatico.sol      contrato
test/CanonClimatico.ts            tests del contrato, con Hardhat 3 y ethers v6
test/power.ts                     tests del cálculo de la lluvia
scripts/lib/power.ts              NASA POWER: URL, meses de la ventana, suma y SHA-256
scripts/deploy.ts                 despliega y guarda la dirección y el ABI en deployments/
scripts/demo.ts                   crea y deposita los contratos de 2024/25 y 2023/24
scripts/relayer.ts                NASA POWER -> sample-data -> hash -> liquidar()
scripts/verificar.ts              compara el hash, los valores y la suma, sin claves
scripts/exportar-web.ts           lee la cadena y arma los datos de la página
deployments/fuji.json             dirección, ABI y transacciones en Fuji
sample-data/                      respuestas de NASA POWER
web/                              página de la demo, en Next.js y estática
web/data/fuji.json                lo que muestra la página, generado por exportar-web
web/public/datos/                 copia del JSON de cada liquidación, para bajarlo y comprobar el hash
```

## Cómo correrlo

Necesita Node 22 o superior.

```
npm install
npm test
```

Los tests usan la historia real de NASA POWER guardada en `sample-data/nasa-power-anta-2004-2025.json`. Comprueban la lluvia de las 21 campañas de la tabla, el reparto de cada tramo y los controles del contrato.

### En Fuji

1. Creá tres cuentas en Core Wallet, en modo testnet: el relayer (también despliega), el dueño y el arrendatario. Tienen que ser distintas.
2. Pedí AVAX de prueba en el faucet para la cuenta del relayer. Con 0,5 AVAX alcanza: el script de la demo le pasa al dueño y al arrendatario lo que necesitan.
3. Cargá las tres claves privadas en un archivo `.env` en la raíz (está en `.gitignore`; no lo subas):

   ```
   copy .env.example .env
   ```

   Completá estas variables y **guardá** el archivo:

   ```
   FUJI_PRIVATE_KEY=0x...
   FUJI_DUENO_KEY=0x...
   FUJI_ARRENDATARIO_KEY=0x...
   ```

   Hardhat las carga con `dotenv`. También sirven como variables de entorno del sistema con esos mismos nombres.
4. Desplegá, creá los dos contratos de la demo, liquidalos y verificá:

   ```
   npm run deploy:fuji
   npm run demo:fuji
   npm run relayer:fuji
   npm run verificar -- 1
   npm run verificar -- 2
   ```

Cada script imprime los links al explorer. La dirección, el ABI y las transacciones quedan en `deployments/fuji.json`, y la respuesta de NASA POWER que usó el relayer, en `sample-data/fuji/<contrato>/<id>.json`. Si NASA POWER no responde, el relayer puede usar una respuesta ya guardada: en PowerShell, `$env:ARCHIVO="ruta.json"; npm run relayer:fuji`. Con `$env:IDS="1"` liquida solo ese contrato.

### La página

La página no se conecta a ninguna wallet ni a la cadena: muestra lo que exporta `exportar-web`, así que queda estática y se publica sola. Después de cada paso en Fuji, regenerá los datos:

```
npm run web:datos
cd web
npm install
npm run dev
```

Muestra la regla de los tramos, la lluvia de las 21 campañas contra los umbrales y una tarjeta por contrato, con la lluvia, el reparto, los links al explorer y el JSON de NASA POWER que usó el relayer. Antes del despliegue avisa que el contrato todavía no está en Fuji.

Para probarla con un ensayo local: `npx hardhat node` en una terminal; en otra, deploy, demo y relayer con `--network localhost`, después `node scripts/exportar-web.ts localhost` y, dentro de `web/`, `$env:RED="localhost"; npm run dev`.

## Plan de trabajo

- **Jueves 12, mañana:** contrato, tests y despliegue en Fuji.
- **Jueves 12, tarde:** relayer y las dos liquidaciones con datos reales.
- **Jueves 12, noche:** página y video de prueba.
- **Viernes 13, antes de las 9:00:** video final, deck y carga en Hacki. La guía del track cuenta hasta las 9:00 y Hacki cierra a las 10:00.

## Entregables del track

La lista completa y la checklist de la guía están en [docs/hackathon/01-requisitos.md](docs/hackathon/01-requisitos.md).

- [ ] Contrato desplegado en Fuji, con link al explorer
- [ ] Video demo de 1 a 3 minutos, con una acción on-chain
- [ ] Pitch deck de 5 a 7 slides, con la slide «por qué blockchain»
- [ ] Este repositorio
- [ ] Atribución de las fuentes de datos

## Próximos pasos

- Expresar el saldo en quintales de soja, convertidos con el precio pizarra.
- Sumar una segunda fuente de lluvia, o varios relayers, con mediana y plazo de disputa.
- Medir la superficie efectivamente sembrada con Sentinel-2, como plantea la cláusula de CREA.
- Pagar en USDC.
- Si a los 30 días del cierre no hay dato, liquidar con un reparto por defecto acordado al firmar.

## Supuestos y límites

- Es un índice, no una medición del lote. NASA POWER entrega la lluvia en una grilla de 0,5° de latitud por 0,625° de longitud (MERRA-2), así que el punto representa una zona de decenas de kilómetros y puede no coincidir con lo que cayó en cada hectárea.
- La ventana de diciembre y enero para soja en Anta hay que confirmarla con un productor.
- Que dueños y arrendatarios acepten una stablecoin es un supuesto.
- En el MVP hay un solo relayer.

## Fuentes y atribución

- NASA POWER: «These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.»
- Contenidos CREA, [Desastre agropecuario: cláusulas climáticas en contratos de arrendamientos](https://www.contenidoscrea.org.ar/agricultura/desastre-agropecuario-clausulas-climaticas-contratos-arrendamientos-n5328137).
- Agrofy News, [Pago por hectárea efectiva y ajuste mensual con imágenes satelitales](https://news.agrofy.com.ar/noticia/214504/que-pasa-alquiler-zonas-inundadas-pago-hectarea-efectiva-y-ajuste-mensual-imagenes).
- [Documentación de Avalanche](https://build.avax.network/docs/primary-network): Fuji C-Chain, chain ID 43113.
