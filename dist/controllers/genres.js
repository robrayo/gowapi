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
exports.genreContent = exports.genres = void 0;
const client_1 = require("../utils/client");
const cheerio = __importStar(require("cheerio"));
const genres = async (req, res) => {
    try {
        const response = await client_1.client.get('/genres/');
        const $ = cheerio.load(response.data);
        const data = [];
        $(".genres-list a").each(function () {
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
    }
    catch (error) {
        res.status(500).json(error.message);
    }
};
exports.genres = genres;
const genreContent = async (req, res) => {
    try {
        const genre = req.params.genre;
        const page = req.query.page || 1;
        const response = await client_1.client.get(`/genre/${genre}/page/${page}/`);
        const $ = cheerio.load(response.data);
        const data = {
            currentPage: Number(page),
            hasNextPage: false,
            totalPages: 1,
            totalResults: 0,
            itemsPerPage: 20,
            data: []
        };
        const lastPageUrl = $("#pagination nav ul li").last().find("a").attr("href")?.split("?")[0];
        const lastPage = lastPageUrl?.split("/").pop();
        const totalPages = Number(lastPage) || Number($("#pagination nav ul li.active a").text());
        data.totalPages = totalPages || 1;
        data.hasNextPage = data.currentPage < totalPages;
        $(".movies-list.movies-list-full .ml-item").each(function () {
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
    }
    catch (error) {
        res.status(500).json(error.message);
    }
};
exports.genreContent = genreContent;
