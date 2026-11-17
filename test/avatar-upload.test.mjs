import { strict as assert } from "node:assert";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Avatar, AvatarUpload } from "../dist/index.js";
import {
  initialPictureCrop,
  movePictureCrop,
  pictureArea,
  zoomPictureCrop,
} from "../dist/components/pictureCrop.js";

const render = (type, props) =>
  renderToStaticMarkup(React.createElement(type, props));

const upload = {
  name: "Studio",
  src: "/studio.png",
  errorMessage: String,
  onUpload: async () => {},
  onRemove: async () => {},
};

test("Avatar shows its shape; the rounded square is the default", () => {
  assert.doesNotMatch(render(Avatar, { name: "Ada" }), /data-shape/);
  assert.match(
    render(Avatar, { name: "Ada", shape: "circle" }),
    /data-shape="circle"/,
  );
  assert.match(
    render(Avatar, { name: "Ada", shape: "square" }),
    /data-shape="square"/,
  );
});

test("AvatarUpload gives the shape and the aspect ratio to its preview", () => {
  const markup = render(AvatarUpload, {
    ...upload,
    shape: "circle",
    aspectRatio: 2,
  });
  assert.match(markup, /--od-avatar-ratio:2/);
  assert.match(markup, /class="od-avatar" data-shape="circle"/);
  assert.match(markup, /<h2[^>]*>Profile picture<\/h2>/);
});

test("AvatarUpload inline is a named group without a section", () => {
  const markup = render(AvatarUpload, {
    ...upload,
    appearance: "inline",
    labels: { title: "Workspace picture" },
  });
  assert.doesNotMatch(markup, /od-section/);
  assert.match(
    markup,
    /<fieldset aria-label="Workspace picture" class="od-avatar-upload" data-appearance="inline"/,
  );
  assert.match(markup, />Replace</);
  assert.match(markup, />Remove</);
});

test("the first crop is the largest centred area with the aspect ratio", () => {
  const landscape = { width: 400, height: 200 };
  assert.deepEqual(pictureArea(landscape, 1, initialPictureCrop), {
    x: 100,
    y: 0,
    width: 200,
    height: 200,
  });
  assert.deepEqual(pictureArea(landscape, 4, initialPictureCrop), {
    x: 0,
    y: 50,
    width: 400,
    height: 100,
  });
  assert.deepEqual(
    pictureArea({ width: 200, height: 400 }, 1, initialPictureCrop),
    { x: 0, y: 100, width: 200, height: 200 },
  );
});

test("a zoom shows a smaller area and stays in its limits", () => {
  const size = { width: 400, height: 400 };
  const zoomed = zoomPictureCrop(size, 1, initialPictureCrop, 2);
  assert.deepEqual(pictureArea(size, 1, zoomed), {
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  });
  assert.equal(zoomPictureCrop(size, 1, initialPictureCrop, 0.2).zoom, 1);
  assert.equal(zoomPictureCrop(size, 1, initialPictureCrop, 40).zoom, 4);
});

test("a move keeps the area in the picture", () => {
  const size = { width: 400, height: 200 };
  const right = movePictureCrop(size, 1, initialPictureCrop, 0.25, 0);
  assert.equal(pictureArea(size, 1, right).x, 150);
  const far = movePictureCrop(size, 1, initialPictureCrop, 5, 5);
  assert.deepEqual(pictureArea(size, 1, far), {
    x: 200,
    y: 0,
    width: 200,
    height: 200,
  });
  const outside = movePictureCrop(size, 1, initialPictureCrop, -9, 0);
  assert.deepEqual(outside, { zoom: 1, x: 0.25, y: 0.5 });
});
