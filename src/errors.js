import { PubSub, Logs } from './index.js'

const ErrorsExtension = {
  /** Determine if thrown Errors should not be logged */
  get silent() { return this._silent },

  /** Set whether or not Errors should be logged */
  set silent(value) { this._silent = value },

  /** The actual storage value for the silent mode */
  _silent: false,

  /**
   * The `Errors` instance of `PubSub` tracks logged errors
   * which allows later review.
   *
   * @param {error} error the error to capture
   */
  capture(error) {
    if (!(error instanceof Error)) {
      error = new Error(String(error))
    }

    if (!this._silent) {
      Logs.error(error);
    }

    this.fire('error', { date: Date.now(), error })
  }
}

/**
 * Used to create the global `Errors` instance, but it can also
 * be used to create local instances of Errors capture.
 *
 * @returns {pubsub} unique instance of PubSub designed to
 * capture publishes with a method to capture errors.
 */
export function CreateLocalErrors() {
  return Object.assign(new PubSub(
    'Errors',
    ['error'],
    { trackPublishes: true }
  ), ErrorsExtension)
}
