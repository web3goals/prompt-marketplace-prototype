import AccountCard from "@/components/account/AccountCard";
import EntityList from "@/components/entity/EntityList";
import { markeplaceContractAbi } from "@/contracts/abi/markeplaceContract";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import ProfileUriDataEntity from "@/entities/uri/ProfileUriDataEntity";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import {
  chainToSupportedChainMarketplaceContractAddress,
  chainToSupportedChainProfileContractAddress,
} from "@/utils/chains";
import { stringToAddress } from "@/utils/converters";
import { SxProps, Typography } from "@mui/material";
import Layout from "components/layout";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";

/**
 * Page with the top authors.
 */
export default function TopAuthors() {
  const { chain } = useNetwork();
  const [topAuthors, setTopAuthors] = useState<any[] | undefined>();

  /**
   * Define sellers
   */
  const { data: sellers } = useContractRead({
    address: chainToSupportedChainMarketplaceContractAddress(chain),
    abi: markeplaceContractAbi,
    functionName: "getSellers",
  });

  /**
   * Define top authors
   */
  useEffect(() => {
    if (sellers) {
      setTopAuthors(
        [...sellers].sort((a, b) => Number(b.soldListings - a.soldListings))
      );
    } else {
      setTopAuthors(undefined);
    }
  }, [sellers]);

  return (
    <Layout>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🏆 Top author
      </Typography>
      <Typography textAlign="center" mt={1}>
        who created the most purchasable clues
      </Typography>
      <EntityList
        entities={topAuthors}
        renderEntityCard={(topAuthor, index) => (
          <TopAuthorCard
            key={index}
            address={topAuthor.sellerAddress}
            soldPrompts={Number(topAuthor.soldListings)}
          />
        )}
        noEntitiesText="😐 no authors"
        sx={{ mt: 4 }}
      />
    </Layout>
  );
}

function TopAuthorCard(props: {
  address: string;
  soldPrompts: number;
  sx?: SxProps;
}) {
  const { chain } = useNetwork();

  /**
   * Define profile uri data
   */
  const { data: profileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [stringToAddress(props.address) || ethers.constants.AddressZero],
  });
  const { data: profileUriData } =
    useUriDataLoader<ProfileUriDataEntity>(profileUri);

  return (
    <AccountCard
      address={props.address}
      profileUriData={profileUriData}
      soldPrompts={props.soldPrompts}
    />
  );
}
