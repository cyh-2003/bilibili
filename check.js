import options from "./options.js"

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

    static async is_vip() {
        let bool = await fetch('https://api.bilibili.com/x/vip/privilege/my',options).then(response => response.json())
        return bool.data.is_vip
    }
}

export default Check