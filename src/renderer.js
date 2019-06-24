'use strict';

const { ipcRenderer } = require('electron');
const BasePromiseIPC = require('./base');

class RendererPromiseIPC extends BasePromiseIPC {
    constructor(opts) {
        super(ipcRenderer, opts);
    }

    // Send requires webContents -- see http://electron.atom.io/docs/api/ipc-main/
    send(route, ...dataArgs) {
        return super.send(route, ipcRenderer, ...dataArgs);
    }

    sendTo(route, winID, ...dataArgs) {
        return this.send(this.BRIDGE_ROUTE, { winID, route }, ...dataArgs);
    }
}

// 默认 30s
const rendererExport = new RendererPromiseIPC({ maxTimeoutMs: 1000 * 30 });
rendererExport.PromiseIpc = RendererPromiseIPC;
rendererExport.PromiseIpcRenderer = RendererPromiseIPC;

module.exports = rendererExport;
