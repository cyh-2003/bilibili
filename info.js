import check from "./check.js"
import options from "./options.js"
import bangumi from "./bangumi.js"

async function get_info(input,type) {
    let str = input.toLowerCase()
    if ((check.is_url(str))) {
        // 尝试匹配 BV 号
        const bvMatch = input.match(/\b(BV.*?).{10}/)
        if (bvMatch) return await get_info(bvMatch[0])

        // 尝试匹配 av 号
        const avMatch = input.match(/\b(av\d+)/)
        if (avMatch) return await get_info(avMatch[0])

        // 尝试匹配 ep 号
        const epMatch = input.match(/\b(ep\d+)/);
        if (epMatch) return await get_info(epMatch[0],type)

        // 尝试匹配 ss 号
        const ssMatch = input.match(/\b(ss\d+)/)
        if (ssMatch) return await get_info(ssMatch[0],type)

        // 尝试匹配 md 号
        const mdMatch = input.match(/\b(md\d+)/)
        if (mdMatch) return await get_info(mdMatch[0])

        // 处理音频au 号
        const auMatch = input.match(/\b(au\d+)/)
        if (auMatch) return await get_info(auMatch[0])

        // 处理付费课程 todo
        const pugvMatch = input.match(/\b(pugv\d+)/)
        if (pugvMatch) return await get_info(pugvMatch[0])

        console.error("URL中未找到有效的视频标识")
        process.exit()
    } else if (str.includes("av")) {
        return await get_info_av_bvid(input.replace("av", ""))
    } else if (str.includes("bv")) {
        return await get_info_av_bvid(null, input)
    } else if (str.includes("ep")) {
        return await get_info_bangumi_or_lesson(null, input.replace("ep", ""),type)
    } else if (str.includes("ss")) {
        return await get_info_bangumi_or_lesson(input.replace("ss", ""),null,type)
    } else if (str.includes("md")) {
        let ssd = await bangumi.get_season_id_by_media_id(input.replace("md", ""))
        return await get_info_bangumi_or_lesson(ssd)
    } else if (str.includes("au")) {
        //此处检测为音频
        let sid = input.replace("au", "")
        return {'sid':sid}
    }
    else {
        console.log("输入错误")
        process.exit()
    }
}

async function get_info_av_bvid(aid, bvid) {
    const url = new URL('https://api.bilibili.com/x/web-interface/wbi/view')
    url.search = new URLSearchParams({
        ...(aid && { aid }),
        ...(bvid && { bvid })
    })
    let response = await fetch(url, options).then(response => response.json())
    if (response.code === 0) {
        let temp = response.data

        // 检测是否为充电视频
        if(temp.is_upower_exclusive){
            console.warn('此视频为充电视频,请注意')
            if (temp.is_upower_preview){
                console.warn('此视频支持预览')
            } else {
                console.warn('此视频不支持预览')
            }
        }

        if (temp.pages.length == 1) {//此处修复BV1tjxnzpELJ标题错误bug
            return {
                aiv: temp.aid, bvid: temp.bvid, list: [
                    { cid: temp.pages[0].cid, part: temp.title }]
            }
        } else {
            return { aiv: temp.aid, bvid: temp.bvid, list: temp.pages }
        }
    } else if (response.code == 62012) {
        console.log('仅UP主自己可见')
    } else {
        console.error(`获取视频信息失败\n${response.message}`)
    }
    process.exit()
}

// bool 为true时获取番剧信息，否则获取课程信息
async function get_info_bangumi_or_lesson(season_id, ep_id, type = 'pgc') {
    const url = new URL(`https://api.bilibili.com/${type}/view/web/season`)
    url.search = new URLSearchParams({
        ...(season_id && { season_id }),
        ...(ep_id && { ep_id })
    })
    console.log(url)
    let response = await fetch(url, options).then(response => response.json())
    if (response.code === 0) {
        switch (type) {
            case  'pgc':
                return response.result.episodes
            case 'pugv':
                if (response.data.user_status.payed == 0){
                    console.warn('未购买课程')
                }
                return response.data.episodes
        }
    } else {
        console.error('获取视频信息失败\n'+response.message)
        process.exit()
    }
}

export default get_info
