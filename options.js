import cookie from './cookie.json' with { type: 'json' }

const headers = new Headers()
if (cookie.cookie) headers.append('Cookie', cookie.cookie)
headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0')
headers.append('Referer', 'https://www.bilibili.com')

const options = {
    method: 'GET',
    headers: headers
}

export default options
