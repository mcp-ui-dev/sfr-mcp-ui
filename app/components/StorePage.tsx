import { Badge } from "~/chat/components/ui/badge";
import { Button } from "~/chat/components/ui/button";
import { Separator } from "~/chat/components/ui/separator";
import {
  Copy,
  Check,
  Zap,
  Settings,
  ShoppingCart,
  Search,
  HelpCircle,
  Eye,
  Package,
  Info,
} from "lucide-react";
import { useState } from "react";
import type { McpToolsResponse } from "~/lib/utils";
import { TooltipProvider } from "~/chat/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { truncateToTwoSentences } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { ExampleUI } from "./ExampleUI";

interface Tool {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const toolNameToIcon = {
  search_shop_catalog: <Search className="h-4 w-4" />,
  update_cart: <ShoppingCart className="h-4 w-4" />,
  get_product_details: <Package className="h-4 w-4" />,
  get_cart: <ShoppingCart className="h-4 w-4" />,
  search_shop_policies_and_faqs: <HelpCircle className="h-4 w-4" />,
  default: <Info className="h-4 w-4" />,
};

interface TruncatedDescriptionProps {
  description: string;
  className?: string;
}

function TruncatedDescription({
  description,
  className = "",
}: TruncatedDescriptionProps) {
  const { truncated, wasTruncated } = truncateToTwoSentences(description);

  if (!wasTruncated) {
    return <p className={className}>{description}</p>;
  }

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <p
          className={`${className} cursor-help hover:text-gray-800 transition-colors`}
        >
          {truncated}
        </p>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="bottom"
          sideOffset={5}
          className={cn(
            "z-50 overflow-hidden rounded-md bg-gray-600 px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "max-w-sm",
          )}
        >
          <div className="p-2">
            <p className="text-sm leading-relaxed">{description}</p>
          </div>
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export function StorePage({
  url,
  storeName,
  tools,
  exampleUIs,
}: {
  url: string;
  storeName: string;
  tools: McpToolsResponse["result"]["tools"];
  exampleUIs: Record<string, string[]>;
}) {
  const storeNameToUse =
    storeName == "checkout.shopify.supply" ? "shopify.supply" : storeName;
  const [copied, setCopied] = useState(false);
  const toolsWithUI = [
    "search_shop_catalog",
    "get_product_details",
    "update_cart",
    "get_cart",
  ]
    .map((toolName) => tools.find((tool) => tool.name === toolName))
    .filter(Boolean) as Tool[];
  const toolsWithoutUI = tools.filter(
    (tool) =>
      ![
        "search_shop_catalog",
        "get_product_details",
        "update_cart",
        "get_cart",
      ].includes(tool.name),
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12 max-w-[920px]">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              (Unofficial) Storefront MCP UI Server
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              This is the MCP server URL for the{" "}
              <strong>
                <a
                  href={`https://${storeNameToUse}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {storeNameToUse}
                </a>
              </strong>{" "}
              Storefront MCP - which contains interactive UI components for
              enhanced shopping experiences.
            </p>
          </div>

          {/* MCP URL div */}
          <div className="p-8 mb-12 bg-white/80 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                MCP Server URL (Streamable HTTP and SSE)
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 mb-4">
                <code className="text-lg font-mono text-blue-600 break-all">
                  {url}
                </code>
              </div>
              <Button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tools Section */}
          <div className="grid md:grid-cols-1 gap-8 mb-12">
            {/* Tools with UI */}
            <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-green-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Tools with UI Support
                </h3>
              </div>
              <p className="text-gray-600 mb-2 text-sm">
                These tools provide interactive user interfaces for enhanced
                user experience.
              </p>
              <p className="text-gray-600 mb-4 text-sm">
                <strong>Note:</strong> When a UI resource emits a message, it
                will show a toast. These messages are intended to be caught by
                the agent.
              </p>
              <div className="space-y-3">
                {toolsWithUI.map((tool, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                  >
                    <div className="text-green-600 mt-0.5">
                      {toolNameToIcon[tool.name as keyof typeof toolNameToIcon]}
                    </div>
                    <div className="flex flex-col w-full">
                      <Badge
                        variant="outline"
                        className="text-green-700 border-green-300 mb-1"
                      >
                        {tool.name}
                      </Badge>
                      <TruncatedDescription
                        description={tool.description || ""}
                        className="text-sm text-gray-600 pb-2"
                      />
                      {exampleUIs[tool.name] && (
                        <ExampleUI
                          toolName={tool.name}
                          exampleUIs={exampleUIs[tool.name]}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools without UI */}
            <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 p-2 rounded-full mr-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Tools without UI Support (yet)
                </h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                These tools provide data and functionality through text-based
                responses.
              </p>
              <div className="space-y-3">
                {toolsWithoutUI.map((tool, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg"
                  >
                    <div className="text-orange-600 mt-0.5">
                      {toolNameToIcon[tool.name as keyof typeof toolNameToIcon]}
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="text-orange-700 border-orange-300 mb-1"
                      >
                        {tool.name}
                      </Badge>
                      <TruncatedDescription
                        description={tool.description || ""}
                        className="text-sm text-gray-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Separator className="mb-6" />
            <p className="text-gray-500 text-sm mb-4">
              Connect your MCP client to this URL to start using the{" "}
              <a
                href={`https://${storeNameToUse}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {storeNameToUse}
              </a>{" "}
              Storefront MCP tools.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-purple-800">
                💡 <strong>Consume in the client using mcp-ui</strong> -
                <a
                  href="https://mcpui.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 hover:underline font-medium ml-1"
                >
                  mcpui.dev
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
