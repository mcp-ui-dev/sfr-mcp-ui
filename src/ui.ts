import { createUIResource } from "@mcp-ui/server";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function addUIResourcesIfNeeded(
  storeDomain: string,
  toolName: string,
  result: CallToolResult,
) {
  const content = result.content;
  if (content?.[0]?.type !== "text") {
    return result;
  }
  const text = content[0].text;
  switch (toolName) {
    case "search_shop_catalog":
      const products = JSON.parse(text).products;
      const newHtmlResourcesItems = products.map(
        (product: { url: string; product_id: string }) => {
          const productName = product.url.split("/").pop();
          return createUIResource({
            uri: `ui://product/${product.product_id}`,
            content: {
              type: "externalUrl",
              iframeUrl: `https://cdn.shopify.com/storefront/product.component?store_domain=${storeDomain}&product_handle=${productName}`,
            },
            delivery: "text",
          });
        },
      );
      content.push(...newHtmlResourcesItems);
      break;

    case "get_product_details":
      const product = JSON.parse(text).product;
      const productName = product.url.split("/").pop();

      content.push(
        createUIResource({
          uri: `ui://product/${product.product_id}`,
          content: {
            type: "externalUrl",
            iframeUrl: `https://cdn.shopify.com/storefront/product-details.component?store_domain=${storeDomain}&inline=true&product_handle=${productName}`,
          },
          delivery: "text",
        }),
      );

      break;

    case "get_cart":
    case "update_cart":
      const cartId = JSON.parse(text).cart.id;

      content.push(
        createUIResource({
          uri: `ui://cart/${cartId}`,
          content: {
            type: "externalUrl",
            iframeUrl: `https://cdn.shopify.com/storefront/global-cart.component?carts=${encodeURIComponent(
              JSON.stringify([
                {
                  shop: storeDomain,
                  cartId: cartId,
                },
              ]),
            )}`,
          },
          delivery: "text",
        }),
      );

      break;
  }

  return { ...result, content };
}
