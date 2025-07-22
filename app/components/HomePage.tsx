import { Code, Globe, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";

export function HomePage() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetch("/api/checkstore", {
        method: "POST",
        body: JSON.stringify({ storeName: domain.trim() }),
      });
      const data = (await result.json()) as {
        success: boolean;
        tools: any[];
        error: string;
      };

      if (data.success) {
        // Redirect to the store page with the domain as query parameter
        window.location.href = `?store=${encodeURIComponent(domain.trim())}`;
      } else {
        setError(data.error || "Failed to validate MCP server");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              (Unofficial) Storefront MCP UI Server
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A generic Storefront MCP server that returns UI components for
              seamless commerce integration and dynamic store experiences.
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Get Started
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Enter any Shopify store domain to get the MCP server URL
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      id="domain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="shopify.supply"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-lg font-medium placeholder-gray-400"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 text-center">
                        {error}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !domain.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Validating...
                    </span>
                  ) : (
                    "Get MCP Server URL"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                UI Components
              </h3>
              <p className="text-gray-600">
                Pre-built, customizable components for any storefront
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast Integration
              </h3>
              <p className="text-gray-600">
                Quick integration in any client using mcp-ui
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Universal
              </h3>
              <p className="text-gray-600">Works with any Shopify store</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <a
                href="https://mcpui.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                mcp-ui
              </a>
              ,{" "}
              <a
                href="https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Storefront MCP Server
              </a>
              , and{" "}
              <a
                href="https://webcomponents.shopify.dev/playground"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Storefront Web Components
              </a>
              . This is not an official Shopify product.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
