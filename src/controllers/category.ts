import { Request, Response } from "express";
import { client } from '../utils/client'
import * as cheerio from 'cheerio'
import { removeTrailingSlash } from "../utils/remove-trailing-slash";
import { getID } from "../utils/get-id";
import { showType } from "../utils/show-type";

type CategoryTypes = {
    currentPage: number
    hasNextPage: boolean   
    totalPages: number
    data: {
        id: string | null
        img: string | null
        quality: string | null
        title: string
        type: string
        imdbRating: number | null
        airStatus: string | null
        episode: number | null
        adultContentTag: string | null
    }[]
}

export const category = async (req: Request, res: Response) => {
    try {
        const category_slug = req.params.category as string;
        const page = req.query.page as string || 1; 
        const country = req.query.country as string;
        const filter = req.query.filter as string;

        let url = `/${category_slug}/page/${page}/`;

        // category_slug = recommended | episode | movies | series | top movies | most viewed | director | actors | studios | countries | networks | genres | release-year
        if(filter) {
            url = `/${category_slug}/${filter}/page/${page}/`;
        }

        // Handle URL for movies or dramas/series filtered by a specific country
        if(country) {
            url = `/${category_slug}/country/${country}/page/${page}/`;
        }

        const response = await client.get(url);
        const $ = cheerio.load(response.data);

        const data: CategoryTypes = {
            currentPage: Number(page),
            hasNextPage: false,
            totalPages: 1,
            data: []
        }

        const lastPageUrl = $("#pagination nav ul li").last().find("a").attr("href")
        const lastPage = removeTrailingSlash(lastPageUrl)?.split("/").pop();
        const totalPages = Number(lastPage) || Number($("#pagination nav ul li.active a").text());
        data.totalPages = totalPages || 1;
        data.hasNextPage = data.currentPage < totalPages;

        $(".movies-list.movies-list-full .ml-item").each(function() {
            const href = $(this).find('a').attr('href') || ""
            const type = showType(href);
            const noscript = $(this).find('noscript').html() || ""
            const img = $(noscript).attr('src') || ""

            data.data.push({
                id: getID(href),
                img,
                title: $(this).find("h2").text() || "",
                type,
                quality: $(this).find("span.mli-quality").text() || null,
                imdbRating: Number($(this).find("span.imdb-rating").text() || 0) || null,
                airStatus: $(this).find(".air-status i").text() || null,
                episode: Number($(this).find(".lt-eps i").text()) || Number($(this).find(".mli-eps i").text()) || null,
                adultContentTag: $(this).find(".ml-info-tr").text() || null
            })  
        })

        res.status(200).send(data)
    } catch (error: any) {
        res.status(500).json(error);
    }
}