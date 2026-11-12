# Guion del video de la demo

Ciclo completo en Fuji, grabado desde la PC que tiene el repo y el `.env`: el dueño crea el alquiler, el arrendatario deposita, el botón corre el relayer y cada uno cobra. Duración: unos 2 minutos y 45 segundos (el track pide entre 1 y 3).

Lo más cómodo: grabar la pantalla **sin voz** siguiendo la tabla, con pausas si hace falta, y después poner la voz encima y cortar las esperas (Clipchamp viene con Windows). Si preferís grabar con voz en vivo, leé la columna «Voz».

## Antes de grabar (10 minutos)

1. **Web levantada en esta PC**, en PowerShell dentro de `web`: `npm run dev`. Abrir `http://localhost:3000` (no la dirección `192.168…`).
2. **MetaMask con las dos cuentas** del dueño (`0x7886…634A`) y del arrendatario (`0x2649…b51e`), las dos autorizadas en el sitio: en `/proceso`, «Cambiar de cuenta» y marcar las dos.
3. **El dueño tiene que tener AVAX para el gas.** Si su saldo en `/proceso` dice 0, mandale 0,05 AVAX desde el arrendatario en MetaMask.
4. **Ensayo con el #4** (está depositado): abrir `/alquiler/4` y apretar «Liquidar con la lluvia de NASA POWER». Así se prueba el botón antes de la toma.
5. **Dejar en cero lo pendiente de cobro**: en `/cobrar`, retirar con el arrendatario y después con el dueño. Así, en el video, «Cobrar» muestra solo lo del alquiler nuevo.
6. **Verificar el código del contrato** en el explorer (README, «En Fuji», paso 6), para que la transacción de `liquidar` se lea por nombre.
7. **Pantalla:** 1080p, Firefox al 125 % (Ctrl +), pantalla completa (F11), notificaciones de Windows apagadas, pestañas de más cerradas.
8. **Grabar la pantalla entera**, no solo la ventana de Firefox: las ventanas de MetaMask se abren aparte. Sirve la Herramienta Recortes (Win+Shift+R) u OBS.
9. Tener abierta una PowerShell en la raíz del repo para el `verificar` del final.

## Guion

El alquiler nuevo va a ser el **#5** si nadie crea otro antes; si sale otro número, usá ese.

| Tiempo | Pantalla y acción | Voz |
| --- | --- | --- |
| 0:00–0:15 | `http://localhost:3000`: portada y gráfico de las 21 campañas | «En Anta, Salta, el campo se alquila a valor fijo y el saldo se paga en la cosecha, llueva o no. En 2024/25 llovieron 243 milímetros en diciembre y enero: solo dos campañas desde 2004 fueron más secas. Con un alquiler fijo, el arrendatario paga igual.» |
| 0:15–0:25 | Botón «Probar el flujo con wallets» → `/proceso`: las tres wallets | «Con Canon Climático, el saldo va a un contrato en Avalanche y se reparte solo, según la lluvia que mide NASA. Hay tres partes: el dueño, el arrendatario y un relayer que informa la lluvia.» |
| 0:25–0:55 | MetaMask en la cuenta **dueño**. Paso «2. Crear (dueño)»: campaña **2014/15**, saldo **0,01**, tramos 255 y 305 mm, 20 % y 50 %. «Firmar y crear el alquiler» → confirmar en MetaMask → «Alquiler #5 creado». Clic en el link | «El dueño escribe las condiciones: la campaña, el saldo y los tramos. Más de 305 milímetros, todo para él; entre 255 y 305, vuelve el 20 % al arrendatario; menos, la mitad. Firma con su wallet y las condiciones quedan en la cadena: ya nadie las puede cambiar. Le queda un link para mandarle al arrendatario.» |
| 0:55–1:20 | En MetaMask, cambiar a la cuenta **arrendatario** (que se vea). En `/alquiler/5`: recorrer las condiciones. «Depositar 0,01 AVAX y aceptar» → confirmar → «Depositado» | «El arrendatario abre el link con su wallet y lee las condiciones directo del contrato. Deposita el saldo: la plata no va al dueño, queda guardada en el contrato. Con ese depósito acepta las condiciones.» |
| 1:20–1:50 | Misma pantalla: señalar el texto de los plazos y apretar «Liquidar con la lluvia de NASA POWER». Esperar la salida del relayer; la pantalla pasa a «Liquidado»: 287,0 mm, tramo medio, 0,008 y 0,002 AVAX. Clic en «ver la transacción en el explorer» | «El relayer solo puede liquidar cuando termina la ventana acordada en el contrato; en el producto lo hace solo, al cierre, y si no lo hiciera, a los 60 días cualquiera puede reembolsar. Esta campaña ya cerró, así que lo corremos ahora: pide la lluvia a NASA POWER, guarda la respuesta y publica en Fuji el total y el hash del archivo. 287 milímetros: tramo medio. El contrato anota el 80 % para el dueño y el 20 % para el arrendatario.» |
| 1:50–2:15 | Paso «4. Cobrar»: con el **arrendatario**, «Retirar 0,002 AVAX» → confirmar. Cambiar a **dueño** en MetaMask, «Retirar 0,008 AVAX» → confirmar | «Cada uno cobra lo suyo cuando quiere, firmando desde su wallet. Nadie tiene que pedirle la plata al otro, y cada paso queda registrado en el explorer de Avalanche.» |
| 2:15–2:35 | PowerShell en la raíz: `npm run verificar -- 5` → tres OK | «¿Y si el relayer miente? Cualquiera lo comprueba sin claves: el archivo tiene el hash que está en la cadena, sus valores son los que hoy devuelve NASA POWER y la suma da la lluvia liquidada. Una mentira queda a la vista y firmada por el relayer, que no puede ser ninguna de las partes.» |
| 2:35–2:50 | `http://localhost:3000/deck`, slide 4 «Por qué blockchain» | «Dueño y arrendatario desconfían entre sí. Con una cláusula en papel, el ajuste se negocia después de la sequía. Con Canon Climático, la regla queda escrita al firmar y la plata ya está adentro. Datos de NASA POWER, contrato en Avalanche Fuji.» |

## Si algo sale mal

- **MetaMask no muestra la cuenta que corresponde:** «Cambiar de cuenta» en la barra de arriba vuelve a abrir el selector.
- **«No alcanza el AVAX» o «insufficient funds»:** mandar AVAX a esa cuenta desde la otra, o bajar el saldo del alquiler.
- **El botón dice que falta el `.env`:** la página no se está sirviendo desde la carpeta del repo que tiene las claves.
- **Un alquiler se liquida una sola vez.** Si la toma falla después de liquidar, se crea otro desde «Crear» y se repite. Antes de repetir «Cobrar», dejar lo pendiente en cero.
- Si el relayer se corre en la terminal, siempre con `$env:IDS="5"`: sin esa variable liquida todos los alquileres depositados.
- Respaldo: los alquileres #1, #2 y #3 ya están liquidados y se ven en el explorer.

## Después de grabar

En la raíz del repo:

```powershell
npm run web:datos
git add deployments/fuji.json sample-data/fuji/ web/data/fuji.json web/public/datos/fuji/
git commit -m "Liquidaciones del video"
git push origin main
```

Después regenerar el PDF del deck (README, sección «La página») y subir el video a YouTube como no listado.

## Grabar desde otra PC

Clonar el repo, `npm install` en `web` y en la raíz, y copiar el `.env` con las tres claves (en persona, nunca por el repo ni por un grupo). Sin `.env`, todo funciona menos el botón del relayer: en ese caso lo corre quien tenga las claves, con `$env:IDS="5"; npm run relayer:fuji`, y la pantalla se actualiza sola.
