import { ethers } from "hardhat";
import { Marketplace__factory } from "../../typechain-types";

async function main() {
  console.log("👟 Start to deploy marketplace contract");

  // Define deployer wallet
  const deployerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );

  // Deploy contract
  const contract = await new Marketplace__factory(deployerWallet).deploy();
  await contract.deployed();
  console.log(`✅ Contract deployed to ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
