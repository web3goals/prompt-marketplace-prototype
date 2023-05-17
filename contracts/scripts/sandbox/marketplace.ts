import { ethers } from "hardhat";
import { Marketplace__factory } from "../../typechain-types";
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
  const marketplaceContractAddress =
    "0x1Be148B230Bcb4E634Be64Ca6134545B59D715Fa";
  const marketplaceId = 1;
  const tokenId = 1;

  // Init contracts
  const promptContract = new ethers.Contract(
    promptContractAddress,
    promptContractAbi
  );
  const marketplaceContract = new Marketplace__factory().attach(
    marketplaceContractAddress
  );

  // Approve the marketplace address as a spender
  const approval = await promptContract
    .connect(accountOneWallet)
    .approve(marketplaceContract.address, tokenId);
  console.log("approval function call Tx Hash:", approval.hash);
  await approval.wait();

  // List the prompt onto the marketplace
  const createListing = await marketplaceContract
    .connect(accountOneWallet)
    .createListing(
      tokenId,
      promptContract.address,
      ethers.utils.parseEther("0.01")
    );
  console.log("createListing function call Tx Hash:", createListing.hash);
  await createListing.wait();

  // Buy the prompt by account two
  const buyPrompt = await marketplaceContract
    .connect(accountTwoWallet)
    .buyListing(marketplaceId, promptContract.address, {
      value: ethers.utils.parseEther("0.01"),
    });
  console.log("buyPrompt function call Tx Hash:", buyPrompt.hash);
  await buyPrompt.wait();

  console.log(
    "Token owner:",
    await promptContract.connect(accountOneWallet).ownerOf(tokenId)
  );
  console.log(
    "Token listings:",
    await marketplaceContract
      .connect(accountOneWallet)
      .getListings(tokenId, promptContract.address)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
