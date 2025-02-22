import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../fc-slider.js';

describe('FcSlider', () => {
  it('sets accessability properties', async () => {
    const el = await fixture(
      html`<fc-slider min="15" max="25" value="17"></fc-slider>`,
    );

    const child = el.shadowRoot.firstElementChild;

    expect(child.getAttribute('role')).to.equal('slider');
    expect(child.getAttribute('aria-valuemin')).to.equal('15');
    expect(child.getAttribute('aria-valuemax')).to.equal('25');
    expect(child.getAttribute('aria-valuenow')).to.equal('17');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<fc-slider label="a label"></fc-slider>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
