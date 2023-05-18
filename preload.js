const { contextBridge, ipcRenderer } = require('electron');

const electronNativeAPI = {
  onBarcodeScan: (callback) => {
    ipcRenderer.on('on-barcode-scan', callback);
  },
  showDevices: (callback) => {
    ipcRenderer.on('show-devices', callback);
    ipcRenderer.send('get-devices');
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronNativeAPI);
