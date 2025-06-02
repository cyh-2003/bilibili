import options from "./options.js"

class bangumi {
    // 根据media_id获取season_id
    static async get_season_id_by_media_id(media_id){
        let data = await fetch(`https://api.bilibili.com/pgc/review/user?media_id=${media_id}`,options).then(res=>res.json())
        return data.result.media.season_id
    }

    // 根据episode_id获取season_id
    static async get_season_id_by_episode_id(episode_id){
        let data = await fetch(`https://api.bilibili.com/pgc/view/web/season?ep_id=${episode_id}`,options).then(res=>res.json())
        return data.result.season_id
    }
}

export default bangumi