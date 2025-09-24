const PRODUCT_SEARCH_RESULT_FILENAME = "product-summary";
const PRODUCT_DETAILS_FILENAME = "product";
const UNIVERSAL_CART_FILENAME = "universal-cart";

function getBaseUrl(proxyMode: boolean, originalUrl: URL) {
  if (proxyMode) {
    return `${originalUrl.protocol}//${originalUrl.host}/img`;
  }
  return "https://cdn.shopify.com";
}

function getPostfix(proxyMode: boolean) {
  if (proxyMode) {
    return "component.html";
  }
  return "component";
}

export function generateProductSummaryUrl({
  storeDomain,
  productId,
  productName,
  actionsMode,
  proxyMode,
  originalUrl,
}: {
  storeDomain: string;
  productId: string;
  productName?: string;
  actionsMode: ActionMode;
  proxyMode: boolean;
  originalUrl: URL;
}) {
  const baseUrl = getBaseUrl(proxyMode, originalUrl);
  const modeVariant = ["prompt", "tool"].includes(actionsMode)
    ? `&mode=${actionsMode}`
    : "";
  const postfix = getPostfix(proxyMode);
  return `${baseUrl}/storefront/${PRODUCT_SEARCH_RESULT_FILENAME}.${postfix}?store_domain=${storeDomain}&product_handle=${productName}&product_id=${productId}${modeVariant}`;
}

export function generateProductDetailsUrl({
  storeDomain,
  productName,
  actionsMode,
  llmDescription,
  proxyMode,
  originalUrl,
}: {
  storeDomain: string;
  productName?: string;
  actionsMode: ActionMode;
  llmDescription?: string;
  proxyMode: boolean;
  originalUrl: URL;
}) {
  const modeVariant = ["prompt", "tool"].includes(actionsMode)
    ? `&mode=${actionsMode}`
    : "";
  const llmDescriptionParam = llmDescription
    ? `&llm_description=${llmDescription}`
    : "";
  const baseUrl = getBaseUrl(proxyMode, originalUrl);
  const postfix = getPostfix(proxyMode);
  return `${baseUrl}/storefront/${PRODUCT_DETAILS_FILENAME}.${postfix}?store_domain=${storeDomain}&inline=true&product_handle=${productName}${llmDescriptionParam}${modeVariant}`;
}

export function generateUniversalCartUrl({
  storeDomain,
  cartId,
  actionsMode,
  proxyMode,
  originalUrl,
}: {
  storeDomain: string;
  cartId: string;
  actionsMode: ActionMode;
  proxyMode: boolean;
  originalUrl: URL;
}) {
  const modeVariant = ["prompt", "tool"].includes(actionsMode)
    ? `&mode=${actionsMode}`
    : "";
  const baseUrl = getBaseUrl(proxyMode, originalUrl);
  const postfix = getPostfix(proxyMode);
  return `${baseUrl}/storefront/${UNIVERSAL_CART_FILENAME}.${postfix}?carts=${encodeURIComponent(
    JSON.stringify([
      {
        shop: storeDomain,
        cartId: cartId,
      },
    ]),
  )}${modeVariant}`;
}

export function getActionMode(actionsMode?: string | null): ActionMode {
  if (!actionsMode) {
    return "default";
  }
  const lowerCaseActionsMode = actionsMode.toLowerCase();
  return ["prompt", "tool"].includes(lowerCaseActionsMode)
    ? (lowerCaseActionsMode as ActionMode)
    : "default";
}

export type ActionMode = "default" | "prompt" | "tool";

export function toStoreDomain(storeDomain: string | null): string | null {
  if (!storeDomain) {
    return null;
  }
  let storeDomainToCheck;
  if (!storeDomain.includes(".")) {
    storeDomainToCheck = `https://${storeDomain}.com`;
  } else if (storeDomain.startsWith("http")) {
    storeDomainToCheck = storeDomain;
  } else {
    storeDomainToCheck = `https://${storeDomain}`;
  }
  const hostname = new URL(storeDomainToCheck).hostname?.toLowerCase();
  if (hostname == "shopify.supply") {
    return "checkout.shopify.supply";
  }
  return hostname;
}
