import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Avatar, type AvatarShape } from "./Avatar.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { InlineAlert } from "./InlineAlert.js";
import { Icon } from "./Icon.js";
import {
  avatarUploadLabels,
  type AvatarUploadLabels,
} from "./identityLabels.js";
import { PictureCropDialog, type LoadedPicture } from "./PictureCropDialog.js";
import {
  initialPictureCrop,
  pictureArea,
  renderPicture,
  type PictureCrop,
  type PictureOutput,
} from "./pictureCrop.js";
import { Section } from "./Section.js";

export interface AvatarUploadProps {
  readonly name: string;
  readonly src: string | null;
  /** Receives the cropped picture at the output size and in its format. */
  readonly onUpload: (picture: Blob) => Promise<void>;
  readonly onRemove: () => Promise<void>;
  readonly errorMessage: (error: unknown) => string;
  /** The frame of the preview and of the crop. The default is `rounded`. */
  readonly shape?: AvatarShape;
  /** The width divided by the height of the picture. The default is 1. */
  readonly aspectRatio?: number;
  /** The default is a WebP picture 256 pixels wide, quality 0.9. */
  readonly output?: PictureOutput;
  /**
   * `section` is a titled card. `inline` is the picture above its buttons,
   * for a column in a host card.
   */
  readonly appearance?: "section" | "inline";
  readonly disabled?: boolean;
  readonly labels?: Partial<AvatarUploadLabels>;
}

/** A picture in the crop dialog. */
interface Editing {
  readonly picture: LoadedPicture;
  readonly bitmap: ImageBitmap;
  readonly crop: PictureCrop;
  readonly saving: boolean;
  readonly failure: string | null;
}

const uploadIcon = <Icon name="upload" size={15} />;

/** Show, crop, replace and remove the picture of an account. */
export function AvatarUpload({
  appearance = "section",
  aspectRatio = 1,
  disabled = false,
  errorMessage,
  labels,
  name,
  onRemove,
  onUpload,
  output,
  shape = "rounded",
  src,
}: AvatarUploadProps) {
  const text = { ...avatarUploadLabels, ...labels };
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);

  const remove = useCallback(async () => {
    setPending(true);
    setFailure(null);
    try {
      await onRemove();
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setPending(false);
    }
  }, [errorMessage, onRemove]);

  const select = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0];
      event.currentTarget.value = "";
      if (file === undefined) return;
      setFailure(null);
      try {
        const bitmap = await createImageBitmap(file);
        setEditing({
          bitmap,
          crop: initialPictureCrop,
          failure: null,
          picture: {
            height: bitmap.height,
            url: URL.createObjectURL(file),
            width: bitmap.width,
          },
          saving: false,
        });
      } catch (error) {
        setFailure(errorMessage(error));
      }
    },
    [errorMessage],
  );

  const close = useCallback(() => {
    if (editing === null) return;
    URL.revokeObjectURL(editing.picture.url);
    editing.bitmap.close();
    setEditing(null);
  }, [editing]);

  const changeCrop = useCallback((crop: PictureCrop) => {
    setEditing((current) => (current === null ? null : { ...current, crop }));
  }, []);

  const save = useCallback(async () => {
    if (editing === null) return;
    const { bitmap, crop, picture } = editing;
    setEditing({ ...editing, failure: null, saving: true });
    try {
      const blob = await renderPicture(
        bitmap,
        pictureArea(picture, aspectRatio, crop),
        aspectRatio,
        output,
      );
      await onUpload(blob);
      close();
    } catch (error) {
      setEditing((current) =>
        current === null
          ? null
          : { ...current, failure: errorMessage(error), saving: false },
      );
    }
  }, [aspectRatio, close, editing, errorMessage, onUpload, output]);

  const saving = editing?.saving ?? false;
  const busy = disabled || pending || saving;
  const style = { "--od-avatar-ratio": String(aspectRatio) } as CSSProperties;
  const alert =
    failure === null ? null : (
      <InlineAlert className="od-section-alert" tone="error">
        {failure}
      </InlineAlert>
    );
  const body: ReactNode = (
    <>
      <Avatar name={name} shape={shape} size="large" src={src} />
      <div className="od-avatar-upload-actions">
        <Button
          icon={uploadIcon}
          disabled={busy}
          loading={saving}
          onClick={() => inputRef.current?.click()}
          variant="secondary"
        >
          {src === null ? text.upload : text.replace}
        </Button>
        {src === null ? null : (
          <Button
            disabled={busy}
            loading={pending}
            onClick={() => void remove()}
            variant="quiet"
          >
            {text.remove}
          </Button>
        )}
        <input
          accept="image/png,image/jpeg,image/webp"
          aria-label={src === null ? text.upload : text.replace}
          disabled={busy}
          hidden
          onChange={(event) => void select(event)}
          ref={inputRef}
          tabIndex={-1}
          type="file"
        />
      </div>
      <PictureCropDialog
        aspectRatio={aspectRatio}
        crop={editing?.crop ?? initialPictureCrop}
        failure={editing?.failure ?? null}
        labels={text}
        onCancel={close}
        onCropChange={changeCrop}
        onSave={() => void save()}
        pending={saving}
        picture={editing?.picture ?? null}
        shape={shape}
      />
    </>
  );

  if (appearance === "inline") {
    return (
      <fieldset
        aria-label={text.title}
        className="od-avatar-upload"
        data-appearance="inline"
        style={style}
      >
        {body}
        {alert}
      </fieldset>
    );
  }
  return (
    <Section title={text.title}>
      <Card padded>
        <div className="od-avatar-upload" style={style}>
          {body}
        </div>
      </Card>
      {alert}
    </Section>
  );
}
