# HACS Installation Fix Summary

## ✅ Issues Fixed

### 1. Missing hacs.json
**Problem**: HACS requires a `hacs.json` file in the repository root to validate and install custom Lovelace cards.

**Solution**: Created `hacs.json` with proper structure:
```json
{
  "name": "Better Curtain Card",
  "description": "Enhanced curtain control card...",
  "version": "1.0.0",
  "rendering": {
    "js": "dist/better-curtain-card.js"
  }
}
```

### 2. Incorrect Path in hacs.json
**Problem**: Initial `hacs.json` used `/dist/better-curtain-card.js` (with leading slash) instead of `dist/better-curtain-card.js`

**Solution**: Fixed to use relative path without leading slash.

### 3. Missing Manifest File
**Problem**: Some HACS installations require a `manifest.json` file.

**Solution**: Created `manifest.json` with proper metadata.

### 4. Invalid HACS Validation Workflow
**Problem**: The workflow used `category: lovelace` which is not valid for custom Lovelace cards.

**Solution**: Replaced with proper validation that checks file structure and JSON validity.

### 5. Missing Dist Folder
**Problem**: The `dist/` folder wasn't committed to the repository.

**Solution**: Added build step to ensure compiled files are available.

## 📁 Files Created/Modified

### New Files:
- `hacs.json` - Required HACS configuration
- `manifest.json` - Additional HACS metadata
- `.github/workflows/release.yml` - Automated release workflow
- `.github/workflows/hacs-validation.yml` - HACS compatibility validation
- `scripts/validate-hacs.js` - Local validation script
- `HACS_FIX_SUMMARY.md` - This summary

### Modified Files:
- `README.md` - Added comprehensive HACS troubleshooting section

## 🚀 Next Steps

### 1. Commit and Push Changes
```bash
git add hacs.json manifest.json .github/workflows/ scripts/ README.md
git commit -m "Add HACS compatibility files and fix validation"
git push origin main
```

### 2. Create a Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the GitHub Action to create a proper release with all required files.

### 3. Install via HACS
1. Open HACS → Settings → Custom Repositories
2. Add: `https://github.com/LunaDeerTech/better-curtain-card`
3. Category: **Lovelace**
4. Search for "Better Curtain Card" and install

### 4. Verify Installation
After installation, add to your dashboard:
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.your_cover
```

## 🔍 Validation Results

Our local validation script confirms:
```
✅ hacs.json exists and is valid JSON
✅ manifest.json exists and is valid JSON
✅ dist/better-curtain-card.js exists (35KB)
✅ README.md exists
✅ hacs.json has required fields
✅ JavaScript file size is reasonable
```

## 🎯 Expected Outcome

After following these steps, the HACS installation error "The version XXXXXX for this plugin can not be used with HACS" should be completely resolved.

Users will be able to:
1. Add your repository as a custom repository in HACS
2. Install the card via HACS interface
3. Receive automatic updates when you create new releases

## 📝 Additional Notes

- The `dist/` folder should be included in releases but not necessarily in the main branch (though it's fine to include it)
- The release workflow automatically builds and includes all necessary files
- HACS may take a few minutes to sync with GitHub after repository changes
- If issues persist, users can clear HACS cache and restart Home Assistant