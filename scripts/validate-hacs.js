#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating HACS Compatibility...\n');

let errors = 0;
let warnings = 0;

function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${description}: ${filePath}`);
      return true;
    } else {
      console.log(`❌ ${description}: ${filePath} - NOT FOUND`);
      errors++;
      return false;
    }
  } catch (err) {
    console.log(`❌ ${description}: ${filePath} - ERROR: ${err.message}`);
    errors++;
    return false;
  }
}

function checkJson(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    console.log(`✅ ${description}: ${filePath} - Valid JSON`);
    return json;
  } catch (err) {
    console.log(`❌ ${description}: ${filePath} - JSON ERROR: ${err.message}`);
    errors++;
    return null;
  }
}

function checkHacsJson(json) {
  const required = ['name', 'rendering'];
  const optional = ['description', 'version', 'homeassistant', 'manifest'];
  
  for (const field of required) {
    if (!json[field]) {
      console.log(`❌ hacs.json missing required field: ${field}`);
      errors++;
    } else {
      console.log(`✅ hacs.json has required field: ${field}`);
    }
  }
  
  if (json.rendering && json.rendering.js) {
    console.log(`✅ hacs.json rendering.js path: ${json.rendering.js}`);
  } else {
    console.log(`❌ hacs.json rendering.js is missing or invalid`);
    errors++;
  }
}

// 1. Check required files
console.log('1. Checking required files:');
checkFile('hacs.json', 'HACS configuration');
checkFile('manifest.json', 'Manifest file');
checkFile('dist/better-curtain-card.js', 'Compiled JavaScript');
checkFile('README.md', 'Documentation');

// 2. Validate JSON files
console.log('\n2. Validating JSON files:');
const hacsJson = checkJson('hacs.json', 'hacs.json');
const manifestJson = checkJson('manifest.json', 'manifest.json');

// 3. Validate hacs.json structure
if (hacsJson) {
  console.log('\n3. Validating hacs.json structure:');
  checkHacsJson(hacsJson);
}

// 4. Check dist folder
console.log('\n4. Checking dist folder:');
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist');
  console.log(`   Found ${distFiles.length} files in dist/: ${distFiles.join(', ')}`);
  
  const jsFile = distFiles.find(f => f.endsWith('.js'));
  if (jsFile) {
    const jsPath = path.join('dist', jsFile);
    const stats = fs.statSync(jsPath);
    console.log(`   Main JS file size: ${stats.size} bytes`);
    
    if (stats.size < 1000) {
      console.log('   ⚠️  JS file seems very small - check compilation');
      warnings++;
    } else {
      console.log('   ✅ JS file size looks reasonable');
    }
  }
}

// 5. Summary
console.log('\n📊 VALIDATION SUMMARY:');
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors === 0) {
  console.log('\n🎉 HACS validation PASSED! Your repository should work with HACS.');
  if (warnings > 0) {
    console.log('⚠️  But please review the warnings above.');
  }
  process.exit(0);
} else {
  console.log('\n❌ HACS validation FAILED. Please fix the errors above.');
  process.exit(1);
}