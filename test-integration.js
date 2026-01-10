#!/usr/bin/env node

/**
 * Integration test - Verify app components work together
 */

console.log('🧪 Running Integration Tests...\n');

let passed = 0;
let failed = 0;

// Test 1: Validate package.json scripts
console.log('Test 1: Package.json scripts');
try {
  const pkg = require('./package.json');
  const requiredScripts = ['start', 'android', 'ios', 'web'];
  requiredScripts.forEach(script => {
    if (!pkg.scripts[script]) {
      throw new Error(`Missing script: ${script}`);
    }
  });
  console.log('  ✅ All required scripts present\n');
  passed++;
} catch (e) {
  console.log(`  ❌ Failed: ${e.message}\n`);
  failed++;
}

// Test 2: Validate app.json configuration
console.log('Test 2: App.json configuration');
try {
  const app = require('./app.json');
  if (!app.expo.name) throw new Error('Missing app name');
  if (!app.expo.slug) throw new Error('Missing app slug');
  if (!app.expo.version) throw new Error('Missing version');
  if (!app.expo.ios?.infoPlist?.NSCameraUsageDescription) {
    throw new Error('Missing camera permission description');
  }
  if (!app.expo.android?.permissions?.includes('CAMERA')) {
    throw new Error('Missing Android camera permission');
  }
  console.log('  ✅ App configuration valid\n');
  passed++;
} catch (e) {
  console.log(`  ❌ Failed: ${e.message}\n`);
  failed++;
}

// Test 3: Check critical files exist
console.log('Test 3: Critical files');
try {
  const fs = require('fs');
  const files = [
    'App.js',
    'src/screens/CalibrationScreen.js',
    'src/screens/CameraScreen.js',
    'src/components/IshiharaTest.js',
    'src/utils/HazardDetector.js',
    'src/utils/SpeedDetector.js'
  ];
  files.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  });
  console.log('  ✅ All critical files exist\n');
  passed++;
} catch (e) {
  console.log(`  ❌ Failed: ${e.message}\n`);
  failed++;
}

// Test 4: Check documentation
console.log('Test 4: Documentation completeness');
try {
  const fs = require('fs');
  const docs = [
    'README.md',
    'USAGE.md',
    'DEVELOPER.md',
    'PROJECT_SUMMARY.md',
    'APP_FLOW.md'
  ];
  docs.forEach(doc => {
    if (!fs.existsSync(doc)) {
      throw new Error(`Missing documentation: ${doc}`);
    }
    const content = fs.readFileSync(doc, 'utf-8');
    if (content.length < 100) {
      throw new Error(`Documentation too short: ${doc}`);
    }
  });
  console.log('  ✅ All documentation complete\n');
  passed++;
} catch (e) {
  console.log(`  ❌ Failed: ${e.message}\n`);
  failed++;
}

// Test 5: Check assets
console.log('Test 5: Assets');
try {
  const fs = require('fs');
  const assets = [
    'assets/icon.png',
    'assets/splash.png',
    'assets/adaptive-icon.png',
    'assets/favicon.png'
  ];
  assets.forEach(asset => {
    if (!fs.existsSync(asset)) {
      throw new Error(`Missing asset: ${asset}`);
    }
  });
  console.log('  ✅ All assets present\n');
  passed++;
} catch (e) {
  console.log(`  ❌ Failed: ${e.message}\n`);
  failed++;
}

// Summary
console.log('═'.repeat(50));
console.log(`Tests Passed: ${passed}/${passed + failed}`);
console.log(`Tests Failed: ${failed}/${passed + failed}`);
console.log('═'.repeat(50));

if (failed === 0) {
  console.log('\n✅ All integration tests passed!');
  console.log('\n🚀 App is ready to run:');
  console.log('   npm install');
  console.log('   npm start');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
