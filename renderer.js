// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// alert node version
// alert(process.versions.node)

const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    // alert text
    // alert('greeting from the DOM side')

    // send msg to main process
    ipcRenderer.send('message', 'hello from renderer')
    ipcRenderer.on('reply', (event, args) => {
        document.getElementById("msg").innerHTML = args;
    })
})

