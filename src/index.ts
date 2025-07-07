import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "./utils/logger";
import { getToolsToRegister } from "./tools";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "SFR MCP",
    version: "1.0.0",
  });

  async init() {
    const initStartTime = Date.now();

    logger.info("Starting MCP server initialization", {
      serverName: "SFR MCP",
      version: "1.0.0",
      initStartTime,
    });

    try {
      const toolRegistrationStartTime = Date.now();
      const tools = await getToolsToRegister(this.props.requestUrl as string);
      tools.forEach((tool) => {
        this.server.tool(
          tool.toolName,
          tool.toolDescription,
          tool.toolSchema,
          tool.toolCallback
        );
      });

      const totalToolRegistrationDuration =
        Date.now() - toolRegistrationStartTime;
      const totalInitDuration = Date.now() - initStartTime;

      logger.info("MCP server initialization completed", {
        totalToolsFound: tools.length,
        toolRegistrationDuration: totalToolRegistrationDuration,
        totalInitDuration,
      });
    } catch (error) {
      const initDuration = Date.now() - initStartTime;
      logger.error("MCP server initialization failed", {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        initDuration,
      });
      throw error;
    }
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const requestStartTime = Date.now();

    logger.info("Incoming request", {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent: request.headers.get("User-Agent"),
      requestStartTime,
    });

    try {
      const url = new URL(request.url);
      logger.debug("Parsed request URL", {
        pathname: url.pathname,
        search: url.search,
        searchParams: Array.from(url.searchParams.entries()),
      });

      ctx.props.requestUrl = request.url;

      if (url.pathname === "/sse" || url.pathname === "/sse/message") {
        logger.info("Routing to SSE endpoint", {
          pathname: url.pathname,
          route: "SSE",
        });

        const response = MyMCP.serveSSE("/sse").fetch(request, env, ctx);

        logger.debug("SSE response created", {
          duration: Date.now() - requestStartTime,
        });

        return response;
      }

      if (url.pathname === "/mcp") {
        logger.info("Routing to MCP endpoint", {
          pathname: url.pathname,
          route: "MCP",
        });

        const response = MyMCP.serve("/mcp").fetch(request, env, ctx);

        logger.debug("MCP response created", {
          duration: Date.now() - requestStartTime,
        });

        return response;
      }

      logger.warn("No matching route found", {
        pathname: url.pathname,
        availableRoutes: ["/sse", "/sse/message", "/mcp"],
        duration: Date.now() - requestStartTime,
      });

      return new Response("Not found", { status: 404 });
    } catch (error) {
      const requestDuration = Date.now() - requestStartTime;
      logger.error("Request processing failed", {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        requestDuration,
      });

      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
