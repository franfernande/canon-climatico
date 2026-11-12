# Guía paso a paso del track

Fuente: [avalanche-track.vercel.app/guia](https://avalanche-track.vercel.app/guia). Capturado el jueves 12 de noviembre de 2026, a las 9:50 (hora de Argentina).

## De la idea al código en 5 etapas

| Etapa | Qué se hace | Herramientas sugeridas | Resultado |
| --- | --- | --- | --- |
| 1. Buscar el problema | Lluvia de problemas del NOA. Investigá si existe y cuánto cuesta. Cruzalo con un dato del dashboard | Claude, Gemini, Kimi | 3 problemas candidatos |
| 2. Proponer la solución | «Cuando [dato], el contrato [acción]». Una sola función clave. Elegí 1 de los 3 | Claude, ChatGPT | La frase de tu solución |
| 3. Cuestionar la idea | La IA hace de jurado escéptico. ¿Por qué no una base de datos? ¿Quién miente y quién paga? ¿Se hace en 2 días? | Claude, DeepSeek, Gemini | Una idea que sobrevive, o se descarta |
| 4. Validar | Con datos reales, no con opiniones. Llamá a la API y guardá la respuesta. Test de las 4 preguntas. Repasá los 5 criterios | Claude, Qwen | Go o no-go |
| 5. Desarrollar | Recortá a MVP y repartí tareas. Contrato en Fuji temprano. Relayer con dato real. Demo y deck en paralelo | v0, Lovable, Claude | Contrato, demo y pitch |

### Prompt para buscar problemas (etapa 1)

```
Sos un investigador del NOA argentino (Salta, Jujuy, Tucumán, Catamarca).
Dame 10 problemas reales que sufren productores, comunidades o empresas locales
(incendios, heladas, sequía, agua, litio, vid, caña, minería).
Para cada uno: quién lo sufre, qué le cuesta y qué dato público lo mediría (API, satélite, sensor).
Después elegí los 3 más medibles y explicá por qué.
```

### Prompt para atacar tu idea (etapa 3)

```
Sos un jurado técnico escéptico de un hackathon de blockchain.
Esta es la idea: [pegá tu frase].
Atacala sin piedad:
1) ¿Por qué no alcanza una base de datos común?
2) ¿Quién podría mentir o manipular el dato y qué lo impide?
3) ¿Quién paga y quién cobra?
4) ¿El dato existe, es gratis y se actualiza?
5) ¿Se puede construir en 2 días?
6) ¿Qué haría que un jurado la descarte?
Dame las 3 objeciones más fuertes, con nota de 1 a 10, y cómo corregir la idea.
```

## Lo que más se pierde en un hackathon

1. **Un solo flujo.** Dato real, contrato, explorer. Nada más.
2. **Contrato primero.** Sin contrato no hay entrega. Desplegalo temprano.
3. **Guardá datos reales.** Una respuesta de cada API en `sample-data/`.
4. **Justificá la cadena.** Tené las 4 respuestas del test escritas.
5. **Grabá una prueba.** El video falla más que el código.
6. **Recortá sin culpa.** Un MVP que corre le gana a uno ambicioso.

## Un problema que un dato pueda medir

1. ¿A quién le pasa? Alguien concreto del NOA.
2. ¿Qué pasa y qué cuesta?
3. ¿Hay un dato público que lo mida?
4. ¿Alguien tiene que confiar en alguien? Ahí entra la cadena.

Temas sugeridos: incendios, heladas, sequía, lluvias intensas, litio, vid, caña de azúcar, minería, agua.

## Armá tu frase

Campos: dato real (API y campo que usás), condición (umbral o evento), acción del contrato (paga, registra, alerta…) y para quién (persona o grupo del NOA).

> Cuando [dato] [condición], el contrato [acción] para [quién].

## Contrato de ejemplo (sin auditar)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Contrato mínimo: guarda la huella del dato y avisa si cruza un umbral.
contract ThresholdAlert {
    address public immutable publisher;
    uint256 public immutable threshold; // ej: Kp 5

    struct Reading {
        bytes32 dataHash;
        uint64 timestamp;
        uint32 value;
    }
    Reading[] public readings;

    event ReadingPublished(uint256 indexed id, bytes32 dataHash, uint32 value, uint64 timestamp);
    event ThresholdCrossed(uint256 indexed id, uint32 value);

    constructor(uint256 _threshold) {
        publisher = msg.sender;
        threshold = _threshold;
    }

    function publish(bytes32 dataHash, uint32 value, uint64 timestamp) external {
        require(msg.sender == publisher, "solo el publicador");
        readings.push(Reading(dataHash, timestamp, value));
        uint256 id = readings.length - 1;
        emit ReadingPublished(id, dataHash, value, timestamp);
        if (value >= threshold) emit ThresholdCrossed(id, value);
    }
}
```

La guía remite a la [página de blockchain](https://avalanche-track.vercel.app/blockchain#oraculo) para «cómo llevar el dato a la cadena» (ver [03-avalanche.md](03-avalanche.md)).

## Lo que entra y lo que no

| Sí | No, por ahora |
| --- | --- |
| 1 contrato en Fuji, 1 función clave | Login y panel propio |
| 1 dato real, guardado en `sample-data/` | Varias cadenas |
| 1 pantalla con dato y transacción | Base de datos propia |

## Video de 100 segundos

| Tiempo | Qué se muestra |
| --- | --- |
| 0:00 a 0:20 | Problema. Una frase y una imagen real |
| 0:20 a 1:10 | Dato y contrato. Dato real, relayer, transacción en el explorer |
| 1:10 a 1:40 | Por qué blockchain. Las 4 respuestas en una pantalla |

- Tené una transacción confirmada de respaldo.
- Grabá una prueba antes de la final.
- 1080p, sin notificaciones.

## Quién hace qué

Sugerencia. Con menos gente, combinen roles.

| 3 personas | 4 personas | 5 personas |
| --- | --- | --- |
| Contratos y relayer | Contratos y relayer | Contratos y relayer |
| Frontend y UI | Frontend | Frontend |
| Pitch, mercado y video | UI y video | UI y diseño |
| | Pitch y mercado | Pitch deck y pitch |
| | | Mercado y entrega |

| Rol | Qué hace | Entrega | Herramientas |
| --- | --- | --- | --- |
| Desarrollo frontend | Muestra el dato y la acción on-chain. Conectar Core Wallet a Fuji, leer el contrato y sus eventos, link a cada transacción | Una pantalla que funcione de punta a punta | |
| UI y diseño | Se entiende en 10 segundos. Jerarquía: dato, acción, prueba. Estados de carga y error. Capturas para deck y video | Pantallas listas para capturar | Stitch, v0, Gemini |
| Contratos y relayer | Contrato en Fuji y script que lleva el dato. Una función clave y eventos. Desplegar temprano. Relayer con dato real guardado | Contrato en el explorer y una transacción real | Claude, ChatGPT, DeepSeek |
| Pitch deck y pitch | La historia en 5 a 7 slides. Slide «por qué blockchain». Guion del video. Ensayar con cronómetro | Deck, guion y pitch ensayado | Gamma, Claude, Gemini |
| Investigación de mercado | Valida problema y modelo. Quién sufre y qué hay hoy. Quién paga y quién cobra. Fuentes y atribución | Una página de problema y modelo | Claude, ChatGPT, Kimi |

Herramientas de IA que lista el sitio: [Claude](https://claude.ai), [ChatGPT](https://chatgpt.com), [Gemini](https://gemini.google.com), [DeepSeek](https://chat.deepseek.com), [Kimi](https://www.kimi.com), [Qwen](https://chat.qwen.ai), [GLM](https://chat.z.ai), [Gamma](https://gamma.app), [v0](https://v0.app), [Lovable](https://lovable.dev) y [Stitch](https://stitch.withgoogle.com).

## Los 11 pasos

### 1. Elegí la categoría (5 min)

Geoespacial, RWA, Agentes o Libre. Elegís una principal y podés cruzarla con otra.

Resultado: una palabra, tu categoría.

### 2. Buscá un problema local real (10 min)

Pensá en Salta y el NOA: incendios, heladas, sequía, lluvias intensas, litio, vid, caña, minería, agua. Escribí a quién le pasa qué.

Resultado: una frase, «X le pasa a Y».

### 3. Elegí el dato y probá la API (10 min)

Buscá en el dashboard una API que mida tu problema. Hacé una llamada real y guardá la respuesta en `sample-data/` para la demo.

Resultado: un JSON real guardado.

### 4. Pasá el test de blockchain (10 min)

Respondé las 4 preguntas. Si alguna queda sin respuesta, replanteá antes de escribir código.

1. **¿Quién desconfía de quién?** Si hay una sola parte, no hace falta cadena.
2. **¿Qué evento dispara algo on-chain?** Un pago, una liberación, un registro o un voto.
3. **¿Qué pasa si el dato miente?** Hay que tener una respuesta para el oráculo.
4. **¿Quién paga o cobra, y cuánto?** Si no se puede responder, replantear antes de escribir código.

Tipos de uso:

- **Disparador:** libera algo cuando se cumple una condición.
- **Procedencia:** prueba que un dato existía y no cambió.
- **Pago:** cobro entre personas, empresas o máquinas.
- **Propiedad y acceso:** licencias y reparto de ingresos.

Resultado: las 4 respuestas.

### 5. Definí el evento on-chain (15 min)

Pensá el contrato mínimo: una sola función que importe. «Cuando [condición], el contrato [acción]».

Resultado: una oración y una función.

### 6. Resolvé qué pasa si el dato miente (10 min)

Elegí cómo evitar que el dato falle o te lo manipulen. Dibujá 3 cajas: fuente, quien lo publica, contrato.

| Opción | Cómo funciona |
| --- | --- |
| Relayer propio | Un script lee la API y firma una tx en Fuji. El más rápido para la demo; confiás en tu script |
| Varios relayers | Varios publican su lectura y el contrato compara (mediana o quórum) |
| Chainlink Functions | La red Chainlink ejecuta JS que consulta la API. Pide una subscription con LINK de testnet: probalo antes |
| Commit de hash | Guardás solo el hash del dato más fecha y fuente. Barato y muy demostrable |
| L1 con validadores | Los validadores son los proveedores de datos. Una red con reglas y gas propios, hecha para tu caso |

Resultado: un diagrama de 3 cajas.

### 7. Recortá a MVP (10 min)

Un MVP simple que funciona le gana a algo ambicioso que no corre. Anotá 3 cosas que sí y 3 que no.

Resultado: lista de 3 sí y 3 no.

### 8. Desarrollá (la mayor parte del tiempo)

Conectá Core Wallet a Fuji, pedí AVAX de prueba, desplegá el contrato y escribí un script (relayer) que lleve el dato. Pegale a tu IA una respuesta real de la API, no solo el nombre. El reglamento permite herramientas, librerías y servicios públicos, pero pide que la solución sea trabajo original del equipo, producido durante el hackathon.

Resultado: contrato en Fuji y una acción on-chain que funcione.

### 9. Armá el pitch deck (5 a 7 slides)

Problema, solución, cómo funciona (dato → contrato), por qué blockchain, demo, modelo (quién paga y cobra), próximos pasos y fuentes.

| Slide | Qué va |
| --- | --- |
| 1. Problema | A quién le pasa qué, en el NOA |
| 2. Solución | Qué hace tu proyecto en una frase |
| 3. Cómo funciona | Dato real → relayer → contrato |
| 4. Por qué blockchain | Las 4 respuestas del test |
| 5. Demo | Captura de la acción on-chain |
| 6. Modelo | Quién paga y quién cobra |
| 7. Próximos pasos y fuentes | Qué falta y atribución de datos |

Resultado: deck corto con la slide de «por qué blockchain».

### 10. Grabá el video demo (1 a 3 min)

Tres pasos: el problema, el dato entrando, la acción on-chain en el explorer. Mostrá una transacción real.

Resultado: un video que muestre una acción on-chain.

### 11. Entregá (antes del 13/11 a las 09:00)

Revisá la checklist de entrega: contrato en el explorer, video, deck, repo o link, y la línea de atribución a las fuentes. La checklist completa está en [01-requisitos.md](01-requisitos.md).

Resultado: todo subido a tiempo.

## Canvas y prompt

Completá el canvas con una línea por campo y pegalo en tu IA junto con el catálogo de APIs y las reglas del track.

```
Categoría:
Problema local (quién sufre qué):
Dato real que usamos (API + campo):
Evento on-chain (cuando X, el contrato hace Y):
Quién paga / quién cobra:
Qué pasa si el dato miente:
Contrato mínimo (1 función clave):
Video demo (3 pasos):
Fuera de alcance (3 cosas):
```

Con este prompt le pedís 5 ideas distintas y que marque cuáles no justifican blockchain:

```
Contexto: te paso CATALOGO_APIS.md y BRAINSTORM_Y_CATEGORIAS.md.
Soy [programador / no programador] y elijo la categoría [X].
Proponeme 5 ideas distintas para el problema [describí el problema local],
usando solo datos reales del catálogo. Para cada una: dato, evento on-chain,
quién paga, qué pasa si el dato miente, y qué haría falta para un MVP
desplegado en Avalanche Fuji. Marcá cuáles NO justifican blockchain y por qué.
Después ayudame a elegir una y a recortarla a un MVP de 24 horas.
```

`CATALOGO_APIS.md` y `BRAINSTORM_Y_CATEGORIAS.md` no están publicados en el sitio ni en el [repo de skills](https://github.com/blastonyz/skills-track) (commit `6c14b4c`). El catálogo equivalente es [04-datos.md](04-datos.md), y las categorías están en [01-requisitos.md](01-requisitos.md).

Tip del sitio: para que la IA genere bien el cliente, pegale una respuesta real de la API, no solo el nombre.
