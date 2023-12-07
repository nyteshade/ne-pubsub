"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLocalErrors = void 0;
const index_js_1 = require("./index.js");
const ErrorsExtension = {
    /** Determine if thrown Errors should not be logged */
    get silent() { return this._silent; },
    /** Set whether or not Errors should be logged */
    set silent(value) { this._silent = value; },
    /** The actual storage value for the silent mode */
    _silent: false,
    /**
     * The `Errors` instance of `PubSub` tracks logged errors
     * which allows later review.
     *
     * @param {error} error the error to capture
     */
    capture(error) {
        if (!(error instanceof Error)) {
            error = new Error(String(error));
        }
        if (!this._silent) {
            index_js_1.Logs.error(error);
        }
        this.fire('error', { date: Date.now(), error });
    }
};
/**
 * Used to create the global `Errors` instance, but it can also
 * be used to create local instances of Errors capture.
 *
 * @returns {pubsub} unique instance of PubSub designed to
 * capture publishes with a method to capture errors.
 */
function CreateLocalErrors() {
    return Object.assign(new index_js_1.PubSub('Errors', ['error'], { trackPublishes: true }), ErrorsExtension);
}
exports.CreateLocalErrors = CreateLocalErrors;
