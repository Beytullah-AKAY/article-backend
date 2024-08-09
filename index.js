const cron = require("cron");
require('dotenv').config(); // dotenv modülünü yükle
const { TextsToBeSent, whatsappstart } = require("./src/whatsapp/whatsapp");
const DBarticles = require("./src/article/upload urls to database/DBarticle");
const expressstart = require("./src/express");

// Başlangıç işlevlerini başlat
const başla = async () => {
    await expressstart();
    await DBarticles()
}

başla().then(() => {

    // Başlangıç işlevleri tamamlandıktan sonra cron işlemi başlatılır

    const mesaj = new cron.CronJob('0 0 9-22 * * *', async () => {
        //const mesaj = new cron.CronJob('*/1 9-20 * * *', async () => {
        // await TextsToBeSent();
    }, null, true, 'Europe/Istanbul');

    mesaj.start();

    const dbcronJob = new cron.CronJob('0 30 9-20 * * *', async () => {
        //  await DBarticles();    
    }, null, true, 'Europe/Istanbul');

    dbcronJob.start();
})