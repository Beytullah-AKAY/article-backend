const express = require("express")
const app = express()
const database = require("./utils/database")
const port = 6001
const cors = require("cors")
const authController = require("./controller/authcontroller")
const makaledinle=require("./controller/makaledinle")

const expressstart = async () => {

   

    app.use(express.json());

    app.use(cors());
    app.options("*", cors());

    app.post("/Login", authController.Login)
    app.post("/Register", authController.Register)
    app.use("/makaledinle", makaledinle)
    
    app.get("/", (req, res) => {
        res.send("Merhaba, isteğinizi dinliyorum");
    });


    app.listen(port, () => {
        console.log(`${port} portu dinleniyor`)
    })
}

module.exports = expressstart
