import { PubSub } from './pubsub.js'

/**
 * A PubSub instance for tracking console logs. It tracks the
 * following events:
 *
 * - log
 * - info
 * - warn
 * - error
 * - trace
 *
 * Optionally, it can be configured to record the messages but
 * not output them to the console by setting the `silent` flag
 * to true.
 */
export const Logs = new PubSub(
  'Logs',
  ['log', 'info', 'warn', 'error', 'trace'],
  { trackPublishes: true }
)

/**
 * Additional properties and functions for the `Logs` `PubSub`
 * instance. Including the ability to replace the global
 * console object with the `Logs` `PubSub` instance. Any function
 * or property that would normally be available on the console
 * object will be available on the Logs PubSub instance.
 *
 * This can be undone using the `restore` function.
 */
Object.assign(Logs, {
  // The getters and setters for silent property are used to
  // prevent logging to be written to the console
  get silent() { return Logs._silent },

  // Set whether or not Logs should be logged
  set silent(value) { Logs._silent = value },

  // Obtain the global value for this environment
  get global() { return globalThis ?? global ?? window },

  // The _silent property is used to track whether logging
  // should be written to the console
  _silent: false,

  // The _console property is used to store the original console
  _console: console,

  // The _replaced property is used to track whether the global
  // console object has been replaced with the Logs PubSub
  _replaced: false,

  log(...args) {
    if (!this._silent) {
      Logs._console.log(...args);
    }
    Logs.fire('log', { level: 'log', date: Date.now(), args })
  },

  info(...args) {
    if (!this._silent) {
      Logs._console.info(...args);
    }
    Logs.fire('info', { level: 'info', date: Date.now(), args })
  },

  warn(...args) {
    if (!this._silent) {
      Logs._console.warn(...args);
    }
    Logs.fire('warn', { level: 'warn', date: Date.now(), args })
  },

  error(...args) {
    if (!this._silent) {
      Logs._console.error(...args);
    }
    Logs.fire('error', { level: 'error', date: Date.now(), args })
  },

  trace(...args) {
    if (!this._silent) {
      Logs._console.trace(...args);
    }
    Logs.fire('trace', { level: 'trace', date: Date.now(), args })
  },

  replace() {
    try {
      // Store the keys of the console object so they can be
      // removed when restoring the console object.
      Logs._consoleKeys = Object.getOwnPropertyNames(Logs._console)
        .filter(key => !Object.hasOwn(Logs, key))

      // Add the console object properties to the Logs PubSub
      Object.defineProperties(Logs, Logs._consoleKeys.map(key => {
        const descriptor = {
          get() { return Logs._console[key] },
          set(value) { Logs._console[key] = value },
          configurable: true,
          enumerable: true,
        }
        return descriptor
      }, {}))

      // Replace the global console object with the Logs PubSub
      Object.defineProperty(this.global, 'console', {
        value: new Proxy(Logs, {
          get: (target, prop) => {
            if (prop in target) {
              return target[prop]
            }
            else {
              return target._console[prop]
            }
          }
        }),
        configurable: true,
        enumerable: true,
      })
      Logs._replaced = true
    }
    catch (err) {
      Errors.capture(err)
    }
  },

  restore() {
    try {
      if (Logs._replaced) {
        // Remove the console object properties from the Logs PubSub
        for (const key of Logs._consoleKeys) {
          delete Logs[key]
        }

        Object.defineProperty(this.global, 'console', {
          value: Logs._console,
          configurable: true,
          enumerable: true,
        })

        Logs._replaced = false
      }
    }
    catch (err) {
      Errors.capture(err)
    }
  },
})