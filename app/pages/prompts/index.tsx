import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Page with prompts.
 */
export default function Prompts() {
  const router = useRouter();

  useEffect(() => {
    router.push("/#prompts");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
