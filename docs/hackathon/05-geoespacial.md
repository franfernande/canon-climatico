# Herramientas geoespaciales

Fuente: [avalanche-track.vercel.app/geoespacial](https://avalanche-track.vercel.app/geoespacial). Capturado el jueves 12 de noviembre de 2026, a las 9:50 (hora de Argentina).

Mapas, imágenes y librerías para mostrar datos del espacio. «Usar FIRMS, Open-Meteo y SMN sobre Salta y el NOA (incendios, lluvias intensas, zonda, sequía) pesa más que un caso genérico.»

## Para mirar, sin código

Explorá, sacá una captura y listo. Sirven para el pitch y para entender el dato antes de usarlo.

| Herramienta | Para qué |
| --- | --- |
| [NASA Worldview](https://worldview.earthdata.nasa.gov) | Explorá capas satelitales en el navegador, sacá una captura y listo. No pide código |
| [Copernicus Browser](https://browser.dataspace.copernicus.eu) | Buscá y mirá imágenes Sentinel sin escribir código |

## Fuentes de imágenes y focos

De acá sale el dato que llega al contrato.

| Fuente | Para qué |
| --- | --- |
| [NASA GIBS](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/) | La mejor opción para mostrar imágenes en un mapa sin procesar nada |
| [Earth Search (STAC)](https://earth-search.aws.element84.com/v1) | Sentinel-2, Sentinel-1, Landsat y DEM, sin key |
| [Planetary Computer](https://planetarycomputer.microsoft.com/api/stac/v1) | STAC sin cuenta, con tokens SAS anónimos que vencen en ~1 h |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov) | Focos de calor casi en tiempo real. Pedí una MAP_KEY y filtrá por país (ARG) |

## Para mostrarlo en pantalla

Librerías de mapa, globo y gráficos para el frontend.

| Librería | Para qué |
| --- | --- |
| [satellite.js](https://github.com/shashwatak/satellite-js) | Calcula la posición de un satélite desde TLE/OMM (SGP4) en el navegador |
| [CesiumJS](https://cesium.com/platform/cesiumjs/) | Globo 3D con órbitas reales. Patrón típico: CelesTrak → satellite.js → Cesium |
| [globe.gl](https://globe.gl) | Puntos sobre un globo. Ideal con GeoJSON de USGS o EONET |
| [Leaflet](https://leafletjs.com) | Mapa 2D simple para marcadores y capas |
| [MapLibre](https://maplibre.org) | Mapas vectoriales con más control de estilo |
| [Chart.js](https://www.chartjs.org) | Series de tiempo: Kp, temperatura, radiación |

## Argentina

El diferencial local: citá la fuente y verificá la licencia.

| Fuente | Qué hay |
| --- | --- |
| [SMN en datos.gob.ar](https://datos.gob.ar) | Alertas, estaciones y más. Licencia CC BY 2.5 AR: citá al SMN |
| [CONAE / SAOCOM](https://www.argentina.gob.ar/ciencia/conae) | Catálogo público con miniaturas. Los datos completos requieren convenio |
| [IGN](https://datos.gob.ar) | Límites provinciales y cartografía pública para cruzar con lo satelital |

## Cuando el dato cruza un umbral

«El usuario paga una prima, un dato verificable cruza un umbral y el contrato paga solo. Entra en Geoespacial o en RWA. Lo difícil es la disputa y el dato manipulado: para el evento alcanza con un relayer y un token de testnet.»

| Riesgo | Dato | Umbral de ejemplo |
| --- | --- | --- |
| Sequía (agro) | NASA POWER, Open-Meteo | Lluvia acumulada bajo X mm en N días |
| Helada (vid, hortalizas) | Open-Meteo | Mínima bajo 0 °C |
| Incendio cerca de una parcela | NASA FIRMS | Focos dentro de X km en 24 h |
| Sismo | USGS | Magnitud ≥ X dentro de un radio |
| Tormenta solar (infraestructura) | NOAA SWPC / DONKI | Kp ≥ X |

## Atribución

Varias fuentes piden que cites si publicás. Una línea en el footer alcanza.

- NASA GIBS: reconocé el servicio de imágenes (ver earthdata.nasa.gov/gibs).
- Copernicus: «Contains modified Copernicus Sentinel data [año]».
- SMN: licencia CC BY 2.5 Argentina; citá al Servicio Meteorológico Nacional.
