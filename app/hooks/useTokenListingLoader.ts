import { markeplaceContractAbi } from "@/contracts/abi/markeplaceContract";
import TokenListingEntity from "@/entities/TokenListingEntity";
import {
  chainToSupportedChainMarketplaceContractAddress,
  chainToSupportedChainPromptContractAddress,
} from "@/utils/chains";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";
import useError from "./useError";

/**
 * Load token listing.
 */
export default function useTokenListingLoader(id: string | undefined): {
  tokenListing: TokenListingEntity | undefined;
} {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const [tokenListing, setTokenListing] = useState<
    TokenListingEntity | undefined
  >();

  /**
   * Contract states to get listing
   */
  const { data: listings } = useContractRead({
    address: chainToSupportedChainMarketplaceContractAddress(chain),
    abi: markeplaceContractAbi,
    functionName: "getListings",
    args: [
      BigInt(id || 0),
      chainToSupportedChainPromptContractAddress(chain) ||
        ethers.constants.AddressZero,
    ],
    enabled: Boolean(id),
    onError(error: any) {
      handleError(error, true);
    },
  });

  /**
   * Check listings to define actual sell price
   */
  useEffect(() => {
    setTokenListing(undefined);
    if (
      listings &&
      listings.length > 0 &&
      listings[listings.length - 1].owner === ethers.constants.AddressZero
    ) {
      setTokenListing({
        price: ethers.utils.formatEther(
          listings[listings.length - 1].listPrice
        ),
        marketplaceId: listings[listings.length - 1].marketplaceId.toString(),
      });
    }
  }, [listings]);

  return { tokenListing };
}
