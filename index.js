import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import check from "./check.js"
import get_info from "./info.js"
import download from "./download.js"
const r = readline.createInterface({ input, output,terminal: false })//process.platform !== 'win32'

async function main() {
    //判断用户状态
    //await check.is_vip()

    let answer = "BV1Ft411s7Xa"//"ss1573"////"BV1bp3ezREcw"////"ep1746689"//await r.question('请输入url/bv/av/ep/md/ss')
    //检查是否合法
    if (!(check.is_url(answer)||check.is_bv(answer)||check.is_av(answer) || /^(ep|md|ss)\d+$/i.test(answer))) {
        console.log('输入错误')
        process.exit(0)
    }
    let result = await get_info(answer)
    const downloader = new download(result)
    await downloader.model(result)
}

main()