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
class Timeline {
  static fromController(controller) {
    const timeline = new Timeline({
      relativeCurrentTime: controller.currentTime,
      absoluteCurrentTime: controller.ac.currentTime,
      absoluteStart: controller.adjustedStart,
      relativeStart: controller.relativeStart,
      playDuration: controller.playDuration,
      audioDuration: controller.duration,
      offset: controller.offset,
    });

    return timeline;
  }

  constructor({
    relativeCurrentTime,
    absoluteStart,
    relativeStart,
    playDuration,
    audioDuration,
    offset,
    absoluteCurrentTime,
  }) {
    this.relativeCurrentTime = relativeCurrentTime;
    this.absoluteCurrentTime = absoluteCurrentTime;
    this.absoluteStart = absoluteStart;
    this.relativeStart = relativeStart;
    this.playDuration = playDuration;
    this.audioDuration = audioDuration;
    this.offset = offset;
  }

  /**
   * Calculate start relative to now.
   * Normally the start time is just this.start. However due to seeking this can vary. It will help to understand the workings of the audiocontext timeline.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
   *
   * @param {Integer} start - The start time in seconds
   *
   * @returns {Integer}
   */
  calculateAbsoluteStart(start) {
    // const relativeStart = this.relativeStart + start - this.offset;

    // let absoluteStart = this.absoluteStart + relativeStart;

    // if (this.currentLoop > 0) {
    //   const loopOffset = this.currentLoop * this.playDuration;
    //   absoluteStart += loopOffset;
    // }

    console.log({
      // relativeStart,
      // absoluteStart,
      pd: this.playDuration,
      loop: this.currentLoop,
      start,
      // loopOffset,
    });

    // return absoluteStart >= 0 ? absoluteStart : 0;

    let realStart = this.absoluteStart + start;

    if (this.currentLoop > 0) {
      // a segment has this property if it is being pre-loaded for playback in the near future
      // this means that _at that time_ nLoop is still less than what it will be when playback
      // for that segment commences - so we need to increase it

      // when looping we need to take the number of loops into consideration when calculating start time
      realStart += this.currentLoop * this.playDuration;
    }

    if (realStart < 0) realStart = 0;

    return realStart;
  }

  /**
   * Calculate offset by taking into consideration the start time.
   * Normally the offset is 0. If the user seeks halfway into a 10 second segment, the offset is 5.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
   *
   * @param {Integer} t
   * @returns {Integer|undefined}
   */
  calculateOffset(start) {
    let offset = this.relativePlayStart - start;

    // offset is < 0 when start is in the future, so offset should be 0 in that case
    if (offset < 0) offset = 0;

    return offset;
  }

  get absolutePlayEnd() {
    return this.absoluteStart + (this.currentLoop + 1) * this.playDuration;
    // return this.calculateAbsoluteStart(this.relativeStart + this.playDuration);
  }

  get relativePlayStart() {
    return this.relativeStart + this.offset;
  }

  get relativePlayEnd() {
    return this.offset + this.playDuration;
  }

  getRelativeTimeAt(absoluteTime) {
    if (this.absoluteStart === undefined) return undefined;

    const t = absoluteTime - this.absoluteStart;

    // take looping into account
    return (t % this.playDuration) + this.offset;
  }

  fastForward(seconds) {
    this.relativeCurrentTime += seconds;
    this.absoluteCurrentTime += seconds;
  }

  /**
   * @returns {Integer|undefined} - The index of the loop
   */
  get currentLoop() {
    // let t =
    //   this.absoluteStart !== undefined ? this.absoluteCurrentTime - this.absoluteStart : undefined;

    // t /= this.playDuration;

    // console.log(
    //   'loop',
    //   this.absoluteCurrentTime,
    //   this.absoluteStart,
    //   this.absoluteCurrentTime - this.absoluteStart,
    //   (this.absoluteCurrentTime - this.absoluteStart) / this.playDuration,
    // );

    return Math.floor((this.absoluteCurrentTime - this.absoluteStart) / this.playDuration);
  }

  /**
   * @returns {Integer|undefined} - The current time, in seconds.
   */
  get currentTime() {
    return this.getRelativeTimeAt(this.absoluteCurrentTime);
  }
}

export default Timeline;
