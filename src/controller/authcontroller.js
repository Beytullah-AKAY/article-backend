const database = require("../utils/database");
const identity = require("./identity")


const Register = async (req, res) => {
    try {
        const { name, surname, email, tel, meslek } = req.body;
        // console.log(req.body)

        if (!name || !surname || !email || !tel || !meslek) {
            return res.status(400).json({
                message: "Bilgilerinizi kontrol ediniz."
            });
        }

        // E-posta adresinin benzersiz olup olmadığını kontrol et
        const existingUserByEmail = await database.user.findUnique({
            where: {
                email: email,
            },
        });

        const existingUserByTel = await database.user.findUnique({
            where: {
                tel: tel,
            },
        });

        if (existingUserByEmail || existingUserByTel) {
            let messsage = existingUserByEmail
                ? "Bu e-posta adresi zaten sistemimizde kayıtlı. Lütfen başka bir e-posta adresi deneyin."
                : "Bu telefon numarası zaten sistemimizde kayıtlı. Lütfen başka bir telefon numarası deneyin.";

            return res.status(400).json({
                message: messsage
            });
        }

        // Eğer e-posta benzersizse, kullanıcıyı oluştur
        const user = await database.user.create({
            data: {
                name,
                surname,
                email,
                tel,
                meslek
            }
        });

        // Kullanıcıya kimlik atama
        await identity(user);

        return res.status(200).json({
            message: "Kayıt başarılı."
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Sunucu hatası oluştu."
        });
    }
};



const Login = async (req, res) => {
    try {
        const { email, meslek } = req.body;

        if (!email || !meslek) {
            return res.status(400).json({
                message: "Lütfen bilgilerinizi doğru giriniz"
            });
        }

        const user = await database.user.findFirst({
            where: { email }
        });

        if (user) {
            return res.status(200).json({
                name: user.name
            });
        } else {
            return res.status(404).json({
                message: "Kullanıcı bulunamadı"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Sunucu hatası"
        });
    }
};


module.exports = { Login, Register };
