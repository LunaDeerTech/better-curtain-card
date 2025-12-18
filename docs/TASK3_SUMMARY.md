# Task 3: Active Range Mapping - Implementation Summary

## Overview
This implementation adds support for mapping logical 0-100% UI positions to custom entity position ranges, enabling support for curtains with limited travel, half-open states, or non-standard position ranges.

## Configuration Format
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.xxx
direction: up | down | left | right  # Optional (Task 2)
range:
  min: number  # 0-100, default 0
  max: number  # 0-100, default 100
```

## Core Features

### 1. Bidirectional Mapping Functions

**mapEntityPositionToUI(entityPosition)**
- Input: Entity position (0-100)
- Output: UI position (0-100)
- Formula: `ui = (entity - min) * 100 / (max - min)`
- Includes clamping to ensure valid 0-100 output

**mapUIToEntityPosition(uiPosition)**
- Input: UI position (0-100)
- Output: Entity position (in range [min, max])
- Formula: `entity = min + ui * (max - min) / 100`
- Includes clamping to ensure valid range output

### 2. Combined Direction + Range Mapping

The implementation creates a two-step pipeline:

**UI Display:**
1. Entity → Range mapping: `entity → ui (0-100)`
2. Direction transformation: `ui → final UI position`

**Service Calls:**
1. Direction inverse: `UI input → transformed UI`
2. Range mapping: `transformed UI → entity position`

### 3. Validation and Error Handling

**Configuration Validation:**
- Range must be object with min/max numbers
- `min < max` required
- Values automatically clamped to 0-100 range
- Clear error messages for invalid configurations

**Runtime Safety:**
- Entity position clamped to range before mapping
- UI position clamped to 0-100 before display
- Final position clamped to range before service call

## Example Scenarios

### Scenario 1: Half-Open Curtain (20-80%)
```yaml
range:
  min: 20
  max: 80
```

**Behavior:**
- UI shows 0% → Entity gets 20%
- UI shows 50% → Entity gets 50%
- UI shows 100% → Entity gets 80%
- Entity at 30% → UI shows 12.5%

### Scenario 2: Limited Travel (45-55%)
```yaml
range:
  min: 45
  max: 55
```

**Behavior:**
- UI 0-100% maps to tiny 45-55% entity range
- Allows fine control over small movement
- Useful for precise positioning

### Scenario 3: Combined with Direction
```yaml
direction: down
range:
  min: 10
  max: 90
```

**Behavior:**
- Range mapping first: entity 0-100 → UI 10-90
- Direction transformation: UI 10-90 → UI 90-10 (inverted)
- Final result: 0% UI = 90% entity, 100% UI = 10% entity

## Technical Implementation

### Files Modified
- `src/better-curtain-card.ts`: Added range interface, validation, mapping functions, render updates

### Key Code Sections

```typescript
// Range mapping functions
private mapEntityPositionToUI(entityPosition: number): number
private mapUIToEntityPosition(uiPosition: number): number

// Combined mapping
private mapPositionForUI(entityPosition: number): number  // Entity → UI
private mapPositionForEntity(uiPosition: number): number  // UI → Entity

// Validation in setConfig
if (config.range) {
  // Type checking
  // min < max validation
  // 0-100 clamping
}
```

### Compilation
- TypeScript compilation: ✅ Clean
- No errors or warnings
- Ready for production use

## Test Coverage

### Test Cases in `test-task3.yaml`:
1. Basic range (10-90%)
2. Small range (20-80%)
3. Combined with all directions
4. Edge case: very small range (45-55%)
5. Error cases commented out (min >= max, out-of-bounds)

## Compatibility

### Backward Compatibility
- ✅ No range specified: Uses 0-100 (same as Task 2)
- ✅ No direction specified: Uses 'up' (same as Task 2)
- ✅ Existing configurations remain valid

### Forward Compatibility
- ✅ Ready for Task 4 (double mode)
- ✅ Range validation logic reusable
- ✅ Mapping functions can be extended

## Acceptance Criteria Verification

### ✅ UI displays 0-100%
- Always shows logical percentage
- Range info displayed when custom range configured

### ✅ Entity position mapping
- Correct bidirectional formulas
- Proper clamping and validation

### ✅ Error handling
- Invalid configurations show clear errors
- Values are safely clamped
- No crashes or silent failures

### ✅ Service call accuracy
- UI → Entity mapping in setCoverPosition
- Entity → UI mapping in render
- State display matches entity position

## Next Steps
- Ready for Task 4: Double curtain mode
- Can be combined with direction mapping from Task 2
- Validation logic reusable for double mode ranges