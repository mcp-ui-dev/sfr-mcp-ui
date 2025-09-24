import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "./utils/logger";
import { addUIResourcesIfNeeded, removeUnneededFields } from "./ui";
import { JsonSchemaToZodRawSchema } from "./utils/schema";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getActionMode, toStoreDomain } from "./utils/ui-urls";

const DEFAULT_STORE_FOR_FETCHING_TOOLS_LIST = "allbirds.com";

export async function getToolsToRegister(requestUrlStr: string): Promise<
  {
    toolName: string;
    toolDescription: string;
    toolSchema: any;
    toolCallback: ToolCallback<any>;
  }[]
> {
  const requestUrl = new URL(requestUrlStr);

  let storeDomain: string | null = toStoreDomain(
    requestUrl.searchParams.get("store"),
  );
  let actionsMode: "default" | "prompt" | "tool" = "default";
  let proxyMode: boolean = false;

  if (requestUrl.searchParams.get("store_domain")) {
    storeDomain = toStoreDomain(requestUrl.searchParams.get("store_domain"));
    proxyMode = true;
    actionsMode = "prompt";
  }
  if (requestUrl.searchParams.get("storedomain")) {
    storeDomain = toStoreDomain(requestUrl.searchParams.get("storedomain"));
    proxyMode = true;
    actionsMode = "tool";
  }

  if (requestUrl.searchParams.get("mode")) {
    actionsMode = getActionMode(requestUrl.searchParams.get("mode"));
    proxyMode = actionsMode !== "default";
  }

  // hack for shopify.supply
  if (storeDomain == "shopify.supply") {
    storeDomain = "checkout.shopify.supply";
  }
  logger.debug("Extracted store domain parameter", {
    storeDomain,
    allParams: Array.from(requestUrl.searchParams.entries()),
  });

  let mcpEndpointForFetchingToolsList;

  if (!storeDomain) {
    mcpEndpointForFetchingToolsList = `https://${DEFAULT_STORE_FOR_FETCHING_TOOLS_LIST}/api/mcp`;
  } else {
    mcpEndpointForFetchingToolsList = `https://${storeDomain}/api/mcp`;
  }

  const toolsStartTime = Date.now();
  logger.debug("Starting tools list fetch", {
    mcpEndpointForFetchingToolsList,
    fetchStartTime: toolsStartTime,
  });

  const tools = await getToolsList(mcpEndpointForFetchingToolsList);
  const toolsFetchDuration = Date.now() - toolsStartTime;

  logger.info("Successfully fetched tools list", {
    toolsCount: tools.length,
    toolNames: tools.map((t) => t.name),
    fetchDuration: toolsFetchDuration,
  });

  if (proxyMode) {
    const getProductDetailsTool = tools.find(
      (t: Tool) => t.name === "get_product_details",
    );
    if (getProductDetailsTool) {
      getProductDetailsTool.inputSchema = {
        type: "object",
        properties: {
          product_id: {
            type: "string",
          },
        },
        required: ["product_id"],
      };
    }
  }

  const toolsToRegister = tools.map((tool, index) => {
    logger.debug("Registering tool", {
      toolIndex: index,
      toolName: tool.name,
      toolDescription: tool.description,
    });

    try {
      if (!storeDomain) {
        logger.debug(
          "Store domain is not provided, adding storeDomain as a required property",
          {
            toolName: tool.name,
          },
        );
        tool.inputSchema = tool.inputSchema || {
          type: "object",
          properties: {},
          required: [],
        };
        tool.inputSchema.required = [
          ...(tool.inputSchema.required || []),
          "storeDomain",
        ];
        tool.inputSchema.properties.storeDomain = {
          type: "string",
          description:
            "The domain of the store to use for the tool. You can call the verify_store_domain tool to verify the store domain.",
        };
      }

      const schema = JsonSchemaToZodRawSchema(tool.inputSchema);
      logger.debug("Converted JSON schema to Zod schema", {
        toolName: tool.name,
      });

      const callback: ToolCallback<typeof schema> = async (
        args: typeof schema,
      ) => {
        const toolCallStartTime = Date.now();

        logger.info("Tool call initiated", {
          toolName: tool.name,
          arguments: args,
          toolCallStartTime,
        });

        try {
          const requestBody = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: { name: tool.apiName ?? tool.name, arguments: args },
          };

          const storeDomainToUse =
            storeDomain ?? toStoreDomain(args.storeDomain as unknown as string);
          if (!storeDomainToUse) {
            logger.error("Store domain is not provided", {
              toolName: tool.name,
            });
            throw new Error("Store domain is required");
          }

          const toolCallMcpEndpoint = `https://${storeDomainToUse}/api/mcp`;

          logger.debug("Sending tool call request", {
            toolName: tool.name,
            mcpEndpoint: toolCallMcpEndpoint,
            requestBody,
          });

          const result = await fetch(toolCallMcpEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          const fetchDuration = Date.now() - toolCallStartTime;
          logger.debug("Received tool call response", {
            toolName: tool.name,
            status: result.status,
            statusText: result.statusText,
            headers: Object.fromEntries(result.headers.entries()),
            fetchDuration,
          });

          if (!result.ok) {
            logger.error("Tool call HTTP error", {
              toolName: tool.name,
              status: result.status,
              statusText: result.statusText,
              fetchDuration,
            });
            throw new Error(`HTTP ${result.status}: ${result.statusText}`);
          }

          const json = (await result.json()) as JsonRpcToolsCallResponse;
          let callToolResult = json.result;
          const totalDuration = Date.now() - toolCallStartTime;

          logger.info("Tool call completed successfully", {
            toolName: tool.name,
            result: callToolResult,
            totalDuration,
            responseId: json.id,
            jsonrpc: json.jsonrpc,
          });

          if (proxyMode) {
            try {
              callToolResult = removeUnneededFields(tool.name, callToolResult);
            } catch (error) {
              logger.error("Failed to remove unneeded fields", {
                toolName: tool.name,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          return addUIResourcesIfNeeded(
            storeDomainToUse,
            tool.name,
            callToolResult,
            proxyMode,
            requestUrl,
            actionsMode,
          );
        } catch (error) {
          const errorDuration = Date.now() - toolCallStartTime;
          logger.error("Tool call failed", {
            toolName: tool.name,
            error:
              error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                  }
                : error,
            errorDuration,
          });
          throw error;
        }
      };

      return {
        toolName: tool.name,
        toolDescription: tool.description,
        toolSchema: schema,
        toolCallback: callback,
      };
    } catch (error) {
      logger.error("Failed to register tool", {
        toolName: tool.name,
        toolIndex: index,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      throw error;
    }
  });

  // add verify_store_domain tool
  if (!storeDomain) {
    const schema = JsonSchemaToZodRawSchema({
      type: "object",
      properties: {
        storeDomain: { type: "string" },
      },
      required: ["storeDomain"],
    });
    toolsToRegister.push({
      toolName: "verify_store_domain",
      toolDescription:
        "Verify the store domain. You can call this tool to verify that a store domain is valid.",
      toolSchema: schema,
      toolCallback: async (args: typeof schema) => {
        const storeDomainToVerify = toStoreDomain(
          args.storeDomain as unknown as string,
        );
        const tools = await getToolsList(
          `https://${storeDomainToVerify}/api/mcp`,
        );
        return {
          content: [
            {
              type: "text",
              text:
                tools.length > 0
                  ? `Store domain is valid: ${storeDomainToVerify}`
                  : "Store domain is not valid",
            },
          ],
        };
      },
    });
  }

  return toolsToRegister;
}

async function getToolsList(mcpEndpoint: string): Promise<Tool[]> {
  const fetchStartTime = Date.now();

  logger.debug("Fetching tools list", {
    mcpEndpoint,
    fetchStartTime,
  });

  try {
    const requestBody = {
      jsonrpc: "2.0",
      method: "tools/list",
      id: 1,
    };

    logger.debug("Sending tools list request", {
      mcpEndpoint,
      requestBody,
    });

    const result = await fetch(mcpEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const fetchDuration = Date.now() - fetchStartTime;
    logger.debug("Received tools list response", {
      mcpEndpoint,
      status: result.status,
      statusText: result.statusText,
      headers: Object.fromEntries(result.headers.entries()),
      fetchDuration,
    });

    if (!result.ok) {
      logger.error("Tools list fetch HTTP error", {
        mcpEndpoint,
        status: result.status,
        statusText: result.statusText,
        fetchDuration,
      });
      throw new Error(`HTTP ${result.status}: ${result.statusText}`);
    }

    const json = (await result.json()) as JsonRpcToolsResponse;
    const tools = json.result.tools;
    const totalDuration = Date.now() - fetchStartTime;

    logger.info("Tools list fetched successfully", {
      mcpEndpoint,
      toolsCount: tools.length,
      toolNames: tools.map((t) => t.name),
      responseId: json.id,
      jsonrpc: json.jsonrpc,
      totalDuration,
    });

    return tools;
  } catch (error) {
    const errorDuration = Date.now() - fetchStartTime;
    logger.error("Tools list fetch failed", {
      mcpEndpoint,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      errorDuration,
    });
    return [];
  }
}

interface JsonRpcToolsResponse {
  jsonrpc: "2.0";
  id: number;
  result: {
    tools: Tool[];
  };
}

interface JsonRpcToolsCallResponse {
  jsonrpc: "2.0";
  id: number;
  result: CallToolResult;
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  apiName?: string;
}
