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
  baseUrl: string,
) {
  const exampleUIs: Record<string, string[]> = {};
  if (
    tools.length > 0 &&
    tools.some((tool) => tool.name === "search_shop_catalog")
  ) {
    const rawProducts = await fetchProductWithRetry(storeDomain, 6, 3);
    if (rawProducts.length > 0) {
      const products = fillMissingProducts(rawProducts);
      exampleUIs.search_shop_catalog = products
        .slice(0, 3)
        .map((product: { url: string; product_id: string }) => {
          const productName = product.url.split("/").pop();
          return `${baseUrl}/storefront/product.component?store_domain=${storeDomain}&product_handle=${productName}`;
        });

      const llmDescription = `This is an awesome product, which fits your needs exactly. It has great reviews, made from the best materials, and is guaranteed to be exactly what you need. A great choice!`;
      exampleUIs.get_product_details = [
        `${baseUrl}/storefront/product-details.component?store_domain=${storeDomain}&inline=true&product_handle=${products[3].url.split("/").pop()}&llm_description=${btoa(llmDescription)}`,
      ];

      const availableVariants = chooseAvailableVariants(products);
      const cartParams = {
        shop_domain: storeDomain,
        add_items: availableVariants.map((variant) => ({
          product_variant_id: variant.variant_id,
          quantity: 1,
        })),
      };
      const response = await fetchToolResponse(
        storeDomain,
        "update_cart",
        cartParams,
      );
      if (response.content?.[0]?.type === "text") {
        const cartId = JSON.parse(response.content[0].text).cart.id;
        exampleUIs.update_cart = [
          `${baseUrl}/storefront/global-cart.component?carts=${encodeURIComponent(
            JSON.stringify([
              {
                shop: storeDomain,
                cartId: cartId,
              },
            ]),
          )}`,
        ];
        exampleUIs.get_cart = [
          `${baseUrl}/storefront/global-cart.component?carts=${encodeURIComponent(
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

const tryQueriesAndContexts = [
  {
    query: "cool",
    context: "the best products",
  },
  {
    query: "best",
    context: "the best products",
  },
  {
    query: "cheap",
    context: "the cheapest products",
  },
  {
    query: "new",
    context: "the newest products",
  },
  {
    query: "popular",
    context: "the most popular products",
  },
];

async function fetchProductWithRetry(
  storeDomain: string,
  limit: number,
  maxRetries: number = 3,
) {
  const retries = Math.min(maxRetries, tryQueriesAndContexts.length);
  let products: any[] = [];
  for (let i = 0; i < retries; i++) {
    const result = await fetchProducts(
      storeDomain,
      tryQueriesAndContexts[i].query,
      tryQueriesAndContexts[i].context,
      limit,
    );
    products = [...products, ...result];
    const urlSet = new Set();
    products = products.filter((p) => {
      if (urlSet.has(p.url)) {
        return false;
      }
      urlSet.add(p.url);
      return true;
    });
    if (products.length >= 3) {
      return products;
    }
  }
  return [];
}

async function fetchProducts(
  storeDomain: string,
  query: string,
  context: string,
  limit: number,
) {
  const searchResult = await fetchToolResponse(
    storeDomain,
    "search_shop_catalog",
    {
      query,
      context,
      limit,
    },
  );
  const content = searchResult.content;
  if (content?.[0]?.type === "text") {
    const text = content[0].text;
    const products = JSON.parse(text).products;
    return products;
  }
  return [];
}

function fillMissingProducts(products: any[]) {
  return [
    products.at(0),
    products.at(1),
    products.at(2) ?? products.at(0),
    products.at(3) ?? products.at(1),
    products.at(-1),
    products.at(-2),
  ];
}

function chooseAvailableVariants(products: any[]) {
  const variants: {
    variant_id: string;
  }[] = [];
  for (let i = products.length - 1; i >= 0; i--) {
    if (products[i].variants) {
      const variant = products[i].variants.find(
        (variant: any) => variant.available,
      );
      if (
        variant &&
        !variants.some((v: any) => v.variant_id === variant.variant_id)
      ) {
        variants.push(variant);
      }
    }
  }
  return variants.slice(0, 2);
}
