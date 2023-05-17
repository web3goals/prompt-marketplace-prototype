import PromptUriDataEntity from "@/entities/uri/PromptUriDataEntity";
import { palette } from "@/theme/palette";
import { Dialog, Typography } from "@mui/material";
import { useState } from "react";
import {
  DialogCenterContent,
  WidgetBox,
  WidgetText,
  WidgetTitle,
} from "../styled";

/**
 * Dialog to show a prompt.
 */
export default function PromptShowDialog(props: {
  id: string;
  uriData: PromptUriDataEntity;
  isClose?: boolean;
  onClose?: Function;
}) {
  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="md" fullWidth>
      <DialogCenterContent>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🤖 Prompt #{props.id}
        </Typography>
        <Typography textAlign="center" mt={1}>
          that can change the world for the better
        </Typography>
        <WidgetBox bgcolor={palette.greyDark} mt={2}>
          <WidgetTitle>Prompt</WidgetTitle>
          <WidgetText>{props.uriData.prompt}</WidgetText>
        </WidgetBox>
        <WidgetBox bgcolor={palette.greyLight} mt={2}>
          <WidgetTitle>Instruction</WidgetTitle>
          <WidgetText>{props.uriData.instruction}</WidgetText>
        </WidgetBox>
      </DialogCenterContent>
    </Dialog>
  );
}
