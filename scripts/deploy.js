const { ethers } = require("hardhat");

async function main() {
  const Doc = await ethers.getContractFactory("DocumentSign");
  const contract = await Doc.deploy();
  await contract.waitForDeployment();
  console.log("DocumentSign deployed to:", await contract.getAddress());
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
