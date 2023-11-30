/**
 * A simple PubSub implementation.
 */
export class PubSub {
  /**
   * A map of event names to subscribers. Each subscriber is
   * an object with the format:
   *
   * `{ handler: function, thisObj: object }`
   */
  trackedEvents = new Map();

  /**
   * A map of arguments passed to the `publish` function. The
   * key is the event name and the value is an array of array
   * of arguments passed to the `publish` function for each
   * firing of the event that has occurred so far.
   *
   * This value is only set if the `trackPublishes` option is
   * set to true.
   */
  trackedPublishes = null;

  /**
   * Create a new PubSub instance.
   *
   * @param name the name of the PubSub instance, consider it to
   * be a namespace for the events it tracks
   * @param eventNames an array of event names that this PubSub
   */
  constructor(
    name,
    eventNames,
    options = {
      trackPublishes: false
    }
  ) {
    this.name = name

    if (options.trackPublishes) {
      this.trackedPublishes = new Map()
    }

    for (let eventName of eventNames) {
      this.trackedEvents.set(eventName, [])
    }

    PubSub.#pubsubs.set(name, this)
  }

  /// Public functions and properties

  /** The name of this PubSub instance */
  get [Symbol.toStringTag]() { this.constructor.name }

  /**
   * Add a new event to be tracked by this PubSub instance. If
   * subscribers are provided, they will be automatically added
   * to the list of subscribers for this event. Subscriber objects
   * can be functions or they can be an object with the format
   * { handler: function, thisObj: object }.
   *
   * @param eventName the name of the event to track
   * @param subscribers the subscribers to add to the list of
   * subscribers for the given event
   */
  addEvent(eventName, ...subscribers) {
    this.trackedEvents.set(
      eventName,
      this.trackedEvents.has(eventName)
        ? this.trackedEvents.get(eventName)
        : []
    )

    for (let subscriber of subscribers) {
      const handler = subscriber?.handler ?? subscriber
      const thisObj = subscriber?.thisObj ?? null
      this.listen(eventName, handler, thisObj)
    }
  }

  /**
   * Add a new subscriber to the list of subscribers for the
   * given event. Subscriber objects can be functions or they
   * can be an object with the format:
   *
   * `{ handler: function, thisObj: object }`
   *
   * @param eventName the name of the event to listen for
   * @param subscriber the subscriber to add to the list of
   * @param thisObj the object to use as the `this` context
   * @param options an object with the following properties:
   * - `once` - if true, the subscriber will be removed after
   * the first time it is invoked
   * - `replayPreviousEvents` - if true, the subscriber will be
   * invoked for all previous events that have been fired if
   * this PubSub instance has been configured to track publishes
   * @returns a function that when executed, removes the added
   * listener from the list of subscribers
   */
  listen(
    eventName,
    subscriber,
    thisObj,
    options = {
      once: false,
      replayPreviousEvents: false
    }
  ) {
    if (!this.trackedEvents.has(eventName)) {
      throw new Error(`PubSub ${this.name} does not track ${eventName}`)
    }

    const subscribers = this.trackedEvents.get(eventName)
    const _handler = subscriber?.handler ?? subscriber
    const _thisObj = thisObj ?? subscriber?.thisObj

    const unsub = () => {
      const index = subscribers.findIndex(e => e.handler === _handler)
      subscribers.splice(index, 1)
    }

    subscribers.push({
      handler: _handler,
      thisObj: _thisObj,
      once: options.once,
      unsub
    })

    if (options.replayPreviousEvents && this.trackedPublishes) {
      const publishes = this.trackedPublishes.get(eventName)
      for (let publish of publishes) {
        _handler.apply(_thisObj, publish)
      }
    }

    return unsub
  }

  /**
   * Remove a subscriber from the list of subscribers for the
   * given event. Subscribers should be function. If subscriber
   * is not provided, all subscribers for the given event will be
   * removed.
   *
   * @param eventName the name of the event to stop listening for
   * @param subscriber the subscriber to remove from the list of
   * subscribers for the given event
   */
  unlisten(eventName, subscriber) {
    if (!this.trackedEvents.has(eventName)) {
      throw new Error(`PubSub ${this.name} does not track ${eventName}`)
    }

    const subscribers = this.trackedEvents.get(eventName)
    if (subscriber) {
      const handler = subscriber?.handler ?? subscriber
      const thisObj = subscriber?.thisObj ?? null
      const index = subscribers.findIndex(
        sub => {
          const hasThisObj = !!thisObj
          const matchingHandler = sub.handler === handler
          const matchingThisObj = hasThisObj
            ? sub.thisObj === thisObj
            : true

          return matchingHandler && matchingThisObj
        }
      )

      if (index !== -1) {
        subscribers.splice(index, 1)
      }
    }
    else {
      subscribers.length = 0
    }
  }

  /**
   * Publish an event to all subscribers. Any arguments passed
   * after the event name will be passed to the subscribers.
   * If the subscriber being invoked has a thisObj set, it will
   * be used as the `this` context for the handler function.
   *
   * @param eventName the name of the event to publish
   * @param args the arguments to pass to the subscribers
   * @return an array of results from the subscribers
   */
  async publish(eventName, ...args) {
    if (!this.trackedEvents.has(eventName)) {
      throw new Error(`PubSub ${this.name} does not track ${eventName}`)
    }

    if (this.trackedPublishes) {
      if (!this.trackedPublishes.has(eventName)) {
        this.trackedPublishes.set(eventName, [])
      }
      this.trackedPublishes.get(eventName).push(...args)
    }

    const isAsync = fn => !!/AsyncFunction/.exec(Object.prototype.toString.call(fn))
    const subscribers = this.trackedEvents.get(eventName)
    const results = []

    for (let subscriber of subscribers) {
      try {
        if (isAsync(subscriber.handler))
          results.push(subscriber.handler.apply(subscriber.thisObj, args))
        else
          results.push(await subscriber.handler.apply(subscriber.thisObj, args))

        if (subscriber.once) {
          subscriber.unsub()
        }
      }
      catch (err) {
        Errors.capture(err)
      }
    }

    return results
  }

  /**
   * Alias for `publish`
   *
   * @param eventName the name of the event to publish
   * @param args the arguments to pass to the subscribers
   * @return an array of results from the subscribers
   */
  async fire(eventName, ...args) {
    return this.publish(eventName, ...args)
  }

  /**
   * Alias for `publish`
   *
   * @param eventName the name of the event to publish
   * @param args the arguments to pass to the subscribers
   * @return an array of results from the subscribers
   */
  async trigger(eventName, ...args) {
    return this.publish(eventName, ...args)
  }

  /**
   * A way of running the listeners in a manner similar to Array.reduce
   * Each handler will be passed a value as an accumulator, and the
   * expectation is that the handler will return the new state of the
   * accumulator. The function will return the final shape of the
   * accumulator object once it has run its course.
   *
   * @param {string|symbol} eventName the key for the event in question
   * @param {any} initialValue the value, usually an object or array,
   * that will be passed into the handler and reassigned with its return
   * value
   * @returns the final shape of the accumulator after all handlers or
   * listeners are completed
   */
  async reduce(eventName, initialValue) {
    if (!this.trackedEvents.has(eventName)) {
      throw new Error(`PubSub ${this.name} does not track ${eventName}`)
    }

    if (this.trackedPublishes) {
      if (!this.trackedPublishes.has(eventName)) {
        this.trackedPublishes.set(eventName, [])
      }
      this.trackedPublishes.get(eventName).push(initialValue)
    }

    const isAsync = fn => !!/AsyncFunction/.exec(Object.prototype.toString.call(fn))
    const subscribers = this.trackedEvents.get(eventName)
    let accumulator = initialValue

    for (let subscriber of subscribers) {
      try {
        if (isAsync(subscriber.handler))
          accumulator = await subscriber.handler.call(subscriber.thisObj, accumulator)
        else
          accumulator = subscriber.handler.call(subscriber.thisObj, accumulator)

        if (subscriber.once) {
          subscriber.unsub()
        }
      }
      catch (error) {
        Errors.capture(error)
      }
    }

    return accumulator
  }

  /// Static functions and properties

  /**
   * Retreive a PubSub instance by name statically
   *
   * @param pubSubName the name of the PubSub instance to get
   * @returns the PubSub instance with the given name or null
   */
  static get(pubSubName) {
    if (PubSub.#pubsubs.has(pubSubName)) {
      return PubSub.#pubsubs.get(pubSubName)
    }
    return null
  }

  /// Private functions and properties

  /** Private map of known PubSubs */
  static #pubsubs = new Map()
}

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
  set silent(value) { Logs._silent = value },

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
      Object.defineProperty(global, 'console', {
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

        Object.defineProperty(global, 'console', {
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

export const Errors = new PubSub('Errors', ['error'], { trackPublishes: true })
Object.assign(Errors, {
  get silent() { return Errors._silent },
  set silent(value) { Errors._silent = value },
  _silent: false,

  capture(error) {
    if (!error instanceof Error) {
      error = new Error(String(error))
    }

    if (!this._silent) {
      Logs.error(error);
    }

    Errors.fire('error', { date: Date.now(), error })
  }
})

export default PubSub