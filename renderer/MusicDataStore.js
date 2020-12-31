const Store = require('electron-store')
const {v4: uuidv4} = require('uuid')
const path = require('path')

class DataStore extends Store{
    constructor(settings) {
        super(settings)
        this.tracks = this.get('tracks') || []//保存所有音乐文件信息,初始为空
    }
    saveTracks(){
        this.set('tracks',this.tracks)
        return this
    }
    getTracks(){
        return this.get('tracks') || []
    }
    addTracks(tracks){//从eletron dialog中传来数组(id,path,filename)
        const tracksWithProps = tracks.map(track => {
            return {
                id:uuidv4(),
                path:track,
                fileName: path.basename(track)
            }
        }).filter(track =>{//去重
            const currentTracksPath = this.getTracks().map(track => track.path)
            return currentTracksPath.indexOf(track.path)<0
        })
        this.tracks = [...this.tracks,...tracksWithProps]//安插在track数组后面
        return this.saveTracks()
    }
    deleteTrack(deletedId) {
        this.tracks = this.tracks.filter(item => item.id !== deletedId )
        return this.saveTracks()
    }
}

module.exports = DataStore
