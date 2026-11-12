// Después de liquidar, el dueño y el arrendatario cobran lo que les anotó el contrato.
// Liquidar no envía la plata: cada uno la retira, así nadie puede trabar el cobro del otro.
import { network } from "hardhat";
import { guardarDespliegue, leerDespliegue, linkTx } from "./lib/despliegue.ts";

const { ethers, networkName } = await network.create();
const [, dueno, arrendatario] = await ethers.getSigners();
const despliegue = leerDespliegue(networkName);
const canon = await ethers.getContractAt("CanonClimatico", despliegue.direccion);
despliegue.retiros ??= [];

for (const [rol, cuenta] of [
  ["dueño", dueno],
  ["arrendatario", arrendatario],
] as const) {
  const monto = await canon.pendiente(cuenta.address);
  if (monto === 0n) {
    console.log(`El ${rol} no tiene nada para retirar`);
    continue;
  }

  const tx = await canon.connect(cuenta).retirar();
  await tx.wait();
  console.log(`El ${rol} retiró ${ethers.formatEther(monto)} AVAX: ${linkTx(networkName, tx.hash)}`);

  despliegue.retiros.push({ rol, cuenta: cuenta.address, montoWei: monto.toString(), tx: tx.hash });
  guardarDespliegue(despliegue);
}
