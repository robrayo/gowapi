import { Request, Response } from "express"
import { client } from "../utils/client"
import * as cheerio from "cheerio"
import { showType } from "../utils/show-type"
import { getID } from "../utils/get-id"

type SpotlightTypes = {
    id: string | null
    img: string | null
    title: string
    description: string
    type: string
    duration: string
    release: number
    imdbRating: number
    genres: string[]
}

export const spotlight = async (req: Request, res: Response) => {
    try {
        const resp  = await client.get('/home/');
        const $ = cheerio.load(resp.data)
        const data: SpotlightTypes[] = []

        $("#slider .swiper-slide").each(function() {
            const href = $(this).find("a").attr("href");
            const type = showType(href)
            
            const genres = [] as string[];
            $(this).find(".slide-caption-info > div:nth-child(1) a").each(function() {
                genres.push($(this).text().trim())
            })

            data.push({ 
                id: getID(href),
                img: $(this).attr("data-bg") || null,
                title: $(this).find(".slide-caption > h2").text().trim(),
                description: $(this).find(".sc-desc").text().trim(),
                type,
                duration: $(this).find(".slide-caption-info > div:nth-child(2)").text().replace("Duration:", "").trim(),
                release: Number($(this).find(".slide-caption-info > div:nth-child(3)").text().replace('Release:', '') || 0),
                imdbRating: Number($(this).find(".slide-caption-info > div:nth-child(4)").text().replace('IMDb:', '').trim() || 0),
                genres,
             })
        })

        res.status(200).send(data)
    } catch (error: any) {
        res.status(500).json(error.message)
    }
}