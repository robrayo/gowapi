"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
const client_1 = require("../utils/client");
const cheerio = __importStar(require("cheerio"));
const remove_trailing_slash_1 = require("../utils/remove-trailing-slash");
const show_type_1 = require("../utils/show-type");
const get_id_1 = require("../utils/get-id");
const info = async (req, res) => {
    try {
        const type = req.params.type;
        const id = req.params.id;
        if (type !== "series" && type !== "movie") {
            res.status(422).json("Type is series or movie");
            return;
        }
        const response = await client_1.client.get(type === 'series' ? `/${type}/${id}` : `/${id}`);
        const $ = cheerio.load(response.data);
        const data = {
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
        };
        let selector = $("#mv-info .mvi-content");
        const noscript = $(selector).find('noscript').html() || "";
        data.img = $(noscript).attr("src") || null;
        data.title = $(selector).find(".mvic-desc > h1").text().trim();
        data.description = $(selector).find("[itemprop='description'] > p").text().trim();
        data.thumbnail = $("[itemprop='thumbnailUrl']").attr("content") || null;
        data.trailer = $("#iframe-trailer").attr("src") || null;
        selector = $('#mv-info .mvi-content .mvic-info p');
        data.quality = $(selector).find(".quality").text() || null;
        data.IMDbRating = Number($(selector).find("[itemprop='ratingValue']").text());
        $(selector).each(function () {
            const isGenre = $(this).text().includes("Genre:");
            const isActors = $(this).text().includes("Actors:");
            const isStudio = $(this).text().includes("Studio:");
            const isCountry = $(this).text().includes("Country:");
            const isTVStatus = $(this).text().includes("TV Status:");
            const isDuration = $(this).text().includes("Duration:");
            const isRelease = $(this).text().includes("Release:");
            const isNetwork = $(this).text().includes("Networks:");
            const isDirectors = $(this).text().includes("Director:");
            const isTMDb = $(this).text().includes("TMDb:");
            if (isTMDb) {
                data.TMDbRating = Number($(this).find(".imdb-r").text());
            }
            if (isGenre === true) {
                $(this).find("a").each(function () {
                    data.genres.push({
                        id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split("/").pop() || null,
                        genre: $(this).text(),
                    });
                });
            }
            if (isActors === true) {
                $(this).find("a").each(function () {
                    data.actors.push({
                        id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split("/").pop() || null,
                        actor: $(this).text(),
                        img: null,
                    });
                });
            }
            if (isStudio === true) {
                $(this).find("a").each(function () {
                    data.studios.push({
                        id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split("/").pop() || null,
                        studio: $(this).text(),
                    });
                });
            }
            if (isTVStatus === true) {
                data.tvStatus = $(this).find("span").text();
            }
            if (isDuration === true) {
                data.duration = Number($(this).find("span").text());
            }
            if (isRelease === true) {
                data.release = Number($(this).find("a").text());
            }
            if (isCountry === true) {
                $(this).find("a").each(function () {
                    data.countries.push({
                        id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split('/').pop() || null,
                        country: $(this).text()
                    });
                });
            }
            if (isNetwork === true) {
                $(this).find("a").each(function () {
                    data.networks.push({
                        id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split("/").pop() || null,
                        network: $(this).text()
                    });
                });
            }
            if (isDirectors === true) {
                $(this).find("a").each(function () {
                    data.directors.push({
                        id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split("/").pop() || null,
                        director: $(this).text()
                    });
                });
            }
        });
        $(".people .card a").each(function () {
            const noscript = $(this).find("noscript").html() || "";
            data.actors.push({
                id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href")?.split("/").pop()) || null,
                actor: $(this).find('p').text(),
                img: $(noscript).attr("src") || null
            });
        });
        $(".movies-list.movies-list-full .ml-item").each(function () {
            const href = $(this).find('a').attr('href') || "";
            const type = (0, show_type_1.showType)(href);
            const noscript = $(this).find('noscript').html() || "";
            const img = $(noscript).attr('src') || "";
            data.youMayAlsoLike.push({
                id: (0, get_id_1.getID)(href),
                img,
                title: $(this).find("h2").text() || "",
                type,
                quality: $(this).find("span.mli-quality").text() || null,
                imdbRating: Number($(this).find("span.imdb-rating").text() || 0) || null,
                airStatus: $(this).find(".air-status i").text() || null,
                episode: Number($(this).find(".lt-eps i").text()) || Number($(this).find(".mli-eps i").text()) || null,
                adultContentTag: $(this).find(".ml-info-tr").text() || null
            });
        });
        res.status(200).send(data);
    }
    catch (error) {
        res.status(500).json(error);
    }
};
exports.info = info;
