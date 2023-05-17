import { ethers } from "hardhat";
import { Profile__factory } from "../../typechain-types";

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
  const profileContractAddress = "0xA28cF70ef924A32C06eE73Fd9CF16E5C299628fB";

  // Init contracts
  const profileContract = new Profile__factory().attach(profileContractAddress);

  // Test
  const testTx = await profileContract.connect(accountTwoWallet).test();
  await testTx.wait();
  console.log("testTx", testTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
