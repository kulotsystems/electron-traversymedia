const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');


// environment checks
const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';


// menu template
const menu = [
    {
        role: 'fileMenu'
    }
];


// create main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1200 : 500,
        height: 600
    });

    // open devtools if in dev environment
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
        .then(() => {
            console.log("main window loaded");
        });
}


// when app is ready
app.whenReady().then(() => {
    createMainWindow();

    // implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // when app is activated
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});


// when all windows are closed
app.on('window-all-closed', () => {
    if(!isMac)
        app.quit();
});
