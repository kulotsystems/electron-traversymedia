const path = require('path');
const os   = require('os');
const fs   = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');


// environment checks
const isDev = process.env.NODE_ENV !== 'production';
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
let mainWindow;
function createMainWindow() {
    mainWindow = new BrowserWindow({
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
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options);
});


// resize the image
async function resizeImage({ imgPath, width, height, dest }) {
    try {
        // call resizeImg
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width : +width, // + converts string to integer
            height: +height
        });

        // create filename
        const filename = path.basename(imgPath);

        // create destination folder if not exists
        if(!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        // write file to destination folder
        fs.writeFileSync(path.join(dest, filename), newPath);

        // send success to renderer
        mainWindow.webContents.send('image:done')

        // open destination folder
        shell.openPath(dest);
    } catch (error) {
        console.log(error);
    }
}


// when app is ready
app.whenReady().then(() => {
    createMainWindow();

    // implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // remove mainWindow from memory on close
    mainWindow.on('closed', () => mainWindow = null);

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
