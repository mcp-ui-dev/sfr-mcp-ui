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
  return { url: url.toString() };
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

  return <div>test</div>;
}
