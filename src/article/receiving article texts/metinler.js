const puppeteer = require("puppeteer");
const maxRetries = 3;

const Metinler = async (articledizielemanlari) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
            ],
        });

        let page;
        let retries = 0;

        while (retries < maxRetries) {
            page = await browser.newPage();

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            try {
                await page.goto(articledizielemanlari, { timeout: 30000, waitUntil: 'networkidle0' });
                break;
            } catch (error) {
                console.error(`Sayfa yüklenirken bir hata oluştu: ${error}`);
                retries++;
                console.log(`Yeniden deneme: ${retries}/${maxRetries}`);
                await page.close();
            }
        }

        if (retries >= maxRetries) {
            throw new Error(`Maksimum yeniden deneme sayısına (${maxRetries}) ulaşıldı.`);
        }

        await page.waitForSelector('p', { timeout: 10000 });

        var paragraphs = await page.evaluate(() => {
            let pTags = Array.from(document.querySelectorAll('p'));
            return pTags.map((tag) => tag.innerText);
        });

        // Son altı satırı sil
        paragraphs.splice(paragraphs.length - 6, 6);

        const ArticleText = paragraphs.join("\n");
        console.log(ArticleText);

        await browser.close();
        return ArticleText;
    } catch (error) {
        console.log(error);
    }
}

module.exports = Metinler;