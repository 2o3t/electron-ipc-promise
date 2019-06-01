'use strict';

const SCOPE_MAP = new Map();
const ACTION_NAME_SET = new Set();

function createSubProxy(key) {
    return new Proxy({}, {
        get(target, name) {
            const value = `${key}@${name}`;
            ACTION_NAME_SET.add(value);
            return value;
        },
    });
}

module.exports = new Proxy({}, {
    get(target, name) {
        if (name === 'list') {
            return () => ACTION_NAME_SET.toJSON();
        }
        if (!SCOPE_MAP.has(name)) {
            const scope = createSubProxy(name);
            SCOPE_MAP.set(name, scope);
        }
        return SCOPE_MAP.get(name);
    },
});
