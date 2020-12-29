const { app, BrowserWindow, ipcMain } = require('electron')

class AppWindow extends BrowserWindow {
    constructor(config, fileLocation) {
        const baseConfig = {
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            }
        }
        const finalConfig = {...baseConfig, ...config}
        super(finalConfig);
        this.loadFile(fileLocation)
        this.once('ready-to-show', () => {
            this.show()
        })
    }
}
app.on('ready', () => {
    const mainWindow = new AppWindow({}, './renderer/index.html')
    ipcMain.on('add-music-window', () => {
        const addWindow = new AppWindow({
            width: 500,
            height: 400,
            parent: mainWindow
        }, './renderer/add.html')
    })
})
