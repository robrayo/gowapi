"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const proxy_1 = require("../proxy");
exports.router = (0, express_1.Router)();
// PROXY
exports.router.get('/hls-proxy', proxy_1.hlsProxy);
// API
exports.router.get('/spotlight', controllers_1.spotlight);
exports.router.get('/suggestions', controllers_1.suggestions);
exports.router.get('/search', controllers_1.search);
exports.router.get('/genres', controllers_1.genres);
exports.router.get('/genre/:genre', controllers_1.genreContent);
// :category = recommended | episode | movies | series | top movies | most viewed | director | actors | studios | countries | networks | genres | release-year
exports.router.get('/category/:category', controllers_1.category);
exports.router.get('/seasons/:type/:id', controllers_1.seasons);
exports.router.get('/info/:type/:id', controllers_1.info);
exports.router.get('/series-episodes/:id', controllers_1.seriesEpisodes);
exports.router.get('/servers/:type/:id', controllers_1.servers);
exports.router.get("/sources/:token", controllers_1.sources);
exports.router.get("/hls/:token", proxy_1.hlsProxy);
