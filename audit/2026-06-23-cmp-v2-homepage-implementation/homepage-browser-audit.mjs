import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const auditDir = path.join(repoRoot, "audit/2026-06-23-cmp-v2-homepage-implementation");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const afterUrl = "http://127.0.0.1:4173/index.html";
const protectedRef = "visual/cmp-wix-public-alignment-v1";
const port = 9223;

const viewports = [
  { name: "desktop", width: 1440, height: 1000, deviceScaleFactor: 1, isMobile: false },
  { name: "tablet", width: 1024, height: 900, deviceScaleFactor: 1, isMobile: false },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
];

function writeBeforeSite() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-v2-before-site-"));
  for (const file of ["index.html", "landing.css", "public-pages.js", "journey-context.js"]) {
    const content = execFileSync("git", ["show", `${protectedRef}:${file}`], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    fs.writeFileSync(path.join(tempDir, file), content);
  }
  fs.symlinkSync(path.join(repoRoot, "assets"), path.join(tempDir, "assets"), "dir");
  return `file://${path.join(tempDir, "index.html")}`;
}

async function waitForChrome() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  throw new Error("Timed out waiting for Chrome DevTools endpoint.");
}

async function openTarget(url) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT"
  });
  if (!res.ok) throw new Error(`Unable to create Chrome target: ${res.status}`);
  return res.json();
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }
    const callbacks = listeners.get(message.method) || [];
    for (const callback of callbacks) callback(message.params || {});
  });

  return {
    ready: new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    }),
    send(method, params = {}) {
      const commandId = ++id;
      ws.send(JSON.stringify({ id: commandId, method, params }));
      return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject }));
    },
    once(method) {
      return new Promise((resolve) => {
        const callback = (params) => {
          listeners.set(method, (listeners.get(method) || []).filter((item) => item !== callback));
          resolve(params);
        };
        listeners.set(method, [...(listeners.get(method) || []), callback]);
      });
    },
    close() {
      ws.close();
    }
  };
}

async function navigate(client, url, viewport, reducedMotion = false) {
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.isMobile,
    screenWidth: viewport.width,
    screenHeight: viewport.height
  });
  await client.send("Emulation.setEmulatedMedia", {
    features: reducedMotion ? [{ name: "prefers-reduced-motion", value: "reduce" }] : []
  });
  const loaded = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 850));
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return result.result?.value;
}

async function capture(client, outputPath) {
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true
  });
  fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
}

const browserChecksExpression = `(() => {
  function visible(el) {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }
  function parseRgb(value) {
    const match = value.match(/rgba?\\(([^)]+)\\)/);
    if (!match) return [255, 255, 255, 1];
    const parts = match[1].split(",").map((part) => Number(part.trim()));
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  }
  function effectiveBg(el) {
    let node = el;
    while (node && node.nodeType === 1) {
      const rgba = parseRgb(getComputedStyle(node).backgroundColor);
      if (rgba[3] > 0.2) return rgba;
      node = node.parentElement;
    }
    return [255, 255, 255, 1];
  }
  function luminance(rgb) {
    const [r, g, b] = rgb.slice(0, 3).map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(fg, bg) {
    const a = luminance(fg);
    const b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  const root = document.documentElement;
  const body = document.body;
  const primaryCta = document.querySelector('.cmp-v2-hero a[href="add-property.html"]');
  const ctaRect = primaryCta?.getBoundingClientRect();
  const firstViewportControls = [...document.querySelectorAll('a, button, input, summary')]
    .filter((el) => visible(el) && el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0);
  const shortTargets = firstViewportControls
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        label: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || el.tagName).trim().replace(/\\s+/g, ' ').slice(0, 80),
        tag: el.tagName.toLowerCase(),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    })
    .filter((item) => item.width < 44 || item.height < 44);
  const contrastSelectors = [
    ['hero h1', '.cmp-v2-hero h1', 3],
    ['hero body copy', '.cmp-v2-hero-copy > p', 4.5],
    ['primary CTA', '.cmp-v2-hero .cmp-v2-button-primary', 4.5],
    ['principle strip', '.cmp-v2-principles span', 4.5],
    ['dark human copy', '.cmp-v2-human p', 4.5]
  ];
  const contrastChecks = contrastSelectors.map(([name, selector, minimum]) => {
    const el = document.querySelector(selector);
    if (!el) return { name, selector, ratio: 0, minimum, status: 'fail', reason: 'missing' };
    const style = getComputedStyle(el);
    const ratio = contrast(parseRgb(style.color), effectiveBg(el));
    return { name, selector, ratio: Number(ratio.toFixed(2)), minimum, status: ratio >= minimum ? 'pass' : 'fail' };
  });
  const heroButton = document.querySelector('.cmp-v2-hero .cmp-v2-button-primary');
  const reducedMotionTransition = heroButton ? getComputedStyle(heroButton).transitionDuration : '';
  return {
    url: location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    scrollWidth: root.scrollWidth,
    bodyScrollWidth: body.scrollWidth,
    noHorizontalOverflow: Math.max(root.scrollWidth, body.scrollWidth) <= window.innerWidth + 1,
    primaryCtaVisibleFirstViewport: !!ctaRect && ctaRect.top >= 0 && ctaRect.left >= 0 && ctaRect.bottom <= window.innerHeight && ctaRect.right <= window.innerWidth,
    primaryCtaRect: ctaRect ? { top: Math.round(ctaRect.top), bottom: Math.round(ctaRect.bottom), width: Math.round(ctaRect.width), height: Math.round(ctaRect.height) } : null,
    firstViewportTapTargets: {
      total: firstViewportControls.length,
      below44: shortTargets,
      status: shortTargets.length === 0 ? 'pass' : 'review'
    },
    reducedMotionTransition,
    contrastChecks,
    contrastStatus: contrastChecks.every((check) => check.status === 'pass') ? 'pass' : 'fail'
  };
})()`;

async function run() {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found at ${chromePath}`);
  const beforeUrl = writeBeforeSite();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-v2-chrome-"));
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--disable-gpu",
    "--hide-scrollbars",
    "about:blank"
  ], { stdio: "ignore" });

  try {
    await waitForChrome();
    const report = {
      generatedAt: new Date().toISOString(),
      afterUrl,
      beforeUrl,
      screenshots: [],
      checks: []
    };

    for (const variant of ["before", "after"]) {
      const url = variant === "before" ? beforeUrl : afterUrl;
      for (const viewport of viewports) {
        const target = await openTarget("about:blank");
        const client = connect(target.webSocketDebuggerUrl);
        await client.ready;
        await navigate(client, url, viewport);
        const screenshotName = `${variant}-${viewport.name}-${viewport.width}x${viewport.height}.png`;
        await capture(client, path.join(auditDir, screenshotName));
        report.screenshots.push({ variant, viewport: viewport.name, width: viewport.width, height: viewport.height, file: screenshotName });
        if (variant === "after") {
          const check = await evaluate(client, browserChecksExpression);
          report.checks.push({ viewport: viewport.name, ...check });
        }
        client.close();
      }
    }

    const target = await openTarget("about:blank");
    const client = connect(target.webSocketDebuggerUrl);
    await client.ready;
    await navigate(client, afterUrl, viewports[2], true);
    const reduced = await evaluate(client, browserChecksExpression);
    report.reducedMotion = {
      viewport: "mobile",
      transitionDuration: reduced.reducedMotionTransition,
      status: /0\\.01ms|0s|1e-05s/.test(reduced.reducedMotionTransition) ? "pass" : "review"
    };
    client.close();

    report.overallStatus = report.checks.every((check) =>
      check.noHorizontalOverflow &&
      check.primaryCtaVisibleFirstViewport &&
      check.firstViewportTapTargets.status === "pass" &&
      check.contrastStatus === "pass"
    ) && report.reducedMotion.status === "pass" ? "pass" : "review";

    fs.writeFileSync(
      path.join(auditDir, "browser-validation-report.json"),
      `${JSON.stringify(report, null, 2)}\n`
    );
    console.log(`Browser audit ${report.overallStatus}. Screenshots and report written to ${auditDir}`);
    if (report.overallStatus !== "pass") process.exitCode = 1;
  } finally {
    chrome.kill("SIGTERM");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
