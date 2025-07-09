import options from "./options.js"
import readline from "node:readline/promises"
import {stdin as input, stdout as output} from "process"
import fs from "node:fs"
const r = readline.createInterface({ input, output,terminal: false })
import {execSync} from "node:child_process"

class Download {
    #aid
    #bvid
    #cid
    #arrary = []
    #audioOptions = [
  { id: 30216, name: '64K' },
  { id: 30232, name: '132K' },
  { id: 30280, name: '192K' },
  { id: 30250, name: '杜比全景声' },
  { id: 30251, name: 'Hi-Res无损' }
]
    #download_choose = []
    #type
    constructor(data) {
        if ('list' in data){
            this.#aid = data.aiv
            this.#bvid = data.bvid
            let arr = []
            for (let i = 0; i < data.list.length; i++) {
                arr.push({cid: data.list[i].cid, part: data.list[i].part.replaceAll(/[\\\/:*?"<>|]/gm, '_')})
            }
            this.#cid = arr
        }else {
            for (let i = 0; i < data.length; i++) {
                this.#arrary.push({
                    aid:data[i].aid,
                    bvid: data[i].bvid,
                    cid: data[i].cid,
                    title: data[i].show_title.replaceAll(/[\\\/:*?"<>|]/gm, "_")
                })
            }
        }
    }

    model(data) {
        'list' in data ? this.video():this.bangumi()
    }

    async video() {
        await this.#check_p(this.#cid,'video')
        for (let i = 0; i < this.#cid.length; i++) {
                const res = await fetch(`https://api.bilibili.com/x/player/playurl?avid=${this.#aid}&cid=${this.#cid[i].cid}&qn=127&type&otype=json&fnver=0&fnval=4048&fourk=1&bvid=${this.#bvid}`, options).then(response => response.json())
                let data = res.data
                if (this.#download_choose.length == 0) {
                    if (res.code === 0) {
                    data.support_formats.forEach(e => {
                            console.log('|'+e.new_description+'|'+e.quality+'|')
                        }
                    )
                    let video_quality = await r.question('请选择视频清晰度')
                    this.#download_choose.push(video_quality)
                    let temp = data.dash.audio.map(item => item.id)
                    temp = this.#audioOptions.filter(option => temp.includes(option.id))
                    temp.forEach(option => {
                        console.log(`| ${option.id} | ${option.name} |`)
                    })
                    let audio_quality = await r.question('请选择音频清晰度')
                    this.#download_choose.push(audio_quality)
                    }
                }
                let temp = data.dash.video.find(item => item.id === Number(this.#download_choose[0]))
                console.log(`开始下载第${i+1}:${this.#cid[i].part}`)
                let video = await this.#download(temp.baseUrl)
                fs.writeFileSync("./video.m4s", video)
                temp = data.dash.audio.find(item => item.id === Number(this.#download_choose[1]))
                console.log('下载音频')
                let audio = await this.#download(temp.baseUrl)
                fs.writeFileSync("./audio.m4s", audio)
                console.log('开始合并')
                execSync(`ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a copy -f mp4 "${this.#cid[i].part}.${this.#type.split('/').pop()}"`,{ stdio: 'ignore' })
                console.log('合并完成')
                fs.unlinkSync('./video.m4s')
                fs.unlinkSync('./audio.m4s')
            }
        console.log('全部下载完成')
        process.exit()
    }

    async bangumi() {
        await this.#check_p(this.#arrary,'bangumi')
        for (let i = 0; i < this.#arrary.length; i++) {
            const res = await fetch(`https://api.bilibili.com/pgc/player/web/v2/playurl?avid=${this.#arrary[i].aid}&bvid=${this.#arrary[i].bvid}&cid=${this.#arrary[i].cid}&qn=127&fnver=0&fnval=4048&fourk=1&support_multi_audio=true&from_client=BROWSER`, options).then(response => response.json())
            let data = res.result.video_info
            if (this.#download_choose.length == 0) {
                if (res.code === 0) {
                    data.support_formats.forEach(e => {
                            console.log('|'+e.new_description+'|'+e.quality+'|')
                        }
                    )
                    let video_quality = await r.question('请选择视频清晰度')
                    this.#download_choose.push(video_quality)
                    let temp = data.dash.audio.map(item => item.id)
                    temp = this.#audioOptions.filter(option => temp.includes(option.id))
                    temp.forEach(option => {
                        console.log(`| ${option.id} | ${option.name} |`)
                    })
                    let audio_quality = await r.question('请选择音频清晰度')
                    this.#download_choose.push(audio_quality)
                }
            }
            let temp = data.dash.video.find(item => item.id === Number(this.#download_choose[0]))
            console.log(`开始下载第${i+1}个:${this.#arrary[i].title}`)
            let video = await this.#download(temp.baseUrl)
            fs.writeFileSync("./video.m4s", video)
            console.log('\n下载音频')
            temp = data.dash.audio.find(item => item.id === Number(this.#download_choose[1]))
            let audio = await this.#download(temp.baseUrl)
            fs.writeFileSync("./audio.m4s", audio)
            console.log('\n开始合并')
            execSync(`ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a copy -f mp4 "${this.#arrary[i].title}.${this.#type.split('/').pop()}"`,{ stdio: 'ignore' })
            console.log('合并完成')
            fs.unlinkSync('./video.m4s')
            fs.unlinkSync('./audio.m4s')
        }
        console.log('全部下载完成')
        process.exit()
    }

    async #check_p(arg,video_type){
        if (arg.length <= 1) return
        let temp = await r.question('视频存在多p,请输入x-x下载\n示例:1-3:下载p1到p3\n直接Enter为下载全部\n单独数字为下载单p\n')
        if (temp !== '') {
            let arr = temp.split('-')
            let start = arr[0]
            let end = arr[1]
            if (end){
                if (start > end|| arg.length < end|| start <= 0){
                    console.log('输入错误')
                    process.exit()
                }
                video_type === 'video'? this.#cid :this.#arrary = arg.slice(start-1, end)
            }else {
                video_type === 'video'? this.#cid : this.#arrary = new Array(arg[start - 1])
            }
        }
    }

    //AJAX进度监控
    async #download(url){
        const resp = await fetch(url,options)
        if (resp.headers.get('content-type').includes('video')) this.#type = resp.headers.get('content-type')
        const total = +resp.headers.get('content-length') //总的数据量
        let body= []
        const reader = resp.body.getReader()//可读流
        let loaded = 0//当前的数据量
        while(true){
            const {done,value} = await reader.read()
            if(done){
                break
            }
            loaded+=value.length
            body.push(value)
            process.stdout.write(`\r下载中: ${Math.trunc(loaded / total * 100)}%`)
        }
        return Buffer.concat(body)
    }
}

export default Download