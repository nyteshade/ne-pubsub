declare namespace defaultObj {
    export { PubSub };
    export { Logs };
    export { Errors };
}
import { PubSub } from './pubsub.js';
import { Logs } from './logs.js';
import { Errors } from './errors.js';
export { defaultObj as default, PubSub, Logs, Errors };
