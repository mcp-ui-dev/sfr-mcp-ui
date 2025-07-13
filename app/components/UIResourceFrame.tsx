import React, { useRef, useState } from "react";
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
  const [messageDetails, setMessageDetails] = useState<string | undefined>(
    undefined,
  );
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onUiAction = React.useCallback(
    async (message: FrameMessage) => {
      if (!frameMessageTypes.includes(message.type)) {
        return;
      }

      const toastMessage = frameMessageToToastMessage(message);
      if (toastMessage) {
        setMessageDetails(toastMessage);
        setShowToast(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setShowToast(false);
        }, 1000);
      }

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
    <div className="relative">
      <Toast show={showToast} message={messageDetails} />
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
    </div>
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
import { Toast } from "./Toast";

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

function frameMessageToToastMessage(
  frameMessage: FrameMessage,
): string | undefined {
  switch (frameMessage.type) {
    case "notify": {
      let { message, ...payload } = frameMessage.payload;
      return `notify: ${message}${getPayloadKeysOnly(payload)}`;
    }
    case "tool": {
      let { toolName, ...payload } = frameMessage.payload;
      return `tool: ${toolName}${getPayloadKeysOnly(payload)}`;
    }
    case "intent": {
      let { intent, ...payload } = frameMessage.payload;
      return `intent: ${intent}${getPayloadKeysOnly(payload)}`;
    }
    // case "size-change":
    //   return `size-change: ${
    //     message.payload.height ? `height: ${message.payload.height}` : ""
    //   } ${message.payload.width ? `width: ${message.payload.width}` : ""}`;
    default:
      return undefined;
  }
}

function getPayloadKeysOnly(payload: Record<string, any>): string {
  if (Object.keys(payload).length === 0) {
    return "";
  }
  return `, { ${Object.keys(payload)
    .map((key) => {
      if (key === "params") {
        return Object.keys(payload.params)
          .filter((key) => key !== "domain")
          .join(", ");
      } else {
        return key;
      }
    })
    .filter(Boolean)
    .join(", ")} }`;
}
