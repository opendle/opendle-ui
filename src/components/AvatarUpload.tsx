import { useCallback, useRef, useState, type ChangeEvent } from "react";

import { Avatar } from "./Avatar.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { InlineAlert } from "./InlineAlert.js";
import { Icon } from "./Icon.js";
import {
  avatarUploadLabels,
  type AvatarUploadLabels,
} from "./identityLabels.js";
import { Section } from "./Section.js";
import { squarePicture } from "./squarePicture.js";

export interface AvatarUploadProps {
  readonly name: string;
  readonly src: string | null;
  /** Receives a square picture of at most `pixels` on each side. */
  readonly onUpload: (picture: Blob) => Promise<void>;
  readonly onRemove: () => Promise<void>;
  readonly errorMessage: (error: unknown) => string;
  readonly pixels?: number;
  readonly disabled?: boolean;
  readonly labels?: AvatarUploadLabels;
}

/** Show, replace and remove the picture of one account. */
export function AvatarUpload({
  disabled = false,
  errorMessage,
  labels = avatarUploadLabels,
  name,
  onRemove,
  onUpload,
  pixels = 256,
  src,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const run = useCallback(
    async (work: () => Promise<void>) => {
      setPending(true);
      setFailure(null);
      try {
        await work();
      } catch (error) {
        setFailure(errorMessage(error));
      } finally {
        setPending(false);
      }
    },
    [errorMessage],
  );

  const select = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = "";
      if (file === undefined) return;
      void run(async () => {
        await onUpload(await squarePicture(file, pixels));
      });
    },
    [onUpload, pixels, run],
  );

  return (
    <Section title={labels.title}>
      <Card padded>
        <div className="od-avatar-upload">
          <Avatar name={name} size="large" src={src} />
          <div className="od-avatar-upload-actions">
            <Button
              icon={<Icon name="upload" size={15} />}
              disabled={disabled || pending}
              loading={pending}
              onClick={() => inputRef.current?.click()}
              variant="secondary"
            >
              {src === null ? labels.upload : labels.replace}
            </Button>
            {src === null ? null : (
              <Button
                disabled={disabled || pending}
                onClick={() => void run(onRemove)}
                variant="quiet"
              >
                {labels.remove}
              </Button>
            )}
            <input
              accept="image/png,image/jpeg,image/webp"
              aria-label={src === null ? labels.upload : labels.replace}
              disabled={disabled || pending}
              hidden
              onChange={select}
              ref={inputRef}
              tabIndex={-1}
              type="file"
            />
          </div>
        </div>
      </Card>
      {failure === null ? null : (
        <InlineAlert className="od-section-alert" tone="error">
          {failure}
        </InlineAlert>
      )}
    </Section>
  );
}
