import "./globals.css";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/img/blue.png" />
        <title>MCP UI Server for Storefronts</title>
        <meta name="description" content="MCP UI Server for any Storefront" />

        <meta property="og:url" content="https://mcpstorefront.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MCP UI Server for Storefronts" />
        <meta
          property="og:description"
          content="MCP UI Server for any Storefront"
        />
        <meta
          property="og:image"
          content="https://mcpstorefront.com/img/Image.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="mcpstorefront.com" />
        <meta property="twitter:url" content="https://mcpstorefront.com/" />
        <meta name="twitter:title" content="MCP UI Server for Storefronts" />
        <meta
          name="twitter:description"
          content="MCP UI Server for any Storefront"
        />
        <meta
          name="twitter:image"
          content="https://mcpstorefront.com/img/Image.png"
        />
        {/* All `meta` exports on all routes will render here */}
        <Meta />

        {/* All `link` exports on all routes will render here */}
        <Links />
      </head>
      <body className="font-sans antialiased">
        {/* Child routes render here */}
        <Outlet />

        {/* Manages scroll position for client-side transitions */}
        {/* If you use a nonce-based content security policy for scripts, you must provide the `nonce` prop. Otherwise, omit the nonce prop as shown here. */}
        <ScrollRestoration />

        {/* Script tags go here */}
        {/* If you use a nonce-based content security policy for scripts, you must provide the `nonce` prop. Otherwise, omit the nonce prop as shown here. */}
        <Scripts />
      </body>
    </html>
  );
}
