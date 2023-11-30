"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _PubSub_pubsubs;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.Logs = exports.PubSub = void 0;
/**
 * A simple PubSub implementation.
 */
class PubSub {
    /**
     * Create a new PubSub instance.
     *
     * @param name the name of the PubSub instance, consider it to
     * be a namespace for the events it tracks
     * @param eventNames an array of event names that this PubSub
     */
    constructor(name, eventNames, options = {
        trackPublishes: false
    }) {
        /**
         * A map of event names to subscribers. Each subscriber is
         * an object with the format:
         *
         * `{ handler: function, thisObj: object }`
         */
        this.trackedEvents = new Map();
        /**
         * A map of arguments passed to the `publish` function. The
         * key is the event name and the value is an array of array
         * of arguments passed to the `publish` function for each
         * firing of the event that has occurred so far.
         *
         * This value is only set if the `trackPublishes` option is
         * set to true.
         */
        this.trackedPublishes = null;
        this.name = name;
        if (options.trackPublishes) {
            this.trackedPublishes = new Map();
        }
        for (let eventName of eventNames) {
            this.trackedEvents.set(eventName, []);
        }
        __classPrivateFieldGet(_a, _a, "f", _PubSub_pubsubs).set(name, this);
    }
    /// Public functions and properties
    /** The name of this PubSub instance */
    get [Symbol.toStringTag]() { this.constructor.name; }
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
        this.trackedEvents.set(eventName, this.trackedEvents.has(eventName)
            ? this.trackedEvents.get(eventName)
            : []);
        for (let subscriber of subscribers) {
            const handler = subscriber?.handler ?? subscriber;
            const thisObj = subscriber?.thisObj ?? null;
            this.listen(eventName, handler, thisObj);
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
     */
    listen(eventName, subscriber, thisObj, options = {
        once: false,
        replayPreviousEvents: false
    }) {
        if (!this.trackedEvents.has(eventName)) {
            throw new Error(`PubSub ${this.name} does not track ${eventName}`);
        }
        const subscribers = this.trackedEvents.get(eventName);
        const _handler = subscriber?.handler ?? subscriber;
        const _thisObj = thisObj ?? subscriber?.thisObj;
        subscribers.push({ handler: _handler, thisObj: _thisObj, once: options.once });
        if (options.replayPreviousEvents && this.trackedPublishes) {
            const publishes = this.trackedPublishes.get(eventName);
            for (let publish of publishes) {
                _handler.apply(_thisObj, publish);
            }
        }
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
            throw new Error(`PubSub ${this.name} does not track ${eventName}`);
        }
        const subscribers = this.trackedEvents.get(eventName);
        if (subscriber) {
            const handler = subscriber?.handler ?? subscriber;
            const thisObj = subscriber?.thisObj ?? null;
            const index = subscribers.findIndex(sub => {
                const hasThisObj = !!thisObj;
                const matchingHandler = sub.handler === handler;
                const matchingThisObj = hasThisObj
                    ? sub.thisObj === thisObj
                    : true;
                return matchingHandler && matchingThisObj;
            });
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        }
        else {
            subscribers.length = 0;
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
    publish(eventName, ...args) {
        if (!this.trackedEvents.has(eventName)) {
            throw new Error(`PubSub ${this.name} does not track ${eventName}`);
        }
        if (this.trackedPublishes) {
            if (!this.trackedPublishes.has(eventName)) {
                this.trackedPublishes.set(eventName, []);
            }
            this.trackedPublishes.get(eventName).push(...args);
        }
        const subscribers = this.trackedEvents.get(eventName);
        const results = [];
        for (let subscriber of subscribers) {
            try {
                results.push(subscriber.handler.apply(subscriber.thisObj, args));
                if (subscriber.once) {
                    this.unlisten(eventName, subscriber);
                }
            }
            catch (err) {
                exports.Errors.capture(err);
            }
        }
        return results;
    }
    /**
     * Alias for `publish`
     *
     * @param eventName the name of the event to publish
     * @param args the arguments to pass to the subscribers
     * @return an array of results from the subscribers
     */
    fire(eventName, ...args) {
        return this.publish(eventName, ...args);
    }
    /**
     * Alias for `publish`
     *
     * @param eventName the name of the event to publish
     * @param args the arguments to pass to the subscribers
     * @return an array of results from the subscribers
     */
    trigger(eventName, ...args) {
        return this.publish(eventName, ...args);
    }
    /// Static functions and properties
    /**
     * Retreive a PubSub instance by name statically
     *
     * @param pubSubName the name of the PubSub instance to get
     * @returns the PubSub instance with the given name or null
     */
    static get(pubSubName) {
        if (__classPrivateFieldGet(_a, _a, "f", _PubSub_pubsubs).has(pubSubName)) {
            return __classPrivateFieldGet(_a, _a, "f", _PubSub_pubsubs).get(pubSubName);
        }
        return null;
    }
}
exports.PubSub = PubSub;
_a = PubSub;
/// Private functions and properties
/** Private map of known PubSubs */
_PubSub_pubsubs = { value: new Map() };
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
exports.Logs = new PubSub('Logs', ['log', 'info', 'warn', 'error', 'trace'], { trackPublishes: true });
/**
 * Additional properties and functions for the `Logs` `PubSub`
 * instance. Including the ability to replace the global
 * console object with the `Logs` `PubSub` instance. Any function
 * or property that would normally be available on the console
 * object will be available on the Logs PubSub instance.
 *
 * This can be undone using the `restore` function.
 */
Object.assign(exports.Logs, {
    // The getters and setters for silent property are used to
    // prevent logging to be written to the console
    get silent() { return exports.Logs._silent; },
    set silent(value) { exports.Logs._silent = value; },
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
            exports.Logs._console.log(...args);
        }
        exports.Logs.fire('log', { level: 'log', date: Date.now(), args });
    },
    info(...args) {
        if (!this._silent) {
            exports.Logs._console.info(...args);
        }
        exports.Logs.fire('info', { level: 'info', date: Date.now(), args });
    },
    warn(...args) {
        if (!this._silent) {
            exports.Logs._console.warn(...args);
        }
        exports.Logs.fire('warn', { level: 'warn', date: Date.now(), args });
    },
    error(...args) {
        if (!this._silent) {
            exports.Logs._console.error(...args);
        }
        exports.Logs.fire('error', { level: 'error', date: Date.now(), args });
    },
    trace(...args) {
        if (!this._silent) {
            exports.Logs._console.trace(...args);
        }
        exports.Logs.fire('trace', { level: 'trace', date: Date.now(), args });
    },
    replace() {
        try {
            // Store the keys of the console object so they can be
            // removed when restoring the console object.
            exports.Logs._consoleKeys = Object.getOwnPropertyNames(exports.Logs._console)
                .filter(key => !Object.hasOwn(exports.Logs, key));
            // Add the console object properties to the Logs PubSub
            Object.defineProperties(exports.Logs, exports.Logs._consoleKeys.map(key => {
                const descriptor = {
                    get() { return exports.Logs._console[key]; },
                    set(value) { exports.Logs._console[key] = value; },
                    configurable: true,
                    enumerable: true,
                };
                return descriptor;
            }, {}));
            // Replace the global console object with the Logs PubSub      
            Object.defineProperty(global, 'console', {
                value: new Proxy(exports.Logs, {
                    get: (target, prop) => {
                        if (prop in target) {
                            return target[prop];
                        }
                        else {
                            return target._console[prop];
                        }
                    }
                }),
                configurable: true,
                enumerable: true,
            });
            exports.Logs._replaced = true;
        }
        catch (err) {
            exports.Errors.capture(err);
        }
    },
    restore() {
        try {
            if (exports.Logs._replaced) {
                // Remove the console object properties from the Logs PubSub
                for (const key of exports.Logs._consoleKeys) {
                    delete exports.Logs[key];
                }
                Object.defineProperty(global, 'console', {
                    value: exports.Logs._console,
                    configurable: true,
                    enumerable: true,
                });
                exports.Logs._replaced = false;
            }
        }
        catch (err) {
            exports.Errors.capture(err);
        }
    },
});
exports.Errors = new PubSub('Errors', ['error'], { trackPublishes: true });
Object.assign(exports.Errors, {
    get silent() { return exports.Errors._silent; },
    set silent(value) { exports.Errors._silent = value; },
    _silent: false,
    capture(error) {
        if (!error instanceof Error) {
            error = new Error(String(error));
        }
        if (!this._silent) {
            exports.Logs.error(error);
        }
        exports.Errors.fire('error', { date: Date.now(), error });
    }
});
exports.default = PubSub;
