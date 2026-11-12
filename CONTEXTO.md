# Contexto para agentes — Canon Climático

Actualizado: jueves 12 de noviembre de 2026, tarde (deck listo, verificación del código preparada y contrato #3 de 2014/15 preparado para liquidarlo en vivo).

Usá este archivo para retomar el proyecto sin releer todo el historial. La fuente de verdad del producto es [README.md](README.md). Los requisitos oficiales del hackathon están en [docs/hackathon/](docs/hackathon/README.md). Las skills del track están en https://github.com/blastonyz/skills-track (guía técnica; no son el reglamento).

## Qué es

Escrow de saldo de alquiler rural en Avalanche Fuji. El arrendatario deposita el saldo al firmar. Al cerrar la ventana (diciembre + enero, hora Argentina), un relayer publica la lluvia de NASA POWER (`PRECTOTCORR_SUM`) y el contrato reparte según tramos acordados:

| Lluvia | Reparto |
| --- | --- |
| > 305 mm | 100 % dueño |
| 255–305 mm | 80 % dueño / 20 % arrendatario |
| ≤ 255 mm | 50 / 50 |

- Hackathon Argentina Space 2026, track Blockchain (Avalanche × Oracle).
- Categoría: RWA, cruzada con Geoespacial.
- Lote demo: Anta, Salta (−25,12 / −64,13).
- Entrega: viernes 13/11 (guía del track ~09:00; Hacki cierra ~10:00).

## Estado actual (dónde estamos)

| Ítem | Estado |
| --- | --- |
| Contrato + tests (33) | Listo |
| Relayer + verificador (3 controles) | Listo |
| Página `web/` (Next.js estático) | Lista; se ve con `cd web && npm run build && npm start` |
| Deploy + liquidación en Fuji | **Hecho** (commit `3c2e55a`) |
| Código verificado en el explorer | **Falta subirlo** (ver «Verificación del código») |
| Video 1–3 min | **Falta**. Se liquida el #3 en vivo durante la grabación |
| Pitch deck 5–7 slides | **Listo (v1)**: ruta `/deck` de `web/` → `entrega/canon-climatico-pitch.pdf`. Regenerarlo después de liquidar el #3 |
| Carga en Hacki | **Falta** |
| Repo público / acceso jurado | Repo **privado**; hay que dar acceso o abrirlo al entregar |
| Deploy en Vercel | **No obligatorio**. Solo aparece como tip en la skill `frontend` de skills-track. Los entregables oficiales no lo piden |

### Fuji (ya en cadena)

- Contrato: [`0x6A84f4eB05f415AB414ca593e07B80728491eA15`](https://explorer-test.avax.network/c-chain/address/0x6A84f4eB05f415AB414ca593e07B80728491eA15)
- Tx deploy: [`0x02b862…7b36`](https://explorer-test.avax.network/c-chain/tx/0x02b862db95991f4057a44e0a876ea0b25c44200651c4e5907b2866095b2a7b36)
- `modoDemo: true` (acepta campañas pasadas para la demo)
- Artefactos: `deployments/fuji.json`, `sample-data/fuji/…`, `web/data/fuji.json`, `web/public/datos/fuji/…`

| Id | Campaña | Lluvia | Reparto | Verificación |
| --- | --- | --- | --- | --- |
| 1 | 2024/25 | 243,2 mm | 50/50 | 3 OK |
| 2 | 2023/24 | 323,6 mm | 100 % dueño | 3 OK |
| 3 | 2014/15 | 287,0 mm (120,22 + 166,73 = 286,95) | 80/20 | Liquidado el 12/11 a la tarde desde esta PC (tx `0xa6d538…d19c`); falta `retirar` (0,08 y 0,02) y `verificar -- 3` |
| 4 | 2014/15 | — | 80/20 | Creado y depositado desde las pantallas (saldo 0,005); es el que se liquida con el botón en el video |

Retiros: dueño 0,15 AVAX; arrendatario 0,05 AVAX (pago por pull: `liquidar` anota; `retirar` mueve la plata).

El #3 se ensayó completo en la red local (crear, depositar, relayer con NASA en vivo, retirar 0,08 y 0,02, verificar 3 OK) y después se creó en Fuji: [fondeo del arrendatario](https://explorer-test.avax.network/c-chain/tx/0x356ae5a7c7f73018273fde4f57b8a5c1b7c2d91dfe431f9729ce17d20bd8ee77), [crear](https://explorer-test.avax.network/c-chain/tx/0x958ea9083fdf5ea5baf97002ea30900a9674a0bf7b159115518e88e4936bb47d) y [depositar](https://explorer-test.avax.network/c-chain/tx/0x3eadacf3441d480e2167dc5f94a16d573acd8e8a3236268aa1d7972448f6fc38). En cadena: estado Depositado, 0,1 AVAX, ventana del 1/12/2014 al 1/2/2015 (ART), y `porcentajeArrendatario(3, 2870)` da 20. Saldos después: relayer 0,02 AVAX, dueño 0,17 y arrendatario 0,01. Alcanzan de sobra para liquidar y retirar: en Fuji, `crear` costó 0,00024 AVAX y `liquidar`, 0,00000000002.

### Verificación del código

No está verificado en ningún explorer (AvaCloud, Sourcify ni Snowtrace), así que el explorer muestra `liquidar` y `Liquidado` en hexadecimal. El explorer de los links (explorer-test.avax.network) pide el `.sol` y el `metadata.json`: Tools → Smart Contract Verification, subir `contracts/CanonClimatico.sol` y `entrega/verificacion/metadata.json` y pegar la dirección. Ese metadata se regeneró con el solc 0.8.28 de la caché de Hardhat y el mismo input de `artifacts/build-info/`, y su hash IPFS (`0af83846…`) es el que figura al final del bytecode en Fuji. No hace falta redeployar.

## Entregables oficiales (lo que manda)

Fuente: `docs/hackathon/01-requisitos.md`.

1. Contrato en Fuji + link explorer — hecho  
2. Video demo 1–3 min con acción on-chain — falta  
3. Pitch deck 5–7 slides con slide «por qué blockchain» — hecho (`entrega/canon-climatico-pitch.pdf`)  
4. Repo o link del proyecto — existe; cuidar acceso  
5. Atribución de fuentes — hecha (README + pie de la web)  
6. Opcional: `sample-data/` — hecho  

## Stack

- Hardhat 3.21.2, ethers 6.17.0, solc 0.8.28, Node ≥ 22 (mejor 24), TypeScript ESM.
- Claves Fuji en `.env` (ver `.env.example`): `FUJI_PRIVATE_KEY` o alias `METAMASK_PRIVATE_KEY`, `FUJI_DUENO_KEY`, `FUJI_ARRENDATARIO_KEY`. Nunca en el repo.
- Web: Next 16.4.6 + React 19.3.1 en `web/`, datos estáticos vía `npm run web:datos` (no wallet en el browser).

## Flujo on-chain

`crear` (dueño) → `depositar` (arrendatario, `msg.value == saldo`) → tras `finVentana`, `liquidar` (solo relayer, con `lluviaDecimasMm` + `hashDato`) → cada parte llama `retirar`. Si nadie liquida a tiempo: `reembolsar`. Si no depositan a tiempo: `cancelar` (dueño).

El relayer está fijado al crear y no puede ser dueño ni arrendatario. El hash es SHA-256 del JSON crudo de NASA POWER guardado en `sample-data/`. Un re-fetch no reproduce el mismo hash (`times` cambia); `scripts/verificar.ts` hace tres controles: hash archivo↔cadena, valores archivo↔pedido fresco, suma↔lluvia on-chain.

Lluvia en décimas de mm (`uint32`). Suma en centésimas y redondeo half-up a décimas (ej. 286,95 → 287,0).

## Comandos útiles

```bash
npm test
npm run deploy:fuji
npm run demo:fuji
npm run relayer:fuji
npm run retirar:fuji
npm run verificar -- 1
npm run verificar -- 2
npm run web:datos
cd web && npm run dev   # o build + start
```

Ensayo local: `npx hardhat node` + los mismos scripts con `--network localhost` + `node scripts/exportar-web.ts localhost` + `$env:RED="localhost"; npm run dev` dentro de `web/`.

Contrato #3 y grabación (PowerShell):

```powershell
$env:CAMPANIAS="2014"; npm run demo:fuji; Remove-Item Env:CAMPANIAS   # ya hecho el 12/11: creó y depositó el #3
$env:IDS="3"; npm run relayer:fuji; Remove-Item Env:IDS               # en la toma: liquida el #3 (una sola vez)
npm run retirar:fuji
npm run verificar -- 3
npm run web:datos
```

Deck: `cd web && npm run build && npx next start -p 3210` y el comando de Edge de la sección «La página» del README, que reescribe `entrega/canon-climatico-pitch.pdf`.

## Estructura clave

```
contracts/CanonClimatico.sol   escrow + tramos + retiros + modoDemo
contracts/test/RechazaPagos.sol  helper de tests (dueño que rechaza ETH)
scripts/lib/power.ts           NASA POWER, ventanas ART, suma, sha256
scripts/lib/despliegue.ts      deployments/, links explorer
scripts/deploy.ts | demo.ts | relayer.ts | retirar.ts | verificar.ts | exportar-web.ts
test/                          33 tests (contrato + power)
web/                           demo estática
web/app/(flujo)/               pantallas con wallet (1 wallets, 2 crear, 3 depositar, 4 cobrar)
web/components/flujo/          Wallet.tsx (EIP-6963, red Fuji, firma, roles fijos) y las pantallas
web/lib/cadena.ts              lectura del contrato desde el navegador y errores en castellano
web/app/deck/                  pitch de 7 slides (1280 × 720) con los datos de la web
entrega/                       PDF del pitch, guion del video y metadata para verificar el código
docs/hackathon/                requisitos y guía capturados del track
sample-data/                   respuestas NASA (tratar como binary; ver .gitattributes)
```

## Decisiones que no hay que reabrir sin pedido

- Relayer propio (no Chainlink Functions) + commit de hash + verificador off-chain.
- El botón «Liquidar» de `/alquiler/<id>` llama a `POST /api/relayer/<id>` (`web/app/api/relayer/[id]/route.ts`), que corre `npm run relayer:fuji` con `IDS=<id>` en la raíz y después `npm run web:datos`. Solo con `npm run dev` o `RELAYER_DESDE_WEB=1`; necesita el `.env` de la raíz. La pantalla dice que se liquida al fin de la ventana y que a los 60 días se puede reembolsar.
- La home y el deck son estáticos, alimentados por el export. Las pantallas con wallet (`/proceso`, `/crear`, `/alquiler/<id>`, `/cobrar`, en `web/app/(flujo)/`) las pidió el usuario el 12/11: firman desde Core o MetaMask con las tres cuentas de la demo fijas (no se pueden editar). El relayer sigue en la terminal.
- Campañas de demo: 2024/25 (seca) y 2023/24 (normal), más 2014/15 (tramo medio), que se liquida en vivo en el video. El #3 lo pidió el usuario el 12/11.
- Umbrales 2550/3050 décimas; `pctMedio` 20; `pctBajo` 50.
- Repo GitHub: `franfernande/canon-climatico` (privado).
- `docs/hackathon/` es material de guía; no mezclarlo con código del producto.

## Próximo paso recomendado

1. Subir la verificación del código al explorer (antes de grabar: así la tx de `liquidar` se lee).  
2. Opción con pantallas: en `/crear` el dueño crea un alquiler nuevo (con saldo chico, por ejemplo 0,005 AVAX, porque al arrendatario le quedan 0,01), en `/alquiler/<id>` deposita el arrendatario, se corre `$env:IDS="<id>"; npm run relayer:fuji` y los dos cobran en `/cobrar`. El #3 queda de respaldo. Las cuentas del dueño y del arrendatario tienen que estar importadas en la wallet del navegador.  
   Opción sin pantallas: grabar con la web en `npm run dev` (así, después de `npm run web:datos`, alcanza con recargar). La tarjeta #3 arranca «Depositado»: correr el relayer del #3 en vivo, abrir la tx y recargar. Primero una toma de prueba sin el relayer; el relayer va solo en la final. 1080p y sin notificaciones.  
3. `retirar`, `verificar -- 3`, `web:datos`, regenerar el PDF y commitear.  
4. Entrega en Hacki antes de las 09:00 y acceso al repo para el jurado.

Vercel u otro host de la web: opcional, solo si conviene mostrar la demo en el celular del jurado.

## Qué no hacer

- No subir `.env`, claves ni `NEXT_PUBLIC_*` con secretos.
- No reescribir el contrato ni redeployar en Fuji salvo bug bloqueante o pedido explícito (ya hay txs de demo en el explorer).
- No asumir que Vercel / Oracle Cloud / L1 propia son obligatorios: confirmar contra `docs/hackathon/01-requisitos.md`.
- No convertir EOL de JSON en `sample-data/` (rompe el hash on-chain).
- No correr el relayer sobre el #3 fuera de la toma: se liquida una sola vez. Correrlo siempre con `$env:IDS`: sin esa variable liquida todos los depositados.
- Los alquileres creados desde `/crear` no quedan en `deployments/fuji.json` (eso lo escribe `demo.ts`): su tarjeta en la home sale sin los links de crear y depositar, pero con el de la liquidación. El guion del video está en `entrega/guion-video.md`.

## Trampas conocidas (Windows)

- Cerrar la shell no mata `next start`: el proceso sigue escuchando el puerto. Detenerlo por PID (`Get-NetTCPConnection -LocalPort 3210`).
- Hardhat borra al compilar las carpetas que no reconoce dentro de `artifacts/`. Lo que haya que conservar va en `entrega/`.
- Edge headless reusa la caché del perfil y puede imprimir una versión vieja: usar un `--user-data-dir` nuevo en cada corrida.
- En el puerto 8545 suele haber un `hardhat node` de un ensayo anterior: se puede usar para ensayar; no hace falta cerrarlo.
