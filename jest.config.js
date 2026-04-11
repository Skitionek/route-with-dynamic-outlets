const fs = require('fs');
const path = require('path');

// Resolve the zone.js testing module path for cross-version compatibility.
//
// Resolution priority (first match wins):
//   1. zone.js >= 0.12: use the 'zone.js/testing' package export (ESM).
//   2. zone.js 0.11.x: use fesm2015/zone-testing.js (ESM-compatible, no export map).
//   3. zone.js 0.10.x: fall back to dist/zone-testing.js (UMD, last resort).
const zoneRoot = path.join(__dirname, 'node_modules/zone.js');
const zoneJsPackage = JSON.parse(
  fs.readFileSync(path.join(zoneRoot, 'package.json'), 'utf8')
);
const zoneTestingExport = (zoneJsPackage.exports ?? {})['./testing'];
let zoneTestingPath;
if (zoneTestingExport) {
  // zone.js >= 0.12 – use the entry from the exports map (ESM by default).
  const rel =
    typeof zoneTestingExport === 'string'
      ? zoneTestingExport
      : zoneTestingExport.default ?? zoneTestingExport.require;
  zoneTestingPath = path.join(zoneRoot, rel);
} else if (fs.existsSync(path.join(zoneRoot, 'fesm2015/zone-testing.js'))) {
  // zone.js 0.11.x – fesm2015 bundle present but not in exports map.
  zoneTestingPath = path.join(zoneRoot, 'fesm2015/zone-testing.js');
} else {
  // zone.js 0.10.x – only the UMD dist bundle is available.
  zoneTestingPath = path.join(zoneRoot, 'dist/zone-testing.js');
}

// Use the ESM preset when available (jest-preset-angular >= 12 / Angular 14+).
// Fall back to the classic preset for older versions.
let presetConfig = {};
try {
  const { createEsmPreset } = require('jest-preset-angular/presets');
  presetConfig = createEsmPreset();
} catch {
  // jest-preset-angular < 12 doesn't expose createEsmPreset; the 'preset' key below handles it.
}

module.exports = {
  preset: 'jest-preset-angular',
  ...presetConfig,
  testMatch: ['**/test/**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!tslib|rxjs)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    ...(presetConfig.moduleNameMapper ?? {}),
    '^zone\\.js/testing$': zoneTestingPath,
  },
};
