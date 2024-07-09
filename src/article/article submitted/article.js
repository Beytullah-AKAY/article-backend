const database = require("../../utils/database");

const articledetails = async () => {
  let yesterdayArticle, todayArticle
  try {

    //BUGÜN 
    const bugün = new Date()
    bugün.setUTCHours(0, 0, 0, 0);

    //DÜN
    const upDate = new Date();
    upDate.setDate(upDate.getDate() - 1)
    upDate.setUTCHours(0, 0, 0, 0);
    const yesterday = upDate.toISOString()

    // console.log(yesterday, bugün, "bugün")

    try {
      yesterdayArticle = await database.article.findMany({
        where: {
          AND: [
            { date: yesterday },
            { clicks: 0 }
          ]
        }
      })
    } catch (error) {
      console.log(error)
    }



    if (yesterdayArticle.length === 0) {
      try {
        todayArticle = await database.article.findMany({
          where: {
            AND: [
              { date: bugün },
              { clicks: 0 }
            ]
          }
        });
      } catch (error) {
        console.log(error)
      }
      return todayArticle
    }


  } catch (error) {
    console.error("Error fetching article details:", error);
    throw error;
  }

  return yesterdayArticle; // details değişkenini döndür
};

module.exports = articledetails;
