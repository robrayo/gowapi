import { Request, Response } from "express";
import { client } from '../utils/client';
import * as cheerio from 'cheerio';

type GenreTypes = {
    name: string;
    slug: string;
    count: number;
}

export const genres = async (req: Request, res: Response) => {
    try {
        const response = await client.get('/genres/');
        const $ = cheerio.load(response.data);

        const data: GenreTypes[] = [];

        $(".genres-list a").each(function() {
            const href = $(this).attr('href') || "";
            const countText = $(this).find('span').text();
            const count = parseInt(countText.replace(/[^0-9]/g, '')) || 0;

            data.push({
                name: $(this).text().replace(countText, '').trim(),
                slug: href.split('/').filter(Boolean).pop() || '',
                count
            });
        });

        res.status(200).send(data);
    } catch (error: any) {
        res.status(500).json(error.message);
    }
}

export const genreContent = async (req: Request, res: Response) => {
    try {
        const genre = req.params.genre;
        const page = req.query.page || 1;

        const response = await client.get(`/genre/${genre}/page/${page}/`);
        const $ = cheerio.load(response.data);

        const data = {
            currentPage: Number(page),
            hasNextPage: false,
            totalPages: 1,
            totalResults: 0,
            itemsPerPage: 20,
            data: [] as any[]
        };

        const lastPageUrl = $("#pagination nav ul li").last().find("a").attr("href")?.split("?")[0];
        const lastPage = lastPageUrl?.split("/").pop();
        const totalPages = Number(lastPage) || Number($("#pagination nav ul li.active a").text());
        data.totalPages = totalPages || 1;
        data.hasNextPage = data.currentPage < totalPages;

        $(".movies-list.movies-list-full .ml-item").each(function() {
            const href = $(this).find('a').attr('href') || "";
            const noscript = $(this).find('noscript').html() || "";
            const img = $(noscript).attr('src') || "";

            data.data.push({
                id: href.split('/').filter(Boolean).pop() || null,
                img,
                title: $(this).find("h2").text() || "",
                quality: $(this).find("span.mli-quality").text() || null,
                imdbRating: Number($(this).find("span.imdb-rating").text() || 0) || null,
                airStatus: $(this).find(".air-status i").text() || null,
                episode: Number($(this).find(".lt-eps i").text()) || Number($(this).find(".mli-eps i").text()) || null,
                adultContentTag: $(this).find(".ml-info-tr").text() || null,
                releaseYear: Number($(this).find(".mli-year").text()) || null,
                duration: $(this).find(".mli-dur").text() || null
            });
        });

        data.totalResults = data.data.length * data.totalPages;

        res.status(200).send(data);
    } catch (error: any) {
        res.status(500).json(error.message);
    }
} 