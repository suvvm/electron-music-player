const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./renderer/MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})
class AppWindow extends BrowserWindow{
  constructor(config, fileLocation){
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
      nodeIntegration: true
     }
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show',() =>{//优化加载界面
      this.show()
    })
  }
}
app.on('ready', () =>{
  const mainWindow = new AppWindow({},'./renderer/index.html')
  mainWindow.webContents.on('did-finish-load',() =>{
    mainWindow.send('getTracks', myStore.getTracks())
  })
  ipcMain.on('add-music-window',() => {
    const addWindow = new AppWindow({
      width: 500,
      heigh: 400,
      parent:mainWindow
    },'./renderer/add.html')
  })
  ipcMain.on('add-tracks', (event,tracks) =>{
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    mainWindow.send('getTracks', updatedTracks)//将添加到的tracks发送给mainwindow
  })
  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })
  ipcMain.on('open-music-file',(event)=>{
    dialog.showOpenDialog({
      properties: ['openFile','multiSelections'],//允许选择文件，允许多选
      filters: [{ name: 'Music', extensions:['mp3'] }]//确定范围类型
    }).then(result => {
      if (result.filePaths){
        event.sender.send('selected-file',result.filePaths)
      }
    })
  })
  ipcMain.on('get-poster', (event, id) => {
    dialog.showOpenDialog({
      properties: ['openFile'], // 选择文件
      filters: [{ name: 'Poster', extensions:['jpg', 'jpeg', 'png', 'gif'] }]//确定范围类型
    }).then(result => {
      if (result.filePaths){
        const updatedTracks = myStore.mdfPoster(id, result.filePaths[0]).getTracks()
        mainWindow.send('getTracks', updatedTracks)
      }
    })
  })
  ipcMain.on('get-lyrics', (event, id) => {
    dialog.showOpenDialog({
      properties: ['openFile'], // 选择文件
      filters: [{ name: 'Lyrics', extensions:['lrc']}] //确定范围类型
    }).then(result => {
      if (result.filePaths){
        const updatedTracks = myStore.mdfLyrics(id, result.filePaths[0]).getTracks()
        mainWindow.send('getTracks', updatedTracks)
      }
    })
  })
})
