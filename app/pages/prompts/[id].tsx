import AccountAvatar from "@/components/account/AccountAvatar";
import AccountLink from "@/components/account/AccountLink";
import FormikHelper from "@/components/helper/FormikHelper";
import PromptBuyDialog from "@/components/prompt/PromptBuyDialog";
import PromptSellDialog from "@/components/prompt/PromptSellDialog";
import PromptShowDialog from "@/components/prompt/PromptShowDialog";
import {
  CardBox,
  FullWidthSkeleton,
  LargeLoadingButton,
  ThickDivider,
  WidgetBox,
  WidgetContentBox,
  WidgetInputTextField,
  WidgetText,
  WidgetTitle,
} from "@/components/styled";
import { DialogContext } from "@/context/dialog";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import TokenDataEntity from "@/entities/TokenDataEntity";
import ProfileUriDataEntity from "@/entities/uri/ProfileUriDataEntity";
import PromptUriDataEntity from "@/entities/uri/PromptUriDataEntity";
import useError from "@/hooks/useError";
import useTokenListingLoader from "@/hooks/useTokenListingLoader";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { palette } from "@/theme/palette";
import { isAddressesEqual } from "@/utils/addresses";
import {
  chainToSupportedChainId,
  chainToSupportedChainNativeCurrencySymbol,
  chainToSupportedChainProfileContractAddress,
  chainToSupportedChainPromptContractAddress,
} from "@/utils/chains";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import axios from "axios";
import Layout from "components/layout";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import useTokenDataLoader from "@/hooks/useTokenDataLoader";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { stringToAddress, timestampToLocaleDateString } from "utils/converters";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import * as yup from "yup";

/**
 * Page with a prompt.
 */
export default function Prompt() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { getTokenData } = useTokenDataLoader();
  const [prompt, setPrompt] = useState<TokenDataEntity | undefined>();

  /**
   * Define prompt data
   */
  useEffect(() => {
    setPrompt(undefined);
    if (id) {
      getTokenData(
        chainToSupportedChainId(chain)!,
        chainToSupportedChainPromptContractAddress(chain)!,
        id.toString()
      )
        .then((tokenData) => setPrompt(tokenData))
        .catch((error) => handleError(error, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Layout maxWidth="sm">
      {id && prompt ? (
        prompt.metadata ? (
          <>
            <PromptData prompt={prompt} />
            <ThickDivider sx={{ mt: 8, mb: 8 }} />
            <PromptSandbox prompt={prompt} />
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight={700} textAlign="center">
              🤔 Hmm...
            </Typography>
            <Typography textAlign="center" mt={1}>
              It seems that the prompt metadata is not ready now, try to open it
              later
            </Typography>
          </>
        )
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function PromptData(props: { prompt: TokenDataEntity }) {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { showDialog, closeDialog } = useContext(DialogContext);

  const promptUriData = props.prompt.metadata as PromptUriDataEntity;

  /**
   * Define author data
   */
  const { data: promptAuthorProfileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [
      stringToAddress(promptUriData.author) || ethers.constants.AddressZero,
    ],
  });
  const { data: promptAuthorProfileUriData } =
    useUriDataLoader<ProfileUriDataEntity>(promptAuthorProfileUri);

  /**
   * Define owner data
   */
  const { data: promptOwnerProfileUri } = useContractRead({
    address: chainToSupportedChainProfileContractAddress(chain),
    abi: profileContractAbi,
    functionName: "getURI",
    args: [stringToAddress(props.prompt.owner) || ethers.constants.AddressZero],
  });
  const { data: promptOwnerProfileUriData } =
    useUriDataLoader<ProfileUriDataEntity>(promptOwnerProfileUri);

  /**
   * Define listing
   */
  const { tokenListing: promptListing } = useTokenListingLoader(
    props.prompt.id
  );

  if (!promptUriData) {
    return <></>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🤖 Prompt #{props.prompt.id}
      </Typography>
      <Typography textAlign="center" mt={1}>
        that can change the world for the better
      </Typography>
      {/* Author */}
      <WidgetBox bgcolor={palette.greyDark} mt={2}>
        <WidgetTitle>Author</WidgetTitle>
        <WidgetContentBox
          display="flex"
          flexDirection="column"
          alignItems={{ xs: "center", md: "flex-start" }}
        >
          <AccountAvatar
            account={promptUriData.author || ethers.constants.AddressZero}
            accountProfileUriData={promptAuthorProfileUriData}
          />
          <AccountLink
            account={promptUriData.author || ethers.constants.AddressZero}
            accountProfileUriData={promptAuthorProfileUriData}
            sx={{ mt: 1 }}
          />
        </WidgetContentBox>
      </WidgetBox>
      {/* Owner */}
      <WidgetBox bgcolor={palette.greyLight} mt={2}>
        <WidgetTitle>Owner</WidgetTitle>
        <WidgetContentBox
          display="flex"
          flexDirection="column"
          alignItems={{ xs: "center", md: "flex-start" }}
        >
          <AccountAvatar
            account={props.prompt.owner}
            accountProfileUriData={promptOwnerProfileUriData}
          />
          <AccountLink
            account={props.prompt.owner}
            accountProfileUriData={promptOwnerProfileUriData}
            sx={{ mt: 1 }}
          />
        </WidgetContentBox>
      </WidgetBox>
      {/* Created */}
      <WidgetBox bgcolor={palette.greyDark} mt={2}>
        <WidgetTitle>Created</WidgetTitle>
        <WidgetText>
          {timestampToLocaleDateString(promptUriData.created, true)}
        </WidgetText>
      </WidgetBox>
      {/* Category */}
      <WidgetBox bgcolor={palette.green} mt={2}>
        <WidgetTitle>Category</WidgetTitle>
        <WidgetText>{promptUriData.category}</WidgetText>
      </WidgetBox>
      {/* Title */}
      <WidgetBox bgcolor={palette.purpleDark} mt={2}>
        <WidgetTitle>Title</WidgetTitle>
        <WidgetText>{promptUriData.title}</WidgetText>
      </WidgetBox>
      {/* Description */}
      <WidgetBox bgcolor={palette.purpleLight} mt={2}>
        <WidgetTitle>Description</WidgetTitle>
        <WidgetText>{promptUriData.description}</WidgetText>
      </WidgetBox>
      {/* Price */}
      {promptListing && (
        <WidgetBox bgcolor={palette.orange} mt={2}>
          <WidgetTitle>Price</WidgetTitle>
          <Stack direction="row" spacing={1}>
            <WidgetText>{promptListing.price}</WidgetText>
            <WidgetText>
              {chainToSupportedChainNativeCurrencySymbol(chain)}
            </WidgetText>
          </Stack>
        </WidgetBox>
      )}
      {/* Buttons */}
      <Stack direction="column" spacing={2} mt={2}>
        {!isAddressesEqual(address, props.prompt.owner) && (
          <LargeLoadingButton
            variant="contained"
            disabled={!Boolean(promptListing)}
            onClick={() => {
              if (promptListing) {
                showDialog?.(
                  <PromptBuyDialog
                    id={props.prompt.id}
                    listingPrice={promptListing.price}
                    listingMarketplaceId={promptListing.marketplaceId}
                    onClose={closeDialog}
                  />
                );
              }
            }}
          >
            Buy
          </LargeLoadingButton>
        )}
        {isAddressesEqual(address, props.prompt.owner) && (
          <LargeLoadingButton
            variant="contained"
            disabled={Boolean(promptListing)}
            onClick={() =>
              showDialog?.(
                <PromptSellDialog id={props.prompt.id} onClose={closeDialog} />
              )
            }
          >
            Sell
          </LargeLoadingButton>
        )}
        {isAddressesEqual(address, props.prompt.owner) && (
          <LargeLoadingButton
            variant="outlined"
            onClick={() =>
              showDialog?.(
                <PromptShowDialog
                  id={props.prompt.id}
                  uriData={promptUriData}
                  onClose={closeDialog}
                />
              )
            }
          >
            Show
          </LargeLoadingButton>
        )}
      </Stack>
    </Box>
  );
}

function PromptSandbox(props: { prompt: TokenDataEntity }) {
  interface Message {
    role: "system" | "assistant" | "user";
    content: string;
  }

  const promptUriData = props.prompt.metadata as PromptUriDataEntity;
  const { handleError } = useError();
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: promptUriData.prompt || "" },
  ]);

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    message: "",
  });
  const formValidationSchema = yup.object({
    message: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Send message to chat gpt and get response.
   */
  async function submitForm(values: any, actions: any) {
    try {
      setIsFormSubmitting(true);
      const { data } = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [...messages, { role: "user", content: values.message }],
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer " + process.env.NEXT_PUBLIC_OPEN_AI_API_KEY_SECRET,
          },
        }
      );
      setMessages([
        ...messages,
        { role: "user", content: values.message },
        data.choices?.[0]?.message,
      ]);
      actions?.resetForm();
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  if (!promptUriData) {
    return <></>;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🕹️ Sandbox
      </Typography>
      <Typography textAlign="center" mt={1}>
        to try the prompt to check out how great it is
      </Typography>
      {/* Form */}
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={submitForm}
      >
        {({ values, errors, touched, handleChange, setValues }) => (
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Message input */}
            <WidgetBox bgcolor={palette.yellow} mt={2}>
              <WidgetTitle>Message</WidgetTitle>
              <WidgetInputTextField
                id="message"
                name="message"
                placeholder="How can you help me?"
                value={values.message}
                onChange={handleChange}
                error={touched.message && Boolean(errors.message)}
                helperText={touched.message && errors.message}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Submit button */}
            <LargeLoadingButton
              loading={isFormSubmitting}
              variant="outlined"
              type="submit"
              disabled={isFormSubmitting}
              sx={{ mt: 2 }}
            >
              Post
            </LargeLoadingButton>
          </Form>
        )}
      </Formik>
      {/* Messages */}
      <Box width={1} mt={2}>
        {messages
          .slice(0)
          .reverse()
          .map((message, index) => {
            if (message.role === "system") {
              return <Box key={index} />;
            }
            return (
              <CardBox key={index} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar
                    sx={{
                      background:
                        message.role === "assistant"
                          ? palette.blue
                          : palette.yellow,
                    }}
                  >
                    <Typography fontSize={18}>
                      {message.role === "assistant" ? "🤖" : "👤"}
                    </Typography>
                  </Avatar>
                  <Typography>{message.content}</Typography>
                </Stack>
              </CardBox>
            );
          })}
      </Box>
    </Box>
  );
}
