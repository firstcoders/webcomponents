/**
 * Copyright (C) 2019-2023 First Coders LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { LitElement, css, html } from 'lit';

export class RegionArea extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }

      .selection {
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: var(
          --stemplayer-js-region-highlight-background-color,
          rgba(255, 255, 255, 0.1)
        );
        height: 100%;
        z-index: 1000;
        border-width: 0 1px 0 1px;
        border-style: solid;
        border-color: var(
          --stemplayer-js-region-highlight-border-color,
          rgba(255, 255, 255, 0.75)
        );
        box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.7);
      }
    `;
  }

  static properties = {
    totalDuration: { type: Number },
    offset: { type: Number },
    duration: { type: Number },
    selectionLeft: { state: true },
    selectionWidth: { state: true },
  };

  constructor() {
    super();

    this.addEventListener('mousedown', this.onMouseDown);
    this.addEventListener('mousemove', this.onMouseMove);
    this.addEventListener('mouseup', this.onMouseUp);
    this.addEventListener('mouseout', this.onMouseOut);
  }

  render() {
    return html`${this.selectionLeft && this.selectionWidth
      ? html`<div
          class="selection"
          style="left: ${this.selectionLeft}; width: ${this.selectionWidth};"
        ></div>`
      : ''}`;
  }

  updated() {
    this.drawRegion();
  }

  onMouseDown(e) {
    this.mouseDownX = e.offsetX;
  }

  onMouseMove(e) {
    if (this.mouseDownX) {
      this.lastOffsetX = e.offsetX;
      const distance = Math.abs(e.offsetX - this.mouseDownX);

      this.mouseMoveWidth = distance > 10 ? distance : undefined;
      if (this.mouseMoveWidth) {
        this.#dispatchEvent('region:update');
      }
    }
  }

  onMouseUp() {
    if (this.mouseMoveWidth) {
      // if we're dragging, dispatch and event
      this.#dispatchEvent('region:change');
    }

    // reset
    this.mouseMoveWidth = undefined;
    this.mouseDownX = undefined;
  }

  onMouseOut() {
    this.onMouseUp();
  }

  #dispatchEvent(eventname) {
    const { pixelsPerSecond } = this;
    const coord1 = this.mouseDownX;
    const coord2 = this.lastOffsetX;
    const left = coord1 < coord2 ? coord1 : coord2;
    const width = this.mouseMoveWidth;
    const offset = left / pixelsPerSecond;
    const duration = width / pixelsPerSecond;

    this.dispatchEvent(
      new CustomEvent(eventname, {
        bubbles: true,
        composed: true,
        detail: { left, width, offset, duration },
      }),
    );
  }

  get pixelsPerSecond() {
    return this.totalDuration
      ? this.offsetWidth / this.totalDuration
      : undefined;
  }

  drawRegion() {
    if (this.offset && this.duration) {
      const { pixelsPerSecond } = this;
      this.selectionLeft = `${Math.round(pixelsPerSecond * this.offset)}px`;
      this.selectionWidth = `${Math.round(pixelsPerSecond * this.duration)}px`;
    }
  }
}
