const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, Notification, shell, clipboard } = require('electron');
const path = require('path');

const SIZES = { closed: { w: 170, h: 40 }, open: { w: 600, h: 380 } };
let win, tray;

function place(state) {
  const d = screen.getPrimaryDisplay().bounds;
  const s = SIZES[state];
  win.setBounds({ x: Math.round(d.x + (d.width - s.w) / 2), y: d.y, width: s.w, height: s.h });
}

function createWindow() {
  win = new BrowserWindow({
    width: SIZES.closed.w, height: SIZES.closed.h,
    frame: false, transparent: true, hasShadow: false,
    alwaysOnTop: true, skipTaskbar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  place('closed');
  win.loadFile('index.html');
  win.once('ready-to-show', () => win.showInactive());
}

function createTray() {
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png')));
  tray.setToolTip('Tetes');
  const menu = () => Menu.buildFromTemplate([
    { label: 'Buka notch', click: () => { place('open'); win.webContents.send('open'); } },
    {
      label: 'Mulai saat login', type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (i) => app.setLoginItemSettings({ openAtLogin: i.checked })
    },
    { type: 'separator' },
    { label: 'Keluar', click: () => app.quit() }
  ]);
  tray.setContextMenu(menu());
  tray.on('click', () => tray.setContextMenu(menu()));
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.whenReady().then(() => {
    if (app.dock) app.dock.hide();
    createWindow();
    createTray();
    ipcMain.on('size', (_e, state) => place(state === 'open' ? 'open' : 'closed'));
    ipcMain.handle('clip', () => clipboard.readText());
    ipcMain.on('copy', (_e, t) => clipboard.writeText(String(t)));
    ipcMain.on('login', (_e, v) => app.setLoginItemSettings({ openAtLogin: v }));
    ipcMain.on('show', (_e, p) => shell.openPath(String(p)));
    ipcMain.on('notify', (_e, title, body) => {
      if (Notification.isSupported()) new Notification({ title, body, silent: false }).show();
    });
  });
  app.on('window-all-closed', () => {});
}
