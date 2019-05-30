# @2o3t/electron-ipc-promise

## Installation

```sh
yarn add @2o3t/electron-ipc-promise
```

## Usage

```js
// in main process
const promiseIpc = require('@2o3t/electron-ipc-promise');

promiseIpc.on('notify', (newSettings) => {
    console.log(newSettings);
    return 'test';
});

// in renderer
const promiseIpc = require('@2o3t/electron-ipc-promise');

promiseIpc
  .send('notify', { "name": "Jeff" }')
  .then(() => console.log('You wrote the settings!'))
  .catch((e) => console.error(e));
```


You can also send data from the main process to a renderer, if you pass in its WebContents object.


```js
// in main process
const promiseIpc = require('@2o3t/electron-ipc-promise');

promiseIpc
  .send('getRendererData', webContentsForRenderer)
  .then((rendererData) => console.log(rendererData))
  .catch((e) => console.error(e));

// in renderer
const promiseIpc = require('@2o3t/electron-ipc-promise');

promiseIpc.on('getRendererData', () => {
  return getSomeSuperAwesomeRendererData();
});
```

### Removing Listeners

You can remove a listener with the off() method.

```js
const promiseIpc = require('@2o3t/electron-ipc-promise');

promiseIpc.on('someRoute', () => {
  return something();
});

promiseIpc.off('someRoute'); // never mind
```
