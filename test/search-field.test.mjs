import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchField } from "../dist/index.js";

test("SearchField names a native search input and keeps host attributes", () => {
  const markup = renderToStaticMarkup(
    React.createElement(SearchField, {
      label: "Search library",
      className: "host-search",
      value: "cover",
      maxLength: 200,
      onChange: () => undefined,
    }),
  );
  assert.match(markup, /^<span class="od-search-field host-search">/);
  assert.match(markup, /<svg[^>]*aria-hidden="true"/);
  assert.match(
    markup,
    /<input(?=[^>]*type="search")(?=[^>]*aria-label="Search library")(?=[^>]*placeholder="Search library")(?=[^>]*value="cover")(?=[^>]*maxLength="200")/,
  );
});

test("SearchField keeps an explicit placeholder", () => {
  const markup = renderToStaticMarkup(
    React.createElement(SearchField, {
      label: "Search media",
      placeholder: "Name",
    }),
  );
  assert.match(markup, /aria-label="Search media"/);
  assert.match(markup, /placeholder="Name"/);
});
