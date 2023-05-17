import TokenDataEntity from "@/entities/TokenDataEntity";
import axios from "axios";

/**
 * Load token data.
 */
export default function useTokenDataLoader() {
  const Auth = Buffer.from(
    process.env.NEXT_PUBLIC_INFURA_API_KEY +
      ":" +
      process.env.NEXT_PUBLIC_INFURA_API_KEY_SECRET
  ).toString("base64");

  const getTokenData = async function (
    chainId: number,
    tokenAddress: string,
    tokenId: string
  ): Promise<TokenDataEntity> {
    const { data } = await axios.get(
      `https://nft.api.infura.io/networks/${chainId}/nfts/${tokenAddress}/${tokenId}/owners`,
      {
        headers: {
          Authorization: `Basic ${Auth}`,
        },
      }
    );
    return {
      id: data.owners[0].tokenId,
      owner: data.owners[0].ownerOf,
      metadata: JSON.parse(data.owners[0].metadata),
    };
  };

  const getTokenDataList = async function (
    chainId: number,
    tokenAddress: string
  ): Promise<TokenDataEntity[]> {
    const tokenDataList: TokenDataEntity[] = [];
    const { data } = await axios.get(
      `https://nft.api.infura.io/networks/${chainId}/nfts/${tokenAddress}/owners`,
      {
        headers: {
          Authorization: `Basic ${Auth}`,
        },
      }
    );
    for (let i = 0; i < data.owners.length; i++) {
      tokenDataList.push({
        id: data.owners[i].tokenId,
        owner: data.owners[i].ownerOf,
        metadata: JSON.parse(data.owners[i].metadata),
      });
    }
    return tokenDataList;
  };

  return {
    getTokenData,
    getTokenDataList,
  };
}
