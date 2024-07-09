
const database = require("../utils/database");
const identity = require("./identity");
const makaledinle = async (req, res) => {
  try {
    const Identity = req.query.Identity;
    const articleid = Number(req.query.article_id)
    let user, findmakale, updateFindMakale

    //  console.log(Identity, articleid, "burdasın")

    if (!Identity || Identity === null || !articleid || articleid === null) {
      console.log("Geçersiz kimlik veya makale bulunamadı")
      return res.status(401).json({ "Geçersiz Identity" });
    } else {
      try {
        user = await database.user.findUnique({
          where: { Identity: Identity }
        })
        console.log(user)

      } catch (error) {
        console.log(error, "kullanıcı bulunamadı")
      }
      if (!user) {
        return res.status(401).json({ error: "Kimlik bilginiz eşleşmedi" });
      } else {

        try {
          findmakale = await database.article.findUnique({
            where: { id: articleid }
          });
        } catch (error) {
          console.log(error, "makale bulunamadı")
        }
        if (!findmakale) {
          return res.status(404).json({ error: "Aradığınız makale bulunamadı" });
        } else {
          updateFindMakale = { ...findmakale, date: findmakale.date.toLocaleDateString("tr-TR") }


          //  console.log(updateFindMakale,"updateFindMakale")
          try {
            const existingClicker = await database.clicker.findFirst({
              where: {
                userIdentity: Identity,
                articleId: articleid,
              },
            });

            if (existingClicker) {
              // Aynı kullanıcı, makale ve IP adresiyle önceki bir tıklama bulundu
              // Sadece makaleye bir tıklama daha ekleyin
              await database.article.update({
                where: { id: articleid },
                data: {
                  clicks: {
                    increment: 1
                  }
                }
              });
            } else {
              // Yeni bir tıklama kaydı oluşturun
              await database.clicker.create({
                data: {
                  userIdentity: Identity,
                  articleId: articleid,
                }
              });

              // Makaledeki click sayısını artırın
              await database.article.update({
                where: { id: articleid },
                data: {
                  clicks: {
                    increment: 1
                  }
                }
              });
            }
            res.json({ updateFindMakale, user });

          } catch (error) {
            console.error("Tıklama işlemi sırasında bir hata oluştu:", error);
            // Hata durumunda gerekli işlemler yapılabilir veya uygun bir şekilde işlenir
          }
        }
      }
    }
  }


  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
module.exports = makaledinle
