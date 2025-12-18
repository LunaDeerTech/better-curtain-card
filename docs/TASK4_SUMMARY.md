# Task 4: Double Curtain Entity Modeling - Implementation Summary

## Overview
This implementation adds support for controlling two curtain entities simultaneously with independent state management, enabling dual-curtain control for wider windows or doorways.

## Configuration Format
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.left
right_entity: cover.right
direction: up | down | left | right  # Optional (Task 2)
left_range:                          # Optional (Task 5)
  min: number
  max: number
right_range:                         # Optional (Task 5)
  min: number
  max: number
```

## Core Features

### 1. Dual Entity State Management

**Independent State Models:**
- Each entity maintains its own state object
- No shared state between left and right
- Both entities can have different positions, states, and capabilities

**State Reading:**
```typescript
const leftState = this.hass.states[leftEntity];
const rightState = this.hass.states[rightEntity];
```

### 2. Entity Validation & Availability

**Configuration Validation:**
- Both `left_entity` and `right_entity` required for double mode
- Entities must exist in Home Assistant state machine
- Type checking for proper configuration structure

**Runtime Availability:**
- Graceful handling of unavailable entities
- Independent failure handling (one side fails, other continues)
- Clear visual indicators for unavailable states

### 3. Status Detection

**Partial State Calculation:**
```typescript
const isPartial = Math.abs(leftPos - rightPos) > 5; // 5% tolerance
const bothClosed = leftPos === 0 && rightPos === 0;
```

**Status Display:**
- `Partial`: Positions differ by >5%
- `Closed`: Both at 0%
- `Open`: Any other state

## UI Architecture

### 1. Overall Control Section
- **Open Both**: Calls open_cover on both entities
- **Close Both**: Calls close_cover on both entities
- **Stop Both**: Calls stop_cover on both entities
- Non-blocking - handles unavailable entities gracefully

### 2. Dual Mode Layout
```
┌─────────────────────────────────────┐
│ Dual Curtain Control                │
│ Status: Partial                     │
├────────────────────┬────────────────┤
│ Left Curtain       │ Right Curtain  │
│ 50%                │ 75%            │
│ [Open][Close][Stop]│[Open][Close][Stop]│
│ [====slider====]   │ [====slider====]  │
└────────────────────┴────────────────┘
```

### 3. Independent Control
- Each side has its own Open/Close/Stop buttons
- Each side has its own position slider (when supported)
- Each side can be controlled independently

## Technical Implementation

### 1. Mode Routing

```typescript
render() {
  const mode = this.config.mode || 'single';
  if (mode === 'single') return this.renderSingleMode();
  if (mode === 'double') return this.renderDoubleMode();
}
```

### 2. Range Mapping Integration

**Double Mode Range Support:**
- Left and right can have independent ranges
- Reuses single-mode mapping functions with side parameter
- `getRangeForSide()` determines correct range

**Mapping Functions:**
```typescript
// Accept optional side parameter
private mapPositionForUI(entityPosition: number, side?: 'left' | 'right')
private mapPositionForEntity(uiPosition: number, side?: 'left' | 'right')
```

### 3. Service Method Extensions

**Independent Control:**
```typescript
// Existing methods work for individual entities
private async openCover(entity: string)
private async closeCover(entity: string)
private async stopCover(entity: string)
private async setCoverPosition(entity: string, uiPosition: string)
```

**Coordinated Control:**
```typescript
private async openBoth() {
  const promises = [];
  if (leftAvailable) promises.push(this.openCover(leftEntity));
  if (rightAvailable) promises.push(this.openCover(rightEntity));
  await Promise.all(promises);
}
```

## Error Handling & Safety

### 1. Configuration Errors
- Missing entities: Clear error message
- Invalid ranges: Validation with error display
- Type mismatches: Detailed error messages

### 2. Runtime Errors
- Entity unavailable: Individual state shows "Unavailable"
- Service failures: Promise.all with availability checks
- State reading: Safe fallback to defaults

### 3. State Management
- Independent clamping for each side
- Separate range validation
- No cross-contamination between sides

## Integration with Previous Tasks

### Task 2 (Direction) + Task 3 (Range) + Task 4 (Double)
The implementation creates a seamless integration:

**For Single Mode:**
- Direction applies to single entity
- Range applies to single entity
- Standard rendering

**For Double Mode:**
- Direction applies to both entities (shared)
- Ranges can be independent (left_range, right_range)
- Dual rendering with independent controls

## Example Scenarios

### Scenario 1: Standard Dual Curtain
```yaml
mode: double
left_entity: cover.living_left
right_entity: cover.living_right
```
- Both entities control independently
- Shared 0-100% logical space
- Status shows "Partial" when mismatched

### Scenario 2: Independent Ranges
```yaml
mode: double
left_entity: cover.kitchen_left
right_entity: cover.kitchen_right
left_range: {min: 10, max: 90}
right_range: {min: 20, max: 80}
```
- Left: 0% UI → 10% entity, 100% UI → 90% entity
- Right: 0% UI → 20% entity, 100% UI → 80% entity

### Scenario 3: One Entity Unavailable
- Left entity becomes unavailable
- Right entity continues to work
- Left shows "Unavailable" message
- Right shows full controls
- "Open Both" only operates on available entity

## Files Modified

### src/better-curtain-card.ts
- **Config interface**: Added double mode properties
- **setConfig**: Enhanced validation for double mode
- **render**: Split into single/double mode methods
- **Service methods**: Added coordinated control helpers
- **Mapping functions**: Added side parameter support
- **CSS**: Added double mode styling

### test-task4.yaml
- 5 working examples
- Error scenarios commented out
- Edge case documentation

## Compilation & Testing

### TypeScript Compilation
- ✅ No errors or warnings
- ✅ Strict type checking maintained
- ✅ All interfaces properly defined

### Test Coverage
- Basic double mode
- Direction + double mode
- Independent ranges
- Combined configuration
- Unavailable entity handling

## Key Design Decisions

### 1. Shared Direction
- Both curtains share the same direction setting
- Reason: Physical symmetry of dual-curtain installations
- Alternative: Separate directions (rejected for complexity)

### 2. Independent Ranges
- Left and right can have different ranges
- Reason: Asymmetric installations are common
- Implementation: Separate `left_range` and `right_range`

### 3. Status Tolerance
- 5% difference triggers "Partial" status
- Reason: Small differences are normal/acceptable
- Prevents constant status flipping

### 4. Non-Blocking Operations
- Service calls handle unavailable entities gracefully
- Reason: One side failure shouldn't break the other
- Implementation: Availability checks before service calls

## Acceptance Criteria Verification

### ✅ Entity Validation
- Both entities validated as cover type
- Clear error messages for missing entities

### ✅ Independent State Models
- Left and right states read independently
- No shared state between entities

### ✅ Unavailable Entity Support
- Graceful degradation when one entity fails
- Other side continues to function
- Clear visual indicators

### ✅ Non-Assumption Design
- No assumption of identical behavior
- Independent control and state management
- Separate range configurations supported

## Next Steps
- Ready for Task 5: Independent range mapping for double mode
- Can be combined with Task 2 & 3 features
- Validation logic reusable for future enhancements

## Compatibility
- ✅ Backward compatible with single mode
- ✅ Existing configurations remain valid
- ✅ No breaking changes to API