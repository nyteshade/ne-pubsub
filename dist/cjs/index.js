"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLocalErrors = exports.Logs = exports.PubSub = exports.Errors = void 0;
const pubsub_js_1 = require("./pubsub.js");
Object.defineProperty(exports, "PubSub", { enumerable: true, get: function () { return pubsub_js_1.PubSub; } });
const logs_js_1 = require("./logs.js");
Object.defineProperty(exports, "Logs", { enumerable: true, get: function () { return logs_js_1.Logs; } });
const errors_js_1 = require("./errors.js");
Object.defineProperty(exports, "CreateLocalErrors", { enumerable: true, get: function () { return errors_js_1.CreateLocalErrors; } });
const Errors = (0, errors_js_1.CreateLocalErrors)();
exports.Errors = Errors;
exports.default = {
    PubSub: pubsub_js_1.PubSub,
    Logs: logs_js_1.Logs,
    Errors,
    CreateLocalErrors: errors_js_1.CreateLocalErrors,
};
