import { markeplaceContractAbi } from "@/contracts/abi/markeplaceContract";
import { promptContractAbi } from "@/contracts/abi/promptContract";
import useDebounce from "@/hooks/useDebounce";
import useToasts from "@/hooks/useToast";
import { palette } from "@/theme/palette";
import {
  chainToSupportedChainId,
  chainToSupportedChainMarketplaceContractAddress,
  chainToSupportedChainNativeCurrencySymbol,
  chainToSupportedChainPromptContractAddress,
} from "@/utils/chains";
import { numberToBigNumberEthers } from "@/utils/converters";
import { Dialog, MenuItem, Stack, Typography } from "@mui/material";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";
import FormikHelper from "../helper/FormikHelper";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputSelect,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

/**
 * Dialog to sell a prompt.
 */
export default function PromptSellDialog(props: {
  id: string;
  isClose?: boolean;
  onClose?: Function;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(!props.isClose);
  const [isApproved, setIsApproved] = useState(false);

  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      {isApproved ? (
        <PromptSellListingForm
          id={props.id}
          onSuccess={() => router.reload()}
        />
      ) : (
        <PromptSellApproveForm
          id={props.id}
          onSuccess={() => setIsApproved(true)}
        />
      )}
    </Dialog>
  );
}

function PromptSellApproveForm(props: { id: string; onSuccess: Function }) {
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();

  /**
   * Contract states
   */
  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainPromptContractAddress(chain),
      abi: promptContractAbi,
      functionName: "approve",
      args: [
        chainToSupportedChainMarketplaceContractAddress(chain) ||
          ethers.constants.AddressZero,
        BigInt(props.id),
      ],
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
      showToastSuccess("Sale is approved!");
      props.onSuccess?.();
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
    <DialogCenterContent>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        💸 Approve the sale
      </Typography>
      <Typography textAlign="center" mt={1}>
        of the prompt #{props.id} before you can place it for sale
      </Typography>
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
  );
}

function PromptSellListingForm(props: { id: string; onSuccess: Function }) {
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    price: 0.05,
    priceCurrency: "native",
  });
  const formValidationSchema = yup.object({
    price: yup.number().required(),
    priceCurrency: yup.string().required(),
  });
  const debouncedFormValues = useDebounce(formValues);

  /**
   * Contract states
   */
  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: chainToSupportedChainMarketplaceContractAddress(chain),
      abi: markeplaceContractAbi,
      functionName: "createListing",
      args: [
        BigInt(props.id),
        chainToSupportedChainPromptContractAddress(chain) ||
          ethers.constants.AddressZero,
        numberToBigNumberEthers(debouncedFormValues.price).toBigInt(),
      ],
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
      showToastSuccess("Prompt is now on sale!");
      props.onSuccess?.();
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
    <DialogCenterContent>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        💸 Sell prompt #{props.id}
      </Typography>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={() => contractWrite?.()}
      >
        {({ values, errors, touched, handleChange, setValues }) => (
          <Form
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Price input */}
            <WidgetBox bgcolor={palette.orange} mt={2}>
              <WidgetTitle>Price</WidgetTitle>
              <Stack direction="row" spacing={1} sx={{ width: 1 }}>
                <WidgetInputTextField
                  id="price"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  error={touched.price && Boolean(errors.price)}
                  helperText={touched.price && errors.price}
                  disabled={isFormDisabled}
                  sx={{ flex: 1 }}
                />
                <WidgetInputSelect
                  id="priceCurrency"
                  name="priceCurrency"
                  value={values.priceCurrency}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="native">
                    {chainToSupportedChainNativeCurrencySymbol(chain)}
                  </MenuItem>
                </WidgetInputSelect>
              </Stack>
            </WidgetBox>
            {/* Submit button */}
            <ExtraLargeLoadingButton
              loading={isFormLoading}
              variant="outlined"
              type="submit"
              disabled={isFormSubmittingDisabled}
              sx={{ mt: 2 }}
            >
              Submit
            </ExtraLargeLoadingButton>
          </Form>
        )}
      </Formik>
    </DialogCenterContent>
  );
}
