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
import { html, css } from 'lit';
import { ResponsiveLitElement } from './ResponsiveLitElement.js';
import gridStyles from './styles/grid.js';
import rowStyles from './styles/row.js';
import flexStyles from './styles/flex.js';
import spacingStyles from './styles/spacing.js';
import typographyStyles from './styles/typography.js';
import bgStyles from './styles/backgrounds.js';
import utilityStyle from './styles/utilities.js';

/**
 * A component to render a single stem
 */
export class SoundwsStemPlayerStem extends ResponsiveLitElement {
  static get styles() {
    return [
      gridStyles,
      rowStyles,
      flexStyles,
      spacingStyles,
      typographyStyles,
      bgStyles,
      utilityStyle,
      css`
        :host {
          display: block;
        }
      `,
    ];
  }

  render() {
    return html`<div>
      ${this.displayMode === 'lg'
        ? this.#getLargeScreenTpl()
        : this.#getSmallScreenTpl()}
    </div>`;
  }

  /**
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  #getSmallScreenTpl() {
    return html`<div class="row"></div>`;
  }

  /**
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  #getLargeScreenTpl() {
    return html`<div class="row dFlex ppsWidth">
      <div class="dFlex stickLeft bgPlayer z99 flexNoShrink wControls">
        <slot name="controls"></slot>
      </div>
      <div class="flex1">
        <slot name="flex"></slot>
      </div>
      <div class="wSpacer flexNoShrink">
        <slot name="end"></slot>
      </div>
    </div>`;
  }
}
