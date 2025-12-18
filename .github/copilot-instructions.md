# Better Curtain Card - AI Agent Instructions

> **Critical**: This project is in **implementation planning phase**. The design is fully specified in `guideline.md` and `agent-tasks.md`. All code must follow the exact specifications in these documents.

## Project Overview
**Better Curtain Card** is a Home Assistant Lovelace custom card that enhances curtain control while maintaining **100% compatibility** with native Cover card behavior. It adds direction mapping, activity range mapping, and dual-curtain coordination without modifying HA's core semantics.

**Core Principle**: "Enhance, don't replace" - When no enhancements are configured, behavior must be identical to native Cover card.

## Technology Stack & Architecture

### Required Technologies
- **TypeScript** - Strict typing required
- **Lit/LitElement** - HA's standard component framework
- **Rollup/Vite** - For bundling as HA custom card
- **Home Assistant Frontend Components** - Reuse `ha-cover-controls`, `ha-slider`, `ha-icon-button`

### Architecture Layers
1. **UI Layer**: Renders cards using HA components, no custom styling
2. **Logic Layer**: Direction mapping, range calculations, dual-curtain coordination
3. **Config Layer**: YAML schema validation with error handling

## Critical Development Patterns

### 1. Direction Mapping (Config: `direction: up|down|left|right`)
```typescript
// UI layer only displays direction
// All position values go through logic layer first
// up/down = vertical slider, left/right = horizontal slider
// left/right may need reversal for intuitive behavior
```

### 2. Range Mapping (Config: `range: {min: 0, max: 100}`)
**Bidirectional formulas**:
- UI → Entity: `real = min + ui × (max - min) / 100`
- Entity → UI: `ui = (real - min) × 100 / (max - min)`

**Critical rules**:
- UI always operates in 0-100% logical space
- Clamp entity values to configured range
- Validate `min < max`, show error if invalid
- Default (0-100) preserves native behavior

### 3. Dual-Curtain Mode (Config: `mode: double`)
**Three-tier interaction**:
1. **Global Control**: Single controls for both curtains
2. **Independent Control**: Separate left/right controls
3. **Status Display**: Show positions, `partial` when mismatched

**Coordination**:
- Position calculations are per-entity
- Service calls (open/close/stop) call both independently
- Non-blocking on entity unavailability

### 4. Configuration Schema
**Single Mode**:
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.xxx
direction: up  # optional, default: up
range:
  min: 0       # optional, default: 0
  max: 100     # optional, default: 100
```

**Double Mode**:
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.left
right_entity: cover.right
direction: left  # optional
left_range:
  min: 10        # optional
  max: 90        # optional
right_range:
  min: 20        # optional
  max: 80        # optional
```

## Essential Workflows

### Build & Development Commands
```bash
# Project initialization (if starting from scratch)
npm init -y
npm install --save-dev typescript lit rollup @rollup/plugin-typescript @rollup/plugin-node-resolve

# Build for HA integration
npm run build

# Output: dist/better-curtain-card.js
# This file goes into HA resources configuration
```

### Testing Strategy
1. **Baseline Test**: Native Cover card behavior (no config)
2. **Direction Test**: Verify slider orientation matches real movement
3. **Range Test**: Boundary conditions (0%, 50%, 100%, min, max)
4. **Dual Test**: Independent vs. coordinated control
5. **Error Test**: Invalid configs show errors, don't crash

## Implementation Constraints (MUST FOLLOW)

### ❌ NEVER DO:
- Modify Home Assistant core behavior semantics
- Introduce custom visual styles that break HA design language
- Assume entity behavior is identical (especially in dual mode)
- Block operations on entity unavailability
- Hardcode values instead of using config

### ✅ ALWAYS DO:
- Reuse HA native components via parameters/CSS variables
- Validate config with clear error messages
- Implement graceful fallback to native behavior
- Test backward compatibility
- Use 0-100% logical UI space consistently

## Project-Specific Conventions

### File Structure (When Starting Implementation)
```
better-curtain-card/
├── src/
│   ├── better-curtain-card.ts      # Main card class
│   ├── types.ts                    # Type definitions
│   ├── logic/                      # Mapping & coordination logic
│   │   ├── direction.ts
│   │   ├── range.ts
│   │   └── dual-curtain.ts
│   └── config/                     # Schema validation
│       └── schema.ts
├── dist/                           # Build output
├── rollup.config.js
├── package.json
└── README.md
```

### Naming Conventions
- Direction: `up | down | left | right` (lowercase)
- Mode: `single | double` (lowercase)
- Config keys: `direction`, `range`, `left_entity`, `right_entity`, `left_range`, `right_range`

### Error Handling
- Invalid config: Show error in UI, don't crash HA
- Entity unavailable: Show warning, continue with available entities
- Range validation: `min < max` required

## Task Progression (Follow agent-tasks.md order)

**Current Phase**: Task 0 - Project Initialization
1. ✅ Task 0: Initialize TypeScript + Lit project
2. 🔄 Task 1: Single curtain (native equivalent)
3. ⏳ Task 2: Direction mapping
4. ⏳ Task 3: Range mapping
5. ⏳ Task 4: Dual curtain entity modeling
6. ⏳ Task 5: Dual curtain range mapping
7. ⏳ Task 6: Dual curtain UI & control modes
8. ⏳ Task 7: Config validation & error handling
9. ⏳ Task 8: Documentation & delivery

## Key Reference Files
- `guideline.md` - Complete design specification (Chinese)
- `agent-tasks.md` - Detailed task breakdown with acceptance criteria
- `README.md` - To be created for user documentation

## Common Pitfalls to Avoid
1. **Direct HA component modification** - Use parameters only
2. **Custom styling** - Reuse native HA components
3. **No range clamping** - Always validate and clamp values
4. **Blocking operations** - Handle entity unavailability gracefully
5. **Breaking 0-100% convention** - UI space is always 0-100%

## Example Implementation Snippet
```typescript
// Direction mapping logic
function mapDirection(position: number, direction: string): number {
  switch(direction) {
    case 'up': return position;        // 0=bottom, 100=top
    case 'down': return 100 - position; // 0=top, 100=bottom
    case 'left': return 100 - position; // 0=right, 100=left
    case 'right': return position;     // 0=left, 100=right
  }
}

// Range mapping (UI ↔ Entity)
function uiToEntity(ui: number, range: {min: number, max: number}): number {
  return range.min + (ui * (range.max - range.min) / 100);
}

function entityToUi(entity: number, range: {min: number, max: number}): number {
  return ((entity - range.min) * 100) / (range.max - range.min);
}
```

## Next Steps for AI Agent
1. Read `guideline.md` and `agent-tasks.md` completely
2. Start with Task 0: Create project structure
3. Implement Task 1: Single curtain (native equivalent)
4. Follow task order exactly - no deviations
5. Test each task against its acceptance criteria
6. Ask for clarification if any spec is unclear