import { expect } from '@bundled-es-modules/chai';
import Timeline from '../../src/timeline';

describe('calculateAbsoluteStart', () => {
  describe('when offset = 0', () => {
    it('should return the correct absolute value', () => {
      expect(
        new Timeline({
          absoluteStart: 0,
          offset: 0,
        }).calculateAbsoluteStart(0),
      ).equal(0);

      expect(
        new Timeline({
          absoluteStart: -10,
          offset: 0,
        }).calculateAbsoluteStart(0),
      ).equal(-10);

      expect(
        new Timeline({
          absoluteStart: -10,
          offset: 0,
        }).calculateAbsoluteStart(10),
      ).equal(0);
    });
  });

  describe('when offset = 10', () => {
    it('should return the correct absolute value', () => {
      expect(
        new Timeline({
          absoluteStart: 0,
          offset: 10,
        }).calculateAbsoluteStart(0),
      ).equal(-10);

      expect(
        new Timeline({
          absoluteStart: -10,
          offset: 10,
        }).calculateAbsoluteStart(0),
      ).equal(-20);

      expect(
        new Timeline({
          absoluteStart: -10,
          offset: 10,
        }).calculateAbsoluteStart(10),
      ).equal(-10);
    });
  });
});

describe('calculateOffset', () => {
  it('should return the correct value', () => {
    expect(
      new Timeline({
        playDuration: 60,
        relativeStart: 0,
        offset: 0,
      }).calculateOffset(0), // first loop
    ).equal(0);

    expect(
      new Timeline({
        playDuration: 60,
        relativeStart: 0,
        offset: 0,
      }).calculateOffset(10), // first loop
    ).equal(0);

    expect(
      new Timeline({
        playDuration: 60,
        relativeStart: 5, // seeked
        offset: 0,
      }).calculateOffset(0), // first loop
    ).equal(5);
  });
});
