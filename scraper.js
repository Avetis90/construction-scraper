const puppeteer = require("puppeteer");
const Company = require('./models/Company')
const emailScraper = require('./emailScraper')

module.exports = async (options) => {

    if (!parseInt(options.start) && !parseInt(options.end)) {
        return
    }
    // Extract partners on the page, recursively check the next page in the URL pattern
    const extractPartners = async url => {

        // Scrape the data we want
        const page = await browser.newPage();
        await page.exposeFunction('emailScraper', emailScraper);
        await page.setDefaultNavigationTimeout(0)
        await page.goto(url, {waitUntil: 'networkidle2'}).catch(e => void 0);
        const partnersOnPage = await page.evaluate(() => {
                const result = Array.from(document.querySelectorAll(".post-content .post-item"));
                const data = result.map(compact => {
                    const title = compact.querySelector(".post-title a").innerText.trim();
                    const link = compact.querySelector(".post-title a").href;
                    const phone = compact.querySelector('.fa-phone-square').parentElement.innerText;
                    //const email =  'asd'
                    return {
                        title,
                        link,
                        phone
                    }
                });
                const list = emailScraper(data)
                return list

            }
        );
        //console.log(partnersOnPage)
        await page.close();

        // Recursively scrape the next page
        if (partnersOnPage.length < 1) {
            // Terminate if no partners exist
            return partnersOnPage
        } else {
            // Go fetch the next page ?page=X+1
            const nextPageNumber = parseInt(url.match(/offset_pagination=(\d+)$/)[1], 10) + 10;
            console.log('nextPageNumber', nextPageNumber)
            if (nextPageNumber >= parseInt(options.end)) {
                return partnersOnPage
            }
            const nextUrl = `https://www.construction.am/arm/construction.php?act=earthworks-and-demolition&offset_pagination=${nextPageNumber}`;

            return partnersOnPage.concat(await extractPartners(nextUrl))
        }
    };

    const browser = await puppeteer.launch();
    const firstUrl =
        `https://www.construction.am/arm/construction.php?act=earthworks-and-demolition&offset_pagination=${parseInt(options.start)}`;
    const partners = await extractPartners(firstUrl);
    const c = await Company.insertMany(partners).then(res => console.log('insertMany')).catch(err => console.log(err))

    await browser.close();

    return c
};
