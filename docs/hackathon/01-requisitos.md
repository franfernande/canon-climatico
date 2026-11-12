# Requisitos del track Blockchain

Fuentes: la portada del [sitio del track](https://avalanche-track.vercel.app/), el [reglamento oficial](https://competencia.argentinaspace.com/reglamento), el [sitio del hackathon](https://competencia.argentinaspace.com/) y la [página de Hacki](https://hacki.crecimiento.build/h/competencia-argentina-space). Capturado el jueves 12 de noviembre de 2026, a las 9:50 (hora de Argentina).

## Evento

- 11, 12 y 13 de noviembre de 2026, en el Centro de Convenciones de Salta.
- Cuatro tracks: Rovers, Blockchain, Big Data y Streaming (estos dos últimos, de QualyData). «Cada equipo elige un único track y trabaja sobre él durante todo el evento.»
- El track Blockchain lo organizan Avalanche y Team1 LATAM, con Oracle en el premio.

Agenda publicada en el sitio del hackathon («Los horarios detallados se publicarán antes del evento»):

| Día | Bloques |
| --- | --- |
| Miércoles 11 | Acreditación, apertura, formación de equipos, trabajo, mentorías, cierre del día |
| Jueves 12 | Trabajo, mentorías, cierre del día |
| Viernes 13 | Entrega de proyectos, pitches, premiación, cierre |

## Fecha y hora de entrega

Las fuentes no dicen lo mismo:

| Fuente | Qué dice |
| --- | --- |
| Sitio del track, portada | «Viernes 13/11, tercera jornada» |
| Guía del track, paso 11 | «Antes del 13/11 a las 09:00» |
| Hacki | Abrió el 11/11 a las 09:00 y cierra el 13/11 a las 10:00 |
| Reglamento | «Los proyectos se entregan durante la tercera jornada, según la guía de entrega publicada en recursos» |

## Entregables

Del sitio del track: «Un MVP que funciona le gana a algo ambicioso que no corre. Un equipo, un solo track.»

1. **Contrato desplegado.** En Fuji o en tu L1, con link al explorer. Sin contrato no hay entrega.
2. **Video demo.** 1 a 3 minutos, con una acción on-chain.
3. **Pitch deck corto.** 5 a 7 slides, una con el «por qué blockchain».
4. **Repo o link del proyecto.** O el link de v0, Lovable o Stitch. Sin repo no descalifica.

Checklist de entrega de la guía del track:

- [ ] Dirección del contrato en el explorer de Fuji (o de la L1)
- [ ] Video demo (1 a 3 min) con una acción on-chain
- [ ] Pitch deck corto, con la slide «por qué blockchain»
- [ ] Repo o link del proyecto (v0 u otra herramienta) si se puede
- [ ] Una línea de atribución a las fuentes de datos
- [ ] Opcional: `sample-data/` con una respuesta real de cada API usada (plan B si cae internet)

## Categorías

«Tres categorías y una libre. Elegís una principal y podés cruzarla con otra.»

| Categoría | Qué es | Condición | Datos sugeridos |
| --- | --- | --- | --- |
| Geoespacial (dato real del espacio) | Un dato del espacio decide algo on-chain: un pago, un registro o una alerta | Usa al menos un dato real del catálogo | FIRMS, EONET, USGS, NOAA SWPC, Sentinel |
| RWA (activos del mundo real) | Agro, minería y otros activos físicos representados on-chain | No se tokeniza nada real: activos simulados, datos reales | Sentinel-2 NDVI, POWER, Open-Meteo, Earth Search |
| Agentes (identidad, reputación y pagos) | Agentes o dispositivos con identidad, reputación y pagos | Identidad, reputación o pagos on-chain | FIRMS, Open-Meteo, ERC-8004, x402 |
| Libre (experimental) | Cualquier cosa con blockchain. Premia la originalidad | Pasa el test de las 4 preguntas | Lo que se te ocurra |

## Criterios de evaluación

«Cinco criterios, el mismo peso. Del documento del track. Lo nuevo: justificá por qué necesitás una cadena.»

| Criterio | Qué se mira |
| --- | --- |
| Impacto | ¿A quién le resuelve qué y quién paga? Un problema local real del NOA suma |
| Creatividad | ¿El cruce de dato y blockchain es original, aunque el MVP sea simple? |
| Validez | ¿Funciona? Contrato desplegado, una acción demostrable on-chain y datos reales |
| Justificación de blockchain | ¿Pasa el test de las 4 preguntas y responde qué pasa si el dato miente? |
| Presentación | Video demo y pitch claros, con atribución de las fuentes de datos |

El reglamento aclara: «La composición del jurado y los criterios de evaluación definitivos, con su ponderación, se publican en las bases y condiciones.»

## Premios del track Blockchain

| Puesto | Avalanche | Oracle |
| --- | --- | --- |
| 1.º | USD 400 en AVAX | USD 500 en créditos de Oracle |
| 2.º | USD 200 en AVAX | USD 500 en créditos de Oracle |
| 3.º | USD 100 en AVAX | USD 500 en créditos de Oracle |

- «Los montos en AVAX están expresados en USD.» El sitio del track agrega: «Confirmá con la organización si el pago es en AVAX».
- Es un solo podio para todo el track, no uno por categoría.
- Los ganadores se anuncian en la premiación del viernes 13.
- El sitio del hackathon dice que «todos los participantes presenciales tendrán créditos de Devin AI».

## Reglamento (borrador interino)

- **Participantes:** personas mayores de edad. Participar implica aceptar el reglamento, el código de conducta y las bases y condiciones.
- **Equipos:** se puede llegar con equipo o sumarse a la formación de equipos del primer día. «El tamaño mínimo y máximo de los equipos se define en las bases y condiciones.»
- **Originalidad:** «El desarrollo del proyecto se realiza durante las jornadas del evento. Se pueden usar herramientas, librerías y servicios públicos preexistentes, pero la solución presentada debe ser trabajo original del equipo, producido durante el hackathon.»
- **Entrega y jurado:** cada equipo presenta su proyecto en un pitch ante el jurado. «Las decisiones del jurado son definitivas.»
- **Propiedad intelectual:** los proyectos pertenecen a los equipos, salvo indicación en contrario en las bases. Al participar, los equipos autorizan a la organización a difundir el nombre, la descripción y las imágenes de sus proyectos.
- **Convivencia:** rige el código de conducta. Incumplirlo puede llevar desde una advertencia hasta la expulsión y la exclusión de la evaluación.
- **Cambios:** la organización puede ajustar la agenda, los espacios o el reglamento y lo comunica por los canales oficiales. Ante situaciones no previstas, decide la organización.
- **Consultas:** marketing@argentinaspace.com.

## Lo que todavía no está publicado

- **Bases y condiciones:** figuran como «Disponible próximamente». Definen el tamaño de los equipos, los requisitos de participación, el cronograma y los criterios definitivos con su ponderación, y prevalecen sobre el reglamento.
- **Guía de entrega de proyectos:** el sitio del hackathon dice que «se publica antes del evento». La única checklist de entrega publicada es la de la guía del track.
- **Hacki:** la página del hackathon dice «No details have been added for this hackathon yet».
- **El reglamento** es un borrador interino.
