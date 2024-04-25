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

    // loop = Math.floor((this.absoluteCurrentTime - this.absoluteStart) / this.playDuration);
    expect(
      new Timeline({
        playDuration: 60,
        relativeStart: 65, // seeked
        relativeCurrentTime: 0,
        offset: 0,
      }).calculateOffset(0), // second loop
    ).equal(5);

    // expect(
    //   new Timeline({
    //     relativeCurrentTime: 74.62321995464852,
    //     absoluteCurrentTime: 5.023219954648526,
    //     absoluteStart: -69.6,
    //     relativeStart: 69.6,
    //     playDuration: 73.301873,
    //     audioDuration: 73.301873,
    //     offset: 0,
    //   }).calculateOffset(0), // second loop
    // ).equal(5);
  });
});
