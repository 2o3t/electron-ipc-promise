'use strict';

const { ipcMain, BrowserWindow } = require('electron');
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

// 建立跨渲染进程桥接
mainExport.on(mainExport.BRIDGE_ROUTE, ({ winID, route }, ...dataArgs) => {
    const win = BrowserWindow.fromId(winID);
    if (win) {
        const webContents = win.webContents;
        return mainExport.send(route, webContents, ...dataArgs);
    }
    return Promise.reject(`Not Found: ${win}`);
});

module.exports = mainExport;
