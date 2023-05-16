import { Avatar, SxProps, Typography } from "@mui/material";
import ProfileUriDataEntity from "entities/uri/ProfileUriDataEntity";
import Link from "next/link";
import { emojiAvatarForAddress } from "utils/avatars";
import { ipfsUriToHttpUri } from "utils/converters";

/**
 * Component with account avatar.
 */
export default function AccountAvatar(props: {
  account: string;
  accountProfileUriData?: ProfileUriDataEntity;
  size?: number;
  emojiSize?: number;
  sx?: SxProps;
}) {
  return (
    <Link href={`/accounts/${props.account}`}>
      <Avatar
        sx={{
          width: props.size || 48,
          height: props.size || 48,
          borderRadius: props.size || 48,
          background: emojiAvatarForAddress(props.account).color,
          ...props.sx,
        }}
        src={
          props.accountProfileUriData?.image
            ? ipfsUriToHttpUri(props.accountProfileUriData.image)
            : undefined
        }
      >
        <Typography fontSize={props.emojiSize || 22}>
          {emojiAvatarForAddress(props.account).emoji}
        </Typography>
      </Avatar>
    </Link>
  );
}
