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
        relativeStart: 0,
      }).calculateOffset(0),
    ).equal(0);

    expect(
      new Timeline({
        relativeStart: 4,
      }).calculateOffset(0),
    ).equal(4);

    expect(
      new Timeline({
        relativeStart: 0,
        offset: 0,
      }).calculateOffset(0),
    ).equal(0);

    expect(
      new Timeline({
        relativeStart: 0,
        offset: 5,
      }).calculateOffset(0),
    ).equal(5);

    expect(
      new Timeline({
        relativeStart: 0,
        offset: 5,
      }).calculateOffset(10),
    ).equal(0);
  });

  describe('when on subsequent loops the seektime (relativestart) should be at the start of the loop', () => {
    it('should return', () => {
      expect(
        new Timeline({
          absoluteCurrentTime: 19, // loop 2
          absoluteStart: 0,
          relativeStart: 4.5,
          playDuration: 10,
          offset: 5,
        }).calculateOffset(0),
      ).equal(5);
    });
  });
});

describe('get currentLoop', () => {
  it('should return the correct values', () => {
    expect(
      new Timeline({
        playDuration: 60,
        absoluteCurrentTime: -59,
      }).currentLoop,
    ).equal(0);

    expect(
      new Timeline({
        playDuration: 60,
        absoluteCurrentTime: -65,
      }).currentLoop,
    ).equal(1);

    expect(
      new Timeline({
        playDuration: 60,
        absoluteCurrentTime: -59,
        offset: 0.9,
      }).currentLoop,
    ).equal(0);

    expect(
      new Timeline({
        relativeCurrentTime: 10.023219954648527,
        absoluteCurrentTime: 0.023219954648526078,
        absoluteStart: 0,
        relativeStart: 0,
        playDuration: 10,
        audioDuration: 73.301873,
        offset: 10,
      }).currentLoop,
    ).equal(0);
  });
});

describe('get absolutePlayEnd', () => {
  it('should return the correct values', () => {
    // expect(
    //   new Timeline({
    //     playDuration: 10,
    //     absoluteStart: 0,
    //   }).absolutePlayEnd,
    // ).equal(10);

    // expect(
    //   new Timeline({
    //     playDuration: 10,
    //     absoluteStart: -5,
    //   }).absolutePlayEnd,
    // ).equal(5);

    // // in loop 7
    // expect(
    //   new Timeline({
    //     relativeCurrentTime: 61,
    //     playDuration: 10,
    //     offset: 0,
    //     absoluteStart: 0,
    //   }).absolutePlayEnd,
    // ).equal(70);

    // with offset
    expect(
      new Timeline({
        relativeCurrentTime: 10.023219954648527,
        absoluteCurrentTime: 0.023219954648526078,
        absoluteStart: 0,
        relativeStart: 0,
        playDuration: 10,
        audioDuration: 73.301873,
        offset: 10,
      }).absolutePlayEnd,
    ).equal(10);
  });
});

describe('get getRelativeTimeAt', () => {
  it('should return the correct values', () => {
    expect(
      new Timeline({
        playDuration: 100,
        absoluteStart: 0,
      }).getRelativeTimeAt(0),
    ).equal(0);

    expect(
      new Timeline({
        playDuration: 100,
        absoluteStart: -10,
      }).getRelativeTimeAt(0),
    ).equal(10);
  });
});
