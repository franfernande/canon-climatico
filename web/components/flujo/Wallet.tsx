"use client";

import {
  BrowserProvider,
  Contract,
  type ContractTransactionReceipt,
  type ContractTransactionResponse,
  type InterfaceAbi,
  type JsonRpcSigner,
} from "ethers";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { explicarError, FUJI, proveedorDeLectura } from "@/lib/cadena";
import { corto } from "@/lib/formato";
import s from "./flujo.module.css";

type Eip1193 = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(evento: string, f: (valor: unknown) => void): void;
  removeListener?(evento: string, f: (valor: unknown) => void): void;
};

type Billetera = { id: string; nombre: string; icono?: string; proveedor: Eip1193 };

export type Rol = "dueño" | "arrendatario" | "relayer";

export type ConfigFlujo = {
  direccion: string;
  abi: InterfaceAbi;
  explorer: string;
  modoDemo: boolean;
  /** El botón del relayer corre el script en el servidor: solo en local (npm run dev) o con RELAYER_DESDE_WEB=1. */
  relayerDesdeWeb: boolean;
  fuente: string;
  punto: { latitud: number; longitud: number };
  /** Las tres cuentas de la demo. En esta versión de prueba son fijas. */
  cuentas: { dueno: string; arrendatario: string; relayer: string };
};

type Flujo = {
  config: ConfigFlujo;
  contrato: Contract;
  billeteras: Billetera[];
  billetera: Billetera | null;
  cuenta: string | null;
  enFuji: boolean;
  rol: Rol | null;
  rolDe(direccion: string): Rol | null;
  conectar(b: Billetera): Promise<void>;
  cambiarCuenta(): Promise<void>;
  cambiarAFuji(): Promise<void>;
  firmante(): Promise<JsonRpcSigner>;
};

const Contexto = createContext<Flujo | null>(null);
const CLAVE_BILLETERA = "canon-climatico:billetera";

export function useFlujo(): Flujo {
  const flujo = useContext(Contexto);
  if (!flujo) throw new Error("useFlujo tiene que usarse dentro de ProveedorWallet");
  return flujo;
}

export function ProveedorWallet({ config, children }: { config: ConfigFlujo; children: ReactNode }) {
  const [billeteras, setBilleteras] = useState<Billetera[]>([]);
  const [billetera, setBilletera] = useState<Billetera | null>(null);
  const [cuenta, setCuenta] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const contrato = useMemo(() => new Contract(config.direccion, config.abi, proveedorDeLectura()), [config]);

  // Cada wallet instalada se anuncia sola (EIP-6963). Si ninguna lo hace, se usa window.ethereum.
  useEffect(() => {
    const encontradas = new Map<string, Billetera>();
    const publicar = () => setBilleteras([...encontradas.values()]);
    const alAnunciar = (e: Event) => {
      const { info, provider } = (e as CustomEvent<{ info: { uuid: string; name: string; icon?: string }; provider: Eip1193 }>)
        .detail;
      encontradas.set(info.uuid, { id: info.uuid, nombre: info.name, icono: info.icon, proveedor: provider });
      publicar();
    };
    window.addEventListener("eip6963:announceProvider", alAnunciar);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const respaldo = setTimeout(() => {
      const inyectada = (window as unknown as { ethereum?: Eip1193 }).ethereum;
      if (encontradas.size === 0 && inyectada) {
        encontradas.set("inyectada", { id: "inyectada", nombre: "Wallet del navegador", proveedor: inyectada });
        publicar();
      }
    }, 500);
    return () => {
      window.removeEventListener("eip6963:announceProvider", alAnunciar);
      clearTimeout(respaldo);
    };
  }, []);

  const usar = useCallback(async (b: Billetera, pedirPermiso: boolean) => {
    const cuentas = (await b.proveedor.request({ method: pedirPermiso ? "eth_requestAccounts" : "eth_accounts" })) as string[];
    if (!cuentas.length) return;
    setBilletera(b);
    setCuenta(cuentas[0]);
    setChainId(Number(await b.proveedor.request({ method: "eth_chainId" })));
    localStorage.setItem(CLAVE_BILLETERA, b.nombre);
  }, []);

  // Al recargar, vuelve a la wallet que se usó la última vez sin abrir ventanas.
  useEffect(() => {
    if (billetera) return;
    const guardada = billeteras.find((b) => b.nombre === localStorage.getItem(CLAVE_BILLETERA));
    if (guardada) usar(guardada, false).catch(() => {});
  }, [billeteras, billetera, usar]);

  useEffect(() => {
    const p = billetera?.proveedor;
    if (!p?.on) return;
    const alCambiarCuentas = (valor: unknown) => setCuenta((valor as string[])[0] ?? null);
    const alCambiarRed = (valor: unknown) => setChainId(Number(valor));
    p.on("accountsChanged", alCambiarCuentas);
    p.on("chainChanged", alCambiarRed);
    return () => {
      p.removeListener?.("accountsChanged", alCambiarCuentas);
      p.removeListener?.("chainChanged", alCambiarRed);
    };
  }, [billetera]);

  const cambiarAFuji = useCallback(async () => {
    const p = billetera?.proveedor;
    if (!p) throw new Error("Primero conectá una wallet.");
    try {
      await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: FUJI.chainIdHex }] });
    } catch (e) {
      if ((e as { code?: number }).code !== 4902) throw e;
      await p.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: FUJI.chainIdHex,
            chainName: FUJI.nombre,
            nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
            rpcUrls: [FUJI.rpc],
            blockExplorerUrls: [config.explorer],
          },
        ],
      });
    }
    setChainId(FUJI.chainId);
  }, [billetera, config.explorer]);

  const cambiarCuenta = useCallback(async () => {
    const p = billetera?.proveedor;
    if (!p) return;
    // MetaMask vuelve a mostrar el selector de cuentas con requestPermissions. Si la wallet no
    // lo implementa, se sigue con eth_requestAccounts.
    try {
      await p.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
    } catch (e) {
      if ((e as { code?: number }).code === 4001) return;
    }
    const cuentas = (await p.request({ method: "eth_requestAccounts" })) as string[];
    setCuenta(cuentas[0] ?? null);
  }, [billetera]);

  const firmante = useCallback(async () => {
    if (!billetera || !cuenta) throw new Error("Primero conectá una wallet.");
    if (chainId !== FUJI.chainId) await cambiarAFuji();
    return new BrowserProvider(billetera.proveedor).getSigner(cuenta);
  }, [billetera, cuenta, chainId, cambiarAFuji]);

  const rolDe = useCallback(
    (direccion: string): Rol | null => {
      const d = direccion.toLowerCase();
      if (d === config.cuentas.dueno.toLowerCase()) return "dueño";
      if (d === config.cuentas.arrendatario.toLowerCase()) return "arrendatario";
      if (d === config.cuentas.relayer.toLowerCase()) return "relayer";
      return null;
    },
    [config.cuentas],
  );

  const valor = useMemo<Flujo>(
    () => ({
      config,
      contrato,
      billeteras,
      billetera,
      cuenta,
      enFuji: chainId === FUJI.chainId,
      rol: cuenta ? rolDe(cuenta) : null,
      rolDe,
      conectar: (b) => usar(b, true),
      cambiarCuenta,
      cambiarAFuji,
      firmante,
    }),
    [config, contrato, billeteras, billetera, cuenta, chainId, rolDe, usar, cambiarCuenta, cambiarAFuji, firmante],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Una dirección corta, con el rol que tiene en la demo y el link al explorer. */
export function Direccion({ valor }: { valor: string }) {
  const { config, rolDe } = useFlujo();
  const rol = rolDe(valor);
  return (
    <span className={s.direccion}>
      <a href={`${config.explorer}/address/${valor}`} title={valor}>
        {corto(valor)}
      </a>
      {rol && <span className={`${s.rol} ${s[`rol_${rol === "dueño" ? "dueno" : rol}`]}`}>{rol}</span>}
    </span>
  );
}

export function PanelWallet() {
  const { billeteras, billetera, cuenta, enFuji, rol, conectar, cambiarCuenta, cambiarAFuji } = useFlujo();
  const [error, setError] = useState<string | null>(null);
  const intentar = (f: () => Promise<void>) => () => {
    setError(null);
    f().catch((e) => setError(explicarError(e)));
  };

  if (!billetera || !cuenta) {
    return (
      <div className={s.panelWallet}>
        {billeteras.length === 0 ? (
          <span>No encontramos una wallet en este navegador. Instalá Core o MetaMask.</span>
        ) : (
          billeteras.map((b) => (
            <button key={b.id} type="button" className={s.boton} onClick={intentar(() => conectar(b))}>
              {b.icono && <img src={b.icono} alt="" width={18} height={18} />}
              Conectar {b.nombre}
            </button>
          ))
        )}
        {error && <span className={s.error}>{error}</span>}
      </div>
    );
  }

  return (
    <div className={s.panelWallet}>
      <span>
        {billetera.nombre}: <Direccion valor={cuenta} />
        {!rol && <span className={s.aviso}> no es ninguna de las cuentas de la demo</span>}
      </span>
      {!enFuji && (
        <button type="button" className={s.boton} onClick={intentar(cambiarAFuji)}>
          Cambiar a Fuji
        </button>
      )}
      <button type="button" className={s.botonSecundario} onClick={intentar(cambiarCuenta)}>
        Cambiar de cuenta
      </button>
      {error && <span className={s.error}>{error}</span>}
    </div>
  );
}

type Fase = "libre" | "firmando" | "confirmando" | "lista" | "error";

/** Manda una transacción y sigue su estado: firma en la wallet, confirmación y resultado. */
export function useTransaccion() {
  const [estado, setEstado] = useState<{ fase: Fase; hash?: string; error?: string }>({ fase: "libre" });
  const enviar = useCallback(
    async (f: () => Promise<ContractTransactionResponse>): Promise<ContractTransactionReceipt | null> => {
      setEstado({ fase: "firmando" });
      try {
        const tx = await f();
        setEstado({ fase: "confirmando", hash: tx.hash });
        const recibo = await tx.wait();
        setEstado({ fase: "lista", hash: tx.hash });
        return recibo;
      } catch (e) {
        setEstado((previo) => ({ fase: "error", hash: previo.hash, error: explicarError(e) }));
        return null;
      }
    },
    [],
  );
  return { ...estado, ocupado: estado.fase === "firmando" || estado.fase === "confirmando", enviar };
}

export function EstadoTransaccion({ fase, hash, error }: { fase: Fase; hash?: string; error?: string }) {
  const { config } = useFlujo();
  if (fase === "libre") return null;
  const link = hash && (
    <a href={`${config.explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
      ver la transacción en el explorer
    </a>
  );
  return (
    <p className={fase === "error" ? s.error : fase === "lista" ? s.ok : s.espera} role="status">
      {fase === "firmando" && "Confirmá la operación en tu wallet…"}
      {fase === "confirmando" && <>Esperando que se confirme en Fuji… {link}</>}
      {fase === "lista" && <>Confirmada en Fuji: {link}.</>}
      {fase === "error" && (
        <>
          {error} {link}
        </>
      )}
    </p>
  );
}
