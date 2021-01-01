const { ipcRenderer } = require('electron')
const{ $ ,converDuration} = require('./helper')
let musicAudio = new Audio()
let allTracks
let currentTrack
let musicId = 0
$('add-music-button').addEventListener('click',()=>{
    ipcRenderer.send('add-music-window')
})

const renderListHTML = (tracks) =>{
    const tracksList = $('tracksList')
    const tracksListHTML = tracks.reduce((html,track) =>{
      html += `<li class = "row music-track list-group-item d-flex justify-content-between align-items-center" >
        <div class="col-9">
          <i class="fas fa-music mr-2 text-secondary"></i>
          <b>${track.fileName}</b>
        </div>
        <div class="col-3">
          <i class="fas fa-play mr-3 " id="${track.id}_play" data-id="${track.id}"></i>
          <i class="fas fa-trash-alt mr-3 " id="${track.id}_del" data-id="${track.id}"></i>
          <i class="fas fa-images mr-3 " id="${track.id}_img" data-id="${track.id}"></i>
          <i class="fas fa-file-word mr-3 " id="${track.id}_word" data-id="${track.id}"></i>
        </div>
      </li>`
      return html
    },'')
    const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}

const renderPlayerHTML = (name,duration) =>{
    const player = $('player-status')
    const html = `<div class="col font-weight-bold">
                    正在播放:${name}
                    </div>
                    <div class="col">
                      <span id= "current-seeker">00:00</span> /${converDuration(duration)}
                    </div>`
    player.innerHTML = html
}
const updateProgressHTML = (currentTime,duration) =>{//计算progress
    const progress = Math.floor(currentTime / duration * 100)
    const bar = $('player-progress')
    bar.innerHTML = progress + '%'
    bar.style.width = progress + '%'
    const seeker = $('current-seeker')
    seeker.innerHTML = converDuration(currentTime)
}
ipcRenderer.on('getTracks', (event,tracks) => {
    console.log('receive tracks' , tracks)
    allTracks = tracks
    renderListHTML(tracks)
    if (currentTrack) {
        var musicPlaying = $(`${currentTrack.id}_play`)
        var classVal = musicPlaying.getAttribute('class').replace('fa-play', 'fa-pause')
        musicPlaying.setAttribute('class', classVal)
    }
})

musicAudio.addEventListener('loadedmetadata', () =>{//渲染播放器状态
    renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', ()=>{//更新播放器状态
   updateProgressHTML(musicAudio.currentTime,musicAudio.duration)
})

musicAudio.addEventListener('ended', (event) => {
    var musicIndex = allTracks.findIndex(track => track.id === musicId)
    var tracksLen = allTracks.length
    musicIndex += 1
    if (musicIndex >= tracksLen) {
        musicIndex = 0
    }
    console.log(musicIndex)
    console.log(tracksLen)
    currentTrack = allTracks[musicIndex]
    // currentTrack = allTracks.find(track => musicIndex)

    var oldMusicItem = $(`${musicId}_play`)
    var oldClassVal = oldMusicItem.getAttribute('class').replace('fa-pause' , 'fa-play')
    oldMusicItem.setAttribute('class', oldClassVal)

    var newMusicItem = $(`${currentTrack.id}_play`)
    var newClassVal = newMusicItem.getAttribute('class').replace('fa-play', 'fa-pause')
    newMusicItem.setAttribute('class', newClassVal)

    musicId = currentTrack.id
    musicAudio.src = currentTrack.path
    musicAudio.play()
    console.log(currentTrack)

})

$('tracksList').addEventListener('click',(event) =>{
    console.log('666')
    event.preventDefault()
    const {dataset, classList} = event.target
    const id = dataset && dataset.id
    musicId = id
    if(id && classList.contains('fa-play')){//播放音乐
        if(currentTrack && currentTrack.id === id){//继续播放音乐
            musicAudio.play()
        }else {//播放新的歌曲，还原之前的图标
            currentTrack = allTracks.find(track => track.id === id )
            console.log(currentTrack.path)
            musicAudio.src = currentTrack.path
            musicAudio.play()
            const resetIconEle = document.querySelector('.fa-pause')
            if(resetIconEle){
                resetIconEle.classList.replace('fa-pause' , 'fa-play')
            }
        }
        classList.replace('fa-play' , 'fa-pause')
    } else if (id && classList.contains('fa-pause')) { // 暂停播放
        musicAudio.pause()
        classList.replace('fa-pause','fa-play')
    } else if (id && classList.contains('fa-trash-alt')){ // 发送事件 删除这条音乐
        ipcRenderer.send('delete-track' , id)
    } else if (id && classList.contains('fa-images')) { // 添加封面
        ipcRenderer.send('get-poster', id)
    } else if (id && classList.contains('fa-file-word')) {
        ipcRenderer.send('get-lyrics', id)
    }
})

$('music_bar').addEventListener('click', (event) => {
    console.log('666')
    var bar_w = $('music_bar').offsetWidth
    var now_w = event.offsetX
    console.log('bar_w')
    console.log(bar_w)
    console.log('now_w')
    console.log(now_w)
    //console.log()

    musicAudio.currentTime = ((now_w/ bar_w) * musicAudio.duration)
})
$('poster_div').addEventListener('click', (event) => {
    var playBtn = $(`${currentTrack.id}_play`)
    var btnClassVal = playBtn.getAttribute('class')
    if (musicAudio.paused) {
        $('music_poster_img').setAttribute('class', 'animation_play')
        $('poster_needle').setAttribute('class', 'animation_needle_play')

        // btnClassVal.replace('fa-play', 'fa-pause')
        // console.log('fa-play to fa-pause')
        // playBtn.setAttribute('class', btnClassVal)

        if (currentTrack) {
            var musicPlaying = $(`${currentTrack.id}_play`)
            var classVal = musicPlaying.getAttribute('class').replace('fa-play', 'fa-pause')
            musicPlaying.setAttribute('class', classVal)
        }
        musicAudio.play()
        console.log(currentTrack.id)

    } else {
        $('music_poster_img').setAttribute('class', 'animation_pause')
        $('poster_needle').setAttribute('class', 'animation_needle_pause')
        const resetIconEle = document.querySelector('.fa-pause')
        if(resetIconEle){
            resetIconEle.classList.replace('fa-pause' , 'fa-play')
        }
        musicAudio.pause()
        console.log(currentTrack.id)

    }
})

// var width = $('player-progress').offsetHeight
