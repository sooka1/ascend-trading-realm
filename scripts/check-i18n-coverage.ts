#!/usr/bin/env bun
import { runI18nCoverage, formatCoverage } from "../src/lib/i18n-coverage";

const reports = runI18nCoverage();
const { ok, output } = formatCoverage(reports);
console.log(output);
console.log(ok ? "\n✅ All translation keys covered." : "\n❌ Missing translation keys detected.");
process.exit(ok ? 0 : 1);