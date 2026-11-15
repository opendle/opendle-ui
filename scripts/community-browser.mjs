import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

// Optional argument: a directory that receives screenshots for review.
assert.ok(process.argv.length <= 3, "This check accepts one optional path.");
const screenshots = process.argv[2] ?? null;
const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = `
import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Card, Conversation, ConversationPost, DateRangeControl, InboxList,
  RecordTable, Section, StackedBarChart, ChartLegend, lastDays,
} from "./dist/index.js";

const base = {avatarUrl: null, createdAt: "2026-11-14T09:00:00Z", own: false, liked: false, likeCount: null, state: "new", canReply: true, canLike: true, depth: 0};
const start = [
  {...base, id: "m1", authorName: "Jonas Weber", authorHandle: "@jonasweber", when: "2 d", text: "Been on repeat since Tuesday.", liked: true, likeCount: 14, state: "replied"},
  {...base, id: "m2", authorName: "Vincent", authorHandle: "", when: "2 d", text: "@jonasweber that makes my week.", own: true, depth: 1},
  {...base, id: "m3", authorName: "Mara Keys", authorHandle: "@mara.keys", when: "3 h", text: "The bridge at 0:42 gave me chills. Is the full song out yet?", likeCount: 6},
  {...base, id: "m4", authorName: "Léa Fontaine", authorHandle: "@lea.fontaine", when: "1 h", text: "Paris show when?", likeCount: 2, canLike: false},
  {...base, id: "m5", authorName: "driftwood.audio", authorHandle: "@driftwood.audio", when: "25 min", text: "Who mixed this? The low end is so clean.", state: "ignored"},
];
const days = Array.from({length: 30}, (_, index) => new Date(Date.UTC(2026, 9, 16 + index)).toISOString().slice(0, 10));
const names = ["Instagram", "TikTok", "YouTube", "Facebook", "Threads", "X", "Bluesky", "Pinterest", "Tumblr", "Mastodon", "LinkedIn"];
const series = names.map((label, slot) => ({id: label, label, slot, total: String((slot + 1) * 310),
  values: days.map((_, day) => (slot === 2 && day < 4 ? null : Math.round(40 + 30 * Math.sin(day / 3 + slot) + slot * 6)))}));

function App() {
  const [messages, setMessages] = useState(start);
  const [sent, setSent] = useState([]);
  const [range, setRange] = useState(lastDays("2026-11-14", 30));
  const [opened, setOpened] = useState("");
  window.sent = sent;
  const patch = (id, change) => setMessages((list) => list.map((m) => m.id === id ? {...m, ...change} : m));
  return (
    <main style={{padding: 16, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 28, maxWidth: 1100, margin: "0 auto"}}>
      <h1 className="od-visually-hidden">Community and analytics parts</h1>
      <Card>
        <InboxList label="Inbox" empty="No messages" selectedId="m3" items={start.filter((m) => !m.own).map((m) => ({
          id: m.id, network: "instagram", authorName: m.authorName, avatarUrl: null, text: m.text, when: m.when,
          createdAt: m.createdAt, context: "Take Me With You", href: "#" + m.id}))}/>
      </Card>
      <Card>
        <Conversation messages={messages} selectedId="m3" limit={60}
          mention={(message) => message.authorHandle}
          suggestions={["Thank you! The full version is out on Friday.", "So happy you like it"]}
          errorMessage={() => "The request failed."}
          onReply={async (id, text) => { if (text.includes("fail")) throw new Error("no"); setSent((list) => [...list, [id, text]]); patch(id, {state: "replied"}); }}
          onLike={(id, liked) => patch(id, {liked})}
          onIgnore={(id) => patch(id, {state: "ignored"})}
          onRestore={(id) => patch(id, {state: "new"})}
          post={<ConversationPost network="instagram" title="Take Me With You" when="10 Nov, 12:30"
            text={["The night we wrote the chorus, nobody wanted to go home.", "", "Full video on YouTube.", "Lyrics:", "Take me with you", "Into the night", "Where the city sleeps", "And the radio plays"].join("\\n")} stats={["18.4K views", "1,204 likes", "37 comments"]} url="https://example.com/p"/>}/>
      </Card>
      <Section title="Views" actions={<DateRangeControl label="Period" fromLabel="From" toLabel="To" today="2026-11-14" value={range} onChange={setRange}
        presets={[{days: 7, label: "7 days"}, {days: 30, label: "30 days"}, {days: 90, label: "90 days"}]}/>}>
        <ChartLegend label="Channels" items={series.slice(0, 9).map(({id, label, slot}) => ({id, label, slot}))}/>
        <Card padded><StackedBarChart label="Views by channel" days={days} series={series} locale="en-GB"/></Card>
        <p id="range">{range.from} {range.to}</p>
        <Card padded><StackedBarChart label="Comments by channel" days={days} locale="en-GB"
          series={series.slice(0, 2).map((entry) => ({...entry, total: "0", values: days.map(() => 0)}))}/></Card>
        <Card padded><StackedBarChart label="Likes by channel" days={days} locale="en-GB" series={[]}/></Card>
        <Card padded><StackedBarChart label="Followers by channel" variant="area" days={days} locale="en-GB"
          series={series.slice(0, 4).map((entry) => ({...entry, values: entry.values.map((value, day) => value === null ? null : 1000 + entry.slot * 400 + day * 10)}))}/></Card>
      </Section>
      <RecordTable label="Best posts" onOpen={setOpened}
        columns={[{id: "post", label: "Post"}, {id: "views", label: "Views", numeric: true}, {id: "likes", label: "Reactions", numeric: true}]}
        rows={[{id: "p1", title: "Take Me With You", label: "Take Me With You", cells: ["18.4K", "1,204"]}, {id: "p2", title: "Paper Lanterns", label: "Paper Lanterns", cells: ["9.1K", "640"]}]}/>
      <p id="opened">{opened}</p>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App/>);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-community-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Community</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
);
const pageUrl = pathToFileURL(pagePath).href;
const browser = await chromium.launch({ headless: true });

async function audit(page, name) {
  assert.deepEqual(
    (await new AxeBuilder({ page }).analyze()).violations.map(
      (violation) => `${violation.id}: ${violation.nodes[0]?.html ?? ""}`,
    ),
    [],
    name,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    `${name}: horizontal overflow`,
  );
  if (screenshots !== null) {
    await page.screenshot({
      path: join(screenshots, `${name}.png`),
      fullPage: true,
    });
  }
}

try {
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [1440, 768, 390]) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pageUrl);
      await page.evaluate(() => document.fonts.ready);
      const name = `${colorScheme}-${String(width)}`;

      // The selected message has the open reply box, with the mention.
      const box = page.getByRole("textbox", { name: "Reply to Mara Keys" });
      await box.waitFor();
      assert.equal(await box.inputValue(), "@mara.keys ");
      assert.equal(
        await box.evaluate((area) => area === document.activeElement),
        true,
      );
      assert.equal(
        await page
          .getByRole("link", { name: /Mara Keys/ })
          .getAttribute("aria-current"),
        "true",
      );
      await page.getByText("11 / 60").waitFor();
      const send = page.locator(".od-reply-send");
      assert.equal(
        await send.isDisabled(),
        true,
        "the mention alone is no reply",
      );
      await audit(page, `${name}-conversation`);

      // A suggestion goes after the mention. The user can edit it.
      await page.getByRole("button", { name: "So happy you like it" }).click();
      assert.equal(await box.inputValue(), "@mara.keys So happy you like it");
      // Shift+Enter adds a line and the textarea grows.
      const before = (await box.boundingBox()).height;
      await box.press("Shift+Enter");
      await box
        .pressSequentially("Second line\nx", { delay: 0 })
        .catch(() => {});
      assert.equal(await page.evaluate(() => window.sent.length), 1);
      assert.match(
        await page.evaluate(() => window.sent[0][1]),
        /^@mara\.keys So happy you like it\nSecond line$/,
      );
      assert.ok(before > 0);
      await box.waitFor({ state: "detached" });

      // Another comment has a reply link that opens a box there.
      await page.getByRole("button", { name: "Reply" }).nth(2).click();
      const second = page.getByRole("textbox", {
        name: "Reply to Léa Fontaine",
      });
      assert.equal(await second.inputValue(), "@lea.fontaine ");
      assert.equal(
        await page.getByRole("group", { name: "Suggestions" }).count(),
        0,
        "only the selected message has suggestions",
      );
      await second.fill("x".repeat(61));
      await page.getByText("61 / 60").waitFor();
      await second.press("Enter");
      assert.equal(await page.evaluate(() => window.sent.length), 1);
      // A long post shows its first lines; More shows all of them.
      const postText = page.locator(".od-conversation-post-text");
      const short = (await postText.boundingBox()).height;
      await page.getByRole("button", { name: "More" }).click();
      assert.equal(
        await page
          .locator(".od-conversation-post-more")
          .getAttribute("aria-expanded"),
        "true",
      );
      assert.ok((await postText.boundingBox()).height > short + 20);
      await page.getByRole("button", { name: "Less" }).click();
      assert.ok(Math.abs((await postText.boundingBox()).height - short) <= 1);
      // The emoji button adds an emoji at the caret.
      await second.fill("@lea.fontaine Soon ");
      await page.getByRole("button", { name: "Emoji" }).click();
      const grid = page.getByRole("group", { name: "Emoji" });
      // The search field finds an emoji by its words; Enter takes the first.
      const search = page.getByRole("searchbox", { name: "Search emoji" });
      assert.equal(
        await search.evaluate((element) => element === document.activeElement),
        true,
      );
      await search.fill("guitar");
      assert.deepEqual(await grid.getByRole("button").allTextContents(), [
        "🎸",
      ]);
      await search.fill("zzz");
      await page.getByText("No emoji").waitFor();
      await search.fill("");
      // The grid is fixed to the window: no container cuts it.
      const gridBox = await grid.boundingBox();
      const viewport = page.viewportSize();
      assert.ok(
        gridBox.y >= 0 &&
          gridBox.y + gridBox.height <= viewport.height &&
          gridBox.x >= 0 &&
          gridBox.x + gridBox.width <= viewport.width,
        `the emoji grid is in the window: ${JSON.stringify(gridBox)}`,
      );
      assert.equal(
        await grid.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(box.left + 10, box.bottom - 10),
          );
        }),
        true,
        "the last row of the grid is on top",
      );
      await audit(page, `${name}-emoji`);
      await grid.getByRole("button").first().click();
      assert.equal(await second.inputValue(), "@lea.fontaine Soon 🧡");
      // The reply box grows with all its lines and never scrolls.
      await second.fill(
        Array.from({ length: 30 }, (_, line) => `Line ${String(line)}`).join(
          "\n",
        ),
      );
      assert.equal(
        await second.evaluate(
          (element) => element.scrollHeight <= element.clientHeight + 1,
        ),
        true,
        "the reply box shows all lines",
      );
      // A failed send keeps the text.
      await second.fill("fail");
      await second.press("Enter");
      await page.getByRole("alert").waitFor();
      assert.equal(await second.inputValue(), "fail");

      // Like where the network permits it, ignore and restore.
      const likes = page.getByRole("button", { name: "Like" });
      assert.equal(await likes.count(), 3);
      await likes.nth(1).click();
      assert.equal(await likes.nth(1).getAttribute("aria-pressed"), "true");
      assert.equal(
        await page.getByRole("button", { name: "Ignore" }).count(),
        3,
      );
      await page.getByRole("button", { name: "Move to the inbox" }).click();
      assert.equal(
        await page.getByRole("button", { name: "Ignore" }).count(),
        4,
      );

      // The chart: a pointer or the arrow keys give the values of one day.
      const chart = page.getByRole("img", { name: "Views by channel" });
      const figure = page.locator("figure.od-chart").first();
      await chart.scrollIntoViewIfNeeded();
      assert.equal(
        await figure.locator(".od-chart-legend > span").count(),
        10,
        "the tenth and later series are one Other series",
      );
      await figure.locator(".od-chart-legend").getByText("Other").waitFor();
      assert.equal(
        await page
          .getByRole("list", { name: "Channels" })
          .getByRole("listitem")
          .count(),
        9,
      );
      // Nine different colours and one neutral colour.
      const fills = await figure
        .locator(".od-chart-swatch")
        .evaluateAll((marks) =>
          marks.map((mark) => getComputedStyle(mark).backgroundColor),
        );
      assert.equal(new Set(fills).size, 10);
      // Each day has one top segment. Only it is round.
      assert.equal(
        await figure.locator('.od-chart-bar[data-top="true"]').count(),
        30,
      );
      const plot = await chart.boundingBox();
      assert.ok(
        Math.abs(
          plot.width -
            (await figure.locator(".od-chart-plot").boundingBox()).width,
        ) <= 1,
      );
      await page.mouse.move(plot.x + plot.width / 3, plot.y + plot.height / 2);
      const tip = figure.locator(".od-chart-tooltip");
      await tip.waitFor();
      assert.equal(await tip.locator(".od-chart-tooltip-row").count(), 10);
      const tipBox = await tip.boundingBox();
      assert.ok(tipBox.x >= 0 && tipBox.x + tipBox.width <= width);
      // The series under the pointer is marked in the values of the day.
      const under = (x, y) =>
        page.evaluate(
          ([pointX, pointY]) =>
            document
              .elementFromPoint(pointX, pointY)
              ?.closest("[data-slot]")
              ?.getAttribute("data-slot") ?? null,
          [x, y],
        );
      const marked = async (scope) =>
        scope
          .locator('.od-chart-tooltip-row[data-active="true"] .od-chart-key')
          .evaluateAll((keys) => keys.map((key) => key.dataset.slot));
      const barSlot = await under(
        plot.x + plot.width / 3,
        plot.y + plot.height / 2,
      );
      assert.notEqual(barSlot, null);
      assert.deepEqual(await marked(figure), [barSlot]);
      await audit(page, `${name}-chart`);
      await page.mouse.move(0, 0);
      await chart.focus();
      await page.keyboard.press("Home");
      await tip.getByText("16 Oct 2026").waitFor();
      assert.equal(
        await tip.locator(".od-chart-tooltip-row").count(),
        9,
        "a series without a value for the day is not in the tooltip",
      );
      await page.keyboard.press("Escape");
      await tip.waitFor({ state: "detached" });
      assert.equal(await figure.locator("table tbody tr").count(), 30);

      // A level that continues is a stacked area, with the same marks.
      const followers = page.getByRole("img", { name: "Followers by channel" });
      const followersFigure = page.locator("figure.od-chart", {
        has: followers,
      });
      await followers.scrollIntoViewIfNeeded();
      assert.equal(await followers.locator(".od-chart-bar").count(), 0);
      assert.equal(await followers.locator(".od-chart-area").count(), 4);
      const areaBox = await followers.boundingBox();
      // The lowest area at the right half of the chart, near the axis.
      const areaX = areaBox.x + areaBox.width * 0.75;
      const areaY = areaBox.y + areaBox.height - 40;
      await page.mouse.move(areaX, areaY);
      await followersFigure.locator(".od-chart-tooltip").waitFor();
      assert.equal(await followers.locator(".od-chart-point").count(), 4);
      const areaSlot = await under(areaX, areaY);
      assert.equal(areaSlot, "0");
      assert.deepEqual(await marked(followersFigure), ["0"]);
      // The top of the stack is the first value of the day.
      assert.equal(
        await followersFigure
          .locator(".od-chart-tooltip-row .od-chart-key")
          .first()
          .getAttribute("data-slot"),
        "3",
      );
      await audit(page, `${name}-area-chart`);
      await page.mouse.move(0, 0);

      // A chart without values keeps its axis and its day labels.
      for (const emptyName of ["Comments by channel", "Likes by channel"]) {
        const empty = page.getByRole("img", { name: emptyName });
        assert.equal(await empty.locator(".od-chart-bar").count(), 0);
        assert.equal(await empty.locator(".od-chart-axis").count(), 1);
        assert.ok((await empty.locator(".od-chart-tick").count()) >= 4);
        assert.ok((await empty.boundingBox()).height >= 190);
      }

      // The period: a preset and the date inputs.
      await page.getByRole("button", { name: "7 days" }).click();
      assert.equal(
        await page.locator("#range").textContent(),
        "2026-11-08 2026-11-14",
      );
      await page.getByLabel("From").fill("2026-11-01");
      assert.equal(
        await page.locator("#range").textContent(),
        "2026-11-01 2026-11-14",
      );

      // The first cell of a table row opens the record.
      await page.getByRole("button", { name: "Paper Lanterns" }).click();
      assert.equal(await page.locator("#opened").textContent(), "p2");

      assert.deepEqual(errors, []);
      await context.close();
    }
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Community and chart browser checks passed.");
