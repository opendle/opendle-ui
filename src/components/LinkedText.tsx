import type { ReactNode } from "react";

import { textParts } from "./textParts.js";

export interface LinkedTextProps {
  readonly text: string;
  readonly className?: string;
}

/** A text in which each web address is a link that opens in a new tab. */
export function LinkedText({ className, text }: LinkedTextProps): ReactNode {
  return textParts(text).map((part, index) =>
    part.href === undefined ? (
      part.text
    ) : (
      <a
        className={className}
        href={part.href}
        // react-doctor-disable-next-line react-doctor/no-array-index-key -- The parts of one text have no identity and no state.
        key={`${String(index)}:${part.href}`}
        rel="noreferrer"
        target="_blank"
      >
        {part.text}
      </a>
    ),
  );
}
