import { Request, Response } from "express";
import { client } from "../utils/client";
import * as cheerio from "cheerio";
import axios from "axios";

export const servers = async (req: Request, res: Response) => {
    try {
        const type = req.params.type as string;
        const id = req.params.id as string;

        if(type !== 'movie' && type !== 'episode') {
            res.status(422).json("Type is movie or episode")
            return
        }

        const response = await client.get(type === 'movie' ? `/${id}` : `/episode/${id}`);
        const $ = cheerio.load(response.data);

        const downloadLink = $("#bar-player [target='_blank'].btn").attr('href') as string;

        const action = 'ajax_getlinkstream'
        const streamKey = $('#content-embed > div').attr("data-streamkey") as string;
        const nonce = 'dd3d2e0bd1'
        const imdbid = $("[itemprop='ratingValue']").attr('data-imdbid') as string;
        const tmdbid = $("[itemprop='partOfSeries']").attr('data-tmdbid') as string;

        const formData = new FormData();
        formData.append('action', action); 
        formData.append('streamkey', streamKey);
        formData.append('nonce', nonce);
        formData.append('imdbid', imdbid);
        formData.append('tmdbid', tmdbid);

        const adminAjax = await axios.post('https://hollymoviehd.cc/wp-admin/admin-ajax.php', formData, {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "Origin": process.env.WEB_TO_SCRAPE_BASE_URL
            }
        })
        const adminAjaxData = adminAjax.data;
        if(!adminAjaxData) throw new Error("No admin ajax found");

        res.status(200).send({ adminAjaxData, downloadLink });
    } catch (error: any) {
        console.log(error.message);
    }
}