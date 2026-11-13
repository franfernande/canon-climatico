# Guion del video: pitch y demo (máximo 3 minutos)

El video junta el pitch (slides del deck) y la demo en vivo en Fuji, grabada en local (`localhost`): en la versión de Vercel, MetaMask muestra una advertencia de phishing por ser un subdominio nuevo de `vercel.app`. La demo recorre las cuatro pantallas en el orden de la barra de pasos, y cada parte firma desde su propia wallet en MetaMask: el dueño crea, el arrendatario deposita, el relayer liquida con la lluvia de NASA y cada uno cobra. En cada paso se muestran los saldos antes y después, y la transacción en el explorer. La voz suma unas 400 palabras, unos 2:40 a ritmo normal: hay que cortar en la edición las esperas de MetaMask y de Fuji.

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
5. **Dejar en cero lo pendiente de cobro:** en `/cobrar`, retirar con el arrendatario y después con el dueño. Así el panel de saldos arranca con el contrato en 0 AVAX, y en el video se ve limpio: 0 → 0,01 al depositar → 0 al cobrar.
6. **Verificar el código del contrato** en el explorer (README, «En Fuji», paso 6), para que la transacción de `liquidar` se lea por nombre.

El alquiler nuevo va a ser el **#5** si nadie crea otro antes; si sale otro número, usá ese.

## Guion

| Tiempo | Pantalla y acción | Voz |
| --- | --- | --- |
| 0:00–0:10 | **Portada** | «Traemos una propuesta para los alquileres de campos en zonas como Anta, en Salta, donde no hay riego y la siembra depende solo de la lluvia.» |
| 0:10–0:38 | **Slide 1**, el problema y las tres maneras de hoy | «Estos alquileres se pagan con un anticipo, en general del 50 %, antes de la siembra, y el resto después de la cosecha. El problema aparece en los años de sequía, un imprevisto para las dos partes. Hoy se resuelve de tres maneras: la aparcería, que paga según lo cosechado pero depende de lo que declare el arrendatario; una cláusula climática, que deja renegociar cuando el daño ya ocurrió; o un juicio por imprevisión, lento y costoso. Ninguna es eficiente.» |
| 0:38–0:52 | **Slide 2**, la solución y los tramos | «Nuestra solución es AgroRenta, un alquiler con ajuste automático por lluvia. El saldo se deposita en un contrato en Avalanche y se reparte solo, según la lluvia que mide NASA: si llueve bien, todo al dueño; si llueve poco, una parte vuelve al arrendatario.» |
| 0:52–0:58 | **Slide 3**, firma, dato y reparto | «Son tres pasos: firma, dato y reparto. Veámoslo funcionando en la red de prueba de Avalanche.» |
| 0:58–1:05 | **Demo · «1. Wallets»** (`/proceso`). Señalar las tres wallets con sus saldos. MetaMask en la cuenta **dueño** | «Hay tres wallets y cada parte firma desde la suya: el dueño, el arrendatario y el relayer, que informa la lluvia.» |
| 1:05–1:20 | **«2. Crear (dueño)»**: campaña 2014/15, saldo 0,01. «Firmar y crear el alquiler» → MetaMask → «Alquiler #5 creado». **Clic en «ver la transacción en el explorer»**: se abre en otra pestaña; mostrarla y volver. Clic en el link del alquiler | «El dueño elige la campaña, el saldo y los tramos, y firma. Las condiciones quedan en la cadena, y acá está la transacción en el explorer de Avalanche.» |
| 1:20–1:38 | **«3. Depositar (arrendatario)»** (`/alquiler/5`). Cambiar a la cuenta **arrendatario**. **Señalar el panel de saldos: «antes»** (custodia en 0). «Depositar 0,01 AVAX y aceptar» → MetaMask. **El panel cambia solo: «después»** (custodia 0,01 y la wallet del arrendatario baja). Clic en «ver la transacción en el explorer» | «El arrendatario abre el link y lee las condiciones del contrato. Miren los saldos antes de depositar. Deposita, y el saldo sale de su wallet y queda en custodia del contrato, no en manos del dueño.» |
| 1:38–2:00 | Misma pantalla. Cambiar a la cuenta **relayer**: el botón se activa. «Liquidar con la lluvia de NASA POWER»: aparecen los valores de NASA, la suma y el hash → MetaMask → «Liquidado», 287,0 mm, tramo medio. **En el panel, «Para cobrar» pasa a 0,008 y 0,002.** Clic en «ver la transacción en el explorer» | «Al cerrar la ventana liquida el relayer, la única wallet que el contrato acepta; en producción corre solo. Pide el dato a NASA, calcula su hash y lo publica: 287 milímetros, tramo medio. Queda anotado 80 % para el dueño y 20 % para el arrendatario, y la transacción se ve en el explorer.» |
| 2:00–2:15 | **«4. Cobrar»**: señalar lo pendiente y el saldo de cada wallet. Con el **arrendatario**, «Retirar 0,002 AVAX»; cambiar a **dueño**, «Retirar 0,008 AVAX». **Lo pendiente pasa a 0 y el saldo de la wallet sube.** Clic en «ver la transacción en el explorer» | «Cada uno retira lo suyo desde su wallet: lo pendiente pasa a cero y el saldo de la wallet sube. Cada retiro también queda en el explorer.» |
| 2:15–2:38 | **Slide 4**, por qué blockchain | «¿Por qué blockchain? Porque las partes desconfían entre sí, y acá la plata la guarda el contrato, con la regla escrita desde la firma. Y si el relayer miente, el hash del dato queda publicado: cualquiera lo comprueba.» |
| 2:38–2:52 | **Slide 5**, modelo y fuente del dato | «Paga el arrendatario, con una comisión por contrato, y llegamos por los corredores rurales. El dato sale de la API pública de NASA POWER y es gratis.» |
| 2:52–3:00 | **Portada** otra vez | «AgroRenta: el alquiler rural que se ajusta con la lluvia.» |

Los links al explorer se abren en otra pestaña; después de mostrar cada uno, cerrala con Ctrl+W para volver a la demo. Si el video se pasa de 3 minutos, cortá primero las esperas de MetaMask y de Fuji; después, mostrá el explorer solo en el depósito y en la liquidación.

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
