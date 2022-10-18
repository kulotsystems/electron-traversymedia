const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');


// environment checks
const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';


// menu template
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : [])
];


// create main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1200 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
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


// create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300
    });


    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
        .then(() => {
            console.log("about window loaded");
        });
}


// respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
    console.log(options);
});


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
