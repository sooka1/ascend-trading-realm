import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPortfoliosTool from "./tools/list-portfolios";
import listTransactionsTool from "./tools/list-transactions";
import getProfileTool from "./tools/get-profile";

// The OAuth issuer MUST be the direct Supabase host. On publish, SUPABASE_URL
// is rewritten to the `.lovable.cloud` proxy which mcp-js rejects (RFC 8414
// issuer mismatch). VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hkex-invest-mcp",
  title: "HKEX Invest",
  version: "0.1.0",
  instructions:
    "Read-only tools for the signed-in HKEX Invest investor. Use list_my_portfolios to see the user's managed portfolios, list_my_transactions for recent account activity, and get_my_profile for their profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPortfoliosTool, listTransactionsTool, getProfileTool],
});