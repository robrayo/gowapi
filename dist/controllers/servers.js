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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.servers = void 0;
const client_1 = require("../utils/client");
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const servers = async (req, res) => {
    try {
        const type = req.params.type;
        const id = req.params.id;
        if (type !== 'movie' && type !== 'episode') {
            res.status(422).json("Type is movie or episode");
            return;
        }
        const response = await client_1.client.get(type === 'movie' ? `/${id}` : `/episode/${id}`);
        const $ = cheerio.load(response.data);
        const downloadLink = $("#bar-player [target='_blank'].btn").attr('href');
        const action = 'ajax_getlinkstream';
        const streamKey = $('#content-embed > div').attr("data-streamkey");
        const nonce = 'dd3d2e0bd1';
        const imdbid = $("[itemprop='ratingValue']").attr('data-imdbid');
        const tmdbid = $("[itemprop='partOfSeries']").attr('data-tmdbid');
        const formData = new FormData();
        formData.append('action', action);
        formData.append('streamkey', streamKey);
        formData.append('nonce', nonce);
        formData.append('imdbid', imdbid);
        formData.append('tmdbid', tmdbid);
        const adminAjax = await axios_1.default.post('https://hollymoviehd.cc/wp-admin/admin-ajax.php', formData, {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "Origin": process.env.WEB_TO_SCRAPE_BASE_URL
            }
        });
        const adminAjaxData = adminAjax.data;
        if (!adminAjaxData)
            throw new Error("No admin ajax found");
        res.status(200).send({ adminAjaxData, downloadLink });
    }
    catch (error) {
        console.log(error.message);
    }
};
exports.servers = servers;
