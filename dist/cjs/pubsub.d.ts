/**
 * A simple PubSub implementation.
 */
export class PubSub {
    /**
     * Retreive a PubSub instance by name statically
     *
     * @param pubSubName the name of the PubSub instance to get
     * @returns the PubSub instance with the given name or null
     */
    static get(pubSubName: any): any;
    /** Private map of known PubSubs */
    static "__#1@#pubsubs": Map<any, any>;
    /**
     * Create a new PubSub instance.
     *
     * @param name the name of the PubSub instance, consider it to
     * be a namespace for the events it tracks
     * @param eventNames an array of event names that this PubSub
     */
    constructor(name: any, eventNames: any, options?: {
        trackPublishes: boolean;
    });
    /**
     * A map of event names to subscribers. Each subscriber is
     * an object with the format:
     *
     * `{ handler: function, thisObj: object }`
     */
    trackedEvents: Map<any, any>;
    /**
     * A map of arguments passed to the `publish` function. The
     * key is the event name and the value is an array of array
     * of arguments passed to the `publish` function for each
     * firing of the event that has occurred so far.
     *
     * This value is only set if the `trackPublishes` option is
     * set to true.
     */
    trackedPublishes: null;
    name: any;
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
    addEvent(eventName: any, ...subscribers: any[]): void;
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
    listen(eventName: any, subscriber: any, thisObj: any, options?: {
        once: boolean;
        replayPreviousEvents: boolean;
    }): () => void;
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
    unlisten(eventName: any, subscriber: any): void;
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
    publish(eventName: any, ...args: any[]): Promise<any[]>;
    /**
     * Alias for `publish`
     *
     * @param eventName the name of the event to publish
     * @param args the arguments to pass to the subscribers
     * @return an array of results from the subscribers
     */
    fire(eventName: any, ...args: any[]): Promise<any[]>;
    /**
     * Alias for `publish`
     *
     * @param eventName the name of the event to publish
     * @param args the arguments to pass to the subscribers
     * @return an array of results from the subscribers
     */
    trigger(eventName: any, ...args: any[]): Promise<any[]>;
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
    reduce(eventName: string | symbol, initialValue: any): Promise<any>;
    /** The name of this PubSub instance */
    get [Symbol.toStringTag](): string;
}
export default PubSub;
