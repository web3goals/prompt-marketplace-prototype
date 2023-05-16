import AccountAvatar from "@/components/account/AccountAvatar";
import AccountLink from "@/components/account/AccountLink";
import {
  FullWidthSkeleton,
  WidgetBox,
  WidgetContentBox,
  WidgetText,
  WidgetTitle,
} from "@/components/styled";
import PromptUriDataEntity from "@/entities/uri/PromptUriDataEntity";
import useError from "@/hooks/useError";
import useInfura from "@/hooks/useInfura";
import { palette } from "@/theme/palette";
import {
  chainToSupportedChainId,
  chainToSupportedChainPromptContractAddress,
} from "@/utils/chains";
import { Typography } from "@mui/material";
import Layout from "components/layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { timestampToLocaleDateString } from "utils/converters";
import { useNetwork } from "wagmi";

/**
 * Page with a prompt.
 */
export default function Prompt() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { getTokenData } = useInfura();
  const [promptData, setPromptData] = useState<
    { owner: string; uriData: PromptUriDataEntity } | undefined
  >();

  /**
   * Load prompt data
   */
  useEffect(() => {
    if (id) {
      getTokenData(
        chainToSupportedChainId(chain)!,
        chainToSupportedChainPromptContractAddress(chain)!,
        id.toString()
      )
        .then((data) =>
          setPromptData({ owner: data.owner, uriData: data.metadata })
        )
        .catch((error) => handleError(error, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Layout maxWidth="sm">
      {promptData ? (
        <>
          <Typography variant="h4" fontWeight={700} textAlign="center">
            🤖 Prompt #{id?.toString()}
          </Typography>
          {/* Owner */}
          <WidgetBox bgcolor={palette.greyDark} mt={2}>
            <WidgetTitle>Owner</WidgetTitle>
            <WidgetContentBox
              display="flex"
              flexDirection="column"
              alignItems={{ xs: "center", md: "flex-start" }}
            >
              <AccountAvatar
                account={promptData.owner}
                accountProfileUriData={undefined} // TODO: Load profile uri data
              />
              <AccountLink
                account={promptData.owner}
                accountProfileUriData={undefined} // TODO: Load profile uri data
                sx={{ mt: 1 }}
              />
            </WidgetContentBox>
          </WidgetBox>
          {/* Created */}
          <WidgetBox bgcolor={palette.greyLight} mt={2}>
            <WidgetTitle>Created</WidgetTitle>
            <WidgetText>
              {timestampToLocaleDateString(promptData.uriData.created)}
            </WidgetText>
          </WidgetBox>
          {/* Category */}
          <WidgetBox bgcolor={palette.green} mt={2}>
            <WidgetTitle>Category</WidgetTitle>
            <WidgetText>{promptData.uriData.category}</WidgetText>
          </WidgetBox>
          {/* Title */}
          <WidgetBox bgcolor={palette.purpleDark} mt={2}>
            <WidgetTitle>Title</WidgetTitle>
            <WidgetText>{promptData.uriData.title}</WidgetText>
          </WidgetBox>
          {/* Description */}
          <WidgetBox bgcolor={palette.purpleLight} mt={2}>
            <WidgetTitle>Title</WidgetTitle>
            <WidgetText>{promptData.uriData.description}</WidgetText>
          </WidgetBox>
          {/* Price */}
          {/* TODO: Display price prompt is for sale */}
          {/* Buttons */}
          {/* TODO: Display buttons */}
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
