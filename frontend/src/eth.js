import { BrowserProvider, Contract, ethers } from "ethers";

export const ABI = [
  "function registerDocument(bytes32 hash) external",
  "function signDocument(bytes32 hash, bytes signature) external",
  "function verifySignature(bytes32 hash, address signer, bytes signature) external returns (bool)",
  "function getDocument(bytes32 hash) external view returns (address owner,uint256 registeredAt,uint256 signersCount)",
  "function getSigners(bytes32 hash) external view returns (address[])",
  "function getSignature(bytes32 hash, address signer) external view returns (bytes,uint256)",
  "function hasSigned(bytes32 hash, address signer) external view returns (bool)",
  "event DocumentRegistered(bytes32 indexed hash, address indexed owner, uint256 timestamp)",
  "event DocumentSigned(bytes32 indexed hash, address indexed signer, uint256 timestamp, bytes signature)",
  "event DocumentVerified(bytes32 indexed hash, address indexed verifier, bool isValid, uint256 timestamp)"
];

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error("MetaMask nije pronađen.");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export function getContract(signerOrProvider) {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS; // bez TypeScript cast-a
  return new Contract(addr, ABI, signerOrProvider);
}

// SHA-256 fajla u browseru → bytes32 hex (0x + 64 hexa)
export async function sha256FileToBytes32(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hex;
}

// Potpisujemo baš bytes32 preko EIP-191 (signMessage dodaje prefiks)
export async function signHashBytes32(hashHex) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hashHex)) throw new Error("Očekivan bytes32 hex");
  const { signer } = await getProviderAndSigner();
  const signature = await signer.signMessage(ethers.getBytes(hashHex));
  const addr = await signer.getAddress();
  return { signature, addr };
}
