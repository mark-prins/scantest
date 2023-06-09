const HID = require('node-hid');

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const hids = [];

const loadScanners = (window) => {
  const devices = [];
  HID.devices().forEach((device) => {
    const current = { ...device, connected: false };
    try {
      if (device.vendorId === 9969 || device.vendorId === 1504) {
        const hid = new HID.HID(device.vendorId, device.productId);
        current.connected = true;
        const result = {
          pid: device.productId,
          vid: device.vendorId,
          product: device.product,
        };
        hid.on('data', (data) => {
          window.webContents.send('on-barcode-scan', {
            ...result,
            data: data.reduce((barcode, curr) => barcode + String.fromCharCode(curr), ''),
            numeric: data.reduce((barcode, curr) => `${barcode},${curr}`, ''),
          });
        });
        hids.push(hid);
      }
    } catch (e) {
      console.error(`device: ${device.product} (${device.productId})`, e);
    }
    devices.push(current);
  });
  window.webContents.send('show-devices', devices);
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  ipcMain.on('get-devices', () => loadScanners(mainWindow));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  console.info('closing devices...');
  hids.forEach((device) => {
    try {
      device.close();
    } catch {}
  });
  console.info('done!');
  app.quit();
});

process.on('uncaughtException', (error) => {
  console.warn('error', error);

  if (error.message === 'could not read from HID device') return;
  dialog.showErrorBox('Error', error.message);
});
