const HID = require('node-hid');

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const loadScanners = (window) => {
  const devices = [];

  HID.devices()
    // .filter((d) => !!d.path)
    .forEach((device) => {
      devices.push(device);
      try {
        // const hid = new HID.HID(device.vendorId, device.productId);
        const hid = new HID.HID(device.path);
        const result = {
          pid: device.productId,
          vid: device.vendorId,
          product: device.product,
        };
        hid.on('data', (data) =>
          window.webContents.send('on-barcode-scan', {
            ...result,
            data: data.reduce((barcode, curr) => barcode + String.fromCharCode(curr), ''),
          })
        );
      } catch (e) {
        console.error(`device: ${device.vendorId}, ${device.productId}`, e);
      }
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
  app.quit();
});
