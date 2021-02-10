const puppeteer = require("puppeteer");

module.exports = async (data) => {
    const getEmails = async (url) => {
        const partnerPage = await browser.newPage();
        await partnerPage.setDefaultNavigationTimeout(0)
        await partnerPage.goto(url, {waitUntil: 'networkidle2'}).catch(e => void 0);
        const email = await partnerPage.evaluate(() => {
                const result = Array.from(document.querySelectorAll(".button.small"));
                let info = {site:'',email:''};
                const data = result.map(el => {
                    if (el.innerText.trim() === 'Կայք') {
                        info.site = el.href
                    }
                    if (el.innerText.trim() === 'Էլ․ Փոստ') {
                        info.email = el.dataset['originalTitle']
                    }
                })
                return info
            }
        );
        await partnerPage.close();
        console.log(email,'email')
        return email
    }

    const browser = await puppeteer.launch();

    const emailList = await Promise.all(data.map(async el => {
        const emails = await getEmails(el.link);
        return {...el, ...emails}
    }))
    let pages = await browser.pages();
    await Promise.all(pages.map(page => page.close()));
    await browser.close();
    return emailList
}
