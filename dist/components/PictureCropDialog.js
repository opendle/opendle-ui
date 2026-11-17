import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useEffectEvent, useRef, } from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import { InlineAlert } from "./InlineAlert.js";
import { maximumPictureZoom, movePictureCrop, pictureArea, zoomPictureCrop, } from "./pictureCrop.js";
const zoomStep = 0.1;
const smallIcon = _jsx(Icon, { name: "image", size: 14 });
const largeIcon = _jsx(Icon, { name: "image", size: 20 });
function percent(value) {
    return `${String(value * 100)}%`;
}
/** The centre and the spread of the active pointers. */
function pointerSpread(points) {
    const list = [...points.values()];
    const x = list.reduce((sum, point) => sum + point.x, 0) / list.length;
    const y = list.reduce((sum, point) => sum + point.y, 0) / list.length;
    const [first, second] = list;
    const distance = first === undefined || second === undefined
        ? 0
        : Math.hypot(first.x - second.x, first.y - second.y);
    return { x, y, distance };
}
/**
 * Move and zoom a picture in a frame of a fixed aspect ratio. A drag, the
 * arrow keys, the zoom slider, the wheel, a pinch and the + and - keys change
 * the visible part.
 */
export function PictureCropDialog({ aspectRatio, crop, failure, labels, onCancel, onCropChange, onSave, pending, picture, shape, }) {
    const frameRef = useRef(null);
    const pointsRef = useRef(new Map());
    const dragRef = useRef(null);
    const stageRef = useRef(null);
    const size = picture ?? { width: 1, height: 1 };
    const area = pictureArea(size, aspectRatio, crop);
    const change = useCallback((next) => {
        if (!pending)
            onCropChange(next);
    }, [onCropChange, pending]);
    const startGesture = () => {
        const spread = pointerSpread(pointsRef.current);
        dragRef.current = { crop, ...spread };
    };
    const pointerDown = (event) => {
        if (pending || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        pointsRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        frameRef.current?.focus({ preventScroll: true });
        startGesture();
    };
    const pointerMove = (event) => {
        const points = pointsRef.current;
        const drag = dragRef.current;
        const frame = frameRef.current;
        if (!points.has(event.pointerId) || drag === null || frame === null) {
            return;
        }
        points.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const spread = pointerSpread(points);
        const zoomed = drag.distance > 0 && spread.distance > 0
            ? zoomPictureCrop(size, aspectRatio, drag.crop, (drag.crop.zoom * spread.distance) / drag.distance)
            : drag.crop;
        const bounds = frame.getBoundingClientRect();
        change(movePictureCrop(size, aspectRatio, zoomed, -(spread.x - drag.x) / bounds.width, -(spread.y - drag.y) / bounds.height));
    };
    const pointerEnd = (event) => {
        if (!pointsRef.current.delete(event.pointerId))
            return;
        if (pointsRef.current.size === 0)
            dragRef.current = null;
        else
            startGesture();
    };
    const wheelZoom = useEffectEvent((event) => {
        event.preventDefault();
        change(zoomPictureCrop(size, aspectRatio, crop, crop.zoom * Math.exp(-event.deltaY / 400)));
    });
    // A wheel listener must not be passive to keep the page still.
    const open = picture !== null;
    useEffect(() => {
        const stage = stageRef.current;
        if (!open || stage === null)
            return undefined;
        const wheel = (event) => {
            wheelZoom(event);
        };
        // react-doctor-disable-next-line react-doctor/client-passive-event-listeners -- The wheel zooms the picture; the page must not scroll.
        stage.addEventListener("wheel", wheel, { passive: false });
        return () => {
            stage.removeEventListener("wheel", wheel);
        };
    }, [open]);
    const keyDown = (event) => {
        const step = event.shiftKey ? 0.1 : 0.02;
        const moves = {
            ArrowLeft: [step, 0],
            ArrowRight: [-step, 0],
            ArrowUp: [0, step],
            ArrowDown: [0, -step],
        };
        const move = moves[event.key];
        if (move !== undefined) {
            event.preventDefault();
            change(movePictureCrop(size, aspectRatio, crop, move[0], move[1]));
            return;
        }
        const zoom = event.key === "+" || event.key === "="
            ? zoomStep
            : event.key === "-" || event.key === "_"
                ? -zoomStep
                : 0;
        if (zoom === 0)
            return;
        event.preventDefault();
        const next = Math.round((crop.zoom + zoom) * 100) / 100;
        change(zoomPictureCrop(size, aspectRatio, crop, next));
    };
    const imageStyle = {
        left: percent(-area.x / area.width),
        top: percent(-area.y / area.height),
        width: percent(size.width / area.width),
        height: percent(size.height / area.height),
    };
    const stageStyle = {
        "--od-picture-ratio": String(aspectRatio),
    };
    return (_jsxs(Dialog, { actions: _jsxs(_Fragment, { children: [_jsx(Button, { disabled: pending, onClick: onCancel, variant: "secondary", children: labels.cancel }), _jsx(Button, { loading: pending, onClick: onSave, children: labels.save })] }), bodyClassName: "od-picture-crop", closeDisabled: pending, closeLabel: labels.close, onClose: onCancel, open: open, size: "narrow", title: labels.cropTitle, children: [_jsx("div", { className: "od-picture-crop-stage", "data-pending": pending || undefined, onLostPointerCapture: pointerEnd, onPointerCancel: pointerEnd, onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerEnd, ref: stageRef, style: stageStyle, children: _jsx("div", { "aria-keyshortcuts": "ArrowUp ArrowDown ArrowLeft ArrowRight + -", "aria-label": labels.position, className: "od-picture-crop-frame", "data-shape": shape, onKeyDown: keyDown, ref: frameRef, role: "group", tabIndex: 0, children: picture === null ? null : (_jsx("img", { alt: "", draggable: false, src: picture.url, style: imageStyle })) }) }), _jsxs("div", { className: "od-picture-crop-zoom", children: [smallIcon, _jsx("input", { "aria-label": labels.zoom, disabled: pending, max: maximumPictureZoom, min: 1, onChange: (event) => {
                            change(zoomPictureCrop(size, aspectRatio, crop, event.currentTarget.valueAsNumber));
                        }, step: 0.01, type: "range", value: crop.zoom }), largeIcon] }), failure === null ? null : (_jsx(InlineAlert, { tone: "error", children: failure }))] }));
}
//# sourceMappingURL=PictureCropDialog.js.map