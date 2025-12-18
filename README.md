# Better Curtain Card

A Home Assistant Lovelace custom card that enhances curtain control while maintaining 100% compatibility with native Cover card behavior.

## 🌟 Features

### Core Enhancements
- ✅ **Direction Mapping**: Up, down, left, right - intuitive slider orientation
- ✅ **Range Mapping**: Map UI 0-100% to custom entity position ranges
- ✅ **Dual Curtain Mode**: Control two curtains with coordinated or independent actions
- ✅ **Status Detection**: Real-time status (Closed, Open, Partial, Mixed)
- ✅ **Comprehensive Validation**: Clear error messages for configuration issues

### Native Compatibility
- Works exactly like official Cover card when no enhancements configured
- Uses standard Home Assistant service calls
- Respects entity capabilities (open/close/stop/position)
- No visual design changes to HA core

### Safety & Quality
- Zero Home Assistant crashes
- Comprehensive error handling
- TypeScript with strict typing
- Production-ready code

## 📦 Installation

### Method 1: Manual Installation

1. **Copy the compiled JavaScript file:**
   ```bash
   cp dist/better-curtain-card.js /config/www/community/better-curtain-card/
   ```

2. **Add to resources in configuration.yaml:**
   ```yaml
   lovelace:
     resources:
       - url: /local/community/better-curtain-card/better-curtain-card.js
         type: module
   ```

3. **Restart Home Assistant**

4. **Add card to dashboard:**
   ```yaml
   type: custom:better-curtain-card
   mode: single
   entity: cover.living_room
   ```

### Method 2: HACS Custom Repository

If you want easier installation and updates via HACS:

1. **Add custom repository:**
   - Open HACS → Settings (bottom left) → Custom Repositories
   - Add repository URL: `https://github.com/LunaDeerTech/better-curtain-card`
   - Category: **Lovelace**

2. **Install via HACS:**
   - Search for "Better Curtain Card" in HACS
   - Click Install
   - HACS will automatically download and install the card

3. **Restart Home Assistant**

### Method 2 Troubleshooting

If you encounter the error "The version XXXXXX for this plugin can not be used with HACS":

**Common Issues & Solutions:**

1. **Missing hacs.json file**
   - ✅ **Fixed**: The repository now includes `hacs.json`
   - Ensure you're using the latest commit

2. **GitHub Release Structure**
   - Make sure GitHub releases are properly tagged (v1.0.0, v1.0.1, etc.)
   - Releases should include compiled `dist/better-curtain-card.js`

3. **File Structure Requirements**
   ```
   Repository Structure:
   ├── hacs.json (required)
   ├── dist/
   │   └── better-curtain-card.js (required)
   ├── README.md
   └── manifest.json (optional, but recommended)
   ```

4. **HACS Cache Issues**
   - Clear HACS cache: HACS → Settings → Clear Cache
   - Restart Home Assistant
   - Try installation again

5. **Repository URL Verification**
   - Ensure URL is exactly: `https://github.com/LunaDeerTech/better-curtain-card`
   - Repository must be public
   - Check for typos in the URL

## ⚙️ Configuration

### Single Curtain Mode

**Basic (Native Equivalent)**
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.living_room
```

**With Direction**
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.bedroom
direction: down  # up, down, left, or right
```

**With Range Mapping**
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.kitchen
range:
  min: 10   # Entity minimum position
  max: 90   # Entity maximum position
```

**Complete Configuration**
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.office
direction: left
range:
  min: 20
  max: 80
```

### Double Curtain Mode

**Basic**
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.left
right_entity: cover.right
```

**With Direction**
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.living_left
right_entity: cover.living_right
direction: right  # Affects both curtains
```

**With Independent Ranges**
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.bedroom_left
right_entity: cover.bedroom_right
left_range:
  min: 10
  max: 90
right_range:
  min: 20
  max: 80
```

**Complete Configuration**
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.dining_left
right_entity: cover.dining_right
direction: up
left_range:
  min: 15
  max: 85
right_range:
  min: 5
  max: 95
```

## 📋 Examples

### Example 1: Basic Living Room
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.living_room
```
**Result**: Simple cover card with Open/Close/Stop buttons

### Example 2: Kitchen with Range
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.kitchen
range:
  min: 10
  max: 90
```
**Result**: Kitchen curtain only moves between 10-90%

### Example 3: Bedroom with Direction
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.bedroom
direction: down
```
**Result**: Vertical slider, top=0%, bottom=100%

### Example 4: Double Curtain - Basic
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.living_left
right_entity: cover.living_right
```
**Result**: Overall + Independent controls for both curtains

### Example 5: Double Curtain - Advanced
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.bedroom_left
right_entity: cover.bedroom_right
direction: left
left_range:
  min: 10
  max: 90
right_range:
  min: 20
  max: 80
```
**Result**: 
- Horizontal sliders
- Left: 10-90% range
- Right: 20-80% range
- Clear status display

## 🎨 User Interface

### Single Mode
```
┌─────────────────────────────┐
│ Curtain Control (up)        │
│ Position: 50%               │
│ Range: 10-90%               │
│                             │
│ [Open] [Close] [Stop]       │
│                             │
│ [====|==========] Slider    │
└─────────────────────────────┘
```

### Double Mode
```
┌─────────────────────────────┐
│ Dual Curtain Control        │
│ Status: Partial             │
│                             │
│ Overall Control             │
│ [Open Both] [Close Both]    │
│ [Stop Both]                 │
│                             │
│ Independent Control         │
│ ┌─────────┐ ┌─────────┐    │
│ │ Left    │ │ Right   │    │
│ │ 50%     │ │ 75%     │    │
│ │ [O C S] │ │ [O C S] │    │
│ └─────────┘ └─────────┘    │
└─────────────────────────────┘
```

## 🛠️ Troubleshooting

### Card Not Appearing
1. **Check resource URL**: Ensure file path is correct
2. **Clear cache**: Hard refresh browser (Ctrl+Shift+R)
3. **Check browser console**: Look for errors
4. **Verify file exists**: Check `/config/www/community/better-curtain-card/`

### Configuration Errors
1. **Check YAML syntax**: Use online YAML validator
2. **Verify entity IDs**: Check in Developer Tools → States
3. **Test in single mode first**: Simplify configuration
4. **Check HA logs**: Settings → System → Logs

### Entity Unavailable
1. **Check device status**: Is the curtain device online?
2. **Verify entity**: Developer Tools → States
3. **Check device class**: Must be "cover"
4. **Restart device**: Power cycle the curtain controller

## 🔨 Build Instructions

### Development Setup
```bash
# Navigate to project
cd better-curtain-card

# Install dependencies
npm install

# Build (TypeScript → JavaScript)
npm run build

# Output: dist/better-curtain-card.js
```

### Build Commands
```bash
npm run build   # Compile for production
npx tsc --noEmit  # Type check only
```

### Development Watch
```bash
npm run dev     # Auto-recompile (if configured)
```

## 📊 Technical Details

### Requirements
- **Home Assistant**: 2023.1 or newer
- **Browser**: Modern browser with ES2021 support
- **HASS**: Frontend with custom card support

### Dependencies
- **TypeScript**: 5.4.5
- **Lit**: 3.1.3
- **No external runtime dependencies**

### Architecture
```
Configuration
    ↓
Validation (setConfig)
    ↓
Runtime Checks (render)
    ↓
State Management
    ↓
Position Calculation
    ├─ Direction Transform
    └─ Range Mapping
    ↓
UI Rendering
    └─ Service Calls
```

## 🆚 Comparison: Native vs Better

### Native Cover Card
```yaml
type: cover
entity: cover.living_room
```
**Limitations:**
- No direction control
- No range mapping
- No dual curtain support
- No status detection

### Better Curtain Card
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.living_room
direction: down
range:
  min: 10
  max: 90
```
**Enhancements:**
- ✅ Direction control
- ✅ Range mapping
- ✅ Dual curtain mode
- ✅ Status detection
- ✅ Clear error messages

## ⚡ Performance

### Efficient Updates
- Only updates when HA state changes
- Minimal DOM manipulation
- No polling or intervals
- Lit's reactive updates

### Small Footprint
- **File size**: ~30KB (minified)
- **Memory**: Minimal
- **CPU**: Negligible

## 🔒 Security

- ✅ No external network calls
- ✅ No data collection
- ✅ Uses only HA APIs
- ✅ Local execution only

## 📜 License

MIT License - Free to use and modify

## 🤝 Support

### Issues & Questions
1. Check this README first
2. Review test files: `test-task{1-7}.yaml`
3. Check Home Assistant community forums
4. Open GitHub issue if needed

### Testing
See `test-task{1-7}.yaml` for 30 comprehensive examples covering all features.

## 🙏 Credits

Built with:
- **TypeScript** - Type safety and modern development
- **Lit** - Efficient web components framework
- **Home Assistant** - Amazing platform and community

## 📅 Version History

### v1.0.0 (December 2025)
- ✅ Single curtain mode with native equivalence
- ✅ Direction mapping (up/down/left/right)
- ✅ Range mapping (bidirectional, clamped)
- ✅ Double curtain mode with independent entities
- ✅ Independent range mapping per curtain
- ✅ Overall + Independent control sections
- ✅ Status detection (Closed/Partial/Open/Mixed)
- ✅ Comprehensive validation (30 scenarios)
- ✅ Clear error display system
- ✅ Production-ready code

## 🔍 What Makes It Special

### 1. Native Compatibility
Works exactly like official Cover card when no enhancements configured.

### 2. Progressive Enhancement
Add features only when needed - all optional.

### 3. Safety First
Comprehensive validation prevents errors and crashes.

### 4. User-Friendly
Clear error messages guide users to fix issues.

### 5. Developer-Friendly
Clean, modular, well-documented code.

---

## 🔧 HACS Troubleshooting

### Common Error: "The version XXXXXX for this plugin can not be used with HACS"

This error typically means HACS cannot find the required files or structure. Here's how to fix it:

**Immediate Solutions:**

1. **Wait for HACS to sync**
   - Sometimes HACS needs 5-10 minutes to sync new repositories
   - Try again after waiting

2. **Manual installation**
   ```bash
   # Clone the repository
   git clone https://github.com/LunaDeerTech/better-curtain-card
   cd better-curtain-card
   
   # Build the project
   npm install
   npm run build
   
   # Copy to Home Assistant
   cp dist/better-curtain-card.js /config/www/community/better-curtain-card/
   ```

3. **Check GitHub repository**
   - Visit: https://github.com/LunaDeerTech/better-curtain-card
   - Verify `hacs.json` exists in the root
   - Verify `dist/better-curtain-card.js` exists

**For Repository Maintainers:**

If you're the repository owner and users report this error:

1. **Ensure hacs.json exists** ✅ (Already done)
2. **Create proper GitHub releases** (Use the workflow provided)
3. **Include dist folder in releases** (Automated via workflow)
4. **Tag releases properly** (v1.0.0, v1.0.1, etc.)

**Quick Release Process:**
```bash
git tag v1.0.1
git push origin v1.0.1
# GitHub Actions will automatically create release with hacs.json and dist/
```

### Verification Checklist

- [x] hacs.json exists in repository root
- [x] dist/better-curtain-card.js exists
- [x] Repository is public
- [x] GitHub releases are tagged properly
- [x] HACS custom repository URL is correct
- [x] Category is set to "Lovelace" in HACS

If all checks pass and it still doesn't work, open an issue on GitHub with:
- Exact error message
- HACS version
- Home Assistant version
- Steps you've tried

---

**Status**: ✅ 100% Complete - Production Ready

**Ready to use!** 🚀