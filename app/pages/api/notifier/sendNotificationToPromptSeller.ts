import { markeplaceContractAbi } from "@/contracts/abi/markeplaceContract";
import { promptContractAbi } from "@/contracts/abi/promptContract";
import * as PushAPI from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import axios from "axios";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Define request params
    const transactionHash: string | undefined = req.body.transactionHash;
    if (!transactionHash) {
      throw new Error("Parameters are incorrect");
    }

    // Define prompt id using transaction transfer event
    const promptId = await getPromptIdByTransaction(transactionHash);
    if (!promptId) {
      throw new Error("Prompt' ID is undefined");
    }

    // Define prompt seller
    const promptSeller = await getPromptSeller(promptId);
    if (!promptSeller) {
      throw new Error("Prompt's seller is undefined");
    }

    // Send notification to prompt sellers using push protocol
    await sendNotification(promptId, promptSeller);

    res.status(200).json({ data: "ok" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || error });
  }
}

async function getPromptIdByTransaction(
  transactionHash: string
): Promise<string | undefined> {
  // Get access token from luniverse
  const { data: postAuthResponseData } = await axios.post(
    "https://web3.luniverse.io/v1/auth-token",
    {},
    {
      headers: {
        "X-Key-ID": process.env.NEXT_PUBLIC_LUNIVERSE_API_KEY,
        "X-Key-Secret": process.env.NEXT_PUBLIC_LUNIVERSE_API_SECRET,
        "X-NODE-ID": process.env.NEXT_PUBLIC_LUNIVERSE_NODE_ID,
      },
    }
  );
  const accessToken = postAuthResponseData["access_token"];
  // Get transaction data from luniverse
  const { data: getTransactionResponseData } = await axios.get(
    `https://web3.luniverse.io/v1/polygon/mumbai/transactions/${transactionHash}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  // Parse transaction logs to get prompt id
  const promptContractInterface = new ethers.utils.Interface(promptContractAbi);
  for (const log of getTransactionResponseData.data.receipt.logs) {
    try {
      const logDescription = promptContractInterface.parseLog(log);
      if (logDescription.eventFragment.name === "Transfer") {
        return logDescription.args.tokenId.toString();
      }
    } catch (error) {}
  }
  return undefined;
}

async function getPromptSeller(promptId: string): Promise<string | undefined> {
  // Get prompt listings
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_MUMBAI_RPC_URL
  );
  const marketplaceContractInterface = new ethers.utils.Interface(
    markeplaceContractAbi
  );
  const marketplaceContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_MUMBAI_MARKETPLACE_CONTRACT_ADDRESS || "",
    marketplaceContractInterface,
    provider
  );
  const listings = await marketplaceContract.getListings(
    promptId,
    process.env.NEXT_PUBLIC_MUMBAI_PROMPT_CONTRACT_ADDRESS
  );
  return listings[listings.length - 1][3];
}

async function sendNotification(promptId: string, promptSeller: string) {
  if (!process.env.NEXT_PUBLIC_PUSH_PROTOCOL_CHANNEL_PRIVATE_KEY) {
    throw new Error("Private key for push protocol is undefined");
  }
  const signer = new ethers.Wallet(
    `0x${process.env.NEXT_PUBLIC_PUSH_PROTOCOL_CHANNEL_PRIVATE_KEY}`
  );
  await PushAPI.payloads.sendNotification({
    signer: signer,
    type: 3,
    identityType: 0,
    recipients: [promptSeller],
    notification: {
      title: "notification title",
      body: `Prompt #${promptId} is purchased!`,
    },
    payload: {
      title: "",
      body: "",
      cta: "",
      img: "",
    },
    channel: "eip155:5:0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1", // your channel address
    env: ENV.STAGING,
  });
}
