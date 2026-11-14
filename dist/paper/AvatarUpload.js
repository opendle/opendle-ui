import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
import { Avatar } from "./Avatar.js";
import { Button } from "./Button.js";
import { InlineAlert } from "./Feedback.js";
import { Icon } from "./Icon.js";
import { avatarUploadLabels } from "./labels.js";
import { Card, Section } from "./Page.js";
import { squarePicture } from "./squarePicture.js";
/** Show, replace and remove the picture of one account. */
export function AvatarUpload({ errorMessage, labels = avatarUploadLabels, name, onRemove, onUpload, pixels = 256, src, }) {
    const inputRef = useRef(null);
    const [pending, setPending] = useState(false);
    const [failure, setFailure] = useState(null);
    const run = useCallback(async (work) => {
        setPending(true);
        setFailure(null);
        try {
            await work();
        }
        catch (error) {
            setFailure(errorMessage(error));
        }
        finally {
            setPending(false);
        }
    }, [errorMessage]);
    const select = useCallback((event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (file === undefined)
            return;
        void run(async () => {
            await onUpload(await squarePicture(file, pixels));
        });
    }, [onUpload, pixels, run]);
    return (_jsxs(Section, { title: labels.title, children: [_jsx(Card, { padded: true, children: _jsxs("div", { className: "pp-avatar-upload", children: [_jsx(Avatar, { name: name, size: "large", src: src }), _jsxs("div", { className: "pp-avatar-upload-actions", children: [_jsx(Button, { disabled: pending, icon: _jsx(Icon, { name: "upload", size: 15 }), onClick: () => inputRef.current?.click(), children: src === null ? labels.upload : labels.replace }), src === null ? null : (_jsx(Button, { disabled: pending, onClick: () => void run(onRemove), variant: "quiet", children: labels.remove })), _jsx("input", { accept: "image/png,image/jpeg,image/webp", "aria-label": src === null ? labels.upload : labels.replace, hidden: true, onChange: select, ref: inputRef, tabIndex: -1, type: "file" })] })] }) }), failure === null ? null : (_jsx(InlineAlert, { className: "pp-section-alert", tone: "error", children: failure }))] }));
}
//# sourceMappingURL=AvatarUpload.js.map