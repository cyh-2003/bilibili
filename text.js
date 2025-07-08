import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
const r = readline.createInterface({ input, output })

let a = [
    { cid: 70499462, part: '01 下载、配置' },
    { cid: 70500265, part: '02 简介、上手（FFmpeg FFprobe FFplay）' },
    { cid: 70503227, part: '03 转换格式（文件格式、封装格式）' },
    { cid: 70503798, part: '04 改变编码 上（编码、音频转码）' },
    { cid: 70505693, part: '05 改变编码 中（视频压制）' },
    { cid: 70507200, part: '06 改变编码 下（码率控制模式）' },
    { cid: 70508243, part: '07 合并、提取音视频' },
    { cid: 70670652, part: '08 截取、连接音视频' },
    { cid: 70672227, part: '09 截图、水印、动图' },
    { cid: 70904882, part: '10 录屏、直播' }
]


async function main() {
    let temp = await r.question('视频存在多p,请输入x-x下载\n直接Enter为下载全部\n示例:1-3:下载p1到p3')
    if (temp === '') return
    let arr = temp.split('-')
    let start = arr[0]
    let end = arr[1]
    if (end){
        if (start > end|| a.length < end|| start <= 0){
            console.log('输入错误')
            process.exit(0)
        }
        a = a.slice(start - 1, end)
    } else {
        a = a[start - 1]
    }

    console.log(a)
    process.exit(0)
}
main()