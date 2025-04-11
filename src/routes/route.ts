import { Router } from "express";
import { 
    category, 
    servers, 
    sources, 
    spotlight, 
    suggestions,
    search,
    info,
    seriesEpisodes,
    seasons,
    genres,
    genreContent
} from "../controllers";
import { hlsProxy } from "../proxy";

export const router = Router();

// PROXY
router.get('/hls-proxy', hlsProxy)



// API
router.get('/spotlight', spotlight)

router.get('/suggestions', suggestions)

router.get('/search', search)

router.get('/genres', genres)

router.get('/genre/:genre', genreContent)

// :category = recommended | episode | movies | series | top movies | most viewed | director | actors | studios | countries | networks | genres | release-year
router.get('/category/:category', category)

router.get('/seasons/:type/:id', seasons)

router.get('/info/:type/:id', info)

router.get('/series-episodes/:id', seriesEpisodes)

router.get('/servers/:type/:id', servers)

router.get("/sources/:token", sources)

router.get("/hls/:token", hlsProxy)