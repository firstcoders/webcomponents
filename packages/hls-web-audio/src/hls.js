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
import Controller from './controller.js';
import Timeline from './timeline.js';
import Segment from './segment.js';
import Stack from './stack.js';
import parseM3u8 from './lib/parseM3u8.js';

class HLS {
  /**
   * @param {Object} param - The params
   * @param {Object} param.controller - The controller
   * @param {Object} param.volume - The initial volume
   * @param {Object} param.fetchOptions - Options to use when fetching the hls/m3u8
   */
  constructor({
    controller,
    volume = 1,
    fetch = null,
    fetchOptions = {},
    start = 0,
    duration = undefined,
    offset = 0,
  } = {}) {
    // optionally set or create controller
    this.controller = controller || new Controller();

    // register this hls track with the controller
    this.controller.observe(this);

    // respond to timeupdates
    this.eTimeUpdate = this.controller.on('timeupdate', () => this.onTimeUpdate());

    // respond to seek
    this.eSeek = this.controller.on('seek', () => this.onSeek());

    // create a gainnode for volume
    this.gainNode = this.controller.ac.createGain();

    // connect this to the destination (normally master gain node)
    this.gainNode.connect(this.controller.gainNode);

    // initialise the volume
    this.volume = volume;

    // The stack contains the stack of segments
    this.stack = new Stack({ start });

    // allows adding to headers for a request
    this.fetchOptions = fetchOptions;

    // allow injecting fetch
    this.fetch = fetch;

    // offset the start time
    this.start = start;

    // duration override
    this.duration = duration;

    this.offset = offset;
  }

  set start(start) {
    this.stack.start = parseFloat(start);
    this.controller?.notify('start', this);
  }

  get start() {
    return this.stack.start;
  }

  set offset(offset) {
    this.stack.offset = offset;
    this.controller?.notify('offset', this);
  }

  get offset() {
    return this.stack.offset;
  }

  destroy() {
    // cancel loading
    this.cancel();

    // unregister from the controller
    this.controller.unobserve(this);
    this.controller = null;

    // remove event listeners
    this.eTimeUpdate.un();
    this.eSeek.un();

    // destroy the stack
    this.stack.destroy();
    this.stack = null;
  }

  /**
   * Loads the source m3u8 file
   *
   * @param {String} src
   * @returns Object
   */
  load(src) {
    this.src = src;

    const abortController = new AbortController();

    const promise = (this.fetch || fetch)(src, {
      signal: abortController.signal,
      ...this.fetchOptions,
      headers: {
        Accept: 'application/x-mpegURL, application/vnd.apple.mpegurl',
        ...this.fetchOptions?.headers,
      },
    })
      .then((r) => {
        if (!r.ok) {
          const error = new Error('HLS Fetch failed');
          error.name = 'HLSLoadError';
          error.response = r;
          throw error;
        }
        return r;
      })
      .then((r) => r.text())
      .then((r) => parseM3u8(r, src))
      .then((r) => this.buildSegments(r))
      .then((r) => {
        this.controller?.notify('init', this);
        return r;
      })
      .catch((error) => {
        this.controller?.notify('error', error);
        throw error;
      });

    this.loadHandle = {
      promise: promise.catch((err) => {
        if (err.name !== 'AbortError') throw err;
      }),
      cancel: () => abortController.abort(),
    };

    return this.loadHandle;
  }

  /**
   * Populates the hls track from a text m3u8 manifest
   * @param {String} manifest - The m3u8 manifest
   * @param {String} src - The m3u8 location
   */
  loadFromM3u8(manifest, src) {
    const sources = parseM3u8(manifest, src);
    this.buildSegments(sources);
  }

  /**
   * @private
   * @param {Array} sources - An array containing the segment data
   */
  // buildSegments(sources) {
  //   this.stack?.push(
  //     ...sources.map((source) => new Segment({ ...source, fetchOptions: this.fetchOptions })),
  //   );

  //   // const [first] = this.stack.elements;

  //   // const virtual = new Segment({ src: first.src, duration: first.duration });
  //   // virtual.$isVirtual = true;
  //   // this.stack?.push(virtual);
  // }

  /**
   **
   * @private
   * @param {Array} sources - An array containing the segment data
   */
  buildSegments(sources) {
    const segments = [];

    sources.forEach((source) => {
      segments.push(
        new Segment({
          ...source,
          fetchOptions: this.fetchOptions,
        }),
      );
    });

    // create a linked list
    segments.forEach((segment, index) => {
      segment.previous = segments[index - 1];
      segment.next = segments[index + 1];

      if (index === 0) {
        segment.previous = segments[segments.length - 1];
      }

      if (index === segments.length - 1) {
        // eslint-disable-next-line prefer-destructuring
        segment.next = segments[0];
      }
    });

    this.stack?.push(...segments);

    // infer the minimum segment length, excluding the last one, which is likely truncated. This is used for scheduling
    const min = Math.min.apply(
      null,
      this.stack.elements
        .slice(0, this.stack.elements.length - 1)
        .map((segment) => segment.duration),
    );

    this.segmentLength = min;
  }

  set duration(duration) {
    this.stack.duration = duration;
    this.controller?.notify('duration', this);
  }

  /**
   * Gets the duration of the hls track
   *
   * @returns Int
   */
  get duration() {
    return this.stack.duration;
  }

  /**
   * Gets end time of the sample
   *
   * @returns Int
   */
  get end() {
    return this.stack.duration + this.stack.start;
  }

  /**
   * Handles a controller's "tick" event
   *
   * @private
   */
  onTimeUpdate() {
    this.runSchedulePass();
  }

  /**
   * Handles a controller's "seek" event
   *
   * @private
   */
  async onSeek() {
    if (this.controller.ac.state === 'running') {
      // eslint-disable-next-line no-console
      console.debug('Disconnecting node when audiocontext is running may cause "ticks"');
    }

    // unset start so we can start afresh
    this.nextStartPointer = undefined;

    // first disconnect everything
    this.stack.disconnectAll();

    // then run a schedule pass in order to immediately schedule the newly required segments
    this.runSchedulePass();
  }

  /**
   * Handles a controller's "timeupdate" event
   */
  async runSchedulePass() {
    const timeline = Timeline.fromController(this.controller);

    // try the current segment
    const current = await this.scheduleAt(timeline);

    if (current) {
      // we have a current.. but check if this current segment is soon ending
      // if so, schedule the upcoming one
      const remaining = current.end - timeline.currentTime;

      // TODO make configurable
      if (remaining < 3) {
        timeline.fastForward(remaining + 0.1);
        await this.scheduleAt(timeline);
      }
    }

    // the current one is already scheduled, try the next one
    if (!current) {
      timeline.fastForward(this.segmentLength / 2);
      await this.scheduleAt(timeline);
    }
  }

  async scheduleAt(timeline) {
    // get the next segment
    const segment = this.stack.consume(timeline.currentTime);

    // // if we dont get one, there's nothing to do at this time
    if (!segment) return undefined;

    try {
      const start = this.nextStartPointer || timeline.calculateAbsoluteStart(segment.start);
      const offset = timeline.calculateOffset(segment.start);
      const stop = timeline.absolutePlayEnd; // cut off any segment that runs beyond this
      let loop = false; // whether to loop a single segment

      // notify to the controller that loading has started
      this.controller.notify('loading-start', this);

      // load the segment
      await segment.load().promise;

      if (Math.floor(segment.start) <= timeline.offset && segment.end > timeline.relativePlayEnd) {
        console.log('loop yes');
        loop = true;
      }

      console.log('connect', {
        start,
        stop,
        offset,
        timeline,
        segment: segment.src,
        segmentstart: segment.start,
      });

      // connect it to the audio
      const actualAbsoluteStart = await segment.connect({
        ac: this.controller.ac,
        destination: this.gainNode,
        start: start < 0 ? 0 : start,
        offset,
        stop,
        loop,
      });

      // store the end of the current segment so we can stitch the next one at the end
      this.nextStartPointer = actualAbsoluteStart + segment.duration - offset;

      if (this.nextStartPointer > timeline.absolutePlayEnd) {
        this.nextStartPointer = timeline.absolutePlayEnd;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.controller?.notify('error', err);
      }
    } finally {
      // release the segment
      this.stack?.ack(segment);

      // notify to the controller that this segment is ready
      this.controller?.notify('loading-end', this);
    }

    return segment;
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  /**
   * @param {Int} volume - The volume
   */
  set volume(volume) {
    this.gainNode.gain.value = volume;
  }

  /**
   * Cancel the loading of the hls playlist
   */
  cancel() {
    if (this.loadHandle) this.loadHandle.cancel();
  }

  /**
   * Whether the track can play the current semgent based on currentTime
   */
  get canPlay() {
    const current = this.stack.getAt(this.controller.currentTime);
    return current?.isReady;
  }

  /**
   * Whether the track should and can play (depends on whether there is a current segment)
   */
  get shouldAndCanPlay() {
    const current = this.stack.getAt(this.controller.currentTime);
    return !current || current?.isReady;
  }
}

export default HLS;
