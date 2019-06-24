'use strict';

const UUID = require('uuid').v4;
const Promise = require('bluebird');
const serializeError = require('serialize-error');

class BasePromiseIPC {
    constructor(eventEmitter, opts) {
        if (!eventEmitter) throw new Error('Please either ipcRenderer or ipcMain');
        if (opts) {
            this.maxTimeoutMs = opts.maxTimeoutMs;
            // TODO namespace
        }
        this.eventEmitter = eventEmitter;
        this.routeListenerMap = new Map();
        this.listenerMap = new Map();
        this.watchMap = new Map();
        // 桥
        this.BRIDGE_ROUTE = Symbol('bridge_route');
    }

    send(route, sender, ...dataArgs) {
        return new Promise((resolve, reject) => {
            const replyChannel = `${route}#${UUID()}`;
            let timeout;
            let didTimeOut = false;

            // ipcRenderer will send a message back to replyChannel when it finishes calculating
            this.eventEmitter.once(replyChannel, (event, status, returnData) => {
                clearTimeout(timeout);
                if (didTimeOut) {
                    return null;
                }
                switch (status) {
                    case 'success':
                        return resolve(returnData);
                    case 'failure':
                        return reject(returnData);
                    default:
                        return reject(new Error(`Unexpected IPC call status "${status}" in ${route}`));
                }
            });
            sender.send(route, replyChannel, ...dataArgs);

            if (this.maxTimeoutMs) {
                timeout = setTimeout(() => {
                    didTimeOut = true;
                    reject(new Error(`${route} timed out.`));
                }, this.maxTimeoutMs);
            }
        });
    }

    on(route, listener) {
        if (!listener || typeof listener !== 'function') return;
        const prevListener = this.routeListenerMap.get(route);
        // If listener has already been added for this route, don't add it again.
        if (prevListener === listener) {
            return this;
        }
        // Only one listener may be active for a given route.
        // If two are active promises it won't work correctly - that's a race condition.
        if (this.routeListenerMap.has(route)) {
            this.off(route, prevListener);
        }
        // This function _wraps_ the listener argument. We maintain a map of
        // listener -> wrapped listener in order to implement #off().
        const wrappedListener = (event, replyChannel, ...dataArgs) => {
            // Chaining off of Promise.resolve() means that listener can return a promise, or return
            // synchronously -- it can even throw. The end result will still be handled promise-like.
            Promise.resolve()
                .then(() => listener(...dataArgs))
                .then(results => {
                    event.sender.send(replyChannel, 'success', results);
                })
                .catch(e => {
                    event.sender.send(replyChannel, 'failure', serializeError(e));
                });
        };
        this.routeListenerMap.set(route, listener);
        this.listenerMap.set(listener, wrappedListener);
        this.eventEmitter.on(route, wrappedListener);
        return this;
    }

    off(route, listener) {
        if (!listener || typeof listener !== 'function') return;
        const registeredListener = this.routeListenerMap.get(route);
        if (listener && listener !== registeredListener) {
            return this; // trying to remove the wrong listener, so do nothing.
        }
        const wrappedListener = this.listenerMap.get(registeredListener);
        this.eventEmitter.removeListener(route, wrappedListener);
        this.listenerMap.delete(registeredListener);
        this.routeListenerMap.delete(route);
        return this;
    }

    watch(route, listener) {
        if (!listener || typeof listener !== 'function') return;
        let watchArrs = this.watchMap.get(route);
        if (!watchArrs) watchArrs = new Set();
        const findOne = [ ...watchArrs ].find(item => {
            return item._listener && listener && item._listener === listener;
        });
        if (findOne) {
            return findOne;
        }
        const wrappedListener = () => {
            this.eventEmitter.removeListener(route, wrappedListener.listener);
            watchArrs.delete(wrappedListener);
        };
        wrappedListener._listener = listener;
        wrappedListener.listener = (event, replyChannel, ...dataArgs) => {
            Promise.resolve()
                .then(() => listener(...dataArgs, replyChannel));
        };
        watchArrs.add(wrappedListener);
        this.eventEmitter.on(route, wrappedListener.listener);
        return wrappedListener;
    }
}

module.exports = BasePromiseIPC;
