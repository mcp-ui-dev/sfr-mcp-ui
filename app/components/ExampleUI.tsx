import { useEffect, useMemo, useRef, useState } from "react";
import UIResourceFrame from "./UIResourceFrame";
import { presets } from "./presets";

export function ExampleUI({
  toolName,
  exampleUIs,
  preset,
}: {
  toolName: string;
  exampleUIs: string[];
  preset: string;
}) {
  const singleIframeRef = useRef<HTMLIFrameElement>(null);
  const customCss = useMemo(
    () => getCustomCss(exampleUIs, preset),
    [exampleUIs],
  );
  if (exampleUIs.length === 0) return null;
  if (exampleUIs.length === 1) {
    return (
      <div className="text-sm text-gray-600 pb-2">
        <UIResourceFrame
          iframeSrc={exampleUIs[0]}
          adjustFrameSize
          style={{ width: "100%" }}
          customCss={customCss[0]}
        />
      </div>
    );
  }
  const isMobile = useMediaQuery("(max-width: 768px)");
  const gridIframeStyle = isMobile ? { height: "300px" } : { height: "400px" };
  return (
    <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
      {exampleUIs.map((ui, index) => (
        <UIResourceFrame
          key={ui}
          iframeSrc={ui}
          style={gridIframeStyle}
          customCss={customCss[index]}
        />
      ))}
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
  }, [matches, query]);
  return matches;
}

function getCustomCss(exampleUIs: string[], preset: string) {
  return exampleUIs.map((ui) => {
    return presets[preset ?? "default"] ?? presets["default"];
  });
}
