import { Request, Response } from "express";
import { client } from "../utils/client";
import * as cheerio from "cheerio";
import { showType } from "../utils/show-type";
import { getID } from "../utils/get-id";

type SuggestionTypes = {
    featured: {
        id: string | null
        img: string | null
        quality: string
        title: string
        type: string
        imdbRating: number
    }[]
    mostViewed: {
        id: string | null
        img: string | null
        quality: string
        title: string
        type: string
        imdbRating: number
    }[]
}

export const suggestions = async (req: Request, res: Response) => {
    try {
        const response = await client.get('/home/');
        const $ = cheerio.load(response.data);

        const data: SuggestionTypes = {
            featured: [],
            mostViewed: []
        }

        $("#movie-featured .ml-item").each(function() {
            const href = $(this).find('a').attr('href') || ""
            const type = showType(href) 

            const noscript = $(this).find('noscript').html() || ""
            const img = $(noscript).attr('src') || ""

            data.featured.push({
                id: getID(href),
                img,
                title: $(this).find("h2").text() || "",
                type,
                quality: $(this).find("span.mli-quality").text() || "",
                imdbRating: Number($(this).find("span.imdb-rating").text() || 0)    
            })
        })

        $("#topview-today #content-box .ml-item").each(function() {
            const href = $(this).find('a').attr('href') || ""
            const type = showType(href)
            
            const noscript = $(this).find('noscript').html() || ""
            const img = $(noscript).attr('src') || ""

            data.mostViewed.push({
                id: getID(href),
                img,
                title: $(this).find("h2").text() || "",
                type,
                quality: $(this).find("span.mli-quality").text() || "",
                imdbRating: Number($(this).find("span.imdb-rating").text() || 0)    
            })
        })

        res.status(200).send(data)
    } catch (error: any) {
        res.status(500).json(error.message); 
    }
}