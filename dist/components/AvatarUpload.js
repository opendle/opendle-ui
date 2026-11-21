import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useRef, useState, } from "react";
import { Avatar } from "./Avatar.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { InlineAlert } from "./InlineAlert.js";
import { Icon } from "./Icon.js";
import { avatarUploadLabels, } from "./identityLabels.js";
import { PictureCropDialog } from "./PictureCropDialog.js";
import { initialPictureCrop, pictureArea, renderPicture, } from "./pictureCrop.js";
import { Section } from "./Section.js";
const uploadIcon = _jsx(Icon, { name: "upload", size: 15 });
/** Show, crop, replace and remove the picture of an account. */
export function AvatarUpload({ appearance = "section", aspectRatio = 1, disabled = false, errorMessage, labels, name, onError, onRemove, onUpload, output, shape = "rounded", src, }) {
    const text = { ...avatarUploadLabels, ...labels };
    const inputRef = useRef(null);
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const [editing, setEditing] = useState(null);
    /** The message to show in the component, or `null` when the host shows it. */
    const failureOf = useCallback((error) => {
        const message = errorMessage(error);
        if (onError === undefined)
            return message;
        onError(message);
        return null;
    }, [errorMessage, onError]);
    const remove = useCallback(async () => {
        setPending(true);
        setFailure(null);
        try {
            await onRemove();
        }
        catch (error) {
            setFailure(failureOf(error));
        }
        finally {
            setPending(false);
        }
    }, [failureOf, onRemove]);
    const select = useCallback(async (event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (file === undefined)
            return;
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
        }
        catch (error) {
            setFailure(failureOf(error));
        }
    }, [failureOf]);
    const close = useCallback(() => {
        if (editing === null)
            return;
        URL.revokeObjectURL(editing.picture.url);
        editing.bitmap.close();
        setEditing(null);
    }, [editing]);
    const changeCrop = useCallback((crop) => {
        setEditing((current) => (current === null ? null : { ...current, crop }));
    }, []);
    const save = useCallback(async () => {
        if (editing === null)
            return;
        const { bitmap, crop, picture } = editing;
        setEditing({ ...editing, failure: null, saving: true });
        try {
            const blob = await renderPicture(bitmap, pictureArea(picture, aspectRatio, crop), aspectRatio, output);
            await onUpload(blob);
            close();
        }
        catch (error) {
            const failed = failureOf(error);
            setEditing((current) => current === null
                ? null
                : { ...current, failure: failed, saving: false });
        }
    }, [aspectRatio, close, editing, failureOf, onUpload, output]);
    const saving = editing?.saving ?? false;
    const busy = disabled || pending || saving;
    const style = { "--od-avatar-ratio": String(aspectRatio) };
    const alert = failure === null ? null : (_jsx(InlineAlert, { className: "od-section-alert", tone: "error", children: failure }));
    const body = (_jsxs(_Fragment, { children: [_jsx(Avatar, { name: name, shape: shape, size: "large", src: src }), _jsxs("div", { className: "od-avatar-upload-actions", children: [_jsx(Button, { icon: uploadIcon, disabled: busy, loading: saving, onClick: () => inputRef.current?.click(), variant: "secondary", children: src === null ? text.upload : text.replace }), src === null ? null : (_jsx(Button, { disabled: busy, loading: pending, onClick: () => void remove(), variant: "quiet", children: text.remove })), _jsx("input", { accept: "image/png,image/jpeg,image/webp", "aria-label": src === null ? text.upload : text.replace, disabled: busy, hidden: true, onChange: (event) => void select(event), ref: inputRef, tabIndex: -1, type: "file" })] }), _jsx(PictureCropDialog, { aspectRatio: aspectRatio, crop: editing?.crop ?? initialPictureCrop, failure: editing?.failure ?? null, labels: text, onCancel: close, onCropChange: changeCrop, onSave: () => void save(), pending: saving, picture: editing?.picture ?? null, shape: shape })] }));
    if (appearance === "inline") {
        return (_jsxs("fieldset", { "aria-label": text.title, className: "od-avatar-upload", "data-appearance": "inline", style: style, children: [body, alert] }));
    }
    return (_jsxs(Section, { title: text.title, children: [_jsx(Card, { padded: true, children: _jsx("div", { className: "od-avatar-upload", style: style, children: body }) }), alert] }));
}
//# sourceMappingURL=AvatarUpload.js.map