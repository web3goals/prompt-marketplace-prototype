import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

const processedTransactions = [];
const luniverseAuthToken = ""; // TODO: Move token to .env

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // Load transfer transactions from prompt contract
    const { data } = await axios.post(
      `https://web3.luniverse.io/v1/polygon/mumbai/nft/listNftTransferByContract`,
      {
        contractAddress: process.env.NEXT_PUBLIC_MUMBAI_PROMPT_CONTRACT_ADDRESS,
      },
      {
        headers: {
          Authorization: `Bearer ${luniverseAuthToken}`,
        },
      }
    );
    // Send notification to prompt sellers
    // TODO:
    res.status(200).json({ message: "Ok" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error });
  }
}
