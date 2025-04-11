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
exports.seasons = void 0;
const client_1 = require("../utils/client");
const cheerio = __importStar(require("cheerio"));
const remove_trailing_slash_1 = require("../utils/remove-trailing-slash");
const seasons = async (req, res) => {
    try {
        const type = req.params.type;
        const id = req.params.id;
        if (type !== "series" && type !== "episode") {
            res.status(422).json("Type must be series or episode");
        }
        const response = await client_1.client.get(`/${type}/${id}`);
        const $ = cheerio.load(response.data);
        const data = [];
        $("#more-seasons .wr-ss a").each(function () {
            const noscript = $(this).find("noscript").html() || "";
            data.push({
                id: (0, remove_trailing_slash_1.removeTrailingSlash)($(this).attr("href"))?.split("/").pop(),
                title: $(this).find("span").text(),
                image: $(noscript).attr("src") || ""
            });
        });
        res.status(200).send(data);
    }
    catch (error) {
        console.log(error);
    }
};
exports.seasons = seasons;
