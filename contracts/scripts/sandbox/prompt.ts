import { ethers } from "hardhat";
import { promptContractAbi } from "../helpers/abi/promptContract";

async function main() {
  console.log("👟 Start sandbox");

  // Init accounts
  const accountOneWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );
  const accountTwoWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_2 || "",
    ethers.provider
  );

  // Define params
  const promptContractAddress = "0xc1Db4070da95988D1251775728a2A0d2edC6bEF4";
  const profileContractAddress = "0xA28cF70ef924A32C06eE73Fd9CF16E5C299628fB";
  const promptAdminRole =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const promptMinterRole =
    "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

  // Init contracts
  const promptContract = new ethers.Contract(
    promptContractAddress,
    promptContractAbi
  );

  // Grant role
  // const grantRoleTx = await promptContract
  //   .connect(accountOneWallet)
  //   .grantRole(promptAdminRole, profileContractAddress);
  // await grantRoleTx.wait();
  // console.log("grantRoleTx", grantRoleTx);

  // Revoke role
  // const revokeRoleTx = await promptContract
  //   .connect(accountOneWallet)
  //   .revokeRole(promptMinterRole, accountTwoWallet.address);
  // await revokeRoleTx.wait();
  // console.log("revokeRoleTx", revokeRoleTx);

  // Has role
  // const hasRoleTx = await promptContract
  //   .connect(accountOneWallet)
  //   .hasRole(promptAdminRole, profileContractAddress);
  // console.log("hasRoleTx", hasRoleTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
