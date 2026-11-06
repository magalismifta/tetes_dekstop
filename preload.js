const { contextBridge, ipcRenderer, webUtils } = require('electron');
contextBridge.exposeInMainWorld('tetes', {
  size: (s) => ipcRenderer.send('size', s),
  notify: (t, b) => ipcRenderer.send('notify', t, b),
  onOpen: (cb) => ipcRenderer.on('open', cb),
  clip: () => ipcRenderer.invoke('clip'),
  copy: (t) => ipcRenderer.send('copy', String(t)),
  login: (v) => ipcRenderer.send('login', !!v),
  show: (p) => ipcRenderer.send('show', p),
  pathFor: (f) => webUtils.getPathForFile(f)
});
