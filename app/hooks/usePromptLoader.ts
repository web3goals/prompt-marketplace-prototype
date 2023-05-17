import { markeplaceContractAbi } from "@/contracts/abi/markeplaceContract";
import PromptUriDataEntity from "@/entities/uri/PromptUriDataEntity";
import {
  chainToSupportedChainId,
  chainToSupportedChainMarketplaceContractAddress,
  chainToSupportedChainPromptContractAddress,
} from "@/utils/chains";
import { ethers } from "ethers";
import useError from "hooks/useError";
import { useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";
import useInfura from "./useInfura";

/**
 * Load prompt.
 */
export default function usePromptLoader(id: string | undefined): {
  isLoaded: boolean;
  owner: string | undefined;
  uriData: PromptUriDataEntity | undefined;
  listing:
    | {
        price: string;
        marketplaceId: string;
      }
    | undefined;
} {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { getTokenData } = useInfura();
  const [isLoaded, setIsLoaded] = useState(false);
  const [owner, setOwner] = useState<string | undefined>();
  const [uriData, setUriData] = useState<PromptUriDataEntity | undefined>();
  const [listing, setListing] = useState<
    | {
        marketplaceId: string;
        price: string;
      }
    | undefined
  >();

  /**
   * Load owner and uri data
   */
  useEffect(() => {
    setIsLoaded(false);
    setOwner(undefined);
    setUriData(undefined);
    if (id) {
      getTokenData(
        chainToSupportedChainId(chain)!,
        chainToSupportedChainPromptContractAddress(chain)!,
        id.toString()
      )
        .then((data) => {
          setOwner(data.owner);
          setUriData(data.metadata);
          setIsLoaded(true);
        })
        .catch((error) => handleError(error, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Contract states to get price
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
   * Check listings to define sell price.
   */
  useEffect(() => {
    setListing(undefined);
    if (
      listings &&
      listings.length > 0 &&
      listings[listings.length - 1].owner === ethers.constants.AddressZero
    ) {
      setListing({
        price: ethers.utils.formatEther(
          listings[listings.length - 1].listPrice
        ),
        marketplaceId: listings[listings.length - 1].marketplaceId.toString(),
      });
    }
  }, [listings]);

  return { isLoaded, owner, uriData, listing };
}
