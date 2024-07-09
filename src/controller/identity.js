const crypto = require('crypto');
const database=require("../utils/database");

const identity = async (user) => {
  try {
    function generateUniqueValue(name,id) {
      const hash = crypto.createHash('sha256').update(name + id).digest('hex');
      return hash.substring(0, 6); // İlk 6 karakteri al
    }
    
    const identityüret = generateUniqueValue(user.name, user.id); // Asenkron olmadığı için await gerekmez
    
    await database.user.update({
      where: { id: user.id },
      data: { Identity: `${identityüret}` }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = identity;
