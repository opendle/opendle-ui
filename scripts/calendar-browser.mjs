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
import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  AccountMenu, ApplicationShell, Avatar, CalendarBoard, CalendarHeader, Icon,
  NavigationLink, PostDetailDialog, TagFilterBar, calendarTitle,
  emptyTagFilter, shiftCalendarAnchor,
} from "./dist/index.js";

const today = "2026-11-14";
const all = ["instagram","tiktok","youtube","facebook","threads","x","bluesky","pinterest","tumblr"];
const video = ["youtube","x","facebook","bluesky"];
const songs = {t: ["Take Me With You", "#b8683c"], p: ["Paper Lanterns", "#3f7a63"], l: ["Low Tide", "#52708f"]};
const plan = [
  [2,"15:00","t","Video",video],[4,"12:30","t","Reel",all],[6,"12:30","t","Reel",all],[8,"12:30","t","Reel",all],
  [9,"15:00","p","Video",video],[10,"12:30","t","Reel",all],[11,"12:30","p","Reel",all],[12,"18:30","t","Reel",all,"pinterest"],
  [13,"12:30","p","Reel",all],[14,"12:30","t","Reel",all],[14,"18:30","p","Reel",all],[16,"15:00","l","Video",video],
  [17,"12:30","p","Reel",all],[18,"12:30","l","Reel",all],[19,"12:30","p","Reel",all],[20,"12:30","l","Reel",all],
  [22,"12:30","l","Reel",all],[24,"12:30","l","Reel",all],[26,"12:30","l","Reel",all],
];
function entries(month, count) {
  return plan.slice(0, count).map(([day, time, song, kind, networks, failed]) => {
    const start = new Date(2026, month, day, Number(time.slice(0, 2)), Number(time.slice(3)));
    const past = start < new Date(2026, 10, 14, 13);
    return {
      id: month + "-" + day + "-" + time, start: start.toISOString(), title: songs[song][0], kind, color: songs[song][1],
      targets: networks.map((network) => ({id: month + "-" + day + time + network, network,
        state: network === failed ? "failed" : past ? "published" : "scheduled"})),
    };
  });
}
const channels = all.map((network) => ({id: network, network, label: network}));
function Mark() {
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill="currentColor"/></svg>;
}
function App() {
  const empty = location.hash === "#empty";
  const [mode, setMode] = useState("month");
  const [anchor, setAnchor] = useState(today);
  const [filter, setFilter] = useState(emptyTagFilter);
  const [earlier, setEarlier] = useState(0);
  const [selected, setSelected] = useState(null);
  const [retried, setRetried] = useState(false);
  const items = useMemo(() => {
    if (empty) return [];
    const base = entries(10, plan.length);
    const older = Array.from({length: earlier}, (_, index) => entries(9 - index, 12)).flat();
    return [...older, ...base].filter((item) =>
      filter.channels.length === 0 || item.targets.some((target) => filter.channels.includes(target.network)));
  }, [earlier, empty, filter]);
  window.loads = earlier;
  const targets = (selected?.targets ?? []).map((target) => ({
    id: target.id, network: target.network, name: target.network[0].toUpperCase() + target.network.slice(1),
    state: retried && target.state === "failed" ? "scheduled" : target.state,
    url: target.state === "published" ? "https://example.com/" + target.id : null,
    error: target.state === "failed" ? "Board not found" : null,
    text: location.hash === "#variants" && target.network === "x"
      ? "Take Me With You. Out now."
      : "The night we wrote the chorus, nobody wanted to go home.\\n\\nTake Me With You. Full video on YouTube.\\n\\n#music #lyrics",
    when: "Thursday 12 November, 18:30",
  }));
  return (
    <ApplicationShell brandMark={<Mark/>} brandName="Poster" navigationLabel="Main" skipLabel="Skip to content"
      navigation={<>
        <NavigationLink href="#calendar" icon={<Icon name="calendar"/>} label="Calendar" active/>
        <NavigationLink href="#settings" icon={<Icon name="settings"/>} label="Settings"/>
      </>}
      account={<AccountMenu href="#settings" avatar={<Avatar name="Vincent"/>} name="Vincent"/>}>
      <CalendarHeader mode={mode} onModeChange={setMode}
        title={mode === "timeline" ? "Timeline" : calendarTitle(mode, anchor, "en-GB")}
        onToday={() => setAnchor(today)}
        {...(mode === "timeline" ? {} : {
          onPrevious: () => setAnchor(shiftCalendarAnchor(mode, anchor, -1)),
          onNext: () => setAnchor(shiftCalendarAnchor(mode, anchor, 1)),
        })}/>
      <TagFilterBar channels={channels} tags={["short","long","take-me-with-you","paper-lanterns","low-tide"]}
        tagColors={{short: 8, long: 3, "take-me-with-you": 1, "paper-lanterns": 5, "low-tide": 7}} value={filter} onChange={setFilter}/>
      <CalendarBoard mode={mode} anchor={anchor} today={today} items={items} locale="en-GB"
        onSelect={(item) => { setRetried(false); setSelected(item); }}
        hasEarlier={!empty && earlier < 3} onLoadEarlier={() => setEarlier((value) => Math.min(3, value + 1))}/>
      <PostDetailDialog open={selected !== null} onClose={() => setSelected(null)}
        title={selected?.title ?? ""} tags={["take-me-with-you","reel"]}
        media={{type: "video", src: "about:blank", duration: "0:38"}} targets={targets}
        onRetry={async () => { setRetried(true); }} errorMessage={() => "The request failed."}/>
    </ApplicationShell>
  );
}
createRoot(document.getElementById("root")).render(<App/>);`;
const bundled = await build({
  stdin: { contents: fixture, loader: "jsx", resolveDir: root },
  bundle: true,
  write: false,
  format: "iife",
});
const directory = mkdtempSync(join(tmpdir(), "opendle-calendar-"));
const pagePath = join(directory, "index.html");
writeFileSync(
  pagePath,
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Calendar</title><link rel="stylesheet" href="${pathToFileURL(join(root, "styles/index.css")).href}"></head><body><div id="root"></div><script>${bundled.outputFiles[0].text.replaceAll("</script", "<\\/script")}</script></body></html>`,
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
    for (const width of [1440, 1000, 390]) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion: "reduce",
        timezoneId: "Europe/Paris",
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(pageUrl);
      await page.evaluate(() => document.fonts.ready);
      const name = `${colorScheme}-${String(width)}`;

      // Month: one entry for each group, with a badge for each network.
      await page.getByRole("heading", { name: "November 2026" }).waitFor();
      const failed = page.getByRole("button", {
        name: "18:30, Reel, Take Me With You, Failed",
      });
      assert.equal(await failed.count(), 1);
      assert.equal(await failed.locator(".od-network").count(), 9);
      assert.equal(
        await failed.locator('.od-network[data-state="failed"]').count(),
        1,
      );
      assert.equal(await page.locator(".od-calendar-item").count(), 19);
      if (width === 390) {
        assert.equal(
          await page.locator(".od-calendar-day:visible").count(),
          18,
          "a phone lists only the days that have entries",
        );
      }
      await audit(page, `${name}-month`);

      // A channel filter keeps the entries of that channel.
      const pinterest = page.getByRole("button", {
        name: "pinterest",
        exact: true,
      });
      await pinterest.click();
      assert.equal(await pinterest.getAttribute("aria-pressed"), "true");
      assert.equal(await page.locator(".od-calendar-item").count(), 16);
      await pinterest.click();
      // One group of tags, each in its colour.
      const tagGroup = page.getByRole("group", { name: "Tags", exact: true });
      assert.equal(await tagGroup.getByRole("button").count(), 5);
      assert.equal(
        await page
          .getByRole("group", { name: /Channel tags|Post tags/ })
          .count(),
        0,
      );
      assert.equal(
        await tagGroup
          .getByRole("button", { name: "#short" })
          .getAttribute("data-color"),
        "8",
      );
      assert.equal(
        await page.getByText("Channels", { exact: true }).count(),
        0,
      );
      assert.equal(await page.getByText("Tags", { exact: true }).count(), 0);
      assert.equal(
        await tagGroup.evaluate(
          (group) => getComputedStyle(group).borderLeftStyle,
        ),
        "solid",
        "a line separates the tags from the channels",
      );
      const logic = page.getByRole("group", { name: "Tag logic" });
      await logic.getByRole("button", { name: "OR" }).click();
      assert.equal(
        await logic
          .getByRole("button", { name: "OR" })
          .getAttribute("aria-pressed"),
        "true",
      );

      // The details show each network. A failed network has a retry action.
      await failed.click();
      const details = page.getByRole("dialog", { name: "Take Me With You" });
      await details.waitFor();
      assert.equal(
        await details.getByRole("link", { name: "Open" }).count(),
        8,
      );
      assert.equal(await details.getByText("Board not found").count(), 1);
      assert.equal(await details.getByRole("tab").count(), 0);
      await audit(page, `${name}-details`);
      await details.getByRole("button", { name: "Retry" }).click();
      await details.getByText("1 scheduled").waitFor();
      assert.equal(
        await details.getByRole("button", { name: "Retry" }).count(),
        0,
      );
      await page.keyboard.press("Escape");
      await details.waitFor({ state: "hidden" });

      // Period navigation and the week view.
      await page.getByRole("button", { name: "Next" }).click();
      await page.getByRole("heading", { name: "December 2026" }).waitFor();
      assert.equal(await page.locator(".od-calendar-item").count(), 0);
      await page.getByRole("button", { name: "Today" }).click();
      const views = page.getByRole("group", { name: "View" });
      await views.getByRole("button", { name: "Week" }).click();
      await page.getByRole("heading", { name: /9.*15 Nov 2026/ }).waitFor();
      assert.equal(await page.locator(".od-calendar-day").count(), 7);
      assert.equal(await page.locator(".od-calendar-item:visible").count(), 7);
      if (width !== 390) {
        // All 24 hours show. An hour with an entry is taller than one without.
        const hours = page.locator(".od-calendar-week-hour");
        assert.equal(await hours.count(), 24);
        const heights = await hours.evaluateAll((cells) =>
          cells.map((cell) => cell.getBoundingClientRect().height),
        );
        assert.ok(heights.every((height) => height >= 20));
        assert.ok(heights[12] > heights[3] * 2, JSON.stringify(heights));
        assert.equal(
          await page
            .locator(".od-calendar-week tbody tr")
            .nth(25)
            .locator(".od-calendar-item")
            .count(),
          4,
          "the entries of 12:30 are in the second half of the hour",
        );
        assert.ok(heights.every((height) => height >= 32));
        // The bottom of the period controls is on the baseline of the title.
        const edges = await page.evaluate(() => {
          const title = document.querySelector(".od-calendar-header h1");
          const probe = document.createElement("span");
          probe.style.cssText = "display:inline-block;width:0;height:0";
          title.append(probe);
          const baseline = probe.getBoundingClientRect().bottom;
          probe.remove();
          return [
            baseline,
            ...[
              ".od-calendar-header-navigation .od-button",
              ".od-calendar-header-navigation .od-icon-button",
            ].map(
              (selector) =>
                document.querySelector(selector).getBoundingClientRect().bottom,
            ),
          ];
        });
        assert.ok(
          Math.abs(edges[0] - edges[1]) <= 1.5 &&
            Math.abs(edges[0] - edges[2]) <= 1.5,
          JSON.stringify(edges),
        );
      }
      await audit(page, `${name}-week`);

      // The timeline opens at the present and loads earlier days on demand.
      await views.getByRole("button", { name: "Timeline" }).click();
      const todayRow = page.locator(
        '.od-calendar-timeline-day[data-today="true"]',
      );
      await todayRow.waitFor();
      assert.equal(
        await todayRow.evaluate((row) => {
          const top = row.getBoundingClientRect().top;
          return top >= 0 && top < window.innerHeight / 2;
        }),
        true,
        "the timeline opens at the present",
      );
      assert.equal(await page.evaluate(() => window.loads), 0);
      for (const load of [1, 2, 3]) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForFunction((count) => window.loads === count, load);
        await page.waitForFunction(() => window.scrollY > 200);
      }
      await page.getByRole("button", { name: "Earlier" }).waitFor({
        state: "detached",
      });
      assert.equal(
        await page.locator(".od-calendar-timeline-month").count(),
        4,
        "each month has one heading",
      );
      await todayRow.scrollIntoViewIfNeeded();
      await audit(page, `${name}-timeline`);

      // Text or time that differs between networks gives one tab for each.
      await page.goto(`${pageUrl}#variants`);
      await page.reload();
      await page
        .getByRole("button", { name: "18:30, Reel, Take Me With You, Failed" })
        .click();
      const variants = page.getByRole("dialog", { name: "Take Me With You" });
      assert.equal(await variants.getByRole("tab").count(), 9);
      await variants.getByRole("tab", { name: "X" }).click();
      await variants.getByText("Take Me With You. Out now.").waitFor();
      await audit(page, `${name}-variants`);

      // An empty calendar keeps its frame.
      await page.goto(`${pageUrl}#empty`);
      await page.reload();
      await page.getByRole("heading", { name: "November 2026" }).waitFor();
      assert.equal(await page.locator(".od-calendar-item").count(), 0);
      assert.equal(
        await page.getByText("No posts").isVisible(),
        width === 390,
        "the empty text shows only where the grid does not",
      );
      await audit(page, `${name}-empty`);

      assert.deepEqual(errors, []);
      await context.close();
    }
  }
} finally {
  await browser.close();
  rmSync(directory, { recursive: true, force: true });
}
console.log("Calendar browser checks passed.");
