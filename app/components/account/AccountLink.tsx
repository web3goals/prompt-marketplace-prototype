import { Link as MuiLink, SxProps } from "@mui/material";
import ProfileUriDataEntity from "entities/uri/ProfileUriDataEntity";
import Link from "next/link";
import { theme } from "theme";
import { addressToShortAddress } from "utils/converters";

/**
 * Component with account link.
 */
export default function AccountLink(props: {
  account: string;
  accountProfileUriData?: ProfileUriDataEntity;
  color?: string;
  sx?: SxProps;
}) {
  return (
    <Link href={`/accounts/${props.account}`} passHref legacyBehavior>
      <MuiLink
        fontWeight={700}
        variant="body2"
        color={props.color || theme.palette.primary.main}
        sx={{ ...props.sx }}
      >
        {props.accountProfileUriData?.attributes[0].value
          ? props.accountProfileUriData?.attributes[0].value +
            " (" +
            addressToShortAddress(props.account) +
            ")"
          : addressToShortAddress(props.account)}
      </MuiLink>
    </Link>
  );
}
