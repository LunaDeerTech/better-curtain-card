# Task 7 Validation Examples

This file shows real examples of the enhanced error handling.

---

## Configuration Errors (Shown in Card UI)

### Example 1: Invalid Mode
```yaml
type: custom:better-curtain-card
mode: triple  # ❌ Invalid
entity: cover.living_room
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ❌ Invalid Mode                     │
├─────────────────────────────────────┤
│ Mode "triple" is not supported.     │
│                                     │
│ Details: Valid modes: single, double│
├─────────────────────────────────────┤
│ Fix the configuration and reload    │
│ the page.                           │
└─────────────────────────────────────┘
```

---

### Example 2: Missing Entities
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.left
# right_entity missing
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ❌ Missing Entities                 │
├─────────────────────────────────────┤
│ Double mode requires both           │
│ left_entity and right_entity.       │
│                                     │
│ Details: Example: left_entity:      │
│ cover.left, right_entity: cover.right│
├─────────────────────────────────────┤
│ Fix the configuration and reload    │
│ the page.                           │
└─────────────────────────────────────┘
```

---

### Example 3: Invalid Range
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.living_room
range:
  min: 80
  max: 20  # ❌ min >= max
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ❌ Invalid Range                    │
├─────────────────────────────────────┤
│ min (80) must be less than max (20).│
│                                     │
│ Details: Range: 80-20               │
├─────────────────────────────────────┤
│ Fix the configuration and reload    │
│ the page.                           │
└─────────────────────────────────────┘
```

---

### Example 4: Duplicate Entities
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.both
right_entity: cover.both  # ❌ Duplicate
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ❌ Duplicate Entities               │
├─────────────────────────────────────┤
│ left_entity and right_entity cannot │
│ be the same.                        │
│                                     │
│ Details: Both configured as:       │
│ cover.both                          │
├─────────────────────────────────────┤
│ Fix the configuration and reload    │
│ the page.                           │
└─────────────────────────────────────┘
```

---

## Runtime Errors (Shown in Card UI)

### Example 5: Entity Not Found
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.nonexistent
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ❌ Runtime Error                    │
├─────────────────────────────────────┤
│ Entity "cover.nonexistent" does not │
│ exist.                              │
│                                     │
│ Details: Check your entity_id in    │
│ the configuration.                  │
├─────────────────────────────────────┤
│ Check entity configuration and      │
│ device status.                      │
└─────────────────────────────────────┘
```

---

### Example 6: Entity Unavailable
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.offline_device
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ⚠️ Warning                          │
├─────────────────────────────────────┤
│ Entity "cover.offline_device" is    │
│ currently unavailable.              │
│                                     │
│ Details: The device may be offline  │
│ or experiencing issues.             │
├─────────────────────────────────────┤
│ Check entity configuration and      │
│ device status.                      │
└─────────────────────────────────────┘
```

---

### Example 7: Wrong Entity Type
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.left
right_entity: light.bedroom  # ❌ Not a cover
```

**Card Displays:**
```
┌─────────────────────────────────────┐
│ ❌ Runtime Error                    │
├─────────────────────────────────────┤
│ Entities must be cover devices.     │
│                                     │
│ Details: Entity "light.bedroom" is  │
│ not a cover device.                 │
├─────────────────────────────────────┤
│ Check entity configuration and      │
│ device status.                      │
└─────────────────────────────────────┘
```

---

## Console Warnings (Not Shown in UI)

### Example 8: Range Clamping
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.living_room
range:
  min: -10
  max: 150
```

**Console Output:**
```
BetterCurtainCard: range clamped to 0-100
```

**Result**: Card works normally with clamped range

---

## Valid Examples (No Errors)

### Example 9: Basic Configuration
```yaml
type: custom:better-curtain-card
mode: single
entity: cover.living_room
```

**Result**: ✅ Works perfectly

---

### Example 10: Full Configuration
```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.left
right_entity: cover.right
direction: up
left_range:
  min: 10
  max: 90
right_range:
  min: 20
  max: 80
```

**Result**: ✅ All features enabled

---

## Error Severity Levels

### Configuration Errors (🔴 Critical)
- Prevent card from rendering
- Must be fixed by user
- Examples: Invalid mode, missing entities

### Runtime Errors (🟠 Warning)
- Card shows error but continues
- May recover automatically
- Examples: Entity not found, wrong type

### Warnings (🟠 Info)
- Card works with limitations
- Console logging only
- Examples: Range clamping

---

## Error Message Structure

Every error follows this pattern:

```
❌ [Error Title]
[Problem description]

Details: [Technical details]
[Helpful context]

[Actionable guidance]
```

This ensures users can:
1. **Identify** the problem
2. **Understand** what went wrong
3. **Fix** the configuration

---

## Comparison: Before vs After

### Before Task 7
```yaml
# Invalid configuration
mode: triple
```
**Result**: Silent failure, card doesn't work, no feedback

### After Task 7
```yaml
# Invalid configuration
mode: triple
```
**Result**: Clear error message with fix guidance

---

## Testing Validation

To test the validation:

1. **Create invalid config**
2. **Add to Lovelace**
3. **Check card displays error**
4. **Fix configuration**
5. **Verify card works**

All 30 test scenarios are in `test-task7.yaml`.

---

**Summary**: Task 7 provides comprehensive validation that catches errors early and gives users clear, actionable feedback.