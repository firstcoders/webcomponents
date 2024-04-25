import { expect } from '@bundled-es-modules/chai';
import Timeline from '../../src/timeline';

describe('calculateAbsoluteStart', () => {
  it('should return the correct absolute value', () => {
    expect(
      new Timeline({
        relativeCurrentTime: 2.023219954648526,
        absoluteCurrentTime: 0.023219954648526078,
        absoluteStart: 0,
        relativeStart: 0,
        playDuration: 13,
        audioDuration: 73.301873,
        offset: 2,
      }).calculateAbsoluteStart(0),
    ).equal(0);

    expect(
      new Timeline({
        relativeCurrentTime: 10.08825396825397,
        absoluteCurrentTime: 8.08825396825397,
        absoluteStart: 0,
        relativeStart: 0,
        playDuration: 13,
        audioDuration: 73.30186879818595,
        offset: 2,
      }).calculateAbsoluteStart(10.005328798185941),
    ).equal(10.005328798185941 - 2); // start time - offset

    // expect(
    //   new Timeline({
    //     relativeCurrentTime: 15.730702947845804,
    //     absoluteCurrentTime: 13.730702947845804,
    //     absoluteStart: 0,
    //     relativeStart: 0,
    //     playDuration: 13,
    //     audioDuration: 73.30186459637189,
    //     offset: 2,
    //   }).calculateAbsoluteStart(0),
    // ).equal(13); // at start of next loop

    // expect(
    //   new Timeline({
    //     relativeCurrentTime: 10.091428571428573,
    //     absoluteCurrentTime: 21.091428571428573,
    //     absoluteStart: 0,
    //     relativeStart: 0,
    //     playDuration: 13,
    //     audioDuration: 73.30186459637189,
    //     offset: 2,
    //   }).calculateAbsoluteStart(10.005328798185941),
    // ).equal(23.005328798185943 - 2);

    // expect(
    //   new Timeline({
    //     relativeCurrentTime: 3,
    //     absoluteCurrentTime: 0,
    //     absoluteStart: -3,
    //     relativeStart: 2.9,
    //     playDuration: 73.301873,
    //     audioDuration: 73.301873,
    //     offset: 0,
    //   }).calculateAbsoluteStart(0),
    // ).equal(0);

    // expect(
    //   new Timeline({
    //     relativeCurrentTime: 10.321995464852607,
    //     absoluteCurrentTime: 7.321995464852607,
    //     absoluteStart: -3,
    //     relativeStart: 2.9,
    //     playDuration: 73.30186879818595,
    //     audioDuration: 73.30186879818595,
    //     offset: 0,
    //   }).calculateAbsoluteStart(10.005328798185941),
    // ).equal(10.005328798185941 - 3);
  });
});
