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
    this.relativeCurrentTime = relativeCurrentTime || 0;
    this.absoluteCurrentTime = absoluteCurrentTime || 0;
    this.absoluteStart = absoluteStart || 0;
    this.relativeStart = relativeStart || 0;
    this.playDuration = playDuration;
    this.audioDuration = audioDuration;
    this.offset = offset || 0;
  }

  /**
   * Returns the start of the segment on as an absolute (audiocontext) time
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
   *
   * @param {Integer} start - The start time
   *
   * @returns {Integer}
   */
  calculateAbsoluteStart(start) {
    return this.absoluteStart + start - this.offset;
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
    let x = this.relativeStart;

    if (this.currentLoop > 0) {
      x = 0;
    }

    const offset = x - start + this.offset;

    // let relativeStart = start;
    // if (this.currentLoop > 0) {
    //   relativeStart += this.currentLoop * this.playDuration;
    // }

    // const offset = this.relativeStart + relativeStart;
    // // offset is < 0 when start is in the future, so offset should be 0 in that case

    if (offset < 0) return 0;

    return offset;
  }

  get absolutePlayEnd() {
    return this.absoluteStart + (this.currentLoop + 1) * this.playDuration;
  }

  get relativePlayStart() {
    return this.offset;
  }

  get relativePlayEnd() {
    return this.offset + this.playDuration;
  }

  fastForward(seconds) {
    this.relativeCurrentTime += seconds;
    this.absoluteCurrentTime += seconds;
  }

  /**
   * @returns {Integer|undefined} - The index of the loop
   */
  get currentLoop() {
    return Math.floor(Math.abs(this.absoluteCurrentTime - this.absoluteStart) / this.playDuration);
  }

  /**
   * @returns {Integer|undefined} - The current time, in seconds.
   */
  get currentTime() {
    return this.getRelativeTimeAt(this.absoluteCurrentTime);
  }

  /**
   * Gives a relative time given an absolute time, taking into account any looping
   * @param {Number} absoluteTime
   * @returns {Number}
   */
  getRelativeTimeAt(absoluteTime) {
    if (this.absoluteStart === undefined) return undefined;

    const t = absoluteTime - this.absoluteStart;

    // take looping into account
    return (t % this.playDuration) + this.offset;
  }
}

export default Timeline;
