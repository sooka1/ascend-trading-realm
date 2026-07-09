import { runI18nCoverage, formatCoverage } from './src/lib/i18n-coverage.ts';
const r = runI18nCoverage();
const { output } = formatCoverage(r);
console.log(output);
