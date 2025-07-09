import options from "./options.js"
import { exec } from 'child_process'

class Check {
    static is_url(url) {
        return /^(?:(http|https|ftp):\/\/)?((?:[\w-]+\.)+[a-z0-9]+)((?:\/[^/?#]*)+)?(\?[^#]+)?(#.+)?$/i.exec(url)
    }

    static is_bv(bv) {
        return /^BV[1-9A-HJ-NP-Za-km-z]{10}$/.test(bv)
    }
    static is_av(av) {
        return /^[1-9]\d{5,}$/.test(av)
    }

    static check_ffmpeg(){
        exec('ffmpeg -version', (error, stdout, stderr) => {
      if (error) {
        console.log('未检测到FFmpeg')
        process.exit()
      }})
    }

    static async is_vip() {
        let data = await fetch('https://api.bilibili.com/x/vip/privilege/my',options).then(response => response.json())
        if (data.code === -101){
            console.log(data.message)
        } else if (data.data.is_vip){
            console.log('拥有大会员')
        }else {
            console.log('未拥有大会员,无法下载高清视频')
        }
    }
}

export default Check