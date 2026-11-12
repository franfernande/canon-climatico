# Guion del video de la demo

Duración: unos 2 minutos y medio (el track pide entre 1 y 3). Se graba la pantalla con la voz en off; las esperas de la wallet y de Fuji se cortan en la edición.

## Antes de grabar

En la PC que graba:

1. Clonar el repo y levantar la web (PowerShell, un comando por línea):

   ```powershell
   git clone https://github.com/franfernande/canon-climatico.git
   cd canon-climatico\web
   npm install
   npm run dev
   ```

   Abrir `http://localhost:3000` (no la dirección `192.168…`).
2. En MetaMask o Core, importar las cuentas del **dueño** (`0x7886…634A`) y del **arrendatario** (`0x2649…b51e`) con sus claves privadas. Las claves se pasan en persona, nunca por el repo ni por un grupo.
3. Conectar la wallet en `/proceso`, aceptar el cambio a Fuji y autorizar las dos cuentas en el sitio.
4. Al arrendatario le quedan 0,01 AVAX: usar **saldo 0,005 AVAX**, o cargar AVAX de prueba en el faucet.
5. Acordar quién corre el relayer. Lo más simple: lo corre el dueño del repo desde su PC, con su `.env`; la pantalla de quien graba se actualiza sola.
6. Verificar el código del contrato en el explorer (README, paso 6 de «En Fuji»), así las transacciones se leen por nombre.
7. Pantalla en 1080p, zoom del navegador al 125 %, notificaciones apagadas, pestañas de más cerradas.
8. Hacer una vuelta completa de ensayo. Cada vuelta crea un alquiler nuevo; no hay problema.

## Guion

El número del alquiler nuevo aparece al crearlo; abajo se usa `#4` como ejemplo.

| Tiempo | Pantalla y acción | Voz |
| --- | --- | --- |
| 0:00–0:15 | Página principal: portada y gráfico de las 21 campañas | «En Anta, Salta, el campo se alquila a valor fijo y el saldo se paga en la cosecha, llueva o no. En 2024/25 llovieron 243 milímetros en diciembre y enero: solo dos campañas desde 2004 fueron más secas. Con un alquiler fijo, el arrendatario paga igual.» |
| 0:15–0:25 | Botón «Probar el flujo con wallets» → `/proceso`: las tres wallets | «Con Canon Climático, el saldo va a un contrato en Avalanche y se reparte solo, según la lluvia que mide NASA. Hay tres partes: el dueño, el arrendatario y un relayer que informa la lluvia.» |
| 0:25–0:55 | Cuenta **dueño**. `/crear`: campaña 2014/15, saldo 0,005, tramos 255 y 305 mm, 20 % y 50 %. «Firmar y crear el alquiler» → MetaMask → «Alquiler #4 creado» | «El dueño escribe las condiciones: la campaña, el saldo y los tramos. Más de 305 milímetros, todo para él; entre 255 y 305 vuelve el 20 % al arrendatario; menos, la mitad. Firma con su wallet y las condiciones quedan en la cadena: ya nadie las puede cambiar. Le queda un link para el arrendatario.» |
| 0:55–1:20 | Cambiar a la cuenta **arrendatario**. Abrir el link `/alquiler/4`: condiciones. «Depositar 0,005 AVAX y aceptar» → MetaMask → «Depositado» | «El arrendatario abre el link y lee las condiciones directo del contrato. Deposita el saldo desde su wallet: la plata no va al dueño, queda en el contrato. Con ese depósito acepta las condiciones.» |
| 1:20–1:45 | Terminal: `$env:IDS="4"; npm run relayer:fuji` (se ven los 287,0 mm, el hash y el link). Volver al navegador: la pantalla pasa sola a «Liquidado», 287,0 mm, tramo medio | «Cuando termina enero, el relayer le pide la lluvia a NASA POWER, guarda la respuesta y publica en Fuji el total y el hash del archivo. 287 milímetros: tramo medio. El contrato anota el 80 % para el dueño y el 20 % para el arrendatario.» |
| 1:45–2:05 | `/cobrar`: con la cuenta arrendatario, «Retirar 0,001 AVAX»; con la cuenta dueño, «Retirar 0,004 AVAX». Abrir un link al explorer | «Cada uno cobra lo suyo cuando quiere, firmando desde su wallet. Nadie tiene que pedirle la plata al otro, y cada paso queda en el explorer de Avalanche.» |
| 2:05–2:25 | Terminal: `npm run verificar -- 4` (tres OK) | «¿Y si el relayer miente? Cualquiera lo comprueba sin claves: el archivo tiene el hash que está en la cadena, sus valores son los que hoy devuelve NASA POWER y la suma da la lluvia liquidada. Una mentira queda a la vista y firmada por el relayer, que no puede ser ninguna de las partes.» |
| 2:25–2:40 | Slide 4 del deck, «Por qué blockchain», y cierre con la atribución | «Dueño y arrendatario desconfían entre sí. Con una cláusula en papel, el ajuste se negocia después de la sequía. Con Canon Climático, la regla queda escrita al firmar y la plata ya está adentro. Datos de NASA POWER, contrato en Avalanche Fuji.» |

`verificar` se corre en la PC donde corrió el relayer, porque ahí quedó guardado el JSON de NASA (`sample-data/fuji/…/4.json`).

## Si algo sale mal

- **Correr el relayer siempre con `$env:IDS`.** Sin esa variable liquida todos los alquileres depositados, incluido el #3 de respaldo.
- **El relayer se corre una sola vez por alquiler.** Si la toma falla después de liquidar, se crea otro alquiler y se repite desde «Crear».
- Si MetaMask no muestra la cuenta que corresponde, el botón «Cambiar de cuenta» vuelve a abrir el selector.
- Si la pantalla dice que no alcanza el AVAX, bajar el saldo o cargar AVAX en el faucet.
- Respaldo: los alquileres #1 y #2 ya están liquidados, y el #3 (0,1 AVAX) está depositado.

## Después de grabar

En la PC donde corrió el relayer:

```powershell
npm run web:datos
git add deployments/fuji.json sample-data/fuji/ web/data/fuji.json web/public/datos/fuji/
```

Después regenerar el PDF del deck (README, sección «La página») para que muestre el alquiler nuevo, commitear y subir el video a YouTube como no listado.
