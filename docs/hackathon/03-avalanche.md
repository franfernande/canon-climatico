# Avalanche para el track

Fuente: [avalanche-track.vercel.app/blockchain](https://avalanche-track.vercel.app/blockchain). Capturado el jueves 12 de noviembre de 2026, a las 9:50 (hora de Argentina).

De cero a un contrato desplegado en Fuji: wallet, AVAX de prueba, red, cómo llevar un dato a la cadena y cuándo conviene una L1 propia.

## Cinco pasos hasta la primera transacción

### 1. Instalá Core Wallet

Core es la wallet de Avalanche ([core.app](https://core.app)). Instalala como extensión del navegador y creá una cuenta nueva solo para el hackatón. Anotá la frase de recuperación en papel y no la compartas ni la subas a ningún repo.

### 2. Cambiá a testnet y sumá Fuji

Activá el modo testnet de Core. Si no ves Fuji, agregala con el botón del sitio o cargá los datos a mano. Agregar la red no firma ninguna transacción ni mueve fondos.

| Dato | Valor |
| --- | --- |
| Red | Avalanche Fuji C-Chain |
| Chain ID | 43113 (`0xA869`) |
| RPC | `https://api.avax-test.network/ext/bc/C/rpc` |
| Moneda | AVAX |
| Explorer | [explorer-test.avax.network/c-chain](https://explorer-test.avax.network/c-chain) |

Referencia oficial: [parámetros de red de Mainnet y Fuji](https://docs.avax.network/dapps/chain-settings).

### 3. Creá tu cuenta de Builder Hub

En [Builder Hub](https://build.avax.network/?ref=NNFFY), con la cuenta creada y Core conectada, la consola te manda AVAX de prueba para C-Chain y P-Chain cuando hace falta, y desbloquea la creación de L1.

### 4. Pedí AVAX de prueba (faucet)

La testnet no usa plata real. Hay dos caminos:

| Faucet | Qué pide | Cómo |
| --- | --- | --- |
| [Builder Hub](https://build.avax.network/?ref=NNFFY) | Cuenta de Builder Hub y Core conectada | Dentro de la consola, buscá Primary Network y después Faucet |
| [Core](https://core.app/tools/testnet-faucet/?subnet=c&token=c) | No pide cuenta de Builder Hub, pero sí un cupón | El Academy de Avalanche usa `avalanche-academy` o `avalanche-academy25` y entrega 2 AVAX en C-Chain |

Si el cupón ya no funciona: los cupones pueden vencer. Usá el faucet de Builder Hub o pedile uno a tu mentor.

### 5. Desplegá y verificá

Desplegá tu contrato en Fuji con la herramienta que prefieras ([Remix](https://remix.ethereum.org), Foundry o Hardhat apuntando al RPC de arriba) y abrí la dirección en el explorer. Ese link es lo que hay que entregar.

## Los contratos no llaman APIs

Alguien tiene que llevar el dato. Hay tres patrones, del más simple al más complejo:

1. **Relayer propio.** Un script Node o Python lee la API (FIRMS, DONKI, Open-Meteo), decide y firma una tx que escribe en tu contrato en Fuji. El más rápido para la demo; confiás en tu script, que es centralizado.
2. **Chainlink Functions.** El contrato pide a la red Chainlink que ejecute JS que consulta una API. Requiere una subscription fondeada con LINK de testnet: probalo antes.
   - Router en Fuji: `0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0`
   - DON ID: `fun-avalanche-fuji-1`
3. **Commit de hash.** Guardás solo el hash de la imagen o dataset, más fecha y fuente. Es la prueba de que el dato existía y no cambió. Barato y muy demostrable.

**Datos de mercado.** Chainlink Data Feeds, Chronicle y DIA tienen feeds o demos en Fuji, por si querés combinar precios con datos espaciales.

**Qué pasa si el dato miente.** Para el evento alcanza con un relayer. Para ir más lejos: varios relayers que comparan (mediana o quórum) o una L1 donde los validadores son los proveedores de datos.

## Tu propia L1

En este track una L1 dedicada tiene sentido: validadores, gas y reglas a medida de tu caso. Y desplegarla desde la consola de Builder Hub es simple.

| | Contrato en C-Chain | L1 dedicada |
| --- | --- | --- |
| Quién publica datos | Cualquiera con una wallet | Solo una lista permitida (allowlist) |
| Validadores | Los de la red principal | Los tuyos, por ejemplo los proveedores de datos |
| Gas | AVAX | Token propio, si lo necesitás |
| Reglas | Las de la C-Chain | Personalizadas |
| Despliegue | Desplegás y listo | Unos pasos guiados en la consola de Builder Hub |
| Ejemplo | Promediar datos de varias fuentes | Red de sensores con allowlist y gas propio |

### Creala y desplegala desde la consola

Los nodos de prueba que hostea Builder Hub son gratis y se apagan a los 3 días: alcanzan para el hackatón. Para seguir después, la red local de Avalanche CLI es la opción más estable. Recorré el flujo completo una vez antes de empezar a construir.

1. Crear la L1 en Builder Hub.
2. Desplegarla con nodos de prueba.
3. Conectar la wallet a la L1.
4. Desplegar un contrato de prueba en la L1.

## Documentación

- [Documentación de Avalanche](https://docs.avax.network): referencia técnica de la red, contratos y herramientas.
- [Avalanche Academy](https://docs.avax.network/academy): cursos guiados, desde Core Wallet hasta tu L1.
- [Curso: crear una L1](https://docs.avax.network/academy/avalanche-l1/avalanche-fundamentals/04-creating-an-l1/01-creating-an-l1): el paso a paso oficial, de la cuenta al despliegue.
- [Chat de Builder Hub](https://build.avax.network/chat).
