import axios from 'axios'
import { config } from 'dotenv'

config()

const baseURL = process.env.WEB_TO_SCRAPE_BASE_URL || "https://hollymoviehd.cc"

export const client = axios.create({
    baseURL,
    timeout: 10000,
    maxRedirects: 5,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
    },
    validateStatus: function (status) {
        return status >= 200 && status < 400;
    }
})