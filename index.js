import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import check from "./check.js"
import get_info from "./info.js"
import download from "./download.js"
const r = readline.createInterface({ input, output })

async function main() {
    if (await check.is_vip()){
        console.log('拥有大会员')
    }else {
        console.log('未拥有大会员')
    }
    let answer = await r.question('请输入url/bv/av/ep/md/ss')
    //检查是否合法
    if (!(check.is_url(answer)||check.is_bv(answer)||check.is_av(answer))) {
        console.log('输入错误')
        process.exit(0)
    }
    let result = await get_info(answer)
    const downloader = new download(result)
    await downloader.model(result)
}

main()