import { Auth, SDK, TEMPLATES, Metadata } from "@infura/sdk";

async function main() {
  console.log("Start to deploy prompt contract to mumbai");

  // Create auth
  const auth = new Auth({
    projectId: process.env.INFURA_API_KEY,
    secretId: process.env.INFURA_API_KEY_SECRET,
    privateKey: process.env.PRIVATE_KEY_1,
    chainId: 80001,
    ipfs: {
      projectId: process.env.INFURA_IPFS_PROJECT_ID,
      apiKeySecret: process.env.INFURA_IPFS_PROJECT_SECRET,
    },
  });

  // Init sdk
  const sdk = new SDK(auth);

  // Init collection metadata
  const collectionMetadata = Metadata.openSeaCollectionLevelStandard({
    name: "Prompt Markeplace - Prompts",
    description: "NFTs with prompts of Prompt Markeplace project.",
    image: "ipfs://QmYhx98JuMsxZz6foLKB1eevopnSxKhLGQTBu48R35vDRs",
    external_link: "https://prompt-marketplace-app.vercel.app/",
  });
  console.log("collectionMetadata:", collectionMetadata);

  // Upload collection metadata to IPFS
  const storeMetadata = await sdk.storeMetadata({
    metadata: collectionMetadata,
  });
  console.log("storeMetadata:", storeMetadata);

  // Deploy contract
  const newContract = await sdk.deploy({
    template: TEMPLATES.ERC721Mintable,
    params: {
      name: "Prompt Markeplace - Prompts",
      symbol: "PMP",
      contractURI: storeMetadata,
    },
  });
  console.log(`Contract address is: ${newContract.contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
