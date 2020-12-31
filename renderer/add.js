const { ipcRenderer } = require('electron')
const{ $ } = require('./helper')
const path = require('path')
let musicFilesPath = []

$('select-music').addEventListener('click',()=>{
    ipcRenderer.send('open-music-file')
})

$('add-music').addEventListener('click',() =>{
  ipcRenderer.send('add-tracks', musicFilesPath)
})

const renderListHTML =  (pathes) =>{//渲染
    const musicList = $('musicList')
    const musicItemsHTML = pathes.reduce((html,music) => {//循环html
      html += `<li class ="list-group-item">${path.basename(music)}</li>`//内置api的path 
      return html
    },'')
    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
}
ipcRenderer.on('selected-file',(event,path) => {
    if(Array.isArray(path)){
        renderListHTML(path)//渲染列表
        musicFilesPath = path//赋值
    }
})