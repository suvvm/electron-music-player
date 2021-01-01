const { ipcRenderer } = require('electron')
const{ $ ,converDuration} = require('./helper')
const fs = require('fs')

let musicAudio = new Audio()
let allTracks
let currentTrack
let musicId = 0
let lyricVal
let lrcHighIndex = 0
let lrcMoveIndex = 0
let movDis = 0
let lyricStyle = 0
$('add-music-button').addEventListener('click',()=>{
    ipcRenderer.send('add-music-window')
})

jQuery(document).ready(function ($) {
    var music = false
    $('#tabs').tab();
    $('#player-status').click(function(){
        // console.log('player-status click')
        if (!music) {
            music = true
            $(`#tabs a[href='#music']`).tab('show')
            if (currentTrack.posterPath) {
                $('#music_poster_img').attr('src',currentTrack.posterPath)
                $('#bg_img').attr('src',currentTrack.posterPath)
            }

        } else {
            music = false
            $(`#tabs a[href='#home']`).tab('show')
        }
    });
    $('#back').click(function (){
        $(`#tabs a[href='#home']`).tab('show')
    })
});


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
    var lyricContainer = $('lyricContainer')
    console.log(musicAudio.currentTime)
    // for (var i = 0, l = lyricVal.length; i < l; i++) {
    //     if (musicAudio.currentTime /*当前播放的时间*/ > lyricVal[i][0]) {
    //         //显示到页面
    //         lyricContainer.innerHTML = lyricVal[i][1];
    //         console.log(lyricVal[i][1])
    //     };
    // };

    for (var i = 0, l = lyricVal.length; i < l; i++) {
        if (musicAudio.currentTime > lyricVal[i][0] - 0.50 /*preload the lyric by 0.50s*/ ) {
            //single line display mode
            // that.lyricContainer.textContent = that.lyric[i][1];
            //scroll mode
            var line = document.getElementById('line-' + i),
                prevLine = document.getElementById('line-' + (i > 0 ? i - 1 : i));
            prevLine.className = '';
            //randomize the color of the current line of the lyric
            line.className = 'current-line-' + lyricStyle;
            lyricContainer.style.top = 130 - line.offsetTop + 'px';
        };
    };


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
            if (currentTrack.lyricsPath) {
                parseLyric(currentTrack.lyricsPath)
                lyricStyle = Math.floor(Math.random() * 4)
            }
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

function appendLyric (lyric) {
    var lyricContainer = $('lyricContainer'),
        fragment = document.createDocumentFragment();
    lyricContainer.style.top = '130px';
    lyricContainer.innerHTML = '';
    lyricVal.forEach(function(v, i, a) {
        var line = document.createElement('p');
        line.id = 'line-' + i;
        line.textContent = v[1];
        fragment.appendChild(line);
    });
    lyricContainer.appendChild(fragment);
}

function getOffset(text) {
    //Returns offset in miliseconds.
    var offset = 0;
    try {
        // Pattern matches [offset:1000]
        var offsetPattern = /\[offset:\-?\+?\d+\]/g,
            // Get only the first match.
            offset_line = text.match(offsetPattern)[0],
            // Get the second part of the offset.
            offset_str = offset_line.split(':')[1];
        // Convert it to Int.
        offset = parseInt(offset_str);
    } catch (err) {
        //alert("offset error: "+err.message);
        offset = 0;
    }
    return offset;
}


function parseLyric(path) {
    console.log(path)
    fs.readFile(path, (err, res) => {
        var text = res.toString()
        var lines = text.split('\n'),
            //this regex mathes the time [00.12.78]
            pattern = /\[\d{2}:\d{2}.\d{3}\]/g,
            result = [];

        // Get offset from lyrics
        var offset = getOffset(text);

        //exclude the description parts or empty parts of the lyric
        while (!pattern.test(lines[0])) {
            lines = lines.slice(1);
        };
        //remove the last empty item
        lines[lines.length - 1].length === 0 && lines.pop();
        //display all content on the page
        lines.forEach(function(v, i, a) {
            var time = v.match(pattern),
                value = v.replace(pattern, '');
            time.forEach(function(v1, i1, a1) {
                //convert the [min:sec] to secs format then store into result
                var t = v1.slice(1, -1).split(':');
                result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]) + parseInt(offset) / 1000, value]);
            });
        });
        //sort the result by time
        result.sort(function(a, b) {
            return a[0] - b[0];
        });
        console.log(result);
        lyricVal = result
        appendLyric(lyricVal);
    })
}

// var width = $('player-progress').offsetHeight
