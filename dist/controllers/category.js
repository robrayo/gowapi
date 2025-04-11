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
exports.category = void 0;
const client_1 = require("../utils/client");
const cheerio = __importStar(require("cheerio"));
const remove_trailing_slash_1 = require("../utils/remove-trailing-slash");
const get_id_1 = require("../utils/get-id");
const show_type_1 = require("../utils/show-type");
const category = async (req, res) => {
    try {
        const category_slug = req.params.category;
        const page = req.query.page || 1;
        const country = req.query.country;
        const filter = req.query.filter;
        let url = `/${category_slug}/page/${page}/`;
        // category_slug = recommended | episode | movies | series | top movies | most viewed | director | actors | studios | countries | networks | genres | release-year
        if (filter) {
            url = `/${category_slug}/${filter}/page/${page}/`;
        }
        // Handle URL for movies or dramas/series filtered by a specific country
        if (country) {
            url = `/${category_slug}/country/${country}/page/${page}/`;
        }
        const response = await client_1.client.get(url);
        const $ = cheerio.load(response.data);
        const data = {
            currentPage: Number(page),
            hasNextPage: false,
            totalPages: 1,
            data: []
        };
        const lastPageUrl = $("#pagination nav ul li").last().find("a").attr("href");
        const lastPage = (0, remove_trailing_slash_1.removeTrailingSlash)(lastPageUrl)?.split("/").pop();
        const totalPages = Number(lastPage) || Number($("#pagination nav ul li.active a").text());
        data.totalPages = totalPages || 1;
        data.hasNextPage = data.currentPage < totalPages;
        $(".movies-list.movies-list-full .ml-item").each(function () {
            const href = $(this).find('a').attr('href') || "";
            const type = (0, show_type_1.showType)(href);
            const noscript = $(this).find('noscript').html() || "";
            const img = $(noscript).attr('src') || "";
            data.data.push({
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
exports.category = category;
