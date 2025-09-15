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
    delete product?.selectedOrFirstAvailableVariant?.image_url;
    content[0].text = JSON.stringify({ product });
    return { ...result, content };
  }
  if (
    (toolName = "search_shop_catalog") ||
    toolName === "search_shop_catalog_txt"
  ) {
    const obj = JSON.parse(text);
    const products = obj.products;
    products.forEach(
      (product: {
        image_url?: string;
        url?: string;
        description?: string;
        tags?: string[];
        variants?: any[];
      }) => {
        delete product.image_url;
        delete product.description;
        delete product.tags;
        if (product.variants) {
          product.variants = product.variants.map((variant: any) => {
            delete variant.image_url;
            return variant;
          });
        }
      },
    );
    content[0].text = JSON.stringify({ ...obj, products });
    return { ...result, content };
  }
  return result;
}

export function addUIResourcesIfNeeded(
  storeDomain: string,
  toolName: string,
  result: CallToolResult,
  baseUrl: string,
  mode: "default" | "prompt" | "tool",
) {
  console.log("result", result);
  const content = result?.content ?? [];
  if (content?.[0]?.type !== "text") {
    return result;
  }
  const postfix = baseUrl.includes("cdn.shopify.com")
    ? "component"
    : "component.html";
  const modeVariant = ["prompt", "tool"].includes(mode) ? `&mode=${mode}` : "";
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
              iframeUrl: `${baseUrl}/storefront/product-summary.${postfix}?store_domain=${storeDomain}&product_handle=${productName}&product_id=${product.product_id}${modeVariant}`,
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
            iframeUrl: `${baseUrl}/storefront/product.${postfix}?store_domain=${storeDomain}&inline=true&product_handle=${productName}${modeVariant}`,
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
            )}${modeVariant}`,
          },
          delivery: "text",
        }),
      );

      break;
  }

  return { ...result, content };
}
