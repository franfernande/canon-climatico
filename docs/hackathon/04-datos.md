# Catálogo de datos del track

Fuente: [avalanche-track.vercel.app/dashboard](https://avalanche-track.vercel.app/dashboard). Capturado el jueves 12 de noviembre de 2026, a las 9:50 (hora de Argentina).

Todas las fuentes del catálogo del track, etiquetadas por cuánto cuesta empezar: 23 en total, 12 sin registro, 5 con key gratis, 3 avanzadas y 3 de Argentina. «Arrancá por las que no piden registro y subí de nivel cuando lo necesites.»

«Los límites salen de la documentación oficial y de fuentes de terceros, y pueden cambiar. Si una API da 429, esperá o usá lo que cacheaste.»

## Tres consejos para el hackatón

1. **Sacá tu propia key de NASA.** Todos comparten el WiFi del evento. `DEMO_KEY` de NASA (≈30 req/hora por IP) y Launch Library 2 (≈15 req/hora anónimo) se agotan al toque. Con tu key en [api.nasa.gov](https://api.nasa.gov) tenés ≈1000 req/hora.
2. **Cacheá todo.** Guardá la respuesta en un `.json` local y trabajá sobre eso. Pedir la misma URL 50 veces mientras iterás es la forma más rápida de quedarte bloqueado.
3. **Tené un plan B offline.** Guardá una respuesta real de cada API que uses en una carpeta `sample-data/` para la demo, por si cae el WiFi o la API.

## Sin registro (12)

| Fuente | Proveedor | Qué da | Temas | URL de ejemplo | Notas |
| --- | --- | --- | --- | --- | --- |
| EONET | NASA | Eventos naturales activos: incendios, tormentas, volcanes, hielo, inundaciones | incendios, eventos | `https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=5` | |
| USGS Sismos | USGS | Terremotos en tiempo real en GeoJSON | sismos | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` | |
| NOAA SWPC | NOAA | Clima espacial: índice Kp, viento solar, alertas y auroras | clima espacial | `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` | |
| Open-Meteo | Open-Meteo | Pronóstico, histórico desde 1940, calidad del aire y datos marinos | clima, sequía, heladas | `https://api.open-meteo.com/v1/forecast?latitude=-24.78&longitude=-65.41&current_weather=true` | El ejemplo apunta a Salta capital |
| wheretheiss.at | wheretheiss.at | Posición de la ISS (NORAD 25544), TLE y zona horaria por coordenada | órbitas | `https://api.wheretheiss.at/v1/satellites/25544` | Límite: ≈1 req/seg |
| CelesTrak | CelesTrak | Órbitas (GP/TLE/OMM) de miles de satélites, por grupo o NORAD ID | órbitas | `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json` | |
| NASA EPIC | NASA | Foto de la Tierra completa desde 1,5 millones de km (DSCOVR) | imágenes | `https://epic.gsfc.nasa.gov/api/natural` | |
| NASA GIBS | NASA | Más de 1000 capas satelitales como tiles de mapa (WMTS), actualizadas a diario | imágenes, mapa | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/` | Capa de ejemplo: `MODIS_Terra_CorrectedReflectance_TrueColor` |
| JPL SSD / CNEOS | NASA JPL | Asteroides: aproximaciones, riesgo de impacto (Sentry), bólidos y SBDB | asteroides | `https://ssd-api.jpl.nasa.gov/cad.api?dist-max=0.05` | |
| NASA POWER | NASA | Radiación solar y meteo satelital, 1984 a hoy, en cualquier punto del planeta | clima, sequía, agro | `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=-65.41&latitude=-24.78&start=20240101&end=20240131&format=JSON` | Útil para seguros paramétricos por sequía o radiación |
| NASA Exoplanet Archive | NASA / Caltech | Más de 6000 exoplanetas confirmados, con consultas tipo SQL (TAP) | astronomía | `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+pscomppars&format=json` | |
| SpaceX API (comunidad) | Comunidad | Lanzamientos, cohetes y Starlink | lanzamientos | `https://api.spacexdata.com/v5/launches/latest` | Solo mantenimiento desde 2024: no trae lanzamientos nuevos |

## Key gratis (5)

| Fuente | Proveedor | Qué da | Temas | URL | Notas |
| --- | --- | --- | --- | --- | --- |
| NASA Open APIs | NASA | APOD, NeoWs (asteroides), DONKI (tormentas solares) e imágenes | clima espacial, asteroides, imágenes | `https://api.nasa.gov` | Límite: `DEMO_KEY` ≈30/h por IP, key propia ≈1000/h. Sacá tu propia key: el WiFi del evento comparte IP. DONKI: `/DONKI/FLR`, `/CME`, `/GST` |
| NASA FIRMS | NASA | Focos de calor satelitales casi en tiempo real (~3 h de latencia), por bounding box o país (ARG) | incendios | `https://firms.modaps.eosdis.nasa.gov/api/map_key/` | Límite: generoso (≈5000 req/10 min según un cliente). Devuelve CSV, no JSON. La MAP_KEY llega por email |
| N2YO | N2YO | Satélites sobre tu ubicación, pases visibles y posiciones futuras | órbitas | `https://www.n2yo.com/api/` | Límite: 1000 transacciones/hora |
| OpenAQ v3 | OpenAQ | Calidad del aire (PM2.5, NO2, O3…) de más de 30.000 estaciones | aire | `https://explore.openaq.org/register` | Límite: 60/min, 2000/hora |
| Launch Library 2 | The Space Devs | Calendario de lanzamientos del mundo, agencias, astronautas y pads | lanzamientos | `https://thespacedevs.com/llapi` | Límite: 15 req/hora anónimo; con key sube el cupo |

## Avanzado (3)

| Fuente | Proveedor | Qué da | Temas | URL | Notas |
| --- | --- | --- | --- | --- | --- |
| Copernicus Data Space | ESA / Copernicus | Sentinel-1 radar, Sentinel-2 óptico, Sentinel-3 y 5P vía Sentinel Hub API | imágenes, NDVI, agro | `https://documentation.dataspace.copernicus.eu` | Límite: ≈10.000 requests y 10.000 Processing Units al mes. Cuenta gratis + OAuth2. El client secret se ve una sola vez: copialo al crearlo |
| Earth Search (Element 84) | Element 84 | STAC con Sentinel-2, Sentinel-1, Landsat C2, NAIP y DEM Copernicus. Archivos COG en AWS | imágenes, NDVI | `https://earth-search.aws.element84.com/v1` | Sin key |
| Microsoft Planetary Computer | Microsoft | STAC sin cuenta; tokens SAS anónimos para bajar datos | imágenes | `https://planetarycomputer.microsoft.com/api/stac/v1` | Los tokens vencen en ~1 h: usá el paquete `planetary-computer` |

## Argentina (3)

| Fuente | Proveedor | Qué da | Temas | URL | Notas |
| --- | --- | --- | --- | --- | --- |
| SMN datasets abiertos | Servicio Meteorológico Nacional | Alertas meteorológicas de 365 días, estaciones y más, en datos.gob.ar | clima, alertas | `https://datos.gob.ar` | Licencia CC BY 2.5 AR: citá al SMN. Los clientes no oficiales de su API fallan a veces; verificá antes de depender de uno |
| CONAE / SAOCOM | CONAE | Catálogo público con miniaturas y productos operativos para agro y emergencias | imágenes, agro | `https://www.argentina.gob.ar/ciencia/conae` | Los datos completos piden convenio y licencia: mostrá el catálogo como fuente, no cuentes con bajar escenas |
| datos.gob.ar / IGN | IGN | Cartografía y datasets públicos (límites provinciales, etc.) para cruzar con lo satelital | mapa | `https://datos.gob.ar` | |

## Checklist del participante

- [ ] Key de NASA en api.nasa.gov
- [ ] MAP_KEY de FIRMS (si vas a hacer incendios)
- [ ] Cuenta de Copernicus Data Space (si vas a usar imágenes): guardá el OAuth secret
- [ ] Cuenta de Builder Hub, Core Wallet en modo testnet y AVAX del faucet
- [ ] Una respuesta real de cada API que uses guardada en `sample-data/`
- [ ] Un archivo `.env` con las keys; nunca lo subas a GitHub

## Atribución de datos

El pie del sitio del track pide:

- NASA GIBS: reconocé el servicio de imágenes (ver earthdata.nasa.gov/gibs).
- Copernicus: «Contains modified Copernicus Sentinel data [año]».
- SMN: licencia CC BY 2.5 Argentina; citá al Servicio Meteorológico Nacional.
- Posición de la ISS: wheretheiss.at.
- Mapa: Natural Earth (dominio público).

## Material del track

[Repo de skills y APIs](https://github.com/blastonyz/skills-track): skills para tu IA y material de las APIs, listos para pegar como contexto junto con el catálogo y las reglas del track. La copia está en [skills-track/](skills-track/).
