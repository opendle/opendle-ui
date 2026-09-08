import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const source = String.raw`
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {GraphWorkspace, GraphInspector} from './dist/index.js';
function Fixture() {
  const [open, setOpen] = useState(false);
  window.openInspector = () => flushSync(() => setOpen(true));
  window.closeInspector = () => flushSync(() => setOpen(false));
  return <GraphWorkspace inspector={open ? <GraphInspector title="Record details" onClose={() => setOpen(false)}><button>Record action</button></GraphInspector> : null} />;
}
flushSync(() => createRoot(document.getElementById('root')).render(<Fixture/>));
`;

export async function checkInspectorModeGeometry(browser, css) {
  const bundle = await build({
    bundle: true,
    format: "iife",
    platform: "browser",
    write: false,
    logLevel: "silent",
    stdin: {
      contents: source,
      loader: "jsx",
      resolveDir: fileURLToPath(new URL("../..", import.meta.url)),
    },
  });
  const page = await browser.newPage({
    viewport: { width: 360, height: 1000 },
    reducedMotion: "reduce",
  });
  try {
    await page.setContent(`<!doctype html><html lang="en"><head><title>Inspector mode geometry</title><style>${css}
      body{margin:0}.od-graph-workspace{border:1px solid; height:800px}
      @media(prefers-reduced-motion:reduce){*{transition-duration:0.01ms!important}}
      </style></head><body><main id="root"></main></body></html>`);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    for (let opening = 0; opening < 2; opening += 1) {
      const result = await page.evaluate(() => {
        window.openInspector();
        const inspector = document.querySelector(".od-graph-inspector");
        const bounds = inspector.getBoundingClientRect();
        return {
          mode: inspector.dataset.mode,
          modal: inspector.matches(":modal"),
          headingFocused:
            inspector.querySelector("h2") === document.activeElement,
          left: bounds.left,
          right: innerWidth - bounds.right,
          bottom: innerHeight - bounds.bottom,
          width: bounds.width,
          height: bounds.height,
          rem: Number.parseFloat(
            getComputedStyle(document.documentElement).fontSize,
          ),
        };
      });
      assert.equal(result.mode, "sheet");
      assert.equal(result.modal, true);
      assert.equal(result.headingFocused, true);
      for (const side of ["left", "right", "bottom"])
        assert.ok(
          Math.abs(result[side] - 0.75 * result.rem) <= 1,
          `Sheet ${side} inset must be exact at opening: ${JSON.stringify(result)}`,
        );
      assert.ok(Math.abs(result.width - (360 - 1.5 * result.rem)) <= 1);
      assert.ok(result.height <= 1000 - 1.5 * result.rem + 1);
      await page.evaluate(() => window.closeInspector());
    }
  } finally {
    await page.close();
  }
  console.log("Inspector immediate sheet insets: 2 browser cases passed.");
}
