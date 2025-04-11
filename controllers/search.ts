import { Request, Response } from "express";
import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';
import * as cheerio from 'cheerio';
import { getID } from "../utils/get-id";

type SearchTypes = {
    id: string | null
    img: string | null
    title: string
    description: string
    type: string
    duration: string
    release: number
    imdbRating: number
    genres: string[]
    episodeCount?: number
    airStatus?: string
}

export const search = async (req: Request, res: Response) => {
    try {
        const keyword = req.query.keyword
        const pageNum = req.query.page || 1
        const genre = req.query.genre as string
        const year = req.query.year as string
        const country = req.query.country as string

        // Debug logging
        console.log('Search parameters:', {
            keyword,
            pageNum,
            genre,
            year,
            country
        });

        const baseUrl = process.env.SCRAPE_WEB_BASE_URL || 'https://hollymoviehd.cc';
        // Try different search URL format
        const searchUrl = `${baseUrl}/search/${encodeURIComponent(keyword as string)}`;

        console.log('Searching URL:', searchUrl);

        // Configure Chrome for Vercel's environment
        const executablePath = await chrome.executablePath;

        const browser = await puppeteer.launch({
            args: [
                ...chrome.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ],
            executablePath: executablePath,
            headless: chrome.headless,
            ignoreHTTPSErrors: true
        });

        try {
            const page = await browser.newPage();
            // Use a more recent Chrome user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': baseUrl,
                'Origin': baseUrl,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            });

            // Add more realistic cookies
            const cookies = [
                {
                    name: 'cf_clearance',
                    value: 'dummy',
                    domain: new URL(baseUrl).hostname,
                    path: '/',
                    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
                    httpOnly: true,
                    secure: true,
                    sameSite: 'Lax' as const
                },
                {
                    name: 'PHPSESSID',
                    value: Math.random().toString(36).substring(2),
                    domain: new URL(baseUrl).hostname,
                    path: '/',
                    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'Lax' as const
                },
                {
                    name: 'wordpress_test_cookie',
                    value: 'WP+Cookie+check',
                    domain: new URL(baseUrl).hostname,
                    path: '/',
                    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'Lax' as const
                }
            ];

            await page.setCookie(...cookies);

            // Visit homepage first with random delay
            await page.goto(baseUrl, { waitUntil: 'networkidle0' });
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

            // Simulate some mouse movements
            await page.mouse.move(Math.random() * 500, Math.random() * 500);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

            // Now go to search page with random delay
            await page.goto(searchUrl, { waitUntil: 'networkidle0' });
            await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

            // Check for human verification
            const verificationText = await page.evaluate(() => {
                return document.body.textContent?.includes('Human Verification') || 
                       document.body.textContent?.includes('Cloudflare') ||
                       document.body.textContent?.includes('security check');
            });

            if (verificationText) {
                throw new Error('Human verification required');
            }

            const content = await page.content();
            console.log('Page content length:', content.length);
            const $ = cheerio.load(content);

            const data: SearchTypes[] = [];

            // Look for search results in various possible containers
            const potentialContainers = [
                '.main-content',
                '.content',
                '.site-content',
                '.search-results',
                '.results',
                '.movies-list',
                '.posts',
                '.article-content'
            ];

            console.log('Checking potential containers...');
            potentialContainers.forEach(selector => {
                const container = $(selector);
                console.log(`Container ${selector} has ${container.length} elements`);
                if (container.length > 0) {
                    console.log(`First child of ${selector}:`, container.children().first().html());
                }
            });

            // Try to find movie/TV items using more specific selectors
            const items = $('.ml-item, .movie-item, .item, article');
            console.log(`Found ${items.length} potential items`);

            items.each((i, el) => {
                const $el = $(el);
                const link = $el.find('a').first();
                const href = link.attr('href');
                const title = link.attr('title') || link.text().trim();
                const img = $el.find('img').first().attr('src');
                const description = $el.find('.desc, .description, p').first().text().trim();
                const type = href?.includes('/series/') ? 'tv' : 'movie';

                // Get episode count and air status
                const episodeCount = parseInt($el.find('.lt-eps i').text()) || undefined;
                const airStatus = $el.find('.air-status i').text().trim() || undefined;

                if (href && title) {
                    const formattedId = getID(href);
                    data.push({
                        id: formattedId,
                        img: img || null,
                        title,
                        description: description || '',
                        type,
                        duration: '', // Will be filled in detail endpoint
                        release: 0, // Will be filled in detail endpoint
                        imdbRating: 0, // Will be filled in detail endpoint
                        genres: [], // Will be filled in detail endpoint
                        episodeCount,
                        airStatus
                    });
                }
            });

            if (data.length === 0) {
                // Try one more time with a broader selector
                $('a').each((i, el) => {
                    const $el = $(el);
                    const href = $el.attr('href');
                    if (href && (href.includes('/movie/') || href.includes('/series/'))) {
                        const title = $el.attr('title') || $el.text().trim();
                        const img = $el.find('img').attr('src');
                        const parent = $el.parent();
                        const description = parent.find('.desc, .description, p').text().trim();
                        const type = href.includes('/series/') ? 'tv' : 'movie';

                        // Get episode count and air status
                        const episodeCount = parseInt(parent.find('.lt-eps i').text()) || undefined;
                        const airStatus = parent.find('.air-status i').text().trim() || undefined;

                        const formattedId = getID(href);
                        data.push({
                            id: formattedId,
                            img: img || null,
                            title,
                            description: description || '',
                            type,
                            duration: '', // Will be filled in detail endpoint
                            release: 0, // Will be filled in detail endpoint
                            imdbRating: 0, // Will be filled in detail endpoint
                            genres: [], // Will be filled in detail endpoint
                            episodeCount,
                            airStatus
                        });
                    }
                });
            }

            if (data.length === 0) {
                res.status(404).json({
                    error: "No results found",
                    message: "No movies or shows found matching your search criteria."
                });
                return;
            }

            res.status(200).send(data);
        } finally {
            await browser.close();
        }
    } catch (error: any) {
        console.error('Search error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        
        if (error.message.includes('Human verification')) {
            res.status(403).json({
                error: "Human Verification Required",
                message: "Please try again later or use a different search term."
            });
        } else {
            res.status(500).json({
                error: error.message,
                message: "Failed to perform search. Please try again later."
            });
        }
    }
}