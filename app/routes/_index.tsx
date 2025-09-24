import { StorePage } from "~/components/StorePage";
import { checkMcpServer, getExampleUIs } from "~/lib/utils.server";
import type { McpToolsResponse } from "~/lib/utils";
import { HomePage } from "~/components/HomePage";
import { getActionMode } from "../../src/utils/ui-urls";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  let actionsMode: "default" | "prompt" | "tool" = "default";
  let proxyMode: boolean = false;
  let storeName = url.searchParams.get("store");
  if (url.searchParams.get("store_domain")) {
    storeName = url.searchParams.get("store_domain");
    actionsMode = "prompt";
    proxyMode = true;
  }
  if (url.searchParams.get("storedomain")) {
    storeName = url.searchParams.get("storedomain");
    actionsMode = "tool";
    proxyMode = true;
  }
  if (url.searchParams.get("mode")) {
    actionsMode = getActionMode(url.searchParams.get("mode"));
    proxyMode = actionsMode !== "default";
  }
  const style = url.searchParams.get("style") ?? "default";
  // hack for shopify.supply
  if (storeName == "shopify.supply") {
    storeName = "checkout.shopify.supply";
  }
  let tools: McpToolsResponse["result"]["tools"] = [];
  let exampleUIs: Record<string, any> = {};
  if (storeName) {
    // get tool list
    const result = await checkMcpServer(storeName);
    if (result.success) {
      tools = result.tools || [];
      exampleUIs = await getExampleUIs({
        storeDomain: storeName,
        tools,
        proxyMode,
        actionsMode,
        originalUrl: url,
      });
    }
  }
  // clear all search params except 'store'
  url.searchParams.forEach((value, key) => {
    if (
      key !== "store" &&
      key !== "store_domain" &&
      key !== "storedomain" &&
      key !== "mode"
    ) {
      url.searchParams.delete(key);
    }
  });
  return { url: url.toString(), storeName, tools, exampleUIs, style };
};

export default function Home({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  const { storeName, url, tools, exampleUIs, style } = loaderData;
  return storeName ? (
    <StorePage
      url={url}
      storeName={storeName}
      tools={tools}
      exampleUIs={exampleUIs}
      preset={style}
    />
  ) : (
    <HomePage />
  );
}
