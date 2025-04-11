import axios from "axios";
import { Request, Response } from "express";
import { Transform, TransformCallback } from 'stream';

export class LineTransform extends Transform {
  private buffer: string;
  private baseUrl: string;

  constructor(baseUrl: string) {
    super();
    this.buffer = '';
    this.baseUrl = baseUrl;
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    const data = this.buffer + chunk.toString();
    const lines = data.split(/\r?\n/);
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const modifiedLine = this.processLine(line);
      this.push(modifiedLine + '\n');
    }

    callback();
  }

  _flush(callback: TransformCallback) {
    if (this.buffer) {
      const modifiedLine = this.processLine(this.buffer);
      this.push(modifiedLine);
    }
    callback();
  }

  private processLine(line: string): string {
    if (line.startsWith('/pl/')) {
      return `hls-proxy?url=${encodeURIComponent(this.baseUrl + line)}`;
    }

    if(line.startsWith('http')) {
        return line.replace("http", "hls-proxy?url=http")
    }

    return line;
  }
}

export const hlsProxy = async (req: Request, res: Response) => {
    try {
        const url = req.query.url as string;
        if (!url) return res.status(400).json({error: 'Missing url'})

        const newUrl = new URL(url);

        const resp = await axios.get(url, {
            responseType: 'stream',
            headers: {
                Origin: 'https://gstream.hollymoviehd.cc',
                Referer: "https://gstream.hollymoviehd.cc/"
            }
        });
        const data = resp.data;
        const headers = {  ...data.headers }
        headers['allow-control-allow-origin'] = '*'
        headers['allow-control-allow-headers'] = '*'
        headers['allow-control-allow-methods'] = '*'
        res.set(headers)

        if(url.includes("streamsvr") || url.includes("public")) {
            return data.pipe(res)
        }

        const transform = new LineTransform(newUrl.origin)
        return data.pipe(transform).pipe(res)
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}