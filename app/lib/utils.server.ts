import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpToolsResponse } from "./utils";

export async function checkMcpServer(domain: string): Promise<{
  success: boolean;
  tools?: McpToolsResponse["result"]["tools"];
  error?: string;
}> {
  try {
    // Ensure domain has proper protocol
    const storeDomain = domain.startsWith("http")
      ? domain
      : `https://${domain}`;

    const requestBody = {
      jsonrpc: "2.0",
      method: "tools/list",
      id: 1,
    };

    const result = await fetch(`${storeDomain}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!result.ok) {
      return {
        success: false,
        error: `Failed to connect to ${domain}. Please check the domain and try again.`,
      };
    }

    const json: McpToolsResponse = await result.json();
    const tools = json.result.tools;

    if (!tools || tools.length === 0) {
      return {
        success: false,
        error: `${domain} does not have an MCP server or has no available tools.`,
      };
    }

    return { success: true, tools };
  } catch (error) {
    return {
      success: false,
      error: `Unable to connect to ${domain}. Please verify the domain is correct and try again.`,
    };
  }
}

interface JsonRpcToolsCallResponse {
  jsonrpc: "2.0";
  id: number;
  result: CallToolResult;
}

export async function fetchToolResponse(
  storeDomain: string,
  toolName: string,
  params: any,
) {
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: toolName, arguments: params },
  };
  const result = await fetch(`https://${storeDomain}/api/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const json = (await result.json()) as JsonRpcToolsCallResponse;
  return json.result;
}

export async function getExampleUIs(
  storeDomain: string,
  tools: McpToolsResponse["result"]["tools"],
) {
  const exampleUIs: Record<string, string[]> = {};
  if (
    tools.length > 0 &&
    tools.some((tool) => tool.name === "search_shop_catalog")
  ) {
    const searchResult = await fetchToolResponse(
      storeDomain,
      "search_shop_catalog",
      {
        query: "cool",
        context: "the best products",
        limit: 6,
      },
    );
    const content = searchResult.content;
    if (content?.[0]?.type === "text") {
      const text = content[0].text;
      const products = JSON.parse(text).products;
      exampleUIs.search_shop_catalog = products
        .slice(0, 3)
        .map((product: { url: string; product_id: string }) => {
          const productName = product.url.split("/").pop();
          return `https://cdn.shopify.com/storefront/product.component?store_domain=${storeDomain}&product_handle=${productName}`;
        });

      exampleUIs.get_product_details = [
        `https://cdn.shopify.com/storefront/product-details.component?store_domain=${storeDomain}&inline=true&product_handle=${products[3].url.split("/").pop()}`,
      ];

      const cartParams = {
        shop_domain: storeDomain,
        add_items: [
          {
            product_variant_id: products[4].variants[0].variant_id,
            quantity: 1,
          },
          {
            product_variant_id: products[5].variants[0].variant_id,
            quantity: 1,
          },
        ],
      };
      const response = await fetchToolResponse(
        storeDomain,
        "update_cart",
        cartParams,
      );
      if (response.content?.[0]?.type === "text") {
        const cartId = JSON.parse(response.content[0].text).cart.id;
        exampleUIs.update_cart = [
          `https://cdn.shopify.com/storefront/global-cart.component?carts=${encodeURIComponent(
            JSON.stringify([
              {
                shop: storeDomain,
                cartId: cartId,
              },
            ]),
          )}`,
        ];
        exampleUIs.get_cart = [
          `https://cdn.shopify.com/storefront/global-cart.component?carts=${encodeURIComponent(
            JSON.stringify([
              {
                shop: storeDomain,
                cartId: cartId,
              },
            ]),
          )}`,
        ];
      }
    }
  }
  return exampleUIs;
}
