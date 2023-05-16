import axios from "axios";

/**
 * Hook for work with Infura SDK.
 */
export default function useInfura() {
  const Auth = Buffer.from(
    process.env.NEXT_PUBLIC_INFURA_API_KEY +
      ":" +
      process.env.NEXT_PUBLIC_INFURA_API_KEY_SECRET
  ).toString("base64");

  const getTokenData = async function (
    chainId: number,
    tokenAddress: string,
    tokenId: string
  ): Promise<{
    owner: string;
    metadata: any;
  }> {
    const { data } = await axios.get(
      `https://nft.api.infura.io/networks/${chainId}/nfts/${tokenAddress}/${tokenId}/owners`,
      {
        headers: {
          Authorization: `Basic ${Auth}`,
        },
      }
    );
    return {
      owner: data.owners[0].ownerOf,
      metadata: JSON.parse(data.owners[0].metadata),
    };
  };

  return {
    getTokenData,
  };
}
