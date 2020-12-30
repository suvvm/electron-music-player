const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./renderer/MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})

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
    // 加载完成后自动渲染音乐
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('page did finish load')
        mainWindow.send('getTracks', myStore.getTracks())
    })

    // 导入音乐
    ipcMain.on('add-tracks', (event, tracks) => {
        console.log('tracks')
        console.log(tracks)
        const updatedTracks = myStore.addTracks(tracks).getTracks()
        console.log('updatedTracks')
        console.log(updatedTracks)
        mainWindow.send('getTracks', updatedTracks)
    })
    ipcMain.on('open-music-file', (event) => {
        dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{name: 'Music', extensions: ['mp3'] }]
        }).then(files => {
            console.log(files)
            if (files) {
                event.sender.send('selected-file', files)
            }
        })
    })
})
