const articledetails = require("../article/article submitted/article")
const database = require("../utils/database.js")
const axios = require('axios');


// Direkt indirme bağlantısı

let token = process.env.TOKEN;

const refreshToken = async () => {
    try {
        const response = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                fb_exchange_token: token,
            },
        });
        console.log("naber3")

        const newAccessToken = response.data.access_token;
        return newAccessToken;
    } catch (error) {
        console.log("naber4")

        //console.error('Token yenileme hatası:', error.response ? error.response.data : error.message);
        console.log("naber5")


    }
};

// Mesaj gönderme işlevi
let messageData
const sendMessage = async (header, date, link, phoneNumber) => {
    try {
        messageData = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
                name: "article",
                language: {
                    code: 'tr'
                },
                components: [
                    {
                        type: 'body', // Örnek olarak bir body bileşeni ekledim
                        parameters: [
                            {
                                type: 'text',
                                text: `${link}`
                            },
                            {
                                type: 'text',
                                text: `${header}`
                            },
                            {
                                type: 'text',
                                text: `${date}`
                            }
                        ]
                    }
                ]
            }
        };

        const response = await axios.post('https://graph.facebook.com/v20.0/229186710277282/messages', messageData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`Mesaj gönderildi ${phoneNumber}:`, response.data);
        console.log(token, "token")

    } catch (error) {
        console.log("naber1")

        console.log(error?.response?.data?.error.type)


        if (error?.response?.data?.error.type === 'OAuthException') {
            console.log("naber2")
            token = await refreshToken();
            console.log(token, "token")
            const response = await axios.post('https://graph.facebook.com/v20.0/229186710277282/messages', messageData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

        }
    }
};







const getUsers = async () => {

    return await database.user.findMany()

}

const TextsToBeSent = async () => {
    const users = await getUsers(); // Veritabanından kullanıcıları al
    //console.log(users)
    if (!users.length) {
        console.log("Kullanıcı bulunamadı");
    } else {
        // Yalnızca belirli bir telefon numarasına sahip kullanıcıyı filtrele
        const targetUserTel = '05359430846'; // Belirli telefon numarası
        const targetUsers = users.filter(user => user.tel === targetUserTel);

        // İşiniz bittiğinde bu kısmı yorum yapabilirsiniz
        // const targetUsers = users;

        const articledizi = await articledetails();

        for await (const user of users) {
            if (articledizi.length !== 0) {
                let formatArticleDizi = articledizi.map(article => {
                    const dateString = article.date.toLocaleDateString("tr-TR");
                    return { ...article, date: dateString };
                });

                for (const article of formatArticleDizi) {
                    // Gönderilen makaleleri veritabanına işliyorum ki tekrar gitmesin
                    await database.article.update({
                        where: {
                            url: article.url
                        },
                        data: {
                            clicks: 1
                        }
                    });

                    const header = `${article.header}`
                    const date = ` ${article.date}`
                    const link = `${process.env.REACT_URL}/makaledinle?articleId=${article.id}&Identity=${user.Identity}"`

                    await sendMessage(header, date, link, "9" + user.tel);


                }

            } else {
                console.log("Güncel Makale bulunamadı");
                //await sendMessage(`${"Güncel Makale bulunamadı"}`, "9" + user.tel )
            }
        }
    }
};









module.exports = { TextsToBeSent, }




