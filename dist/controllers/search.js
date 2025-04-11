"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const axios_1 = __importDefault(require("axios"));
const search = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const pageNum = req.query.page || 1;
        const genre = req.query.genre;
        const year = req.query.year;
        const country = req.query.country;
        // TMDB API configuration
        const TMDB_API_KEY = process.env.TMDB_API_KEY; // You'll need to set this in your environment variables
        const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        if (!TMDB_API_KEY) {
            throw new Error('TMDB API key is not configured');
        }
        // Search for movies
        const movieResponse = await axios_1.default.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query: keyword,
                page: pageNum,
                year: year,
                region: country,
                include_adult: false
            }
        });
        // Search for TV shows
        const tvResponse = await axios_1.default.get(`${TMDB_BASE_URL}/search/tv`, {
            params: {
                api_key: TMDB_API_KEY,
                query: keyword,
                page: pageNum,
                first_air_date_year: year,
                region: country,
                include_adult: false
            }
        });
        // Get genre list for mapping
        const genreResponse = await axios_1.default.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        const genreMap = new Map(genreResponse.data.genres.map((g) => [g.id, g.name]));
        // Combine and process results
        const data = {
            currentPage: Number(pageNum),
            hasNextPage: movieResponse.data.page < movieResponse.data.total_pages ||
                tvResponse.data.page < tvResponse.data.total_pages,
            totalPages: Math.max(movieResponse.data.total_pages, tvResponse.data.total_pages),
            totalResults: movieResponse.data.total_results + tvResponse.data.total_results,
            itemsPerPage: 20,
            data: []
        };
        // Process movie results
        movieResponse.data.results.forEach((movie) => {
            data.data.push({
                id: movie.id.toString(),
                img: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                quality: null, // TMDB doesn't provide quality info
                title: movie.title,
                type: 'movie',
                imdbRating: movie.vote_average,
                airStatus: null,
                episode: null,
                adultContentTag: movie.adult ? 'Adult' : null,
                releaseYear: new Date(movie.release_date).getFullYear(),
                duration: null, // We'd need an additional API call for this
                genres: movie.genre_ids.map((id) => genreMap.get(id) || 'Unknown'),
                country: movie.original_language.toUpperCase(),
                language: movie.original_language
            });
        });
        // Process TV results
        tvResponse.data.results.forEach((show) => {
            data.data.push({
                id: show.id.toString(),
                img: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
                quality: null,
                title: show.name,
                type: 'tv',
                imdbRating: show.vote_average,
                airStatus: show.status,
                episode: show.number_of_episodes,
                adultContentTag: show.adult ? 'Adult' : null,
                releaseYear: new Date(show.first_air_date).getFullYear(),
                duration: null,
                genres: show.genre_ids.map((id) => genreMap.get(id) || 'Unknown'),
                country: show.original_language.toUpperCase(),
                language: show.original_language
            });
        });
        // Sort results by popularity
        data.data.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0));
        if (data.data.length === 0) {
            res.status(404).json({
                error: "No results found",
                message: "No movies or shows found matching your search criteria."
            });
            return;
        }
        res.status(200).send(data);
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: error.message,
            message: "Failed to perform search. Please try again later."
        });
    }
};
exports.search = search;
