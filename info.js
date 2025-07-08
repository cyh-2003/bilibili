import check from "./check.js"
import options from "./options.js"
import bangumi from "./bangumi.js"
const params = new URLSearchParams()

async function get_info(input){
    let str = input.toLowerCase()
    if ((check.is_url(str))){
        // 尝试匹配 BV 号
        const bvMatch = input.match(/(BV.*?).{10}/)
        if (bvMatch) return await get_info(bvMatch[0])

        // 尝试匹配 av 号
        const avMatch = input.match(/(av\d+)/)
        if (avMatch) return await get_info(avMatch[0])

        // 尝试匹配 ep 号
        const epMatch = input.match(/(ep\d+)/);
        if (epMatch) return await get_info(epMatch[0])

        // 尝试匹配 ss 号
        const ssMatch = input.match(/(ss\d+)/)
        if (ssMatch) return await get_info(ssMatch[0])
        // 尝试匹配 md 号
        const mdMatch = input.match(/(md\d+)/)
        if (mdMatch) return await get_info(mdMatch[0])
        console.log("URL中未找到有效的视频标识")
        process.exit(0)
    } else if (str.includes("av")) {
        return await get_info_av_bvid(input.replace("av",""))
    } else if (str.includes("bv")) {
        return await get_info_av_bvid(undefined, input)
    } else if (str.includes("ep")) {
        return await get_info_bangumi(undefined,input.replace("ep",""))
    } else if (str.includes("ss")) {
        return await get_info_bangumi(input.replace("ss",""))
    } else if (str.includes("md")) {
        let ssd = await bangumi.get_season_id_by_media_id(input.replace("md",""))
        return await get_info_bangumi(ssd)
    } else {
        console.log("输入错误")
        process.exit(0)
    }
}

async function get_info_av_bvid(aid,bvid){
    const url = new URL('https://api.bilibili.com/x/web-interface/wbi/view')
    if (bvid) params.append('bvid', bvid)
    if (aid) params.append('aid', aid)
    url.search = params.toString()
    let response = await fetch(url.toString(),options).then(response => response.json())
    if (response.code === 0){
         return  {aiv: response.data.aid, bvid: response.data.bvid, list: response.data.pages}
    }else if (response.code === 62012) {
        console.log('仅UP主自己可见')
    } else {
        console.log('获取视频信息失败')
    }
    process.exit(0)
}

async function get_info_bangumi(season_id,ep_id){
    const url = new URL('https://api.bilibili.com/pgc/view/web/season')
    if (season_id) params.append('season_id', season_id)
    if (ep_id) params.append('ep_id', ep_id)
    url.search = params.toString()
    let response = await fetch(url.toString(),options).then(response => response.json())
    if (response.code === 0){
        return  response.result.episodes
    }else {
        console.log('获取视频信息失败')
        process.exit(0)
    }
}

//console.log(await get_info('https://www.bilibili.com/video/BV1hboNYmEuQ/?spm_id_from=333.788.recommend_more_video.2&vd_source=52631a42a3c38d92ade2b122efc5106e'))
//console.log(await get_info('https://www.bilibili.com/video/av332121/?spm_id_fro'))
//console.log(await get_info('https://www.bilibili.com/bangumi/media/md25577961'))
// console.log(await get_info('https://www.bilibili.com/bangumi/play/ss425?from_spmid=666.4.mylist.1'))
// console.log(await get_info('https://www.bilibili.com/bangumi/play/ep1530739?from_spmid=666.19.0.0'))
export default get_info
