# 🪙 DocumentSign DApp — Blockchain Digital Signature System

This project implements a **Decentralized Application (DApp)** for digitally signing and verifying electronic documents using **Ethereum blockchain** and **cryptographic mechanisms** (SHA-256, ECDSA).  
The system ensures document authenticity and integrity by recording document hashes and digital signatures on the blockchain.

---

## Project Overview

**Goal:**  
To provide a secure, blockchain-based digital signature system where each document is represented by its hash and can be signed by multiple users.  
All signatures and registration events are permanently recorded on the Ethereum blockchain (Sepolia testnet).

---

## System Architecture

| Component | Description |
|------------|-------------|
| **Smart Contract** | Solidity contract (`DocumentSign.sol`) that stores document hashes, owners, timestamps, and signer addresses. |
| **Frontend App** | React + Vite web interface that allows users to upload a file, compute its SHA-256 hash, register it, sign it, and verify signatures. |
| **Blockchain Network** | Ethereum Sepolia testnet via **Infura RPC**. |
| **Web3 Library** | [ethers.js](https://docs.ethers.io/) used for interaction with MetaMask and the deployed smart contract. |
| **Wallet Integration** | MetaMask used for user authentication, signing messages (ECDSA), and sending transactions. |
| **Development Framework** | [Hardhat](https://hardhat.org/) used for compiling, testing, and deploying smart contracts. |

---

## Cryptographic Features

- Document integrity guaranteed via **SHA-256 hash**.  
- Digital signatures use **ECDSA** (Ethereum-native algorithm).  
- Each blockchain record includes:
  - Document hash  
  - Owner address  
  - Timestamp of registration  
  - All signers’ addresses  
- Verification performed only using public information (no private keys needed).  
- Events emitted:  
  - `DocumentRegistered`  
  - `DocumentSigned`  
  - `DocumentVerified`

---

## Automated Tests

Implemented with **Hardhat**.  
Run with:
```bash
npx hardhat test
```
Tests cover:
Registering a document
Signing a document
Preventing double-signing
Rejecting invalid signatures
Allowing multiple users to sign the same document

All tests passing.

## Frontend Interface

Frontend built using React + Vite.

Main features:

Upload and hash a document (SHA-256)
Register the document on the blockchain
Sign document (MetaMask ECDSA signature)
Verify signatures
Display owner, timestamp, and list of signers

Run frontend locally:
```bash
cd frontend
npm install
npm run dev
```
Then open the displayed http://localhost:5173 in your browser.

## Deployment (Hardhat)

Deploy the smart contract to Sepolia:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Make sure .env file exists with your credentials:
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

After deployment, copy the contract address and paste it into:
```bash
frontend/src/eth.js
```
## MetaMask Configuration

Install MetaMask extension (Chrome / Edge / Firefox).

Create or import a wallet.

Switch to Sepolia Test Network.

Get free test ETH from:
https://cloud.google.com/application/web3/faucet/ethereum/sepolia

Connect your wallet when prompted by the DApp.

## Project Structure

```bash
project/
 ├─ contracts/
 │   └─ DocumentSign.sol
 ├─ scripts/
 │   └─ deploy.js
 ├─ test/
 │   └─ documentSign.js
 ├─ frontend/
 │   ├─ src/
 │   │   ├─ App.jsx
 │   │   └─ eth.js
 │   └─ package.json
 ├─ .env.example
 ├─ hardhat.config.js
 └─ README.md
```
## Technologies Used

| Layer           | Technologies               |
| --------------- | -------------------------- |
| Smart Contracts | Solidity (0.8.28), Hardhat |
| Blockchain      | Ethereum Sepolia Testnet   |
| Frontend        | React, Vite                |
| Web3            | ethers.js                  |
| Wallet          | MetaMask                   |
| Deployment      | Infura RPC                 |
| Testing         | Hardhat + Chai + Mocha     |

