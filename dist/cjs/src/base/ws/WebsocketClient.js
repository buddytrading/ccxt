"use strict";
// @flow
var WebSocket = require('ws')
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An asynchronous WebSocket client.
 * @example
 * // Set up connection.
 * const webSocketClient = new WebSocketClient;
 * // Connect.
 * await webSocketClient.connect('ws://www.example.com/');
 * // Send is synchronous.
 * webSocketClient.send('Hello!');
 * // Receive is asynchronous.
 * console.log(await webSocketClient.receive());
 * // See if there are any more messages received.
 * if (webSocketClient.dataAvailable !== 0) {
 *     console.log(await webSocketClient.receive());
 * }
 * // Close the connection.
 * await webSocketClient.disconnect();
 */
var WebSocketClient = /** @class */ (function () {
    function WebSocketClient() {
        this._reset();
    }
    Object.defineProperty(WebSocketClient.prototype, "connected", {
        /**
         * Whether a connection is currently open.
         * @returns true if the connection is open.
         */
        get: function () {
            // Checking != null also checks against undefined.
            return this._socket != null && this._socket.readyState === WebSocket.OPEN;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebSocketClient.prototype, "dataAvailable", {
        /**
         * The number of messages available to receive.
         * @returns The number of queued messages that can be retrieved with {@link #receive}
         */
        get: function () {
            return this._receiveDataQueue.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets up a WebSocket connection to specified url. Resolves when the
     * connection is established. Can be called again to reconnect to any url.
     */
    WebSocketClient.prototype.connect = function (url, protocols) {
        var _this = this;
        return this.disconnect().then(function () {
            _this._reset();
            _this._socket = new WebSocket(url, protocols);
            _this._socket.binaryType = "arraybuffer";
            return _this._setupListenersOnConnect();
        });
    };
    /**
     * Send data through the websocket.
     * Must be connected. See {@link #connected}.
     */
    WebSocketClient.prototype.send = function (data) {
        if (!this.connected) {
            throw this._closeEvent || new Error("Not connected.");
        }
        this._socket.send(data);
    };
    /**
     * Asynchronously receive data from the websocket.
     * Resolves immediately if there is buffered, unreceived data.
     * Otherwise, resolves with the next rececived message,
     * or rejects if disconnected.
     * @returns A promise that resolves with the data received.
     */
    WebSocketClient.prototype.receive = function () {
        var _this = this;
        if (this._receiveDataQueue.length !== 0) {
            return Promise.resolve(this._receiveDataQueue.shift());
        }
        if (!this.connected) {
            return Promise.reject(this._closeEvent || new Error("Not connected."));
        }
        var receivePromise = new Promise(function (resolve, reject) {
            _this._receiveCallbacksQueue.push({ resolve: resolve, reject: reject });
        });
        return receivePromise;
    };
    /**
     * Initiates the close handshake if there is an active connection.
     * Returns a promise that will never reject.
     * The promise resolves once the WebSocket connection is closed.
     */
    WebSocketClient.prototype.disconnect = function (code, reason) {
        var _this = this;
        if (!this.connected) {
            return Promise.resolve(this._closeEvent);
        }
        return new Promise(function (resolve, reject) {
            // It's okay to call resolve/reject multiple times in a promise.
            var callbacks = {
                resolve: function (dummy) {
                    // Make sure this object always stays in the queue
                    // until callbacks.reject() (which is resolve) is called.
                    _this._receiveCallbacksQueue.push(callbacks);
                },
                reject: resolve,
            };
            _this._receiveCallbacksQueue.push(callbacks);
            // After this, we will imminently get a close event.
            // Therefore, this promise will resolve.
            _this._socket.close(code, reason);
        });
    };
    /**
     * Sets up the event listeners, which do the bulk of the work.
     * @private
     */
    WebSocketClient.prototype._setupListenersOnConnect = function () {
        var _this = this;
        var socket = this._socket;
        return new Promise(function (resolve, reject) {
            var handleMessage = function (event) {
                var messageEvent = event;
                // The cast was necessary because Flow's libdef's don't contain
                // a MessageEventListener definition.
                if (_this._receiveCallbacksQueue.length !== 0) {
                    _this._receiveCallbacksQueue.shift().resolve(messageEvent.data);
                    return;
                }
                _this._receiveDataQueue.push(messageEvent.data);
            };
            var handleOpen = function (event) {
                socket.addEventListener("message", handleMessage);
                socket.addEventListener("close", function (event) {
                    _this._closeEvent = event;
                    // Whenever a close event fires, the socket is effectively dead.
                    // It's impossible for more messages to arrive.
                    // If there are any promises waiting for messages, reject them.
                    while (_this._receiveCallbacksQueue.length !== 0) {
                        _this._receiveCallbacksQueue.shift().reject(_this._closeEvent);
                    }
                });
                resolve();
            };
            socket.addEventListener("error", reject);
            socket.addEventListener("open", handleOpen);
        });
    };
    /**
     * @private
     */
    WebSocketClient.prototype._reset = function () {
        this._receiveDataQueue = [];
        this._receiveCallbacksQueue = [];
        this._closeEvent = null;
    };
    return WebSocketClient;
}());
exports.default = WebSocketClient;
