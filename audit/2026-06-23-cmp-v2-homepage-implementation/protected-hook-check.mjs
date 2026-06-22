import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname);
const publicPagesPath = path.join(repoRoot, "public-pages.js");
const landingCssPath = path.join(repoRoot, "landing.css");
const assetDir = path.join(repoRoot, "assets/generated/public-homepage-v2");
const reportPath = path.join(
  repoRoot,
  "audit/2026-06-23-cmp-v2-homepage-implementation/protected-hook-report.json"
);

const publicPages = fs.readFileSync(publicPagesPath, "utf8");
const landingCss = fs.readFileSync(landingCssPath, "utf8");

const requiredSubstrings = [
  ["primary CTA href", 'href="add-property.html"'],
  ["service CTA href", 'href="services.html"'],
  ["guided demo href", 'href="dashboard-labs.html?demo=nick"'],
  ["My Properties route", "my-properties.html"],
  ["home postcode form id", 'id="homePostcodeForm"'],
  ["home postcode input id", 'id="homePostcodeInput"'],
  ["postcode input name", 'name="postcode"'],
  ["postcode storage key", 'sessionStorage.setItem(HOME_POSTCODE_KEY, postcode)'],
  ["Add Property postcode handoff", "add-property.html?postcode="],
  ["assistant toggle hook", "data-toggle-assistant"],
  ["article open hook", "data-open-article"],
  ["canonical handoff hook", "data-canonical-handoff"],
  ["service continue hook", "data-continue-service"],
  ["service skip hook", "data-skip-service"],
  ["service properties hook", "data-service-properties"],
  ["question input hook", "data-question-input"],
  ["question choice hook", "data-question-choice"],
  ["question upload hook", "data-question-upload"],
  ["intent hook", "data-intent"],
  ["focus hook", "data-focus"],
  ["tenanted hook", "data-tenanted"],
  ["view property hook", "data-view-property"],
  ["news filter hook", "data-news-filter"],
  ["legal advice boundary", "not legal advice"],
  ["supplier boundary", "no supplier contacted"]
];

const expectedAssetFiles = [
  "uk-rental-exterior-detail.png",
  "property-evidence-desk.png",
  "human-support-review.png",
  "CMP_V2_IMAGE_PROVENANCE.md"
];

const checks = [];

for (const [name, needle] of requiredSubstrings) {
  const haystack = name.includes("legal") || name.includes("supplier")
    ? publicPages.toLowerCase()
    : publicPages;
  const expected = name.includes("legal") || name.includes("supplier")
    ? needle.toLowerCase()
    : needle;
  checks.push({
    name,
    status: haystack.includes(expected) ? "pass" : "fail",
    detail: needle
  });
}

checks.push({
  name: "V2 homepage renderer marker",
  status: publicPages.includes("cmp-v2-homepage") ? "pass" : "fail",
  detail: "renderHomepage uses the selected hybrid V2 homepage shell"
});

checks.push({
  name: "V2 CSS layer marker",
  status: landingCss.includes("CMP selected public hybrid V2 homepage implementation")
    ? "pass"
    : "fail",
  detail: "landing.css contains the final homepage-only V2 implementation layer"
});

for (const filename of expectedAssetFiles) {
  checks.push({
    name: `V2 copied asset: ${filename}`,
    status: fs.existsSync(path.join(assetDir, filename)) ? "pass" : "fail",
    detail: `assets/generated/public-homepage-v2/${filename}`
  });
}

const forbiddenProductionPatterns = [
  ["core import", /from\s+["']\.\/core\//],
  ["Supabase import", /supabase/i],
  ["dashboard labs write", /dashboard-labs\.js|dashboard-labs\.css/],
  ["service storage key mutation", /SERVICE_DRAFT_PREFIX\s*=/],
  ["workspace storage key mutation", /WORKSPACE_STORAGE_KEY\s*=/]
];

for (const [name, pattern] of forbiddenProductionPatterns) {
  checks.push({
    name: `Forbidden homepage implementation change: ${name}`,
    status: pattern.test(publicPages.slice(publicPages.indexOf("function renderHomepage"), publicPages.indexOf("function renderArticleCard"))) ? "fail" : "pass",
    detail: String(pattern)
  });
}

const failures = checks.filter((check) => check.status !== "pass");
const report = {
  generatedAt: new Date().toISOString(),
  publicPagesPath,
  landingCssPath,
  assetDir,
  total: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  checks
};

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (failures.length) {
  console.error(`Protected hook check failed: ${failures.length}/${checks.length} checks failed.`);
  for (const failure of failures) {
    console.error(`- ${failure.name}: ${failure.detail}`);
  }
  process.exit(1);
}

console.log(`Protected hook check passed: ${checks.length}/${checks.length} checks passed.`);
