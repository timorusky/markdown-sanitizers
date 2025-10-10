"use client";

import { ComponentType, ComponentProps } from "react";
import type { Options } from "react-markdown";
import { defaultUrlTransform } from "react-markdown";
import { harden } from "rehype-harden";

interface HardenReactMarkdownOptions {
  defaultOrigin?: string;
  allowedLinkPrefixes?: string[];
  allowedImagePrefixes?: string[];
  allowDataImages?: boolean;
}

export default function hardenReactMarkdown(
  MarkdownComponent: ComponentType<Options>,
): ComponentType<Options & HardenReactMarkdownOptions> {
  return function HardenedReactMarkdown({
    defaultOrigin,
    allowedLinkPrefixes,
    allowedImagePrefixes,
    allowDataImages,
    rehypePlugins,
    urlTransform,
    ...props
  }: Options & HardenReactMarkdownOptions) {
    // Create a custom URL transform that allows data:image/ URLs when allowDataImages is true
    const customUrlTransform = (url: string, key: string, node: any) => {
      // If allowDataImages is enabled and this is an image with a data:image/ URL, allow it
      if (allowDataImages && key === "src" && url.startsWith("data:image/")) {
        return url;
      }
      // Otherwise, use the provided urlTransform or default
      return urlTransform ? urlTransform(url, key, node) : defaultUrlTransform(url);
    };

    return (
      <MarkdownComponent
        {...props}
        urlTransform={customUrlTransform}
        rehypePlugins={[
          [
            harden,
            { defaultOrigin, allowedLinkPrefixes, allowedImagePrefixes, allowDataImages },
          ],
          ...(rehypePlugins ?? []),
        ]}
      />
    );
  };
}
