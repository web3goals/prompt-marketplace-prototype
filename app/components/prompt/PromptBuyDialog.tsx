import { markeplaceContractAbi } from "@/contracts/abi/markeplaceContract";
import useToasts from "@/hooks/useToast";
import { palette } from "@/theme/palette";
import {
  chainToSupportedChainId,
  chainToSupportedChainMarketplaceContractAddress,
  chainToSupportedChainNativeCurrencySymbol,
  chainToSupportedChainPromptContractAddress,
} from "@/utils/chains";
import { Dialog, Stack, Typography } from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetText,
  WidgetTitle,
} from "../styled";

/**
 * Dialog to buy a prompt.
 */
export default function PromptBuyDialog(props: {
  id: string;
  listingPrice: string;
  listingMarketplaceId: string;
  isClose?: boolean;
  onClose?: Function;
}) {
  const router = useRouter();
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();
  const [isOpen, setIsOpen] = useState(!props.isClose);

  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  /**
   * Contract states
   */
  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainMarketplaceContractAddress(chain),
      abi: markeplaceContractAbi,
      functionName: "buyListing",
      args: [
        BigInt(props.listingMarketplaceId),
        chainToSupportedChainPromptContractAddress(chain) ||
          ethers.constants.AddressZero,
      ],
      value: ethers.utils.parseEther(props.listingPrice).toBigInt(),
      chainId: chainToSupportedChainId(chain),
      onError(error: any) {
        showToastError(error);
      },
    });

  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractPrepareConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Handle transaction success to show success message.
   */
  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Prompt is bought!");
      axios.post("/api/notifier/sendNotificationToPromptSeller", {
        transactionHash: contractWriteData?.hash,
      });
      router.reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmittingDisabled =
    isFormDisabled ||
    isTransactionSuccess ||
    isContractPrepareError ||
    !contractWrite;

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          💸 Buy prompt #{props.id}
        </Typography>
        <WidgetBox bgcolor={palette.orange} mt={2}>
          <WidgetTitle>Price</WidgetTitle>
          <Stack direction="row" spacing={1}>
            <WidgetText>{props.listingPrice}</WidgetText>
            <WidgetText>
              {chainToSupportedChainNativeCurrencySymbol(chain)}
            </WidgetText>
          </Stack>
        </WidgetBox>
        <ExtraLargeLoadingButton
          loading={isFormLoading}
          variant="outlined"
          type="submit"
          disabled={isFormSubmittingDisabled}
          onClick={() => contractWrite?.()}
          sx={{ mt: 2 }}
        >
          Submit
        </ExtraLargeLoadingButton>
      </DialogCenterContent>
    </Dialog>
  );
}
