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
export const Logs: PubSub;
import { PubSub } from './pubsub.js';
