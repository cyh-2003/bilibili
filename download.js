import options from "./options.js"
import readline from "node:readline/promises"
import {stdin as input, stdout as output} from "process"
import fs from "node:fs"
const r = readline.createInterface({ input, output,terminal: false })
import {execSync} from "node:child_process"

let text = '视频存在多p,请输入x-x下载\n示例:1-3:下载p1到p3\n直接Enter为下载全部\n单独数字为下载单p\n'

class Download {
    #aid
    #bvid
    #cid
    #arrary = []
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
        if ('list' in data){
            this.video()
        }else {
            this.bangumi()
        }
    }

    async video() {
        if (this.#cid.length > 1){
            let temp = await r.question(text)
            if (temp !== '') {
                let arr = temp.split('-')
                let start = arr[0]
                let end = arr[1]
                if (end){
                    if (start > end|| this.#cid.length < end|| start <= 0){
                        console.log('输入错误')
                        process.exit(0)
                    }
                    this.#cid = this.#cid.slice(start-1, end)
                }else {
                    this.#cid = this.#cid[start - 1]
                }
            }
        }

        for (let i = 0; i < this.#cid.length; i++) {
                const res = await fetch(`https://api.bilibili.com/x/player/playurl?avid=${this.#aid}&cid=${this.#cid[i].cid}&qn=127&type&otype=json&fnver=0&fnval=4048&fourk=1&bvid=${this.#bvid}`, options).then(response => response.json())
                let data = res.data
                if (res.code === 0) {
                    data.support_formats.forEach(e => {
                            console.log('|'+e.new_description+'|'+e.quality+'|')
                        }
                    )
                    let video_quality = await r.question('请选择清晰度')
                    let temp = data.dash.video.find(item => item.id === Number(video_quality))

                    const video = await fetch(temp.baseUrl, options).then(response => response.arrayBuffer())

                    fs.writeFileSync("./video.m4s", Buffer.from(video))
                    console.log('可选择的音频'+data.dash.audio.map(item => item.id))
                    console.log(`| ----- | ---- |
| 30216 | 64K  |
| 30232 | 132K |
| 30280 | 192K |
| 30250 | 杜比全景声 |
| 30251 | Hi-Res无损 |`)
                    let audio_quality = await r.question('请选择音频清晰度')
                    temp = data.dash.audio.find(item => item.id === Number(audio_quality))

                    const audio = await fetch(temp.baseUrl, options).then(response => response.arrayBuffer())

                    fs.writeFileSync("./audio.m4s", Buffer.from(audio))
                    console.log('开始合并')
                    execSync(`ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a copy -f mp4 "${this.#cid[i].part}.mp4"`)
                    fs.unlinkSync('./video.m4s')
                    fs.unlinkSync('./audio.m4s')
                    console.log('下载完成')
                } else {
                    console.log(res.message)
                }
            }
        console.log('全部完成')
        process.exit(0)
    }

    async bangumi() {
        for (let i = 0; i < this.#arrary.length; i++) {
            const res = await fetch(`https://api.bilibili.com/pgc/player/web/v2/playurl?avid=${this.#arrary[i].aid}&bvid=${this.#arrary[i].bvid}&cid=${this.#arrary[i].cid}&qn=127&fnver=0&fnval=4048&fourk=1&support_multi_audio=true&from_client=BROWSER`, options).then(response => response.json())
            let data = res.result
            if (res.code === 0) {
                data.video_info.support_formats.forEach(e => {
                        console.log('|'+e.new_description+'|'+e.quality+'|')
                    }
                )
                let video_quality = await r.question('请选择清晰度')
                let temp = data.video_info.dash.video.find(item => item.id === Number(video_quality))
                const video = await fetch(temp.baseUrl, options).then(response => response.arrayBuffer())
                fs.writeFileSync("./video.m4s", Buffer.from(video))
                console.log('可选择的音频'+data.video_info.dash.audio.map(item => item.id))
                console.log(`| ----- | ---- |
| 30216 | 64K  |
| 30232 | 132K |
| 30280 | 192K |
| 30250 | 杜比全景声 |
| 30251 | Hi-Res无损 |`)
                let audio_quality = await r.question('请选择音频清晰度')
                temp = data.video_info.dash.audio.find(item => item.id === Number(audio_quality))
                const audio = await fetch(temp.baseUrl, options).then(response => response.arrayBuffer())
                fs.writeFileSync("./audio.m4s", Buffer.from(audio))
                execSync(`ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a copy -y -f mp4 "${this.#arrary[i].title}.mp4"`)
                fs.unlinkSync('./video.m4s')
                fs.unlinkSync('./audio.m4s')
                console.log('下载完成')
                process.exit(0)
            } else {
                console.log(res.message)
            }
        }
    }
}

export default Download