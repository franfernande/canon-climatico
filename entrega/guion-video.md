# Guion del video: pitch y demo (máximo 3 minutos)

El video junta el pitch (slides del deck) y la demo en vivo en Fuji, grabada en local (`localhost`): en la versión de Vercel, MetaMask muestra una advertencia de phishing por ser un subdominio nuevo de `vercel.app`. La demo recorre las cuatro pantallas en el orden de la barra de pasos, y cada parte firma desde su propia wallet en MetaMask: el dueño crea, el arrendatario deposita, el relayer liquida con la lluvia de NASA y cada uno cobra. La voz suma unas 430 palabras, unos 2:50 a ritmo normal: hay que cortar en la edición las esperas de MetaMask y de Fuji.

## Cómo grabarlo

1. **Slides:** abrir `entrega/agrorenta-pitch.pdf` en Firefox y pasar a modo presentación (botón «>>» → «Modo presentación», o Ctrl+Alt+P). Se avanza con la flecha derecha.
2. **Demo:** levantar la web en una PowerShell (un comando por línea; PowerShell no acepta `&&`):

   ```powershell
   cd C:\proyects\canon-climatico\web
   npm run dev
   ```

   y abrir `http://localhost:3000/proceso` en otra pestaña de Firefox (no la dirección `192.168…`). Al liquidar, el JSON de NASA se guarda solo en el repo.
3. **Grabar la pantalla entera**, no solo la ventana de Firefox, porque las ventanas de MetaMask se abren aparte. Sirve la Herramienta Recortes (Win+Shift+R) u OBS. 1080p, notificaciones de Windows apagadas, Firefox al 125 % para la demo.
4. Lo más cómodo es grabar la pantalla **sin voz** siguiendo la tabla, y después poner la voz encima en Clipchamp (viene con Windows), cortando las esperas de MetaMask y de Fuji.

## Antes de grabar

1. **MetaMask con las tres cuentas importadas:** el dueño (`0x7886…634A`, `FUJI_DUENO_KEY`), el arrendatario (`0x2649…b51e`, `FUJI_ARRENDATARIO_KEY`) y el relayer (`0x9FB4…D3e2`, `FUJI_PRIVATE_KEY`). Las claves están en el `.env`; nunca se pegan en un chat ni en el repo.
2. **Las tres autorizadas en el sitio:** en `/proceso`, «Conectar MetaMask» y después «Cambiar de cuenta», y marcar las tres. Si no, MetaMask no deja pasar de una a otra en la página.
3. **AVAX para el gas:** en `/proceso` se ve el saldo de cada wallet. Si alguna está en 0 (el dueño lo estaba), mandale 0,05 AVAX desde el arrendatario en MetaMask.
4. **Ensayo con el #4**, que está depositado: en `/alquiler/4`, cambiar a la cuenta **relayer** y apretar «Liquidar con la lluvia de NASA POWER». Así se prueba la firma del relayer antes de la toma.
5. **Dejar en cero lo pendiente de cobro:** en `/cobrar`, retirar con el arrendatario y después con el dueño. Así, en el video, «Cobrar» muestra solo lo del alquiler nuevo.
6. **Verificar el código del contrato** en el explorer (README, «En Fuji», paso 6), para que la transacción de `liquidar` se lea por nombre.

El alquiler nuevo va a ser el **#5** si nadie crea otro antes; si sale otro número, usá ese.

## Guion

| Tiempo | Pantalla y acción | Voz |
| --- | --- | --- |
| 0:00–0:03 | **Portada**: título, subtítulo e ilustración | Sin voz, o solo «AgroRenta». |
| 0:03–0:25 | **Slide 1**, el problema y las tres salidas de hoy | «En Anta, Salta, la soja se siembra sin riego y el campo se alquila a valor fijo: anticipo al firmar y saldo en la cosecha. Si hay sequía, el arrendatario paga igual. Hoy hay tres salidas: la aparcería depende de lo que se declare; la cláusula climática se negocia después de la sequía, y la imprevisión es un juicio lento y caro. Ninguna se ejecuta sola.» |
| 0:25–0:40 | **Slide 2**, solución: los tres tramos | «AgroRenta pone el saldo en un contrato en Avalanche al firmar, y lo reparte solo según la lluvia que mide NASA en el lote: más de 305 milímetros, todo al dueño; entre 255 y 305, vuelve el 20 % al arrendatario; menos, la mitad.» |
| 0:40–0:46 | **Slide 3**, cómo funciona: firma, dato y reparto | «Funciona en tres pasos: la firma, el dato y el reparto. Veámoslo en vivo, en la red de prueba de Avalanche.» |
| 0:46–0:58 | **Demo · pantalla 1, «1. Wallets»** (`/proceso`). Señalar la barra con los cuatro pasos y la tabla de las tres wallets: dueño, arrendatario y relayer. Conectar MetaMask con la cuenta **dueño**: arriba aparece su dirección con la etiqueta «dueño» y su fila queda marcada | «La demo sigue los cuatro pasos de la barra. Hay tres wallets: el dueño, el arrendatario y el relayer, que informa la lluvia. Cada uno firma desde la suya. Empiezo con la del dueño.» |
| 0:58–1:13 | **Pantalla 2, «2. Crear (dueño)»**. Mostrar lo que queda fijo y elegir campaña 2014/15 y saldo 0,01; los tramos se actualizan. «Firmar y crear el alquiler» → confirmar en MetaMask → «Alquiler #5 creado» → clic en el link | «Paso dos, la pantalla del dueño: elige la campaña, el saldo y los tramos, y ve cómo se reparte. Firma, y las condiciones quedan en la cadena: ya nadie las puede cambiar. Le queda un link para el arrendatario.» |
| 1:13–1:28 | **Pantalla 3, «3. Depositar (arrendatario)»** (`/alquiler/5`). En MetaMask, cambiar a la cuenta **arrendatario** (que se vea): arriba cambia la etiqueta a «arrendatario». Recorrer las condiciones y la línea «Liquidación». «Depositar 0,01 AVAX y aceptar» → confirmar en MetaMask → «Depositado» | «Paso tres, la pantalla del arrendatario: abre el link con su wallet y ve las condiciones leídas del contrato, con los plazos. Deposita, y la plata queda en el contrato, no en manos del dueño.» |
| 1:28–1:50 | Misma pantalla: señalar el texto de los plazos y el aviso «Para liquidar, conectá la wallet del relayer». En MetaMask, cambiar a la cuenta **relayer** (que se vea): arriba aparece la etiqueta «relayer» y el botón se activa. Apretar «Liquidar con la lluvia de NASA POWER»: aparecen los valores de NASA, la suma y el SHA-256; confirmar en MetaMask. La pantalla pasa a «Liquidado»: 287,0 mm, tramo medio. Clic en «ver la transacción en el explorer» | «Cuando termina la ventana, liquida el relayer: en producción corre solo, y si no lo hiciera, a los 60 días cualquiera puede reembolsar. Me conecto con su wallet, la única que el contrato acepta. Pide el dato a NASA POWER, calcula el hash y lo publica: 287 milímetros, tramo medio. El contrato anota 80 % para el dueño y 20 % para el arrendatario.» |
| 1:50–2:05 | **Pantalla 4, «4. Cobrar»**. Cambiar a la cuenta **arrendatario**, «Retirar 0,002 AVAX». Cambiar a **dueño**, «Retirar 0,008 AVAX» (en la edición, este segundo retiro puede ir acelerado) | «Paso cuatro, cobrar: cada uno retira lo suyo desde su wallet, sin pedirle nada al otro, y cada transacción queda en el explorer de Avalanche.» |
| 2:05–2:30 | **Slide 4**, por qué blockchain | «¿Por qué blockchain? Dueño y arrendatario desconfían entre sí. Con una cláusula en papel, el ajuste se negocia después; acá la regla y la plata están desde la firma. ¿Y si el relayer miente? El hash del dato queda publicado: cualquiera lo verifica sin claves, y la mentira queda firmada.» |
| 2:30–2:47 | **Slide 5**, modelo de negocio | «Paga el arrendatario, con una comisión por contrato, porque es quien compra la protección. Llegamos por los corredores rurales que ya redactan estos contratos. El dato es gratis; el costo es el gas.» |
| 2:47–3:00 | **Portada** otra vez, para cerrar | «AgroRenta: el alquiler rural que se ajusta con la lluvia. Datos de NASA POWER, contrato en Avalanche Fuji.» |

Si el video se pasa de 3 minutos, primero acortá las esperas de la demo; después, la voz de la slide 5 se puede reducir a «Paga el arrendatario, con una comisión por contrato».

## Si algo sale mal

- **MetaMask no muestra la cuenta que corresponde:** «Cambiar de cuenta», en la barra de arriba, vuelve a abrir el selector; marcá las tres cuentas.
- **El botón de liquidar está desactivado:** la cuenta conectada no es la del relayer (`0x9FB4…D3e2`); cambiala en MetaMask.
- **«No alcanza el AVAX» o «insufficient funds»:** mandar AVAX a esa cuenta desde otra, o bajar el saldo del alquiler.
- **NASA POWER no responde:** esperar unos segundos y volver a apretar el botón; todavía no se firmó nada.
- **Un alquiler se liquida una sola vez.** Si la toma falla después de liquidar, se crea otro desde «Crear» y se repite. Antes de repetir «Cobrar», dejar lo pendiente en cero.
- Plan B para liquidar sin MetaMask: desde la terminal, en la PC con el `.env`, `$env:IDS="5"; npm run relayer:fuji`. La pantalla se actualiza sola.
- Respaldo: los alquileres #1, #2 y #3 ya están liquidados y se ven en el explorer.

## Después de grabar

Al liquidar desde `localhost`, la página ya guardó el JSON de NASA en `sample-data/` y la liquidación en `deployments/fuji.json`, y regeneró los datos de la web (la pantalla lo confirma con «Guardado en el repo»). En otra PowerShell, en la raíz del repo:

```powershell
cd C:\proyects\canon-climatico
npm run verificar -- 5
git add deployments/fuji.json sample-data/fuji/ web/data/fuji.json web/public/datos/fuji/
git commit -m "Liquidaciones del video"
git push origin main
```

El push actualiza también Vercel. Después, subir el video a YouTube como no listado.

## Grabar desde otra PC

Clonar el repo, correr `npm install` en la raíz y en `web`, y `npm run dev` en `web`. Hacen falta las tres cuentas importadas en MetaMask y autorizadas en el sitio; el `.env` no hace falta. Las claves se pasan en persona, nunca por el repo ni por un grupo.
