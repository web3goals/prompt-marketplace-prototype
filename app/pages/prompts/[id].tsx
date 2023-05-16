import AccountAvatar from "@/components/account/AccountAvatar";
import AccountLink from "@/components/account/AccountLink";
import {
  FullWidthSkeleton,
  ThickDivider,
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
      {id && promptData ? (
        <>
          <PromptData
            id={id.toString()}
            owner={promptData.owner}
            uriData={promptData.uriData}
          />
          <ThickDivider sx={{ mt: 8, mb: 8 }} />
          <PromptSandbox uriData={promptData.uriData} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function PromptData(props: {
  id: string;
  owner: string;
  uriData: PromptUriDataEntity;
}) {
  return (
    <>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🤖 Prompt #{props.id}
      </Typography>
      <Typography textAlign="center" mt={1}>
        that can change the world for the better
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
            account={props.owner}
            accountProfileUriData={undefined} // TODO: Load profile uri data
          />
          <AccountLink
            account={props.owner}
            accountProfileUriData={undefined} // TODO: Load profile uri data
            sx={{ mt: 1 }}
          />
        </WidgetContentBox>
      </WidgetBox>
      {/* Created */}
      <WidgetBox bgcolor={palette.greyLight} mt={2}>
        <WidgetTitle>Created</WidgetTitle>
        <WidgetText>
          {timestampToLocaleDateString(props.uriData.created)}
        </WidgetText>
      </WidgetBox>
      {/* Category */}
      <WidgetBox bgcolor={palette.green} mt={2}>
        <WidgetTitle>Category</WidgetTitle>
        <WidgetText>{props.uriData.category}</WidgetText>
      </WidgetBox>
      {/* Title */}
      <WidgetBox bgcolor={palette.purpleDark} mt={2}>
        <WidgetTitle>Title</WidgetTitle>
        <WidgetText>{props.uriData.title}</WidgetText>
      </WidgetBox>
      {/* Description */}
      <WidgetBox bgcolor={palette.purpleLight} mt={2}>
        <WidgetTitle>Description</WidgetTitle>
        <WidgetText>{props.uriData.description}</WidgetText>
      </WidgetBox>
      {/* Price */}
      {/* TODO: Display price prompt is for sale */}
      {/* Buttons */}
      {/* TODO: Display buttons */}
    </>
  );
}

// TODO: Implement
function PromptSandbox(props: { uriData: PromptUriDataEntity }) {
  return (
    <>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🕹️ Sandbox
      </Typography>
      <Typography textAlign="center" mt={1}>
        to try the prompt to check out how great it is
      </Typography>
    </>
  );
}
