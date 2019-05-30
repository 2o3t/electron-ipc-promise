'use strict';

const isRenderer = require('is-electron-renderer');

if (isRenderer) {
    module.exports = require('./src/renderer');
} else {
    module.exports = require('./src/main');
}
