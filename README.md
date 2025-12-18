# Better Curtain Card

A Home Assistant Lovelace custom card that enhances curtain control while maintaining 100% compatibility with native Cover card behavior.

## Features

- **Single Curtain Mode**: Enhanced single curtain control with direction and range mapping
- **Dual Curtain Mode**: Coordinated control of left and right curtains
- **Direction Mapping**: Support for up/down/left/right UI orientation
- **Range Mapping**: Configurable active range for limited-travel curtains
- **Native HA Components**: Uses Home Assistant's built-in UI components for consistency

## Installation

### Build from Source

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Copy `dist/better-curtain-card.js` to your Home Assistant `config/www` directory

### Add to Home Assistant

1. In your Home Assistant configuration, add the resource:
   ```yaml
   resources:
     - url: /local/better-curtain-card.js
       type: module
   ```

2. Restart Home Assistant if needed

## Configuration

### Single Curtain Mode

```yaml
type: custom:better-curtain-card
mode: single
entity: cover.bedroom_curtain
direction: up  # optional: up, down, left, right (default: up)
range:
  min: 10      # optional: map UI 0-100% to real position range
  max: 90
```

### Dual Curtain Mode

```yaml
type: custom:better-curtain-card
mode: double
left_entity: cover.living_room_left
right_entity: cover.living_room_right
direction: left  # optional: up, down, left, right (default: up)
left_range:
  min: 15
  max: 85
right_range:
  min: 20
  max: 80
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | `single` \| `double` | `single` | Card operation mode |
| `entity` | string | - | Cover entity ID (single mode only) |
| `left_entity` | string | - | Left cover entity ID (double mode) |
| `right_entity` | string | - | Right cover entity ID (double mode) |
| `direction` | `up` \| `down` \| `left` \| `right` | `up` | UI slider orientation |
| `range` | `{min, max}` | `{0, 100}` | Position mapping range for single mode |
| `left_range` | `{min, max}` | `{0, 100}` | Position mapping range for left curtain |
| `right_range` | `{min, max}` | `{0, 100}` | Position mapping range for right curtain |

## Range Mapping

The range mapping allows you to map the logical 0-100% UI to a specific position range of your curtain device.

**Example**: If your curtain only travels from 10% to 90% of its full range:
- Set `range: {min: 10, max: 90}`
- UI 0% = Real 10% (fully closed)
- UI 100% = Real 90% (fully open)
- UI 50% = Real 50% (middle of available range)

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch for changes (development)
npm run dev

# Type checking
npx tsc --noEmit
```

## Compatibility

- Home Assistant 2023.11+
- Modern browsers with ES2021 support
- Lit 3.x

## License

MIT