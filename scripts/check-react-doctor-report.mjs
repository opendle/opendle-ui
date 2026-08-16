import console from "node:console";
import { readFileSync } from "node:fs";
import process from "node:process";

const reportPath = process.argv[2];
if (reportPath === undefined) {
  console.error("A React Doctor JSON report is required.");
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
const projects = Array.isArray(report.projects) ? report.projects : [];
const diagnostics = projects.flatMap((project) => project.diagnostics ?? []);
const scores = projects.map((project) => project.score?.score);

if (
  projects.length !== 1 ||
  diagnostics.length !== 0 ||
  scores.length !== 1 ||
  scores.some((score) => score !== 100) ||
  report.summary?.totalDiagnosticCount !== 0
) {
  console.error(
    `React Doctor scores ${JSON.stringify(scores)} with ${String(diagnostics.length)} diagnostics.`,
  );
  process.exit(1);
}

console.log("React Doctor has score 100 and zero diagnostics.");
