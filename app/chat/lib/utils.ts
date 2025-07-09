import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRepoData(url: string): {
  owner: string | null;
  repo: string | null;
} {
  return {
    owner: null,
    repo: null,
  };
}
