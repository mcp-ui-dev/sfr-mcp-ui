import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates text to the first two sentences
 * @param text - The text to truncate
 * @returns Object with truncated text and whether it was truncated
 */
export function truncateToTwoSentences(text: string): {
  truncated: string;
  wasTruncated: boolean;
} {
  if (!text) return { truncated: "", wasTruncated: false };

  // Split by sentence-ending punctuation (., !, ?) followed by whitespace or end of string
  const sentences = text.split(/[.!?]+\s+/).filter((s) => s.trim().length > 0);

  if (sentences.length <= 2) {
    return { truncated: text, wasTruncated: false };
  }

  // Take first two sentences and add back the punctuation
  const firstTwo = sentences.slice(0, 2);
  const truncated = firstTwo.join(". ").trim();

  // Add appropriate punctuation if not already present
  const lastChar = truncated.slice(-1);
  const needsPunctuation = ![".", "!", "?"].includes(lastChar);

  return {
    truncated: `${truncated}...`,
    wasTruncated: true,
  };
}

export interface McpToolsResponse {
  result: {
    tools: Array<{
      name: string;
      description?: string;
      inputSchema?: any;
    }>;
  };
}
