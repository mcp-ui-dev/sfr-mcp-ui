export const presets: Record<string, any> = {
  default: `body {
    box-sizing: border-box;
  }`,
  copilot: `
      shopify-universal-cart {
  --shopify-universal-cart-text-color-base: rgba(39, 35, 32, 1);
  --shopify-universal-cart-text-color-subdued: rgba(0, 0, 0, 0.56);
  --shopify-universal-cart-border-color-base: rgba(235, 233, 231, 1);
  --shopify-universal-cart-border-radius-base: 10px;
  --shopify-universal-cart-border-radius-small: 6px;
  }
  
  shopify-universal-cart::part(cart-group) {
  background: linear-gradient(180deg, #fefdfd 0%, #fffbf8 100%);
  }
  
  shopify-universal-cart::part(primary-button) {
  --shopify-universal-cart-text-color-base: rgba(139, 75, 1, 1);
  --shopify-universal-cart-text-color-subdued: rgba(139, 75, 1, 0.8);
  background: rgba(252, 251, 250, 1);
  }
  
  shopify-universal-cart::part(primary-button):hover {
  background: rgba(251, 226, 207, 1);
  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 1px rgba(202, 125, 52, 1) inset;
  }
  
  shopify-universal-cart::part(secondary-button) {
  color: inherit;
  background: rgba(252, 251, 250, 1);
  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 0.5px 0.5px 0.5px rgba(255, 255, 255, 1) inset;
  }
  
  shopify-universal-cart::part(line-summary-quantity) {
  color: inherit;
  border-color: #fefdfd;
  }
  
  shopify-universal-cart::part(shop-logo),
  shopify-universal-cart::part(line-summary-quantity) {
  background: linear-gradient(
    180deg,
    #fefdfd 0%,
    rgba(251, 226, 207, 1) 100%
  );
  }



  .product-layout, .product-card {
  background: linear-gradient(180deg, #fefdfd 0%, #fffbf8 100%);
  }
  .add-to-cart, .buy-now-button, .action-btn.buy-now, .action-btn.quick-add, shopify-variant-selector::part(radio) {
  color: rgba(139, 75, 1, 1) !important;
  background: rgba(252, 251, 250, 1) !important;
    box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 0.5px 0.5px 0.5px rgba(255, 255, 255, 1) inset;
  }
  
  .add-to-cart:hover, .buy-now-button:hover, .action-btn.buy-now:hover, .action-btn.quick-add:hover, shopify-variant-selector::part(radio):hover, shopify-variant-selector::part(radio-selected){
  background: rgba(251, 226, 207, 1) !important;
  box-shadow:
    0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 1px rgba(202, 125, 52, 1) inset;
    border-color: transparent !important;
  }

      `,
};
