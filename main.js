const { app, BrowserWindow, ipcMain } = require('electron')

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadFile('index.html')
    // const secondWindow = new BrowserWindow({
    //     width: 400,
    //     height: 300,
    //     webPreferences: {
    //         nodeIntegration: true
    //     },
    //     parent: mainWindow
    // })
    // secondWindow.loadFile('second.html')
    ipcMain.on('message', (event, arg) => {
        console.log(arg)
        // event.sender.send('reply', 'hello from main')
        mainWindow.send('reply', 'hello from main')
    })
})

