import React, { useState } from "react";
import { UIResourceRenderer } from "@mcp-ui/client";

interface UIResourceFrameProps {
  iframeSrc: string;
  handleUiAction?: (message: FrameMessage) => Promise<unknown>;
  adjustFrameSize?: boolean;
  style?: React.CSSProperties;
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
  initialHeight?: number;
  initialWidth?: number;
}

const UIResourceFrame: React.FC<UIResourceFrameProps> = ({
  iframeSrc,
  handleUiAction,
  adjustFrameSize,
  style,
  initialHeight,
  iframeProps,
}) => {
  // convert to standard resource format
  const resource = React.useMemo(() => {
    return iframeSrcToResource(iframeSrc);
  }, [iframeSrc]);
  const [height, setHeight] = useState(initialHeight || 400);

  const onUiAction = React.useCallback(
    async (message: FrameMessage) => {
      if (!frameMessageTypes.includes(message.type)) {
        return;
      }

      console.log("--listener-iframe-message", message);

      if (message.type === "size-change" && adjustFrameSize) {
        setHeight(message.payload.height);
        return;
      } else {
        handleUiAction?.(message);
      }
    },
    [handleUiAction, adjustFrameSize],
  );

  return (
    <UIResourceRenderer
      htmlProps={{
        style: {
          height: `${height}px`,
          minHeight: 0,
          ...style,
        },
        iframeProps: iframeProps,
      }}
      onUIAction={onUiAction}
      resource={resource}
    />
  );
};

UIResourceFrame.displayName = "UIResourceFrame";

function iframeSrcToResource(iframeSrc: string) {
  return {
    // TODO: better uri generation
    uri: iframeSrc.replace(/https:|blob:/, "ui:"),
    mimeType: "text/uri-list",
    text: iframeSrc,
  };
}

export default UIResourceFrame;

import type { UIActionResult } from "@mcp-ui/client";

export const frameMessageTypes = ["tool", "size-change", "intent", "notify"];

type FrameMessageSizeChange = {
  type: "size-change";
  payload: {
    height: number;
    width: number;
  };
};

type FrameMessageNotify = {
  type: "notify";
  payload: {
    message: string;
    [key: string]: any;
  };
};

export type FrameMessage =
  | UIActionResult
  | FrameMessageSizeChange
  | FrameMessageNotify;
