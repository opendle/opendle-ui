import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileNavigation } from "../dist/index.js";

test("MobileNavigation keeps buttons and supplies current-page native destinations", () => {
  const markup = renderToStaticMarkup(
    React.createElement(MobileNavigation, {
      "aria-label": "Phone destinations",
      items: [
        {
          id: "home",
          label: "Home",
          icon: "H",
          href: "/home",
          active: true,
          badge: 2,
        },
        { id: "help", label: "Help", icon: "?" },
      ],
      onSelect: () => undefined,
    }),
  );
  assert.match(
    markup,
    /<a[^>]*href="\/home"[^>]*aria-current="page"[^>]*data-active="true"/,
  );
  assert.match(markup, /<button[^>]*aria-label="Help"/);
  assert.doesNotMatch(markup, /<dialog/);
  assert.doesNotMatch(markup, /badge=/);
});

test("the optional surface starts closed with an identified dialog trigger", () => {
  const markup = renderToStaticMarkup(
    React.createElement(MobileNavigation, {
      items: [],
      surface: {
        label: "Destinations",
        icon: "Menu",
        applicationName: "Example",
        context: { label: "Administrator", value: "Example user" },
        accountActions: null,
        closeLabel: "Close",
        items: [],
      },
    }),
  );
  assert.match(
    markup,
    /aria-controls="[^"]+" aria-expanded="false" aria-haspopup="dialog"/,
  );
  assert.doesNotMatch(markup, /<dialog/);
  assert.doesNotMatch(markup, /<dialog[^>]* open/);
});

test("built public types accept legacy buttons and optional native surface navigation", async () => {
  const { default: ts } = await import("typescript");
  const { fileURLToPath } = await import("node:url");
  const file = fileURLToPath(
    new URL("../mobile-navigation-contract-fixture.mts", import.meta.url),
  );
  const source = `
import {type MobileNavigationItem, type MobileNavigationDestination, type MobileNavigationSurface, type MobileNavigationProps, type DialogProps} from './dist/index.js';
const legacy: MobileNavigationItem = {id:'action',label:'Action',icon:null};
const buttonProps: MobileNavigationProps = {items:[legacy],onSelect:id => id.toUpperCase()};
const destination: MobileNavigationDestination = {...legacy,href:'/home',active:true};
const surface: MobileNavigationSurface = {label:'Destinations',icon:null,applicationName:'Example',context:{label:'Administrator',value:'Example user'},accountActions:null,closeLabel:'Close',items:[destination]};
const links: MobileNavigationProps = {items:[destination],surface,onNavigate:(item,event) => {item.href.toUpperCase();event.preventDefault();event.currentTarget.href;}};
const native: MobileNavigationProps = {items:[destination]};
const dialog: DialogProps = {open:false,title:'Example',children:null,onClose:()=>{},restoreFocusOnClose:false};
// @ts-expect-error Surface destinations require native URLs.
const missingHref: MobileNavigationDestination = legacy;
// @ts-expect-error Context cannot contain interactive React children.
const interactive: MobileNavigationSurface['context'] = {label:'Administrator',value: {type:'button'}};
void [buttonProps,links,native,dialog];`;
  const options = {
    strict: true,
    exactOptionalPropertyTypes: true,
    noEmit: true,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile;
  host.getSourceFile = (name, languageVersion, onError, newFile) =>
    name === file
      ? ts.createSourceFile(name, source, languageVersion)
      : read(name, languageVersion, onError, newFile);
  const program = ts.createProgram([file], options, host);
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      ),
    [],
  );
});
