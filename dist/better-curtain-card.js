var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
let BetterCurtainCard = class BetterCurtainCard extends LitElement {
    // Main render method with enhanced error handling (Task 7)
    render() {
        // Configuration errors
        if (this.error) {
            return this.renderError(this.error, 'configuration');
        }
        if (!this.config) {
            return this.renderLoading('Loading configuration...');
        }
        // Runtime validation: Home Assistant connection
        if (!this.hass) {
            return this.renderLoading('Connecting to Home Assistant...');
        }
        // Runtime validation: Entity existence (single mode)
        if (this.config.mode === 'single' && this.config.entity) {
            const stateObj = this.hass.states[this.config.entity];
            if (!stateObj) {
                return this.renderError(this.formatError('Entity Not Found', `Entity "${this.config.entity}" does not exist.`, 'Check your entity_id in the configuration.'), 'runtime');
            }
            if (stateObj.state === 'unavailable') {
                return this.renderError(this.formatError('Entity Unavailable', `Entity "${this.config.entity}" is currently unavailable.`, 'The device may be offline or experiencing issues.'), 'warning');
            }
        }
        // Runtime validation: Entity existence (double mode)
        if (this.config.mode === 'double') {
            const leftState = this.hass.states[this.config.left_entity];
            const rightState = this.hass.states[this.config.right_entity];
            if (!leftState || !rightState) {
                const missing = [];
                if (!leftState)
                    missing.push(`left_entity: ${this.config.left_entity}`);
                if (!rightState)
                    missing.push(`right_entity: ${this.config.right_entity}`);
                return this.renderError(this.formatError('Entities Not Found', 'One or both entities do not exist.', `Missing: ${missing.join(', ')}`), 'runtime');
            }
            // Entity type validation
            const validateCover = (entity, state, side) => {
                if (!state.attributes || state.attributes.device_class !== 'cover' &&
                    !state.entity_id.startsWith('cover.')) {
                    return `Entity "${entity}" is not a cover device.`;
                }
                return null;
            };
            const leftError = validateCover(this.config.left_entity, leftState, 'left');
            const rightError = validateCover(this.config.right_entity, rightState, 'right');
            if (leftError || rightError) {
                return this.renderError(this.formatError('Invalid Entity Type', 'Entities must be cover devices.', [leftError, rightError].filter(Boolean).join('\n')), 'runtime');
            }
        }
        // Render mode-specific UI
        const mode = this.config.mode || 'single';
        if (mode === 'single') {
            return this.renderSingleMode();
        }
        else if (mode === 'double') {
            return this.renderDoubleMode();
        }
        // Should never reach here due to config validation
        return this.renderError(this.formatError('Unknown Mode', `Mode "${mode}" could not be processed.`, 'This should not happen. Please report this issue.'), 'critical');
    }
    // Enhanced error display
    renderError(errorMessage, type) {
        const typeColors = {
            configuration: '#db4437', // Red
            runtime: '#ff9800', // Orange
            warning: '#ff9800', // Orange
            critical: '#9c27b0' // Purple
        };
        const typeLabels = {
            configuration: 'Configuration Error',
            runtime: 'Runtime Error',
            warning: 'Warning',
            critical: 'Critical Error'
        };
        const color = typeColors[type];
        const label = typeLabels[type];
        return html `
      <div class="error-container" style="border-left: 4px solid ${color};">
        <div class="error-header">
          <strong>${label}</strong>
        </div>
        <div class="error-body">
          ${errorMessage.split('\n').map(line => html `${line}<br>`)}
        </div>
        <div class="error-footer">
          ${type === 'configuration' ? 'Fix the configuration and reload the page.' : ''}
          ${type === 'runtime' ? 'Check entity configuration and device status.' : ''}
          ${type === 'warning' ? 'The card will continue to work, but with limitations.' : ''}
          ${type === 'critical' ? 'This is a bug. Please report it.' : ''}
        </div>
      </div>
    `;
    }
    // Loading state display
    renderLoading(message) {
        return html `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      </div>
    `;
    }
    renderSingleMode() {
        const entity = this.config.entity;
        if (!entity) {
            return html `<div class="error-message">No entity specified for single mode</div>`;
        }
        const stateObj = this.hass.states[entity];
        if (!stateObj) {
            return html `<div class="error-message">Entity not found: ${entity}</div>`;
        }
        if (stateObj.state === 'unavailable') {
            return html `
        <div class="card-header">Better Curtain Card</div>
        <div class="unavailable">Entity unavailable</div>
      `;
        }
        // Get entity position and map to UI based on direction + range
        const rawEntityPosition = stateObj.attributes?.current_position ?? 0;
        // Clamp entity position to valid range before mapping
        const range = this.config.range || { min: 0, max: 100 };
        const clampedEntityPosition = Math.max(range.min, Math.min(range.max, rawEntityPosition));
        const uiPosition = this.mapPositionForUI(clampedEntityPosition);
        const supports = stateObj.attributes?.supported_features || 0;
        const direction = this.config.direction || 'up';
        // Determine if slider should be horizontal
        const isHorizontal = direction === 'left' || direction === 'right';
        // Show range info if custom range is configured
        const rangeInfo = (range.min !== 0 || range.max !== 100)
            ? html `<div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px;">
                Range: ${range.min}-${range.max}%
              </div>`
            : '';
        return html `
      <div class="card-header">Curtain Control (${direction})</div>
      <div class="position-display">Position: ${Math.round(uiPosition)}%</div>
      ${rangeInfo}
      <div class="controls">
        ${(supports & 1) ? html `
          <button class="control-button" @click=${() => this.openCover(entity)}>Open</button>
        ` : ''}
        ${(supports & 2) ? html `
          <button class="control-button" @click=${() => this.closeCover(entity)}>Close</button>
        ` : ''}
        ${(supports & 4) ? html `
          <button class="control-button" @click=${() => this.stopCover(entity)}>Stop</button>
        ` : ''}
        ${(supports & 8) ? html `
          <div class="slider-container">
            <input type="range" 
                   min="0" 
                   max="100" 
                   value=${Math.round(uiPosition)}
                   class=${isHorizontal ? 'horizontal-slider' : 'vertical-slider'}
                   @change=${(e) => this.setCoverPosition(entity, e.target.value)}>
          </div>
        ` : ''}
      </div>
    `;
    }
    renderDoubleMode() {
        const leftEntity = this.config.left_entity;
        const rightEntity = this.config.right_entity;
        if (!leftEntity || !rightEntity) {
            return html `<div class="error-message">Both left_entity and right_entity must be specified for double mode</div>`;
        }
        // Get states for both entities
        const leftState = this.hass.states[leftEntity];
        const rightState = this.hass.states[rightEntity];
        if (!leftState || !rightState) {
            return html `<div class="error-message">One or both entities not found</div>`;
        }
        // Check availability
        const leftUnavailable = leftState.state === 'unavailable';
        const rightUnavailable = rightState.state === 'unavailable';
        // Get positions with range mapping
        const leftRange = this.config.left_range || { min: 0, max: 100 };
        const rightRange = this.config.right_range || { min: 0, max: 100 };
        const leftRawPos = leftState.attributes?.current_position ?? 0;
        const rightRawPos = rightState.attributes?.current_position ?? 0;
        const leftClamped = Math.max(leftRange.min, Math.min(leftRange.max, leftRawPos));
        const rightClamped = Math.max(rightRange.min, Math.min(rightRange.max, rightRawPos));
        const leftUIPos = this.mapPositionForUI(leftClamped, 'left');
        const rightUIPos = this.mapPositionForUI(rightClamped, 'right');
        // Check if positions are significantly different (partial state)
        const isPartial = Math.abs(leftUIPos - rightUIPos) > 5; // 5% tolerance
        const bothClosed = leftUIPos === 0 && rightUIPos === 0;
        const bothOpen = leftUIPos === 100 && rightUIPos === 100;
        // Status text and class
        const statusText = isPartial ? 'Partial' : (bothClosed ? 'Closed' : (bothOpen ? 'Open' : 'Mixed'));
        const statusClass = isPartial ? 'status-partial' : (bothClosed ? 'status-closed' : (bothOpen ? 'status-open' : 'status-mixed'));
        return html `
      <div class="card-header">Dual Curtain Control</div>
      
      <!-- Status Summary -->
      <div class="status-row">
        <span>Status:</span>
        <span class=${statusClass}>${statusText}</span>
      </div>

      <!-- Overall Control区 -->
      <div class="control-section overall-control">
        <div class="section-title">Overall Control</div>
        <div class="controls">
          ${(leftState.attributes?.supported_features & 1 || rightState.attributes?.supported_features & 1) ? html `
            <button class="control-button" @click=${() => this.openBoth()}>Open Both</button>
          ` : ''}
          ${(leftState.attributes?.supported_features & 2 || rightState.attributes?.supported_features & 2) ? html `
            <button class="control-button" @click=${() => this.closeBoth()}>Close Both</button>
          ` : ''}
          ${(leftState.attributes?.supported_features & 4 || rightState.attributes?.supported_features & 4) ? html `
            <button class="control-button" @click=${() => this.stopBoth()}>Stop Both</button>
          ` : ''}
        </div>
      </div>

      <!-- Independent Control区 -->
      <div class="control-section independent-controls">
        <div class="section-title">Independent Control</div>
        <div class="dual-mode-container">
          <!-- Left Curtain -->
          <div class="single-entity">
            <div class="entity-label">Left Curtain</div>
            ${leftUnavailable ? html `
              <div class="unavailable">Unavailable</div>
            ` : html `
              <div class="position-display">${Math.round(leftUIPos)}%</div>
              ${this.renderEntityControls(leftEntity, leftState, leftUIPos, 'left')}
            `}
          </div>

          <!-- Right Curtain -->
          <div class="single-entity">
            <div class="entity-label">Right Curtain</div>
            ${rightUnavailable ? html `
              <div class="unavailable">Unavailable</div>
            ` : html `
              <div class="position-display">${Math.round(rightUIPos)}%</div>
              ${this.renderEntityControls(rightEntity, rightState, rightUIPos, 'right')}
            `}
          </div>
        </div>
      </div>
    `;
    }
    renderEntityControls(entity, stateObj, uiPosition, side) {
        const supports = stateObj.attributes?.supported_features || 0;
        const direction = this.config.direction || 'up';
        const isHorizontal = direction === 'left' || direction === 'right';
        return html `
      <div class="controls">
        ${(supports & 1) ? html `
          <button class="control-button" @click=${() => this.openCover(entity)}>Open</button>
        ` : ''}
        ${(supports & 2) ? html `
          <button class="control-button" @click=${() => this.closeCover(entity)}>Close</button>
        ` : ''}
        ${(supports & 4) ? html `
          <button class="control-button" @click=${() => this.stopCover(entity)}>Stop</button>
        ` : ''}
      </div>
      ${(supports & 8) ? html `
        <div class="slider-container">
          <input type="range" 
                 min="0" 
                 max="100" 
                 value=${Math.round(uiPosition)}
                 class=${isHorizontal ? 'horizontal-slider' : 'vertical-slider'}
                 @change=${(e) => this.setCoverPosition(entity, e.target.value)}>
        </div>
      ` : ''}
    `;
    }
    // Configuration handling with enhanced Task 7 validation
    setConfig(config) {
        // Validate basic structure
        if (!config || typeof config !== 'object') {
            this.error = this.formatError('Configuration Error', 'Invalid configuration format. Expected an object.');
            return;
        }
        // Validate type
        if (!config.type || typeof config.type !== 'string') {
            this.error = this.formatError('Configuration Error', 'Missing or invalid "type" property. Expected: "custom:better-curtain-card"');
            return;
        }
        if (config.type !== 'custom:better-curtain-card') {
            this.error = this.formatError('Configuration Error', `Invalid type: "${config.type}". Expected: "custom:better-curtain-card"`);
            return;
        }
        // Determine and validate mode
        const mode = config.mode || 'single';
        const validModes = ['single', 'double'];
        if (!validModes.includes(mode)) {
            this.error = this.formatError('Invalid Mode', `Mode "${mode}" is not supported.`, `Valid modes: ${validModes.join(', ')}`);
            return;
        }
        // Validate direction
        const validDirections = ['up', 'down', 'left', 'right'];
        if (config.direction && !validDirections.includes(config.direction)) {
            this.error = this.formatError('Invalid Direction', `"${config.direction}" is not a valid direction.`, `Valid directions: ${validDirections.join(', ')}`);
            return;
        }
        // Validate entity requirements based on mode
        if (mode === 'single') {
            if (!config.entity) {
                this.error = this.formatError('Missing Entity', 'Single mode requires "entity" property.', 'Example: entity: cover.living_room');
                return;
            }
            if (typeof config.entity !== 'string') {
                this.error = this.formatError('Invalid Entity', '"entity" must be a string.', `Received: ${typeof config.entity}`);
                return;
            }
        }
        else if (mode === 'double') {
            if (!config.left_entity || !config.right_entity) {
                this.error = this.formatError('Missing Entities', 'Double mode requires both "left_entity" and "right_entity".', 'Example: left_entity: cover.left, right_entity: cover.right');
                return;
            }
            if (typeof config.left_entity !== 'string' || typeof config.right_entity !== 'string') {
                this.error = this.formatError('Invalid Entities', '"left_entity" and "right_entity" must be strings.', `Received left: ${typeof config.left_entity}, right: ${typeof config.right_entity}`);
                return;
            }
            // Check for duplicate entities
            if (config.left_entity === config.right_entity) {
                this.error = this.formatError('Duplicate Entities', 'left_entity and right_entity cannot be the same.', `Both configured as: ${config.left_entity}`);
                return;
            }
        }
        // Validate range configurations
        const validatedRange = this.validateRange(config.range, 'range');
        const validatedLeftRange = this.validateRange(config.left_range, 'left_range');
        const validatedRightRange = this.validateRange(config.right_range, 'right_range');
        if (this.error)
            return; // Stop if validation failed
        // Store config with defaults
        if (mode === 'single') {
            this.config = {
                type: config.type,
                mode: 'single',
                entity: config.entity,
                direction: config.direction || 'up',
                range: validatedRange || { min: 0, max: 100 }
            };
        }
        else {
            this.config = {
                type: config.type,
                mode: 'double',
                left_entity: config.left_entity,
                right_entity: config.right_entity,
                direction: config.direction || 'up',
                left_range: validatedLeftRange || { min: 0, max: 100 },
                right_range: validatedRightRange || { min: 0, max: 100 }
            };
        }
        this.error = undefined;
    }
    // Helper to format error messages with clear structure
    formatError(title, message, details) {
        let formatted = `❌ ${title}\n${message}`;
        if (details) {
            formatted += `\n\nDetails: ${details}`;
        }
        return formatted;
    }
    // Enhanced range validation (Task 7)
    validateRange(range, name) {
        // Null/undefined is valid (uses default 0-100)
        if (range === null || range === undefined)
            return null;
        // Type validation
        if (typeof range !== 'object') {
            this.error = this.formatError('Invalid Range', `${name} must be an object with min and max properties.`, `Received: ${typeof range}`);
            return null;
        }
        // Property existence
        if (!('min' in range) || !('max' in range)) {
            this.error = this.formatError('Invalid Range', `${name} is missing required properties.`, `Required: { min: number, max: number }`);
            return null;
        }
        // Value type validation
        if (typeof range.min !== 'number' || typeof range.max !== 'number') {
            this.error = this.formatError('Invalid Range', `${name} properties must be numbers.`, `Received: min=${typeof range.min}, max=${typeof range.max}`);
            return null;
        }
        // NaN check
        if (isNaN(range.min) || isNaN(range.max)) {
            this.error = this.formatError('Invalid Range', `${name} values cannot be NaN.`);
            return null;
        }
        // Infinity check
        if (!isFinite(range.min) || !isFinite(range.max)) {
            this.error = this.formatError('Invalid Range', `${name} values must be finite numbers.`, `Received: min=${range.min}, max=${range.max}`);
            return null;
        }
        // Min < Max validation
        if (range.min >= range.max) {
            this.error = this.formatError('Invalid Range', `min (${range.min}) must be less than max (${range.max}).`, `Range: ${range.min}-${range.max}`);
            return null;
        }
        // Clamp to valid 0-100 range
        const min = Math.max(0, Math.min(100, range.min));
        const max = Math.max(0, Math.min(100, range.max));
        // Final validation after clamping
        if (min >= max) {
            this.error = this.formatError('Invalid Range', `${name} values result in invalid range after clamping.`, `Original: ${range.min}-${range.max}, Clamped: ${min}-${max}`);
            return null;
        }
        // Warn about clamping if values were modified
        if (min !== range.min || max !== range.max) {
            console.warn(`BetterCurtainCard: ${name} values clamped to valid range: ${min}-${max}`);
        }
        return { min, max };
    }
    // Hass property
    get hass() {
        return this._hass;
    }
    set hass(value) {
        this._hass = value;
        this.requestUpdate();
    }
    // Combined direction and range mapping (Task 2 + Task 3)
    mapPositionForUI(entityPosition, side) {
        // Step 1: Map entity position to UI position (0-100) using range
        const range = this.getRangeForSide(side);
        // Clamp entity position to range first
        const clamped = Math.max(range.min, Math.min(range.max, entityPosition));
        // Map to UI: ui = (entity - min) * 100 / (max - min)
        let uiPosition = ((clamped - range.min) * 100) / (range.max - range.min);
        // Ensure 0-100
        uiPosition = Math.max(0, Math.min(100, uiPosition));
        // Step 2: Apply direction transformation
        const direction = this.config.direction || 'up';
        switch (direction) {
            case 'up': // 0=bottom, 100=top (natural vertical)
                return uiPosition;
            case 'down': // 0=top, 100=bottom (inverted vertical)
                return 100 - uiPosition;
            case 'left': // 0=right, 100=left (inverted horizontal)
                return 100 - uiPosition;
            case 'right': // 0=left, 100=right (natural horizontal)
                return uiPosition;
            default:
                return uiPosition;
        }
    }
    mapPositionForEntity(uiPosition, side) {
        // Step 1: Apply inverse direction transformation
        const direction = this.config.direction || 'up';
        let transformedUI;
        switch (direction) {
            case 'up': // UI 0=bottom, 100=top → Entity 0=bottom, 100=top
                transformedUI = uiPosition;
                break;
            case 'down': // UI 0=top, 100=bottom → Entity 0=bottom, 100=top
                transformedUI = 100 - uiPosition;
                break;
            case 'left': // UI 0=right, 100=left → Entity 0=bottom, 100=top
                transformedUI = 100 - uiPosition;
                break;
            case 'right': // UI 0=left, 100=right → Entity 0=bottom, 100=top
                transformedUI = uiPosition;
                break;
            default:
                transformedUI = uiPosition;
        }
        // Step 2: Map transformed UI position to entity position using range
        const range = this.getRangeForSide(side);
        // Clamp transformed UI to 0-100 first
        const clamped = Math.max(0, Math.min(100, transformedUI));
        // Map to entity: entity = min + ui * (max - min) / 100
        const entity = range.min + (clamped * (range.max - range.min) / 100);
        return Math.max(range.min, Math.min(range.max, entity)); // Final clamp to range
    }
    // Helper to get range for specific side
    getRangeForSide(side) {
        if (this.config.mode === 'double') {
            if (side === 'left') {
                return this.config.left_range || { min: 0, max: 100 };
            }
            else if (side === 'right') {
                return this.config.right_range || { min: 0, max: 100 };
            }
        }
        // Single mode or default
        return this.config.range || { min: 0, max: 100 };
    }
    // Service calls (Task 2 + Task 4)
    async openCover(entity) {
        if (!this.hass)
            return;
        await this.hass.callService('cover', 'open_cover', { entity_id: entity });
    }
    async closeCover(entity) {
        if (!this.hass)
            return;
        await this.hass.callService('cover', 'close_cover', { entity_id: entity });
    }
    async stopCover(entity) {
        if (!this.hass)
            return;
        await this.hass.callService('cover', 'stop_cover', { entity_id: entity });
    }
    async setCoverPosition(entity, uiPositionString) {
        if (!this.hass)
            return;
        // Map UI position back to entity position (with range + direction)
        const uiPosition = parseInt(uiPositionString, 10);
        // Determine side for double mode
        let side;
        if (this.config.mode === 'double') {
            if (entity === this.config.left_entity)
                side = 'left';
            else if (entity === this.config.right_entity)
                side = 'right';
        }
        const entityPosition = this.mapPositionForEntity(uiPosition, side);
        await this.hass.callService('cover', 'set_cover_position', {
            entity_id: entity,
            position: entityPosition
        });
    }
    // Double mode service helpers
    async openBoth() {
        if (!this.config.left_entity || !this.config.right_entity)
            return;
        const leftAvailable = this.hass.states[this.config.left_entity]?.state !== 'unavailable';
        const rightAvailable = this.hass.states[this.config.right_entity]?.state !== 'unavailable';
        const promises = [];
        if (leftAvailable)
            promises.push(this.openCover(this.config.left_entity));
        if (rightAvailable)
            promises.push(this.openCover(this.config.right_entity));
        await Promise.all(promises);
    }
    async closeBoth() {
        if (!this.config.left_entity || !this.config.right_entity)
            return;
        const leftAvailable = this.hass.states[this.config.left_entity]?.state !== 'unavailable';
        const rightAvailable = this.hass.states[this.config.right_entity]?.state !== 'unavailable';
        const promises = [];
        if (leftAvailable)
            promises.push(this.closeCover(this.config.left_entity));
        if (rightAvailable)
            promises.push(this.closeCover(this.config.right_entity));
        await Promise.all(promises);
    }
    async stopBoth() {
        if (!this.config.left_entity || !this.config.right_entity)
            return;
        const leftAvailable = this.hass.states[this.config.left_entity]?.state !== 'unavailable';
        const rightAvailable = this.hass.states[this.config.right_entity]?.state !== 'unavailable';
        const promises = [];
        if (leftAvailable)
            promises.push(this.stopCover(this.config.left_entity));
        if (rightAvailable)
            promises.push(this.stopCover(this.config.right_entity));
        await Promise.all(promises);
    }
    // Card size hint for Home Assistant
    getCardSize() {
        return 3;
    }
};
BetterCurtainCard.styles = css `
    :host {
      display: block;
      background: var(--card-background-color, var(--ha-card-background));
      border-radius: var(--ha-card-border-radius, 4px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
      padding: 16px;
      font-family: var(--ha-font-family, Roboto, sans-serif);
    }

    .card-header {
      font-size: 1.2em;
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color);
    }

    .error-message {
      color: var(--error-color, #db4437);
      padding: 8px;
      background: var(--error-background-color, #ffebee);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .loading {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 20px;
    }

    .controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
    }

    .control-button {
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      min-width: 60px;
      transition: background-color 0.2s;
    }

    .control-button:hover {
      background: var(--dark-primary-color, #1976d2);
    }

    .control-button:disabled {
      background: var(--disabled-color, #9e9e9e);
      cursor: not-allowed;
    }

    .position-display {
      text-align: center;
      font-size: 1.1em;
      font-weight: 500;
      margin: 12px 0;
      color: var(--primary-text-color);
    }

    .slider-container {
      margin: 12px 0;
    }

    input[type="range"] {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--slider-track-color, #dcdcdc);
      outline: none;
      -webkit-appearance: none;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
    }

    input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      border: none;
    }

    .unavailable {
      color: var(--state-unavailable-color, #757575);
      font-style: italic;
      text-align: center;
      padding: 8px;
    }

    /* Horizontal slider for left/right directions */
    .horizontal-slider {
      width: 100%;
      margin: 10px 0;
    }

    /* Vertical slider for up/down directions */
    .vertical-slider {
      height: 100px;
      transform: rotate(270deg);
      transform-origin: center;
      margin: 20px 0;
    }

    /* Double mode specific styles */
    .dual-mode-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }

    .single-entity {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      padding: 8px;
    }

    .entity-label {
      font-size: 0.9em;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--secondary-text-color);
      text-align: center;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0 16px 0;
      padding: 8px 12px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      font-size: 0.95em;
    }

    .status-row span:first-child {
      font-weight: 500;
      color: var(--secondary-text-color);
    }

    .status-partial {
      color: var(--state-cover-partial-color, #ff9800);
      font-weight: 700;
    }

    .status-closed {
      color: var(--state-cover-closed-color, #4caf50);
      font-weight: 700;
    }

    .status-open {
      color: var(--state-cover-open-color, #2196f3);
      font-weight: 700;
    }

    .status-mixed {
      color: #9c27b0;
      font-weight: 700;
    }

    /* Control sections for Task 6 */
    .control-section {
      margin-bottom: 16px;
      padding: 12px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border-radius: 6px;
      border: 1px solid var(--divider-color, #e0e0e0);
    }

    .section-title {
      font-weight: 600;
      font-size: 1em;
      margin-bottom: 8px;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: '';
      width: 3px;
      height: 16px;
      background: var(--primary-color, #2196f3);
      border-radius: 2px;
    }

    .overall-control {
      border-left: 4px solid var(--primary-color, #2196f3);
    }

    .independent-controls {
      border-left: 4px solid #ff9800;
    }

    /* Enhanced dual mode container */
    .dual-mode-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 8px;
    }

    .single-entity {
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      padding: 10px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      text-align: center;
    }

    .entity-label {
      font-size: 0.95em;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Enhanced error display (Task 7) */
    .error-container {
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border-radius: 6px;
      padding: 16px;
      margin: 8px 0;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .error-header {
      font-size: 1.1em;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--error-color, #db4437);
    }

    .error-body {
      font-family: monospace;
      font-size: 0.9em;
      line-height: 1.6;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, #f5f5f5);
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .error-footer {
      font-size: 0.85em;
      color: var(--secondary-text-color);
      font-style: italic;
      margin-top: 8px;
    }

    /* Loading states (Task 7) */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 16px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--divider-color, #e0e0e0);
      border-top: 4px solid var(--primary-color, #2196f3);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      color: var(--secondary-text-color);
      font-size: 0.95em;
      text-align: center;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .dual-mode-container {
        grid-template-columns: 1fr;
      }
    }
  `;
__decorate([
    state()
], BetterCurtainCard.prototype, "config", void 0);
__decorate([
    state()
], BetterCurtainCard.prototype, "error", void 0);
__decorate([
    property({ attribute: false })
], BetterCurtainCard.prototype, "hass", null);
BetterCurtainCard = __decorate([
    customElement('better-curtain-card')
], BetterCurtainCard);
export { BetterCurtainCard };
//# sourceMappingURL=better-curtain-card.js.map