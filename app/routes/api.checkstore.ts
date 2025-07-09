import { checkMcpServer } from "~/lib/utils.server";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as { storeName: string };
    const { storeName } = body;

    if (!storeName) {
      return Response.json(
        { error: "Store name is required" },
        { status: 400 },
      );
    }

    const result = await checkMcpServer(storeName);

    return Response.json({
      success: result.success,
      tools: result.tools || [],
      error: result.error || null,
    });
  } catch (error) {
    console.error("Error checking store:", error);
    return Response.json(
      {
        success: false,
        tools: [],
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
