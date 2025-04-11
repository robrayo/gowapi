import { Request, Response } from "express"
import { client } from "../utils/client"
import * as cheerio from 'cheerio'
import { removeTrailingSlash } from "../utils/remove-trailing-slash"

export const seasons = async (req: Request, res: Response) => {
    try {
        const type = req.params.type as string
        const id = req.params.id as string

        if(type !== "series" && type !== "episode") {
            res.status(422).json("Type must be series or episode")
        }

        const response = await client.get(`/${type}/${id}`)
        const $ = cheerio.load(response.data)

        const data: any = [];

        $("#more-seasons .wr-ss a").each(function() {
            const noscript = $(this).find("noscript").html() || ""

            data.push({ 
                id: removeTrailingSlash($(this).attr("href"))?.split("/").pop(),
                title: $(this).find("span").text(),
                image: $(noscript).attr("src") || ""
            })
        })

        res.status(200).send(data)
    } catch (error) {
        console.log(error)
    }
}