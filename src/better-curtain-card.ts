import { LitElement, html, css, CSSResultGroup, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Home Assistant types (minimal definitions for our needs)
interface HomeAssistant {
  callService: (domain: string, service: string, serviceData?: any) => Promise<void>;
  states: Record<string, any>;
}

interface LovelaceCardConfig {
  type: string;
  mode?: 'single' | 'double';
  entity?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  left_entity?: string;
  right_entity?: string;
  range?: {
    min: number;
    max: number;
  };
  left_range?: {
    min: number;
    max: number;
  };
  right_range?: {
    min: number;
    max: number;
  };
}

@customElement('better-curtain-card')
export class BetterCurtainCard extends LitElement {
  @state() private config!: LovelaceCardConfig;
  @state() private error?: string;
  
  private _hass?: HomeAssistant;

  // Default configuration
  private defaultConfig: Partial<LovelaceCardConfig> = {
    mode: 'single',
    direction: 'up',
    range: { min: 0, max: 100 }
  };

  static styles: CSSResultGroup = css`
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

    ha-slider {
      width: 100%;
    }

    .unavailable {
      color: var(--state-unavailable-color, #757575);
      font-style: italic;
      text-align: center;
      padding: 8px;
    }

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
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      font-size: 0.9em;
    }

    .status-partial {
      color: var(--state-cover-partial-color, #ff9800);
      font-weight: 500;
    }

    .status-closed {
      color: var(--state-cover-closed-color, #4caf50);
    }

    .status-open {
      color: var(--state-cover-open-color, #2196f3);
    }

    /* Horizontal slider orientation */
    .horizontal-slider {
      transform: rotate(0deg);
    }
  `;

  // Main render method
  render() {
    if (this.error) {
      return html`
        <div class="error-message">
          <strong>Configuration Error:</strong><br>
          ${this.error}
        </div>
      `;
    }

    if (!this.config) {
      return html`<div class="loading">Loading...</div>`;
    }

    if (!this.hass) {
      return html`<div class="loading">Connecting to Home Assistant...</div>`;
    }

    const mode = this.config.mode || 'single';

    if (mode === 'single') {
      return this.renderSingleMode();
    } else if (mode === 'double') {
      return this.renderDoubleMode();
    }

    return html`<div class="error-message">Invalid mode: ${mode}</div>`;
  }

  private renderSingleMode() {
    const entity = this.config.entity;
    if (!entity) {
      return html`<div class="error-message">No entity specified for single mode</div>`;
    }

    const stateObj = this.hass.states[entity];
    if (!stateObj) {
      return html`<div class="error-message">Entity not found: ${entity}</div>`;
    }

    if (stateObj.state === 'unavailable') {
      return html`
        <div class="card-header">Better Curtain Card</div>
        <div class="unavailable">Entity unavailable</div>
      `;
    }

    const position = this.getDisplayPosition(stateObj);
    const supports = stateObj.attributes?.supported_features || 0;

    return html`
      <div class="card-header">Curtain Control</div>
      <div class="position-display">Position: ${Math.round(position)}%</div>
      <div class="controls">
        ${(supports & 1) ? html`
          <button class="control-button" @click=${() => this.openCover(entity)}>Open</button>
        ` : ''}
        ${(supports & 2) ? html`
          <button class="control-button" @click=${() => this.closeCover(entity)}>Close</button>
        ` : ''}
        ${(supports & 4) ? html`
          <button class="control-button" @click=${() => this.stopCover(entity)}>Stop</button>
        ` : ''}
        ${(supports & 8) ? html`
          <div class="slider-container">
            <input type="range" 
                   min="0" 
                   max="100" 
                   value=${Math.round(position)}
                   @change=${(e: Event) => this.setCoverPosition(entity, (e.target as HTMLInputElement).value)}
                   style="width: 100%">
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderDoubleMode() {
    const leftEntity = this.config.left_entity;
    const rightEntity = this.config.right_entity;

    if (!leftEntity || !rightEntity) {
      return html`<div class="error-message">Both left_entity and right_entity must be specified for double mode</div>`;
    }

    const leftState = this.hass.states[leftEntity];
    const rightState = this.hass.states[rightEntity];

    if (!leftState || !rightState) {
      return html`<div class="error-message">One or both entities not found</div>`;
    }

    const leftPos = this.getDisplayPosition(leftState, 'left');
    const rightPos = this.getDisplayPosition(rightState, 'right');
    const isPartial = Math.abs(leftPos - rightPos) > 5; // 5% tolerance

    return html`
      <div class="card-header">Dual Curtain Control</div>
      <div class="status-row">
        <span>Status:</span>
        <span class=${isPartial ? 'status-partial' : (leftPos === 0 && rightPos === 0 ? 'status-closed' : 'status-open')}>
          ${isPartial ? 'Partial' : (leftPos === 0 && rightPos === 0 ? 'Closed' : 'Open')}
        </span>
      </div>
      
      <div class="controls">
        <button class="control-button" @click=${() => this.openCover(leftEntity)}>Left Open</button>
        <button class="control-button" @click=${() => this.closeCover(leftEntity)}>Left Close</button>
        <button class="control-button" @click=${() => this.stopCover(leftEntity)}>Left Stop</button>
        <button class="control-button" @click=${() => this.openCover(rightEntity)}>Right Open</button>
        <button class="control-button" @click=${() => this.closeCover(rightEntity)}>Right Close</button>
        <button class="control-button" @click=${() => this.stopCover(rightEntity)}>Right Stop</button>
        <button class="control-button" @click=${() => this.openBoth()}>Open Both</button>
        <button class="control-button" @click=${() => this.closeBoth()}>Close Both</button>
        <button class="control-button" @click=${() => this.stopBoth()}>Stop Both</button>
      </div>

      <div class="dual-mode-container">
        <div class="single-entity">
          <div class="entity-label">Left Curtain</div>
          <div class="position-display">${Math.round(leftPos)}%</div>
          ${(leftState.attributes?.supported_features & 8) ? html`
            <input type="range" min="0" max="100" value=${Math.round(leftPos)}
                   @change=${(e: Event) => this.setCoverPosition(leftEntity, (e.target as HTMLInputElement).value)}
                   style="width: 100%">
          ` : ''}
        </div>
        <div class="single-entity">
          <div class="entity-label">Right Curtain</div>
          <div class="position-display">${Math.round(rightPos)}%</div>
          ${(rightState.attributes?.supported_features & 8) ? html`
            <input type="range" min="0" max="100" value=${Math.round(rightPos)}
                   @change=${(e: Event) => this.setCoverPosition(rightEntity, (e.target as HTMLInputElement).value)}
                   style="width: 100%">
          ` : ''}
        </div>
      </div>
    `;
  }

  // Configuration handling
  setConfig(config: LovelaceCardConfig) {
    // Validate basic structure
    if (!config || typeof config !== 'object') {
      this.error = 'Invalid configuration format';
      return;
    }

    // Create merged config with defaults
    this.config = { ...this.defaultConfig, ...config };

    // Validate mode
    if (this.config.mode !== 'single' && this.config.mode !== 'double') {
      this.error = `Invalid mode: ${this.config.mode}. Must be 'single' or 'double'`;
      return;
    }

    // Validate entity requirements based on mode
    if (this.config.mode === 'single' && !this.config.entity) {
      this.error = 'Single mode requires an entity';
      return;
    }

    if (this.config.mode === 'double') {
      if (!this.config.left_entity || !this.config.right_entity) {
        this.error = 'Double mode requires both left_entity and right_entity';
        return;
      }
    }

    // Validate range configuration if provided
    if (this.config.range) {
      if (this.config.range.min >= this.config.range.max) {
        this.error = `Invalid range: min (${this.config.range.min}) must be less than max (${this.config.range.max})`;
        return;
      }
    }

    if (this.config.left_range && (this.config.left_range.min >= this.config.left_range.max)) {
      this.error = 'Invalid left_range: min must be less than max';
      return;
    }

    if (this.config.right_range && (this.config.right_range.min >= this.config.right_range.max)) {
      this.error = 'Invalid right_range: min must be less than max';
      return;
    }

    this.error = undefined;
  }

  // Hass property
  @property({ attribute: false })
  get hass(): HomeAssistant {
    return this._hass!;
  }

  set hass(value: HomeAssistant) {
    this._hass = value;
    this.requestUpdate();
  }

  // Service calls
  private async openCover(entity: string) {
    if (!this.hass) return;
    await this.hass.callService('cover', 'open_cover', { entity_id: entity });
  }

  private async closeCover(entity: string) {
    if (!this.hass) return;
    await this.hass.callService('cover', 'close_cover', { entity_id: entity });
  }

  private async stopCover(entity: string) {
    if (!this.hass) return;
    await this.hass.callService('cover', 'stop_cover', { entity_id: entity });
  }

  private async setCoverPosition(entity: string, uiPosition: string) {
    if (!this.hass) return;
    
    let position = parseInt(uiPosition, 10);
    
    // Apply range mapping if configured
    const range = this.getRangeForEntity(entity);
    if (range) {
      // Map UI position (0-100) to real position (min-max)
      position = Math.round(range.min + (position * (range.max - range.min) / 100));
    }

    await this.hass.callService('cover', 'set_cover_position', {
      entity_id: entity,
      position: position
    });
  }

  private async openBoth() {
    if (!this.config.left_entity || !this.config.right_entity) return;
    await Promise.all([
      this.openCover(this.config.left_entity),
      this.openCover(this.config.right_entity)
    ]);
  }

  private async closeBoth() {
    if (!this.config.left_entity || !this.config.right_entity) return;
    await Promise.all([
      this.closeCover(this.config.left_entity),
      this.closeCover(this.config.right_entity)
    ]);
  }

  private async stopBoth() {
    if (!this.config.left_entity || !this.config.right_entity) return;
    await Promise.all([
      this.stopCover(this.config.left_entity),
      this.stopCover(this.config.right_entity)
    ]);
  }

  // Position calculation helpers
  private getDisplayPosition(stateObj: any, side?: 'left' | 'right'): number {
    if (!stateObj || stateObj.state === 'unavailable') return 0;

    let position = stateObj.attributes?.current_position ?? 0;
    
    // Apply range mapping (real position → UI position)
    const range = this.getRangeForEntity(stateObj.entity_id, side);
    if (range && range.min !== 0 && range.max !== 100) {
      position = ((position - range.min) * 100) / (range.max - range.min);
    }

    // Clamp to 0-100
    position = Math.max(0, Math.min(100, position));

    return position;
  }

  private getRangeForEntity(entityId: string, side?: 'left' | 'right'): { min: number; max: number } | null {
    if (this.config.mode === 'single') {
      return this.config.range || null;
    }
    
    if (this.config.mode === 'double') {
      if (side === 'left') {
        return this.config.left_range || null;
      } else if (side === 'right') {
        return this.config.right_range || null;
      }
      
      // Auto-detect side for double mode
      if (this.config.left_entity === entityId) {
        return this.config.left_range || null;
      } else if (this.config.right_entity === entityId) {
        return this.config.right_range || null;
      }
    }
    
    return null;
  }

  // Card size hint for Home Assistant
  getCardSize(): number {
    return 3;
  }
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'better-curtain-card': BetterCurtainCard;
  }
}