import { Request, Response } from "express";
import { client } from '../utils/client'
import * as cheerio from 'cheerio'
import { removeTrailingSlash } from "../utils/remove-trailing-slash";
import { showType } from "../utils/show-type";
import { getID } from "../utils/get-id";

interface InfoTypes {
    img: string | null;
    title: string | null;
    description: string | null;
    thumbnail: string | null
    trailer: string | null;
    TMDbRating: number | null;
    IMDbRating: number | null;
    genres: {
        id: string | null 
        genre: string
    }[];
    actors: {
        id: string | null
        actor: string
        img: string | null
    }[];
    studios: {
        id: string | null
        studio: string
    }[];
    tvStatus: string | null;
    duration: number | null;
    release: number | null;
    countries: {
        id: string | null
        country: string | null
    }[];
    networks: {
        id: string | null
        network: string
    }[];
    directors: {
        id: string | null
        director: string
    }[]
    quality: string | null
    youMayAlsoLike: YouMayAlsoLike[];
}

type YouMayAlsoLike = {
    id: string | null
    img: string | null
    quality: string | null
    title: string
    type: string
    imdbRating: number | null
    airStatus: string | null
    episode: number | null
    adultContentTag: string | null
}

export const info = async (req: Request, res: Response) => {
    try {
        const type = req.params.type as string;
        const id = req.params.id as string;

        if(type !== "series" && type !== "movie") {
            res.status(422).json("Type is series or movie");
            return
        }

        const response = await client.get(type === 'series' ? `/${type}/${id}` : `/${id}`);
        const $ = cheerio.load(response.data);

        const data: InfoTypes = {
            img: null,
            title: null,
            description: null,
            thumbnail: null,
            trailer: null,
            TMDbRating: null,
            IMDbRating: null,
            genres: [],
            actors: [],
            studios: [],
            tvStatus: null,
            duration: null,
            release: null,
            countries: [],
            networks: [],
            directors: [],
            quality: null,
            youMayAlsoLike: []
        }

        let selector = $("#mv-info .mvi-content");       
        const noscript = $(selector).find('noscript').html() || "";

        data.img = $(noscript).attr("src") || null
        data.title = $(selector).find(".mvic-desc > h1").text().trim()
        data.description = $(selector).find("[itemprop='description'] > p").text().trim()
        data.thumbnail = $("[itemprop='thumbnailUrl']").attr("content") || null
        data.trailer = $("#iframe-trailer").attr("src") || null

        selector = $('#mv-info .mvi-content .mvic-info p')

        data.quality = $(selector).find(".quality").text() || null
        data.IMDbRating = Number($(selector).find("[itemprop='ratingValue']").text())
        $(selector).each(function() {
            const isGenre = $(this).text().includes("Genre:")
            const isActors = $(this).text().includes("Actors:")
            const isStudio = $(this).text().includes("Studio:")
            const isCountry = $(this).text().includes("Country:")
            const isTVStatus = $(this).text().includes("TV Status:")
            const isDuration = $(this).text().includes("Duration:")
            const isRelease = $(this).text().includes("Release:")
            const isNetwork = $(this).text().includes("Networks:")
            const isDirectors = $(this).text().includes("Director:")
            const isTMDb = $(this).text().includes("TMDb:")

            if(isTMDb) {
                data.TMDbRating = Number($(this).find(".imdb-r").text())
            }

            if(isGenre === true) {
                $(this).find("a").each(function() {
                    data.genres.push({
                        id: removeTrailingSlash($(this).attr("href"))?.split("/").pop() || null,
                        genre: $(this).text(),
                    })
                })
            }

            if(isActors === true) {
                $(this).find("a").each(function() {
                    data.actors.push({
                        id: removeTrailingSlash($(this).attr("href"))?.split("/").pop() || null,
                        actor: $(this).text(),
                        img: null,
                    })
                })
            }

            if(isStudio === true) {
                $(this).find("a").each(function() {
                    data.studios.push({
                        id: removeTrailingSlash($(this).attr("href"))?.split("/").pop() || null,
                        studio: $(this).text(),
                    })
                })
            }

            if(isTVStatus === true) {
                data.tvStatus = $(this).find("span").text()
            }

            if(isDuration === true) {
                data.duration = Number($(this).find("span").text())
            }

            if(isRelease === true) {
                data.release = Number($(this).find("a").text())
            }

            if(isCountry === true) {
                $(this).find("a").each(function() {
                    data.countries.push({
                        id: removeTrailingSlash($(this).attr("href"))?.split('/').pop() || null,
                        country: $(this).text()
                    })
                })
            }

            if(isNetwork === true) {
                $(this).find("a").each(function() {
                    data.networks.push({
                        id: removeTrailingSlash($(this).attr("href"))?.split("/").pop() || null,
                        network: $(this).text()
                    })
                })
            }

            if(isDirectors === true) {
                $(this).find("a").each(function() {
                   data.directors.push({
                    id: removeTrailingSlash($(this).attr("href"))?.split("/").pop() || null,
                    director: $(this).text()
                   })
                })
            }
        })

        $(".people .card a").each(function() {
            const noscript = $(this).find("noscript").html() || "";

           data.actors.push({
            id: removeTrailingSlash($(this).attr("href")?.split("/").pop()) || null,
            actor: $(this).find('p').text(),
            img: $(noscript).attr("src") || null
           }) 
        })

        $(".movies-list.movies-list-full .ml-item").each(function() {
            const href = $(this).find('a').attr('href') || ""
            const type = showType(href);
            const noscript = $(this).find('noscript').html() || ""
            const img = $(noscript).attr('src') || ""

            data.youMayAlsoLike.push({
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