const puppeteer = require("puppeteer")

const maxRetries = 3;

const Metinler = async (articledizielemanlari) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox", // Güvenlik önlemleri
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu", // GPU kullanımını devre dışı bırak
            ],
        });
        let page;
        let retries = 0;

        while (retries < maxRetries) {
            page = await browser.newPage();
            try {
                await page.goto(articledizielemanlari, { timeout: 0 });
                break; // Yükleme başarılıysa döngüden çık
            } catch (error) {
                console.error(`Sayfa yüklenirken bir hata oluştu: ${error}`);
                retries++;
                console.log(`Yeniden deneme: ${retries}/${maxRetries}`);
            }
        }

        if (retries >= maxRetries) {
            throw new Error(`Maksimum yeniden deneme sayısına (${maxRetries}) ulaşıldı.`);
        }

        var paragraphs = await page.evaluate(() => {
            let pTags = Array.from(document.querySelectorAll('p'));
            return pTags = pTags.map((tag) => tag.innerText);
        });

        paragraphs.splice(paragraphs.length - 6, 6);
        const ArticleText = Object.values(paragraphs).join("\n");

        await browser.close();
        return ArticleText;
    } catch (error) {
        console.log(error);
    }
}

module.exports = Metinler;
