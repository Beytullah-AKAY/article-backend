const puppeteer = require('puppeteer');
const database = require("../../utils/database");
const Metinler = require('../receiving article texts/metinler');

const DBarticles = async () => {
    console.log("db başladı")
    let UpDateDate
    let i = 1
    try {
        while (i >= 1) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox", // Güvenlik önlemleri
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--disable-gpu", // GPU kullanımını devre dışı bırak
                ],
            }); const page = await browser.newPage();
            await page.goto(`https://www.muhasebetr.com/ulusalbasin/index.php?sayfa=${i}`, { timeout: 0 });

            const links = await page.evaluate(() => {
                const authorListDiv = document.querySelector('.author-list');
                if (!authorListDiv) {
                    return [];
                }

                const urlheaderdate = Array.from(authorListDiv.querySelectorAll('a'));
                // Her <a> elementinin href özniteliğini ve içindeki <strong> etiketlerinin içeriğini al ve bir diziye ekle
                return urlheaderdate.map(a => ({
                    url: a.href,
                    header: a.querySelector('strong').innerText,
                    date: a.querySelector('i').innerText
                }));
            });

            await browser.close(); // Tarayıcıyı kapat



            const existingUser = await database.user.findUnique({
                where: { email: "akay@gmail.com" }
            });

            if (!existingUser) {
                await database.user.create({
                    data: {
                        name: "Beytullah",
                        surname: "AKAY",
                        email: "akay@gmail.com",
                        tel: "05359430846",
                        meslek: "Mühendis",
                        Identity: "ASELDO"
                    }
                });
            } else {
                console.log("Ana kullanıcı zaten var.");
            }


            const linksFirst30 = links.splice(0, 30)
            const DbUrl = await database.article.findMany({
                select: {
                    url: true
                }
            })

            //tarih formatı ayarlama
            function parseDate(dateString) {
                const [day, month, year] = dateString.split('.');
                return `${year}-${month}-${day}`;
            }



            const DbUrlSet = new Set(DbUrl.map(item => item.url));

            // Birinci dizideki URL'leri filtrele
            const UpDateArticle = linksFirst30.filter(item => !DbUrlSet.has(item.url));

            //  console.log(UpDateArticle)
            const UpDateArticleReverse = UpDateArticle.reverse()

            if (UpDateArticle.length <= 15 && UpDateArticle.length !== 0) {
                for (const link of UpDateArticleReverse) {

                    const linkDate = parseDate(link.date)
                    UpDateDate = new Date(linkDate)


                    const ArticleText = await Metinler(link.url)
                    // console.log(ArticleText)
                    link.text = ArticleText


                    try {

                        await database.article.create({
                            data: {
                                url: link.url,
                                header: link.header,
                                date: UpDateDate,
                                text: link.text
                            }
                        });
                    } catch (error) {
                        console.log(error)
                    }

                }
                console.log("Yeni Makale Yüklendi")
            } else if (UpDateArticle.length !== 0) {


                for (const link of UpDateArticleReverse) {

                    const ArticleText = await Metinler(link.url)
                    link.text = ArticleText


                    const linkDate = parseDate(link.date)
                    UpDateDate = new Date(linkDate)
                    try {
                        await database.article.create({
                            data: {
                                url: link.url,
                                header: link.header,
                                date: UpDateDate,
                                text: link.text
                            }
                        });
                    } catch (error) {
                        console.log(error)
                    }

                }
                console.log("Yeni Makale Yüklendi")
            } else {
                console.log("Henüz Güncel Makale Yüklenmedi")
            }

            i--
        }
    } catch (error) {
        console.log(error);
        return;
    }
    // await database.article.delete({data})
}
module.exports = DBarticles;
