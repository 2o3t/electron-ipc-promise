
interface BasePromiseIPC {
    send: (route:string, sender:any, ...dataArgs: any) => Promise<any>,
    on: (route:string, listener: (...dataArgs: any) => Promise<any>) => BasePromiseIPC,
    watch: (route:string, listener: (...dataArgs: any, replyChannel?: string) => Promise<any>) => () => void,
}

interface RendererPromiseIPC extends BasePromiseIPC {
    send: (route:string, ...dataArgs: []) => Promise<any>,
    sendTo: (route:string, winID:string, ...dataArgs: any) => Promise<any>,
    PromiseIpc?:RendererPromiseIPC,
    PromiseIpcRenderer?:RendererPromiseIPC,
}

interface MainPromiseIPC extends BasePromiseIPC {
    send: (route:string, webContents:any, ...dataArgs: any) => Promise<any>,
    PromiseIpc?:RendererPromiseIPC,
    PromiseIpcMain?:RendererPromiseIPC,
}

interface PromiseIPC {
    ACTIONS?: any,
}

declare module '@2o3t/electron-ipc-promise' {
    const content: RendererPromiseIPC & MainPromiseIPC & PromiseIPC;
    export = content;
}
