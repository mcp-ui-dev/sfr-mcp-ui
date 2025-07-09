import { useRef } from "react";
import UIResourceFrame from "./UIResourceFrame";

export function ExampleUI({
  toolName,
  exampleUIs,
}: {
  toolName: string;
  exampleUIs: string[];
}) {
  const singleIframeRef = useRef<HTMLIFrameElement>(null);
  if (exampleUIs.length === 0) return null;
  if (exampleUIs.length === 1) {
    return (
      <div className="text-sm text-gray-600 pb-2">
        <UIResourceFrame
          iframeSrc={exampleUIs[0]}
          adjustFrameSize
          style={{ width: "100%" }}
        />
      </div>
    );
  }
  return (
    <div className="text-sm text-gray-600 grid grid-cols-3 gap-4 pb-2">
      {exampleUIs.map((ui) => (
        <UIResourceFrame iframeSrc={ui} />
      ))}
    </div>
  );
}
