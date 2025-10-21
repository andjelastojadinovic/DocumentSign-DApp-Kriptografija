import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getProviderAndSigner, getContract, sha256FileToBytes32, signHashBytes32 } from "./eth.js";

function App() {
  const [account, setAccount] = useState("");
  const [file, setFile] = useState(null);
  const [hashHex, setHashHex] = useState("");
  const [status, setStatus] = useState("");
  const [signers, setSigners] = useState([]);
  const [docInfo, setDocInfo] = useState({});

  useEffect(() => {
    (async () => {
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const accs = await provider.send("eth_requestAccounts", []);
          if (accs && accs.length > 0) setAccount(accs[0]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function connect() {
    try {
      const { signer } = await getProviderAndSigner();
      setAccount(await signer.getAddress());
      setStatus("MetaMask povezan.");
    } catch (e) {
      setStatus(e?.message || "Greška pri povezivanju MetaMask-a.");
    }
  }

  async function computeHash() {
    if (!file) {
      setStatus("Izaberi fajl prvo.");
      return;
    }
    const h = await sha256FileToBytes32(file);
    setHashHex(h);
    setStatus("Hash izračunat.");
  }

  async function registerDoc() {
    if (!hashHex) return setStatus("Nema hash-a.");
    try {
      const { signer } = await getProviderAndSigner();
      const c = getContract(signer);
      const tx = await c.registerDocument(hashHex);
      setStatus("Slanje transakcije (register)...");
      await tx.wait();
      setStatus("Dokument registrovan.");
      await refreshInfo();
    } catch (e) {
      setStatus(`Greška (register): ${e?.message || e}`);
    }
  }

  async function signDoc() {
    if (!hashHex) return setStatus("Nema hash-a.");
    try {
      const { signature } = await signHashBytes32(hashHex);
      const { signer } = await getProviderAndSigner();
      const c = getContract(signer);
      const tx = await c.signDocument(hashHex, signature);
      setStatus("Slanje transakcije (sign)...");
      await tx.wait();
      setStatus("Potpis sačuvan on-chain.");
      await refreshInfo();
    } catch (e) {
      setStatus(`Greška (sign): ${e?.message || e}`);
    }
  }

  async function verifySig() {
    if (!hashHex) return setStatus("Nema hash-a.");
    try {
      const { signature, addr } = await signHashBytes32(hashHex);
      const { signer } = await getProviderAndSigner();
      const c = getContract(signer);
      const _okTx = await c.verifySignature(hashHex, addr, signature); // šalje tx (jer emituje event)
      setStatus("Verifikacija poslata (proveri event na Etherscan-u).");
    } catch (e) {
      setStatus(`Greška (verify): ${e?.message || e}`);
    }
  }

  async function refreshInfo() {
    if (!hashHex) return;
    try {
      const { provider } = await getProviderAndSigner();
      const c = getContract(provider);
      const info = await c.getDocument(hashHex);
      const owner = info[0];
      const registeredAt = Number(info[1]);
      const count = Number(info[2]);
      setDocInfo({ owner, registeredAt, count });

      const s = await c.getSigners(hashHex);
      setSigners(s);
    } catch (e) {
      setStatus(`Greška (refreshInfo): ${e?.message || e}`);
    }
  }

  return (
    <div style={{maxWidth: 720, margin: "40px auto", fontFamily: "Inter, system-ui"}}>
      <h1>e-Dokumenti – Digitalni potpisi (Sepolia)</h1>

      <div style={{margin: "8px 0", padding: 12, border: "1px solid #ddd", borderRadius: 12}}>
        <div><b>Nalog:</b> {account || "(nije povezan)"} </div>
        <button onClick={connect}>Poveži MetaMask</button>
      </div>

      <div style={{marginTop: 20}}>
        <input type="file" onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
        <button onClick={computeHash} style={{marginLeft: 8}}>Izračunaj SHA-256</button>
      </div>

      <div style={{marginTop: 10, wordBreak: "break-all"}}>
        <b>Hash (bytes32):</b> <code>{hashHex}</code>
      </div>

      <div style={{marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap"}}>
        <button onClick={registerDoc}>Register dokumenta</button>
        <button onClick={signDoc}>Potpiši dokument</button>
        <button onClick={verifySig}>Verifikuj potpis</button>
        <button onClick={refreshInfo}>Osveži info</button>
      </div>

      <div style={{marginTop: 20, padding: 12, border: "1px solid #eee", borderRadius: 12}}>
        <h3>Info o dokumentu</h3>
        <div><b>Owner:</b> {docInfo.owner || "-"}</div>
        <div><b>Registered at:</b> {docInfo.registeredAt ? new Date(docInfo.registeredAt*1000).toLocaleString() : "-"}</div>
        <div><b>Potpisnika:</b> {docInfo.count != null ? docInfo.count : "-"}</div>
        <div style={{marginTop: 10}}>
          <b>Signers:</b>
          <ul>
            {signers.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>

      <p style={{marginTop: 20, color: "#666"}}>{status}</p>
    </div>
  );
}

export default App;
