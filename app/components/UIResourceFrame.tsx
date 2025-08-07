import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { UIResourceRenderer } from "@mcp-ui/client";

interface UIResourceFrameProps {
  iframeSrc: string;
  handleUiAction?: (message: FrameMessage) => Promise<unknown>;
  adjustFrameSize?: boolean;
  style?: React.CSSProperties;
  frameProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
  initialHeight?: number;
  initialWidth?: number;
  customCss?: string;
}

const UIResourceFrame: React.FC<UIResourceFrameProps> = ({
  iframeSrc,
  handleUiAction,
  adjustFrameSize,
  style,
  initialHeight,
  frameProps,
  customCss,
}) => {
  // convert to standard resource format
  const resource = React.useMemo(() => {
    const iframeUrl = new URL(iframeSrc);
    if (customCss) {
      iframeUrl.searchParams.set("waitForRenderData", "true");
    }
    return iframeSrcToResource(iframeUrl.toString());
  }, [iframeSrc]);
  const [height, setHeight] = useState(initialHeight || 400);
  const [messageDetails, setMessageDetails] = useState<string | undefined>(
    undefined,
  );
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mountIframe, setMountIframe] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeProps = useMemo(() => {
    return { ...frameProps, ref: iframeRef as RefObject<HTMLIFrameElement> };
  }, [frameProps]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: InternalMessageType.UI_LIFECYCLE_FRAME_RENDER_DATA,
        payload: {
          renderData: { customCss },
        },
      },
      "*",
    );
  }, [customCss]);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (
        event?.data?.type === InternalMessageType.UI_LIFECYCLE_FRAME_READY &&
        event.source === iframeRef.current?.contentWindow &&
        customCss
      ) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: InternalMessageType.UI_LIFECYCLE_FRAME_RENDER_DATA,
            payload: {
              renderData: { customCss },
            },
          },
          "*",
        );
      }
    };
    window.addEventListener("message", messageHandler);
    setMountIframe(true);
    return () => window.removeEventListener("message", messageHandler);
  }, [customCss]);

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

      // if (message.type === "ui-size-change" && adjustFrameSize) {
      //   setHeight(message.payload.height);
      //   return;
      // } else {
      //   handleUiAction?.(message);
      // }
    },
    [handleUiAction, adjustFrameSize, customCss],
  );

  return (
    <div className="relative">
      <Toast show={showToast} message={messageDetails} />
      {mountIframe && (
        <UIResourceRenderer
          htmlProps={{
            style: {
              height: `${height}px`,
              minHeight: 0,
              ...style,
            },
            autoResizeIframe: adjustFrameSize,
            iframeProps: iframeProps,
          }}
          onUIAction={onUiAction}
          resource={resource}
        />
      )}
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

export const frameMessageTypes = [
  "tool",
  "ui-size-change",
  "intent",
  "notify",
  "prompt",
];

type FrameMessageSizeChange = {
  type: "ui-size-change";
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
    case "prompt": {
      let { prompt } = frameMessage.payload;
      return `prompt: ${prompt.replace("gid://shopify/ProductVariant/", "").replace(/Checkout using url .*?$/, "Checkout using url <checkout-url>")}`;
    }
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

const InternalMessageType = {
  UI_LIFECYCLE_FRAME_READY: "ui-lifecycle-iframe-ready",
  UI_LIFECYCLE_FRAME_RENDER_DATA: "ui-lifecycle-iframe-render-data",
} as const;

const ReservedUrlParams = {
  WAIT_FOR_RENDER_DATA: "waitForRenderData",
} as const;
