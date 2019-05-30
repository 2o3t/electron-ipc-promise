'use strict';

const { ipcMain } = require('electron');
const BasePromiseIPC = require('./base');

class MainPromiseIPC extends BasePromiseIPC {
    constructor(opts) {
        super(ipcMain, opts);
    }

    // Send requires webContents -- see http://electron.atom.io/docs/api/ipc-main/
    send(route, webContents, ...dataArgs) {
        return super.send(route, webContents, ...dataArgs);
    }
}

// 默认 30s
const mainExport = new MainPromiseIPC({ maxTimeoutMs: 1000 * 30 });
mainExport.PromiseIpc = MainPromiseIPC;
mainExport.PromiseIpcMain = MainPromiseIPC;

module.exports = mainExport;
