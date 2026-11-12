# Material de la hackathon para el track de Avalanche

Todo lo que la organización y los sponsors del track Blockchain (Avalanche × Oracle) publicaron para desarrollar el proyecto: requisitos, pautas y recursos. Quedan afuera los tracks de QualyData (Big Data y Streaming) y Rovers.

Capturado el jueves 12 de noviembre de 2026, a las 9:50 (hora de Argentina). Las páginas pueden cambiar. Ante una duda, la fuente original manda.

## Documentos

| Archivo | Qué tiene |
| --- | --- |
| [01-requisitos.md](01-requisitos.md) | Entregables, fechas, reglas, categorías, criterios de evaluación y premios |
| [02-guia.md](02-guia.md) | La guía paso a paso del track: test de las 4 preguntas, MVP, deck, video, reparto de tareas y prompts |
| [03-avalanche.md](03-avalanche.md) | Core Wallet, red Fuji, faucet, despliegue, cómo llevar un dato a la cadena y L1 propia |
| [04-datos.md](04-datos.md) | Catálogo de las 23 fuentes de datos del track, con límites y consejos |
| [05-geoespacial.md](05-geoespacial.md) | Visores, fuentes de imágenes, librerías de mapas y el patrón «cuando el dato cruza un umbral» |
| [06-oracle.md](06-oracle.md) | El workshop de Oracle Cloud y lo que pide el sponsor |
| [skills-track/](skills-track/) | Copia de las skills para IA que da el track, sin cambios |

## Qué manda sobre qué

1. Las **bases y condiciones** del hackathon. Al 12/11 figuran como «disponible próximamente».
2. El **reglamento oficial**, que es un borrador interino.
3. El **sitio de ayuda del track**. El propio sitio aclara: «Sitio de ayuda del track, no oficial […] El reglamento oficial prevalece sobre este sitio».

## Fuentes

| Fuente | URL |
| --- | --- |
| Sitio del track (guía, datos, blockchain, geoespacial) | https://avalanche-track.vercel.app/ |
| Reglamento oficial | https://competencia.argentinaspace.com/reglamento |
| Sitio del hackathon | https://competencia.argentinaspace.com/ |
| Plataforma de entrega (Hacki) | https://hacki.crecimiento.build/h/competencia-argentina-space |
| Workshop de Oracle (Team1) | https://hub.team1.network/events/workshop-ambiente-de-desarrollo-en-la-nube-de-oracle-h7rb |
| Repo de skills del track | https://github.com/blastonyz/skills-track (copiado del commit `6c14b4c`) |
| Workshops de Team1 | https://github.com/avalancheteam1/workshops |

## Dónde encaja Canon Climático

- **Categoría:** RWA como principal, cruzada con Geoespacial.
- **Dato:** NASA POWER, que está en el catálogo de RWA.
- **Oráculo:** relayer propio, con el hash del dato.
- **Red:** contrato en Fuji.

El detalle está en el [README del proyecto](../../README.md).
