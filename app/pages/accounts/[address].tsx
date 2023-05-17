import AccountProfile from "@/components/account/AccountProfile";
import Layout from "components/layout";
import { useRouter } from "next/router";

/**
 * Page with an account.
 */
export default function Account() {
  const router = useRouter();
  const { address } = router.query;

  return (
    <Layout>
      {address && <AccountProfile address={address.toString()} />}
    </Layout>
  );
}
