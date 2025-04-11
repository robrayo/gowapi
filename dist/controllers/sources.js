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
exports.sources = void 0;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const sources = async (req, res) => {
    try {
        const token = req.params.token;
        const getCsrfToken = await axios_1.default.get(`https://gstream.hollymoviehd.cc/embed/${token}`);
        const sourcesData = cheerio.load(getCsrfToken.data);
        const csrf_token = sourcesData("#csrf_token").val();
        if (!csrf_token)
            throw new Error("No csrf token found");
        const formData2 = new FormData();
        formData2.append('csrf_token', csrf_token);
        const getSources = await axios_1.default.post(`https://gstream.hollymoviehd.cc/embed/${token}`, formData2);
        const sources = getSources.data;
        const fixedSources = sources.sources.map(({ file, prop }) => ({
            file: file.startsWith('https') ? file : `https://gstream.hollymoviehd.cc${file}`,
            ...prop
        }));
        res.status(200).send(fixedSources);
    }
    catch (error) {
        res.status(500).json(error.message);
    }
};
exports.sources = sources;
