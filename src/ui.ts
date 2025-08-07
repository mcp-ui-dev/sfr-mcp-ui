import { createUIResource } from "@mcp-ui/server";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function removeUnneededFields(toolName: string, result: CallToolResult) {
  const content = result?.content ?? [];
  if (content?.[0]?.type !== "text") {
    return result;
  }
  const text = content[0].text;
  if (toolName === "get_product_details") {
    const product = JSON.parse(text).product;
    delete product.images;
    delete product.options;
    delete product.image_url;
    content[0].text = JSON.stringify({ product });
    return { ...result, content };
  }
  return result;
}

export function addUIResourcesIfNeeded(
  storeDomain: string,
  toolName: string,
  result: CallToolResult,
  baseUrl: string,
) {
  console.log("result", result);
  const content = result?.content ?? [];
  if (content?.[0]?.type !== "text") {
    return result;
  }
  const postfix = baseUrl.includes("cdn.shopify.com")
    ? "component"
    : "component.html";
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
              iframeUrl: `${baseUrl}/storefront/product.${postfix}?store_domain=${storeDomain}&product_handle=${productName}`,
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
            iframeUrl: `${baseUrl}/storefront/product-details.${postfix}?store_domain=${storeDomain}&inline=true&product_handle=${productName}`,
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
            iframeUrl: `${baseUrl}/storefront/universal-cart.${postfix}?carts=${encodeURIComponent(
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
