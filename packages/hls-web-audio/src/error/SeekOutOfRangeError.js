export default class SeekOutOfRangeError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'SeekOutOfRangeError';
  }
}
