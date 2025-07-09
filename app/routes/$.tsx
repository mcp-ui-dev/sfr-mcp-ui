import ChatPageServer from "../components/chatPage";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [];
  }
  const { url, storeName } = data;
  return [
    { title: `MCP UI Server for ${storeName}` },
    {
      name: "description",
      content: `MCP UI Server for ${storeName}`,
    },
  ];
};

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const storeName = url.searchParams.get("store");
  return { url: url.toString(), storeName };
};

export function HydrateFallback() {
  return <p>Skeleton rendered during SSR</p>; // (2)
}

export default function ContentPage({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  const { url } = loaderData;

  if (false) {
    return <ChatPageServer owner={null} repo={null} />;
  }

  return <div>test</div>;
}

function isChatPage({
  owner,
  repo,
  url,
}: {
  owner: string | null;
  repo: string | null;
  url: string;
}) {
  // is a valid repo
  const isValid = (owner && repo) || (!repo && owner == "docs");
  if (!isValid) {
    return false;
  }
  // is a chat page
  return owner != "chat" && repo != "chat" && url.endsWith("/chat");
}
