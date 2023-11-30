"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.Logs = exports.PubSub = exports.default = void 0;
const pubsub_js_1 = require("./pubsub.js");
Object.defineProperty(exports, "PubSub", { enumerable: true, get: function () { return pubsub_js_1.PubSub; } });
Object.defineProperty(exports, "Logs", { enumerable: true, get: function () { return pubsub_js_1.Logs; } });
Object.defineProperty(exports, "Errors", { enumerable: true, get: function () { return pubsub_js_1.Errors; } });
const defaultObj = { PubSub: pubsub_js_1.PubSub, Logs: pubsub_js_1.Logs, Errors: pubsub_js_1.Errors };
exports.default = defaultObj;
