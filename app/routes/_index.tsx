import { StorePage } from "~/components/StorePage";
import { checkMcpServer, getExampleUIs } from "~/lib/utils.server";
import type { McpToolsResponse } from "~/lib/utils";
import { HomePage } from "~/components/HomePage";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const storeName = url.searchParams.get("store");
  let tools: McpToolsResponse["result"]["tools"] = [];
  let exampleUIs: Record<string, any> = {};
  if (storeName) {
    // get tool list
    const result = await checkMcpServer(storeName);
    if (result.success) {
      tools = result.tools || [];
      exampleUIs = await getExampleUIs(storeName, tools);
    }
  }
  return { url: url.toString(), storeName, tools, exampleUIs };
};

export default function Home({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  const { storeName, url, tools, exampleUIs } = loaderData;
  return storeName ? (
    <StorePage
      url={url}
      storeName={storeName}
      tools={tools}
      exampleUIs={exampleUIs}
    />
  ) : (
    <HomePage />
  );
}
