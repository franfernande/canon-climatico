# Canon Climático

Alquiler de campo con un saldo que se ajusta solo según la lluvia que mide un satélite.

El arrendatario deposita el saldo del alquiler en un contrato en Avalanche al firmar. Cuando termina la ventana de siembra, el contrato toma la lluvia acumulada en el lote y reparte ese saldo entre el dueño y el arrendatario, según tramos que acordaron de antemano.

Track Blockchain de Avalanche · Hackathon Argentina Space 2026 · Salta, 11 al 13 de noviembre.
Categoría principal: RWA (activos del mundo real), cruzada con Geoespacial.

> Estado: idea validada y diseño cerrado. El código se escribe el jueves 12.

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
| 2007/08 | 393,4 | 2014/15 | 286,9 | 2021/22 | 344,8 |
| 2008/09 | 304,5 | 2015/16 | 305,2 | 2022/23 | 254,4 |
| 2009/10 | 260,9 | 2016/17 | 240,6 | 2023/24 | 323,6 |
| 2010/11 | 344,9 | 2017/18 | 317,2 | 2024/25 | 243,2 |

</details>

## Por qué blockchain

1. **¿Quién desconfía de quién?** El dueño teme no cobrar el saldo en un año malo. El arrendatario teme pagar el alquiler entero en una sequía, o que el dueño no le devuelva su parte.
2. **¿Qué evento queda en la cadena?** Al cierre de la ventana, el contrato reparte el depósito según la lluvia.
3. **¿Qué pasa si el dato miente?** La fuente, el punto, la ventana y los umbrales se fijan al crear el contrato y quedan públicos. El relayer publica la lluvia junto con el hash SHA-256 de la respuesta original de NASA POWER, y cualquiera puede volver a pedirla y rehacer la suma. En el MVP hay un solo relayer. Más adelante habrá dos fuentes o varios relayers, con un plazo para disputar.
4. **¿Quién paga y quién cobra?** El arrendatario paga una comisión por contrato, porque es quien compra la protección. Cobra Canon Climático. El monto es un supuesto que hay que validar con usuarios.

La comparación para la slide: con una cláusula en papel, el reparto depende de que dos partes con intereses opuestos se pongan de acuerdo después de la sequía. Con el contrato, la regla queda escrita al firmar y la plata ya está adentro.

## Contra qué compite

| Lo que se usa hoy | Dónde falla |
| --- | --- |
| Alquiler fijo con anticipo | El arrendatario carga con todo el riesgo |
| Aparcería (porcentaje de la cosecha) | Depende de lo que el arrendatario declare que cosechó |
| Cláusula climática del modelo CREA | Las hectáreas o el ajuste se acuerdan después del evento |
| Teoría de la imprevisión | Es un reclamo, lento y caro |

## Modelo de negocio

- **Quién lo usa:** el dueño del campo y el arrendatario, en zonas de secano con riesgo de sequía, como Anta.
- **Quién paga:** el arrendatario, con una comisión por cada contrato liquidado. Es un supuesto.
- **Por dónde llega:** corredores rurales y administradoras de campos, que ya redactan estos contratos. También es un supuesto.
- **Costo de operar:** el gas en Avalanche y un relayer. El dato es gratis.

## Diseño del contrato

`CanonClimatico.sol`, en Solidity, desplegado en Avalanche Fuji C-Chain (chain ID 43113).

Cada contrato de alquiler guarda:

- el dueño y el arrendatario;
- el saldo a depositar;
- el punto del lote, con latitud y longitud multiplicadas por 10.000;
- la fuente del dato, como texto (por ejemplo, `NASA POWER PRECTOTCORR_SUM`);
- el inicio y el fin de la ventana;
- el plazo para depositar;
- los dos umbrales, en décimas de milímetro (255 mm se guarda como `2550`);
- el porcentaje que vuelve al arrendatario en cada tramo;
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

`scripts/relayer.ts`, con [viem](https://viem.sh):

1. Pide a NASA POWER los meses de la ventana para el punto del contrato.
2. Guarda la respuesta original en `sample-data/`.
3. Calcula el SHA-256 de esos bytes.
4. Suma la lluvia de los meses y la pasa a décimas de milímetro.
5. Llama a `liquidar` en Fuji.

## Demo (video de 1 a 3 minutos)

| Tiempo | Qué se muestra |
| --- | --- |
| 0:00 a 0:20 | El problema: un lote en Anta y la sequía de 2024/25 |
| 0:20 a 1:10 | Dos contratos con datos reales en el explorer de Fuji. En 2024/25 llovieron 243,2 mm y el saldo se reparte mitad y mitad. En 2023/24 llovieron 323,6 mm y todo va al dueño |
| 1:10 a 1:40 | Por qué blockchain, y la verificación del hash del JSON de NASA POWER |

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

## Estructura planificada

```
contracts/CanonClimatico.sol      contrato
test/CanonClimatico.ts            tests con Hardhat 3 + viem
ignition/modules/CanonClimatico.ts
scripts/relayer.ts                NASA POWER -> hash -> liquidar()
sample-data/                      respuestas originales de NASA POWER
web/                              página de la demo
```

## Plan de trabajo

- **Jueves 12, mañana:** contrato, tests y despliegue en Fuji.
- **Jueves 12, tarde:** relayer y las dos liquidaciones con datos reales.
- **Jueves 12, noche:** página y video de prueba.
- **Viernes 13, antes de las 9:00:** video final, deck y carga en Hacki. La guía del track cuenta hasta las 9:00 y Hacki cierra a las 10:00.

## Entregables del track

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

- Es un índice, no una medición del lote. La lluvia del punto de NASA POWER puede no ser la que cayó en cada hectárea.
- La ventana de diciembre y enero para soja en Anta hay que confirmarla con un productor.
- Que dueños y arrendatarios acepten una stablecoin es un supuesto.
- En el MVP hay un solo relayer.

## Fuentes y atribución

- NASA POWER: «These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.»
- Contenidos CREA, [Desastre agropecuario: cláusulas climáticas en contratos de arrendamientos](https://www.contenidoscrea.org.ar/agricultura/desastre-agropecuario-clausulas-climaticas-contratos-arrendamientos-n5328137).
- Agrofy News, [Pago por hectárea efectiva y ajuste mensual con imágenes satelitales](https://news.agrofy.com.ar/noticia/214504/que-pasa-alquiler-zonas-inundadas-pago-hectarea-efectiva-y-ajuste-mensual-imagenes).
- [Documentación de Avalanche](https://build.avax.network/docs/primary-network): Fuji C-Chain, chain ID 43113.
