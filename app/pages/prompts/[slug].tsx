import Layout from "components/layout";
import { useRouter } from "next/router";

/**
 * Page with a prompt.
 */
export default function Prompt() {
  const router = useRouter();
  const { slug } = router.query;

  return <Layout>...</Layout>;
}
