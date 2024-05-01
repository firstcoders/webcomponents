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
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import gridStyles from './styles/grid.js';
import rowStyles from './styles/row.js';
import backgroundStyles from './styles/backgrounds.js';
import formatSeconds from './lib/format-seconds.js';

export class RegionArea extends LitElement {
  static get styles() {
    return [
      gridStyles,
      rowStyles,
      typographyStyles,
      backgroundStyles,
      css`
        :host {
          display: block;
        }

        .wrapper {
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
          box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.85);
          position: relative;
        }

        .absolute {
          position: absolute;
        }

        .bottom {
          bottom: 0;
        }

        .left {
          left: calc(var(--stemplayer-js-grid-base, 1.5rem) * -2);
        }

        .right {
          right: calc(var(--stemplayer-js-grid-base, 1.5rem) * -2);
        }

        .toolbar {
          height: 100%;
          z-index: 99999;
        }
      `,
      spacingStyles,
    ];
  }

  static properties = {
    totalDuration: { type: Number },
    offset: { type: Number },
    duration: { type: Number },
  };

  constructor() {
    super();

    this.addEventListener('mousedown', this.onMouseDown);
    this.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', e => this.onMouseUp(e)); // mouse up _anywhere_ (not just in this element) will trigger the select-end behaviour
    this.addEventListener('mouseout', this.onMouseOut);
    this.addEventListener('click', this.#handleSeek);
  }

  render() {
    return html`${this.offset !== undefined && this.duration !== undefined
      ? html`<div
            class="toolbar absolute left w2"
            style="left: calc(${this.pixelsPerSecond * this.offset}px - 50px);"
          >
            <div class="w2 hRow textCenter noSelect textXs">
              ${formatSeconds(this.offset)}
            </div>
          </div>
          <div
            class="toolbar absolute right w2"
            style="left: ${this.pixelsPerSecond *
            (this.offset + this.duration)}px;"
          >
            <div class="w2 hRow textCenter noSelect textXs">
              ${formatSeconds(this.offset + this.duration)}
            </div>
            <soundws-player-button
              @click=${this.onDeselectClick}
              class="hRow w2"
              type="deselect"
            ></soundws-player-button>
          </div>
          <div class="wrapper">
            <div
              class="selection"
              style="left: ${Math.round(
                this.pixelsPerSecond * this.offset,
              )}px; width: ${Math.round(
                this.pixelsPerSecond * this.duration,
              )}px;"
            ></div>
          </div>`
      : ''}`;
  }

  onMouseDown(e) {
    this.mouseDownX = e.offsetX;
  }

  onMouseMove(e) {
    if (this.mouseDownX && e.offsetX > 0 && e.offsetX < this.offsetWidth) {
      this.lastOffsetX = e.offsetX;
      const distance = Math.abs(e.offsetX - this.mouseDownX);
      this.mouseMoveWidth = distance; // > 10 ? distance : undefined;

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

  onMouseOut(e) {
    // console.log('mouseout');
    // this.onMouseUp(e);
  }

  onDeselectClick(e) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(
      new CustomEvent('region:change', {
        detail: { offset: undefined, duration: undefined },
      }),
    );
  }

  #dispatchEvent(eventname) {
    this.dispatchEvent(
      new CustomEvent(eventname, {
        detail: this.state,
      }),
    );
  }

  get state() {
    const { pixelsPerSecond } = this;
    const coord1 = this.mouseDownX;
    const coord2 = this.lastOffsetX;
    const left = coord1 < coord2 ? coord1 : coord2;
    const width = this.mouseMoveWidth;
    const offset = Math.floor((left / pixelsPerSecond) * 100) / 100;
    const duration = Math.floor((width / pixelsPerSecond) * 100) / 100;

    return { left, width, offset, duration };
  }

  get pixelsPerSecond() {
    return this.totalDuration
      ? this.offsetWidth / this.totalDuration
      : undefined;
  }

  #handleSeek(e) {
    this.dispatchEvent(
      new CustomEvent('region:seek', {
        bubbles: true,
        composed: true,
        detail: Math.round((e.offsetX / e.target.clientWidth) * 100) / 100,
      }),
    );
  }
}
