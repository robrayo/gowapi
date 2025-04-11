import { Request, Response } from "express";
import { client } from '../utils/client'
import * as cheerio from 'cheerio'
import { removeTrailingSlash } from "../utils/remove-trailing-slash";

type SeriesEpisodesTypes = {
    id: string | null
    episodeNumber: number
}

export const seriesEpisodes = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string

        const response = await client.get(`/series/${id}`);
        const $ = cheerio.load(response.data);

        const data: SeriesEpisodesTypes[] = []

        $(".episodeList li a").each(function() {
            data.push({
                id: removeTrailingSlash($(this).attr("href"))?.split('/').pop() || null,
                episodeNumber: Number($(this).text()) 
            })
        })

        res.status(200).send(data)
    } catch (error: any) {
        res.status(500).json(error.message);
    }
}