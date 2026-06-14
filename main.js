const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    const customSession = session.fromPartition('persist:kinetix_session', {
        cache: true
    });

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 600,
        minHeight: 400,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1e1e1e',
            symbolColor: '#ffffff',
            height: 40
        },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            session: customSession,
            webviewTag: true // Разрешаем использование тега <webview>
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'ui', 'browser.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
