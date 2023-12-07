/**
 * Used to create the global `Errors` instance, but it can also
 * be used to create local instances of Errors capture.
 *
 * @returns {pubsub} unique instance of PubSub designed to
 * capture publishes with a method to capture errors.
 */
export function CreateLocalErrors(): pubsub;
