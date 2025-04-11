"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hlsProxy = exports.LineTransform = void 0;
const axios_1 = __importDefault(require("axios"));
const stream_1 = require("stream");
class LineTransform extends stream_1.Transform {
    constructor(baseUrl) {
        super();
        this.buffer = '';
        this.baseUrl = baseUrl;
    }
    _transform(chunk, encoding, callback) {
        const data = this.buffer + chunk.toString();
        const lines = data.split(/\r?\n/);
        this.buffer = lines.pop() || '';
        for (const line of lines) {
            const modifiedLine = this.processLine(line);
            this.push(modifiedLine + '\n');
        }
        callback();
    }
    _flush(callback) {
        if (this.buffer) {
            const modifiedLine = this.processLine(this.buffer);
            this.push(modifiedLine);
        }
        callback();
    }
    processLine(line) {
        if (line.startsWith('/pl/')) {
            return `hls-proxy?url=${encodeURIComponent(this.baseUrl + line)}`;
        }
        if (line.startsWith('http')) {
            return line.replace("http", "hls-proxy?url=http");
        }
        return line;
    }
}
exports.LineTransform = LineTransform;
const hlsProxy = async (req, res) => {
    try {
        const url = req.query.url;
        if (!url)
            return res.status(400).json({ error: 'Missing url' });
        const newUrl = new URL(url);
        const resp = await axios_1.default.get(url, {
            responseType: 'stream',
            headers: {
                Origin: 'https://gstream.hollymoviehd.cc',
                Referer: "https://gstream.hollymoviehd.cc/"
            }
        });
        const data = resp.data;
        const headers = { ...data.headers };
        headers['allow-control-allow-origin'] = '*';
        headers['allow-control-allow-headers'] = '*';
        headers['allow-control-allow-methods'] = '*';
        res.set(headers);
        if (url.includes("streamsvr") || url.includes("public")) {
            return data.pipe(res);
        }
        const transform = new LineTransform(newUrl.origin);
        return data.pipe(transform).pipe(res);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.hlsProxy = hlsProxy;
