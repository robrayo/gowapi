import * as cheerio from 'cheerio';
import { Request, Response } from 'express';
import axios from 'axios';

export const sources = async (req: Request, res: Response) => {
    try {
        const token = req.params.token as string;

        const getCsrfToken = await axios.get(`https://gstream.hollymoviehd.cc/embed/${token}`);
        const sourcesData = cheerio.load(getCsrfToken.data);
        const csrf_token = sourcesData("#csrf_token").val() as string;
        
        if(!csrf_token) throw new Error("No csrf token found");

        const formData2 = new FormData();
        formData2.append('csrf_token', csrf_token);
        const getSources = await axios.post(`https://gstream.hollymoviehd.cc/embed/${token}`, formData2);
        const sources = getSources.data;

        const fixedSources = sources.sources.map(({ file, prop }: any) => ({
            file: file.startsWith('https') ? file : `https://gstream.hollymoviehd.cc${file}`,
            ...prop
        }))

        res.status(200).send(fixedSources);
    } catch (error: any) {  
        res.status(500).json(error.message)
    }
}