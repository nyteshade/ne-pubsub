declare namespace defaultObj {
    export { PubSub };
    export { Logs };
    export { Errors };
    export { CreateLocalErrors };
}
import { PubSub } from './pubsub.js';
import { Logs } from './logs.js';
import { Errors } from './errors.js';
import { CreateLocalErrors } from './errors.js';
export { defaultObj as default, PubSub, Logs, Errors, CreateLocalErrors };
