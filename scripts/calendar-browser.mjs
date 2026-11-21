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
  AccountMenu, ApplicationShell, Avatar, CalendarBoard, CalendarHeader,
  CalendarViewTabs, FilterToolbar, Icon, NavigationLink, PostDetailDialog,
  SearchField, TabPanel, TagFilterBar, calendarTitle, emptyTagFilter,
  shiftCalendarAnchor,
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
      id: month + "-" + day + "-" + time, start: start.toISOString(), title: songs[song][0], color: songs[song][1],
      ...(day % 4 === 0 ? {} : {preview: {src: preview(songs[song][1]), video: kind !== "Image"}}),
      targets: networks.map((network) => ({id: month + "-" + day + time + network, network,
        state: network === failed ? "failed" : past ? "published" : "scheduled"})),
    };
  });
}
const preview = (color) => "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 16"><rect width="9" height="16" fill="' + color + '"/><circle cx="3" cy="5" r="2" fill="#fff8"/></svg>');
const wide = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#52708f"/></svg>');
const channels = all.map((network) => ({id: network, network, label: network}));
function Mark() {
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill="currentColor"/></svg>;
}
function App() {
  const empty = location.hash === "#empty";
  const [mode, setMode] = useState("month");
  const [search, setSearch] = useState("");
  const [anchor, setAnchor] = useState(today);
  const [filter, setFilter] = useState(emptyTagFilter);
  const [earlier, setEarlier] = useState(0);
  const [selected, setSelected] = useState(null);
  const [retried, setRetried] = useState(false);
  const [moved, setMoved] = useState({});
  window.moved = moved;
  const items = useMemo(() => {
    if (empty) return [];
    const base = entries(10, plan.length);
    const older = Array.from({length: earlier}, (_, index) => entries(9 - index, 12)).flat();
    return [...older, ...base].map((item) => moved[item.id] ? {...item, start: moved[item.id]} : item).filter((item) =>
      filter.channels.length === 0 || item.targets.some((target) => filter.channels.includes(target.network)));
  }, [earlier, empty, filter, moved]);
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
    ...(location.hash === "#variants" ? {media: target.network === "x"
      ? [{type: "image", src: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", alt: "Front cover"},
         {type: "image", src: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=#back", alt: "Back cover"}]
      : []} : {}),
  }));
  return (
    <ApplicationShell brandMark={<Mark/>} brandName="Poster" navigationLabel="Main" skipLabel="Skip to content"
      navigation={<>
        <NavigationLink href="#calendar" icon={<Icon name="calendar"/>} label="Calendar" active/>
        <NavigationLink href="#settings" icon={<Icon name="settings"/>} label="Settings"/>
      </>}
      account={<AccountMenu href="#settings" avatar={<Avatar name="Vincent"/>} name="Vincent"/>}>
      <CalendarHeader
        title={mode === "timeline" ? "Timeline" : calendarTitle(mode, anchor, "en-GB")}
        onToday={() => setAnchor(today)}
        {...(mode === "timeline" ? {} : {
          onPrevious: () => setAnchor(shiftCalendarAnchor(mode, anchor, -1)),
          onNext: () => setAnchor(shiftCalendarAnchor(mode, anchor, 1)),
        })}/>
      <FilterToolbar start={<CalendarViewTabs idBase="calendar" value={mode} onChange={setMode}/>}
        end={<SearchField label="Search posts" value={search} onChange={(event) => setSearch(event.currentTarget.value)}/>}>
        <TagFilterBar channels={channels} tags={["short","long","take-me-with-you","paper-lanterns","low-tide"]}
          tagColors={{short: 8, long: 3, "take-me-with-you": 1, "paper-lanterns": 5, "low-tide": 7}} value={filter} onChange={setFilter}/>
      </FilterToolbar>
      <TabPanel idBase="calendar" id={mode}>
        <CalendarBoard mode={mode} anchor={anchor} today={today} items={items} locale="en-GB" now={new Date(2026, 10, 14, 13, 20)}
          onSelect={(item) => { setRetried(false); setSelected(item); }}
          canMove={(item) => item.targets.every((target) => target.state === "scheduled")}
          onMove={(item, start) => setMoved((current) => ({...current, [item.id]: start}))}
          hasEarlier={!empty && earlier < 3} onLoadEarlier={() => setEarlier((value) => Math.min(3, value + 1))}/>
      </TabPanel>
      <PostDetailDialog open={selected !== null} onClose={() => setSelected(null)}
        title={selected?.title ?? ""} tags={["take-me-with-you","reel"]}
        media={{type: "video", src: "about:blank", duration: "4:18", poster: wide}} targets={targets}
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

/**
 * In a header, the text of each control is on the baseline of the title, and
 * an icon button has the same middle as the text button next to it.
 */
async function baselines(page, name) {
  const result = await page.evaluate(() => {
    // A zero-size inline box sits on the baseline of its line. The wrapper
    // keeps the line when the element is a flex container.
    const baseline = (element) => {
      const line = document.createElement("span");
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0";
      line.append(probe);
      element.append(line);
      const value = probe.getBoundingClientRect().bottom;
      line.remove();
      return value;
    };
    const header = document.querySelector(".od-calendar-header");
    const title = header.querySelector("h1");
    const today = header.querySelector(
      ".od-calendar-header-navigation .od-button",
    );
    const arrow = header.querySelector(".od-icon-button");
    const middle = (element) => {
      const box = element.getBoundingClientRect();
      return box.top + box.height / 2;
    };
    return {
      title: baseline(title),
      today: baseline(today),
      arrow: arrow === null ? null : middle(arrow) - middle(today),
    };
  });
  assert.ok(
    Math.abs(result.title - result.today) <= 1.5,
    `${name}: ${JSON.stringify(result)}`,
  );
  if (result.arrow !== null) {
    assert.ok(
      Math.abs(result.arrow) <= 1,
      `${name}: ${JSON.stringify(result)}`,
    );
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
        name: "18:30, Take Me With You, Failed",
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
      // The days before today have the hatch of the past. Today has not.
      const pastDays = page.locator('.od-calendar-day[data-past="true"]');
      assert.equal(await pastDays.count(), 19);
      assert.equal(
        await page
          .locator('.od-calendar-day[data-today="true"]')
          .getAttribute("data-past"),
        "false",
      );
      if (width !== 390) {
        assert.match(
          await pastDays
            .first()
            .evaluate((day) => getComputedStyle(day).backgroundImage),
          /repeating-linear-gradient/,
        );
      }
      await baselines(page, `${name} month`);
      // The network marks follow the time in the first block of the card,
      // on its line when the card has the room.
      assert.equal(
        await failed.evaluate(
          (card) =>
            card.querySelector("time").nextElementSibling.className ===
            "od-calendar-item-networks",
        ),
        true,
      );
      assert.equal(await page.locator(".od-calendar-item-kind").count(), 0);
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
          (group) => getComputedStyle(group, "::before").borderLeftStyle,
        ),
        "solid",
        "a line separates the tags from the channels",
      );
      // The tag logic starts with OR.
      const logic = page.getByRole("group", { name: "Tag logic" });
      assert.equal(
        await logic
          .getByRole("button", { name: "OR" })
          .getAttribute("aria-pressed"),
        "true",
      );
      await logic.getByRole("button", { name: "AND" }).click();
      assert.equal(
        await logic
          .getByRole("button", { name: "AND" })
          .getAttribute("aria-pressed"),
        "true",
      );
      // The search is at the right end of the toolbar, after the filters.
      const toolbar = await page.evaluate(() => {
        const box = (selector) =>
          document.querySelector(selector).getBoundingClientRect();
        return {
          tabs: box(".od-filter-toolbar-tabs"),
          tags: box(".od-tag-filter"),
          search: box(".od-filter-toolbar-search"),
          bar: box(".od-filter-toolbar"),
        };
      });
      assert.ok(
        Math.abs(toolbar.search.right - toolbar.bar.right) <= 1,
        `${name}: ${JSON.stringify(toolbar)}`,
      );
      assert.ok(
        toolbar.search.width <= 13 * 16 + 1 || toolbar.bar.width <= 60 * 16,
      );
      assert.ok(
        toolbar.tabs.top >= toolbar.search.bottom - 1 ||
          toolbar.tabs.right <= toolbar.tags.left,
        "the tabs are left of the filters or below them",
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
      // A wide video keeps its proportions and gets a wider column.
      const tile = details.locator('.od-post-detail-media[data-wide="true"]');
      await tile.waitFor();
      const tileBox = await tile.boundingBox();
      assert.ok(
        Math.abs(tileBox.width / tileBox.height - 16 / 9) < 0.03,
        JSON.stringify(tileBox),
      );
      if (width !== 390)
        assert.ok(tileBox.width > 300, JSON.stringify(tileBox));
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
      const views = page.getByRole("tablist", { name: "View" });
      await views.getByRole("tab", { name: "Week" }).click();
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
        // The past of the week is hatched to the present: 13:20 is two thirds
        // of the half hour that starts at 13:00, in the column of today.
        const rows = page.locator(".od-calendar-week tbody tr");
        const todayCell = (slot) => rows.nth(slot).locator("td").nth(5);
        assert.equal(await todayCell(25).getAttribute("data-past"), "true");
        assert.equal(await todayCell(26).getAttribute("data-now"), "true");
        assert.equal(await todayCell(26).getAttribute("data-past"), "false");
        assert.equal(await todayCell(27).getAttribute("data-past"), "false");
        assert.equal(
          await rows.nth(40).locator("td").nth(4).getAttribute("data-past"),
          "true",
          "a day before today is in the past for all hours",
        );
        assert.equal(
          await rows.nth(2).locator("td").nth(6).getAttribute("data-past"),
          "false",
        );
        const nowLine = await todayCell(26).evaluate((cell) => {
          // The percentage is of the cell without its border.
          const box = { height: cell.clientHeight };
          const hatch = getComputedStyle(cell, "::before");
          const line = getComputedStyle(cell, "::after");
          return {
            height: box.height,
            hatch: Number.parseFloat(hatch.height),
            line: Number.parseFloat(line.top),
          };
        });
        assert.ok(
          Math.abs(nowLine.hatch / nowLine.height - 2 / 3) < 0.03 &&
            Math.abs(nowLine.line / nowLine.height - 2 / 3) < 0.03,
          JSON.stringify(nowLine),
        );
        assert.equal(await page.locator('[data-now="true"]').count(), 1);
        // The preview is square and hides before the title has no room.
        const previews = page.locator(
          ".od-calendar-week .od-calendar-item-preview:visible",
        );
        if (width === 1440) {
          const box = await previews.first().boundingBox();
          assert.equal(box.width, box.height);
          assert.ok(box.width >= 32);
        } else {
          assert.equal(
            await previews.count(),
            0,
            "no preview in a narrow column",
          );
        }
        assert.equal(
          await page
            .locator(".od-calendar-week .od-calendar-item")
            .evaluateAll((cards) =>
              cards.every((card) => {
                const title = card.querySelector(".od-calendar-item-title");
                return title.getBoundingClientRect().width >= 60;
              }),
            ),
          true,
          "each title keeps room",
        );
      }
      await baselines(page, `${name} week`);
      await audit(page, `${name}-week`);

      // The timeline opens at the present and loads earlier days on demand.
      await views.getByRole("tab", { name: "Timeline" }).click();
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
      if (width !== 390) {
        assert.equal(
          await page
            .locator(".od-calendar-timeline .od-calendar-item")
            .first()
            .evaluate((card) => {
              const time = card.querySelector("time").getBoundingClientRect();
              const mark = card
                .querySelector(".od-calendar-item-network")
                .getBoundingClientRect();
              return (
                Math.abs(
                  time.top + time.height / 2 - (mark.top + mark.height / 2),
                ) <= 3
              );
            }),
          true,
          "in a row, the marks are on the line of the time",
        );
        assert.equal(
          await page
            .locator(".od-calendar-timeline .od-calendar-item")
            .first()
            .evaluate((card) => {
              const time = card.querySelector("time").getBoundingClientRect();
              const title = card
                .querySelector(".od-calendar-item-title")
                .getBoundingClientRect();
              const networks = card
                .querySelector(".od-calendar-item-networks")
                .getBoundingClientRect();
              return (
                title.left >= time.right - 1 && networks.left >= title.right - 1
              );
            }),
          true,
          "in a row, the title is between the time and the networks",
        );
      }
      await todayRow.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, 0));
      await baselines(page, `${name} timeline`);
      await todayRow.scrollIntoViewIfNeeded();
      await audit(page, `${name}-timeline`);

      // Each version of the text and media has one tab with its networks.
      await page.goto(`${pageUrl}#variants`);
      await page.reload();
      await page
        .getByRole("button", { name: "18:30, Take Me With You, Failed" })
        .click();
      const variants = page.getByRole("dialog", { name: "Take Me With You" });
      assert.equal(await variants.getByRole("tab").count(), 2);
      await variants.getByRole("tab", { name: "X" }).click();
      await variants.getByText("Take Me With You. Out now.").waitFor();
      await variants.getByRole("img", { name: "Front cover" }).waitFor();
      assert.equal(
        await variants
          .getByRole("button", { name: "Previous image" })
          .isDisabled(),
        true,
      );
      const nextImage = variants.getByRole("button", { name: "Next image" });
      await nextImage.focus();
      await page.keyboard.press("Enter");
      await variants.getByRole("img", { name: "Back cover" }).waitFor();
      assert.equal(await nextImage.isDisabled(), true);
      assert.equal(await variants.getByRole("status").textContent(), "2 / 2");
      await variants.getByRole("tab", { name: "Instagram" }).click();
      assert.equal(await variants.locator(".od-post-detail-media").count(), 0);
      await variants.getByRole("tab", { name: "X" }).click();
      await variants.getByRole("img", { name: "Front cover" }).waitFor();
      assert.equal(await variants.getByRole("status").textContent(), "1 / 2");
      assert.equal(
        await variants
          .getByRole("img", { name: "Front cover" })
          .evaluate((image) => getComputedStyle(image).objectFit),
        "contain",
      );
      await audit(page, `${name}-variants`);

      if (width === 1440 && colorScheme === "light") {
        await page.goto(`${pageUrl}#drag`);
        await page.reload();
        await page.getByRole("heading", { name: "November 2026" }).waitFor();
        const begin = async (source) => {
          const transfer = await page.evaluateHandle(() => new DataTransfer());
          await source.dispatchEvent("dragstart", { dataTransfer: transfer });
          await page.locator('.od-calendar[data-dragging="true"]').waitFor();
          return transfer;
        };
        const destination = (day) =>
          page.locator(".od-calendar-day").filter({
            has: page.locator(`time[datetime="${day}"]`),
          });
        const future = page.getByRole("button", {
          name: "15:00, Low Tide, Scheduled",
          exact: true,
        });
        assert.equal(await future.getAttribute("draggable"), "true");
        assert.equal(
          await page
            .getByRole("button", {
              name: "18:30, Take Me With You, Failed",
              exact: true,
            })
            .getAttribute("draggable"),
          null,
        );
        const transfer = await begin(future);
        const past = destination("2026-11-13");
        const nextDay = destination("2026-11-21");
        assert.equal(await past.getAttribute("data-drop-target"), "false");
        assert.equal(await nextDay.getAttribute("data-drop-target"), "true");
        await nextDay.dispatchEvent("dragover", { dataTransfer: transfer });
        assert.equal(await nextDay.getAttribute("data-drop-active"), "true");
        assert.equal(await nextDay.getAttribute("data-drop-label"), "15:00");
        await nextDay.dispatchEvent("drop", { dataTransfer: transfer });
        await page.waitForFunction(
          () => window.moved["10-16-15:00"] !== undefined,
        );
        assert.equal(
          await page.evaluate(() =>
            new Date(window.moved["10-16-15:00"]).getDate(),
          ),
          21,
        );
        assert.equal(
          await nextDay.locator(".od-calendar-item time").textContent(),
          "15:00",
        );
        assert.equal(
          await page.locator('[data-drop-active="true"]').count(),
          0,
        );
        assert.equal(await page.getByRole("dialog").count(), 0);

        const earlyToday = page
          .getByRole("button", {
            name: "12:30, Low Tide, Scheduled",
            exact: true,
          })
          .first();
        const immediate = await begin(earlyToday);
        await destination("2026-11-14").dispatchEvent("drop", {
          dataTransfer: immediate,
        });
        await page.waitForFunction(
          () => window.moved["10-18-12:30"] !== undefined,
        );
        assert.equal(
          await page.evaluate(() => window.moved["10-18-12:30"]),
          new Date("2026-11-14T13:20:00+01:00").toISOString(),
        );

        await page
          .getByRole("tablist", { name: "View" })
          .getByRole("tab", { name: "Week", exact: true })
          .click();
        const weekSource = page
          .locator('.od-calendar-week .od-calendar-item[draggable="true"]')
          .filter({
            has: page.locator('time[datetime="2026-11-14T17:30:00.000Z"]'),
          });
        const weekTransfer = await begin(weekSource);
        const rows = page.locator(".od-calendar-week tbody tr");
        const oldSlot = rows.nth(25).locator("td").nth(5);
        const slot = rows.nth(31).locator("td").nth(6);
        assert.equal(await oldSlot.getAttribute("data-drop-target"), "false");
        await slot.dispatchEvent("dragover", { dataTransfer: weekTransfer });
        assert.equal(await slot.getAttribute("data-drop-active"), "true");
        assert.equal(await slot.getAttribute("data-drop-label"), "15:30");
        await slot.dispatchEvent("drop", { dataTransfer: weekTransfer });
        await page.waitForFunction(
          () => window.moved["10-14-18:30"] !== undefined,
        );
        assert.equal(
          await page.evaluate(() => window.moved["10-14-18:30"]),
          new Date("2026-11-15T15:30:00+01:00").toISOString(),
        );
        assert.equal(
          await slot.locator(".od-calendar-item time").textContent(),
          "15:30",
        );
        await audit(page, "calendar-drag-targets");
      }

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
