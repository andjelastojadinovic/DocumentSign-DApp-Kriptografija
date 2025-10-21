const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("DocumentSign", function () {
  let contract, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const Doc = await ethers.getContractFactory("DocumentSign");
    contract = await Doc.deploy();
    await contract.waitForDeployment();
  });

  it("registers a document", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc1"));
    await expect(contract.connect(alice).registerDocument(hash))
      .to.emit(contract, "DocumentRegistered");
    const [docOwner, registeredAt, count] = await contract.getDocument(hash);
    expect(docOwner).to.equal(alice.address);
    expect(registeredAt).to.be.gt(0);
    expect(count).to.equal(0);
  });

  it("signs and verifies", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc2"));
    await contract.connect(alice).registerDocument(hash);
    const sig = await bob.signMessage(ethers.getBytes(hash));
    await expect(contract.connect(bob).signDocument(hash, sig))
      .to.emit(contract, "DocumentSigned");
    const has = await contract.hasSigned(hash, bob.address);
    expect(has).to.equal(true);
    const ok = await contract.verifySignature.staticCall(hash, bob.address, sig);
    expect(ok).to.equal(true);
  });

  it("prevents double-sign", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc3"));
    await contract.connect(owner).registerDocument(hash);
    const sig = await owner.signMessage(ethers.getBytes(hash));
    await contract.connect(owner).signDocument(hash, sig);
    await expect(contract.connect(owner).signDocument(hash, sig))
      .to.be.revertedWith("Already signed");
  });

  it("rejects mismatched signer/signature", async () => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc4"));
    await contract.connect(owner).registerDocument(hash);
    const sigByAlice = await alice.signMessage(ethers.getBytes(hash));
    await expect(contract.connect(bob).signDocument(hash, sigByAlice))
      .to.be.revertedWith("Signature doesn't match sender");
  });
  it("allows multiple different signers for the same document", async () => {
  const [owner, alice, bob] = await ethers.getSigners();
  const Doc = await ethers.getContractFactory("DocumentSign");
  const contract = await Doc.deploy();
  await contract.waitForDeployment();

  const hash = ethers.keccak256(ethers.toUtf8Bytes("multi-signed-doc"));

  await expect(contract.connect(owner).registerDocument(hash))
    .to.emit(contract, "DocumentRegistered");

  const sigAlice = await alice.signMessage(ethers.getBytes(hash));
  await expect(contract.connect(alice).signDocument(hash, sigAlice))
    .to.emit(contract, "DocumentSigned")
    .withArgs(hash, alice.address, anyValue, sigAlice); 

  const sigBob = await bob.signMessage(ethers.getBytes(hash));
  await expect(contract.connect(bob).signDocument(hash, sigBob))
    .to.emit(contract, "DocumentSigned");

  const signers = await contract.getSigners(hash);
  expect(signers).to.have.lengthOf(2);
  expect(signers).to.include.members([alice.address, bob.address]);

  await expect(contract.connect(alice).signDocument(hash, sigAlice))
    .to.be.revertedWith("Already signed");

  const okAlice = await contract.verifySignature.staticCall(hash, alice.address, sigAlice);
  const okBob   = await contract.verifySignature.staticCall(hash, bob.address, sigBob);
  expect(okAlice).to.equal(true);
  expect(okBob).to.equal(true);
});
});
