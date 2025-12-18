# Better Curtain Card - AI Agent Instructions

> **Status**: Project 87.5% complete (7/8 tasks). Implementation is in `src/better-curtain-card.ts` (1059 lines). Focus on Task 8 (Documentation) or bug fixes.

## 🎯 Project Overview
**Better Curtain Card** is a Home Assistant Lovelace custom card that enhances curtain control while maintaining **100% compatibility** with native Cover card behavior. 

**Core Principle**: "Enhance, don't replace" - When no enhancements are configured, behavior must be identical to native Cover card.

### Current Implementation State
- ✅ **Task 0**: Project setup (TypeScript + Lit)
- ✅ **Task 1**: Single mode (native equivalent)
- ✅ **Task 2**: Direction mapping (up/down/left/right)
- ✅ **Task 3**: Range mapping (0-100% ↔ custom ranges)
- ✅ **Task 4**: Double mode (dual entity support)
- ✅ **Task 5**: Independent ranges per entity
- ✅ **Task 6**: UI & control modes (overall + independent)
- ✅ **Task 7**: Comprehensive validation & error handling
- ⏳ **Task 8**: Documentation (README.md, installation guide)

## 🏗️ Architecture & Implementation

### File Structure
```
better-curtain-card/
├── src/
│   └── better-curtain-card.ts      # 1059 lines - Complete implementation
├── dist/
│   └── better-curtain-card.js      # Compiled output for HA
├── tests/
│   ├── test-task1.yaml through test-task7.yaml
├── docs/
│   ├── guideline.md                # Original design spec (Chinese)
│   ├── agent-tasks.md              # Task breakdown
│   └── TASK[1-7]_SUMMARY.md        # Task completion docs
└── example-config.yaml             # Usage examples
```

### Key Implementation Files
- **`src/better-curtain-card.ts`** - Single file implementation with all logic
- **`package.json`** - TypeScript + Lit dependencies, `npm run build` compiles to dist/
- **`tsconfig.json`** - Strict TypeScript configuration
- **`rollup.config.js`** - Placeholder (using tsc directly)

### Architecture Layers (In Implementation)
1. **UI Layer**: Renders using Lit templates, CSS variables for HA theming
2. **Logic Layer**: Position mapping (direction + range) in `mapPositionForUI()` / `mapPositionForEntity()`
3. **Validation Layer**: Comprehensive `setConfig()` validation with clear error messages
4. **Service Layer**: HA service calls with graceful degradation for unavailable entities

## 🔧 Critical Code Patterns

### 1. Position Mapping (Bidirectional)
```typescript
// UI → Entity: Real position calculation
private mapPositionForEntity(uiPosition: number, side?: 'left' | 'right'): number {
  // Step 1: Inverse direction transformation
  const direction = this.config.direction || 'up';
  let transformedUI: number;
  
  switch (direction) {
    case 'up':    transformedUI = uiPosition; break;
    case 'down':  transformedUI = 100 - uiPosition; break;
    case 'left':  transformedUI = 100 - uiPosition; break;
    case 'right': transformedUI = uiPosition; break;
  }
  
  // Step 2: Map to entity range
  const range = this.getRangeForSide(side);
  const clamped = Math.max(0, Math.min(100, transformedUI));
  return range.min + (clamped * (range.max - range.min) / 100);
}

// Entity → UI: Display position calculation
private mapPositionForUI(entityPosition: number, side?: 'left' | 'right'): number {
  const range = this.getRangeForSide(side);
  const clamped = Math.max(range.min, Math.min(range.max, entityPosition));
  let uiPosition = ((clamped - range.min) * 100) / (range.max - range.min);
  
  // Apply direction
  const direction = this.config.direction || 'up';
  switch (direction) {
    case 'down': return 100 - uiPosition;
    case 'left': return 100 - uiPosition;
    default: return uiPosition;
  }
}
```

### 2. Validation Strategy (Task 7 - Comprehensive)
```typescript
setConfig(config: LovelaceCardConfig) {
  // 1. Basic structure validation
  // 2. Mode validation (single/double)
  // 3. Entity requirements & duplicate check
  // 4. Direction validation
  // 5. Range validation with clamping
  // 6. Store sanitized config or set error
}
```

**Validation Features**:
- ✅ Type checking for all properties
- ✅ Range validation: `min < max`, finite numbers, no NaN
- ✅ Automatic clamping to 0-100 range
- ✅ Duplicate entity detection in double mode
- ✅ Clear error messages with examples

### 3. Error Handling (UI-First Approach)
```typescript
render() {
  // Check config errors first
  if (this.error) return this.renderError(this.error, 'configuration');
  
  // Runtime validation
  if (!this.hass) return this.renderLoading('Connecting...');
  
  // Entity existence checks
  if (entityNotFound) return this.renderError('Entity Not Found', 'runtime');
  if (entityUnavailable) return this.renderError('Entity Unavailable', 'warning');
  
  // Render mode-specific UI
  return mode === 'single' ? this.renderSingleMode() : this.renderDoubleMode();
}
```

**Error Display**:
- Color-coded borders (red=configuration, orange=runtime, purple=critical)
- Formatted with ❌ emoji and clear structure
- Footer with actionable advice
- Loading states with spinner animation

### 4. Double Mode Architecture
```typescript
renderDoubleMode() {
  // 1. Status detection: Closed/Open/Partial/Mixed
  // 2. Overall Control区 (blue accent) - Open/Close/Stop both
  // 3. Independent Control区 (orange accent) - Per-side controls
  // 4. Graceful handling of unavailable entities
  // 5. Independent range mapping per side
}
```

**Status Logic**:
```typescript
const isPartial = Math.abs(leftUIPos - rightUIPos) > 5; // 5% tolerance
const bothClosed = leftUIPos === 0 && rightUIPos === 0;
const bothOpen = leftUIPos === 100 && rightUIPos === 100;
// Status: Partial | Closed | Open | Mixed
```

### 5. Service Coordination (Non-Blocking)
```typescript
private async openBoth() {
  const leftAvailable = this.hass.states[this.config.left_entity]?.state !== 'unavailable';
  const rightAvailable = this.hass.states[this.config.right_entity]?.state !== 'unavailable';
  
  const promises = [];
  if (leftAvailable) promises.push(this.openCover(this.config.left_entity));
  if (rightAvailable) promises.push(this.openCover(this.config.right_entity));
  
  await Promise.all(promises); // Non-blocking, graceful
}
```

## 🔨 Development Workflows

### Build Process
```bash
npm run build  # tsc compiles src/ to dist/
# Output: dist/better-curtain-card.js (ready for HA)
```

### Testing (Manual)
1. **Single Mode**: `tests/test-task1.yaml` - Basic cover behavior
2. **Direction**: `tests/test-task2.yaml` - Slider orientation
3. **Range**: `tests/test-task3.yaml` - Mapping verification
4. **Double Mode**: `tests/test-task4.yaml` - Dual entity support
5. **Independent Ranges**: `tests/test-task5.yaml` - Per-side mapping
6. **UI/Controls**: `tests/test-task6.yaml` - Visual structure
7. **Validation**: `tests/test-task7.yaml` - Error scenarios

### Adding to Home Assistant
```yaml
# configuration.yaml
lovelace:
  resources:
    - url: /local/community/better-curtain-card/better-curtain-card.js
      type: module
```

```yaml
# Dashboard
cards:
  - type: custom:better-curtain-card
    mode: single
    entity: cover.bedroom
    direction: up
    range:
      min: 10
      max: 90
```

## ⚠️ Critical Constraints (MUST FOLLOW)

### ❌ NEVER DO:
1. **Modify HA core semantics** - All service calls use standard cover services
2. **Custom visual styles** - Only use CSS variables and HA theme colors
3. **Assume identical entity behavior** - Always check `supported_features`
4. **Block on unavailability** - Use `Promise.all()` with availability checks
5. **Hardcode values** - All values from config with defaults

### ✅ ALWAYS DO:
1. **Validate at config time** - `setConfig()` must catch all errors
2. **Clamp all ranges** - Both input and output positions
3. **Handle missing entities** - Show error, don't crash
4. **Use 0-100% UI space** - Consistent logical mapping
5. **Test edge cases** - 0%, 50%, 100%, min, max, unavailable

## 📊 Implementation Statistics
- **Total Lines**: 1059 (src/better-curtain-card.ts)
- **Functions**: 20+ methods
- **Validation Checks**: 15+ distinct validations
- **Error Types**: 4 categories (configuration, runtime, warning, critical)
- **Status States**: 4 (Closed, Open, Partial, Mixed)
- **Direction Modes**: 4 (up, down, left, right)
- **Configuration Keys**: 9 (type, mode, entity, left_entity, right_entity, direction, range, left_range, right_range)

## 🎨 Visual Design (HA Native)
- Uses HA CSS variables: `--primary-color`, `--card-background-color`, `--error-color`
- Grid layout for double mode: `grid-template-columns: 1fr 1fr`
- Blue accent for Overall Control, Orange for Independent
- Responsive: switches to single column on mobile (<600px)
- No custom fonts or external resources

## 🔍 Common Issues & Fixes

### Issue: "Property 'hass' does not exist"
**Fix**: Use `@property({ attribute: false })` decorator and private `_hass` field

### Issue: Slider not updating
**Fix**: Ensure `requestUpdate()` is called when hass changes

### Issue: Range clamping errors
**Fix**: Always clamp to 0-100 after direction, then to entity range

### Issue: Entity unavailable crashes card
**Fix**: Check `state === 'unavailable'` in render, show warning instead

### Issue: Double mode with one unavailable entity
**Fix**: `Promise.all()` with availability filters, show individual status

## 📝 Next Actions

### If Fixing Bugs:
1. Check `tests/test-task7.yaml` for validation scenarios
2. Review `renderError()` and `validateRange()` methods
3. Test with actual HA entities if available

### If Adding Features:
1. **Currently at 87.5%** - Task 8 (Documentation) remaining
2. Create comprehensive README.md with installation steps
3. Add HACS integration instructions
4. Create visual examples/gifs

### If Extending:
- **Future enhancements**: Preset positions, scheduling, automation triggers
- **Architecture is ready**: Add new config options in `LovelaceCardConfig`
- **Validation pattern**: Extend `setConfig()` with new checks
- **UI pattern**: Add new sections in `render()` methods

## 🔗 Key Reference Files
- `src/better-curtain-card.ts` - **Source of truth** for all logic
- `docs/guideline.md` - Original design spec (Chinese)
- `docs/agent-tasks.md` - Task breakdown
- `example-config.yaml` - All usage patterns
- `tests/test-task[1-7].yaml` - Test scenarios

## 💡 Quick Reference

### Configuration Schema
```typescript
interface LovelaceCardConfig {
  type: 'custom:better-curtain-card';
  mode: 'single' | 'double';
  entity?: string;              // Single mode
  left_entity?: string;         // Double mode
  right_entity?: string;        // Double mode
  direction?: 'up'|'down'|'left'|'right'; // Default: 'up'
  range?: { min: number; max: number };   // Default: {0, 100}
  left_range?: { min: number; max: number };
  right_range?: { min: number; max: number };
}
```

### Build Command
```bash
npm run build  # Compiles TypeScript to dist/better-curtain-card.js
```

### Installation
1. Copy `dist/better-curtain-card.js` to `/config/www/community/better-curtain-card/`
2. Add resource in `configuration.yaml`
3. Restart HA
4. Add card to dashboard with YAML config

**This instruction file is now comprehensive and actionable for AI agents working on this codebase.**