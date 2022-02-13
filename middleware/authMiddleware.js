/*
const jwt = require("jsonwebtoken");
const settings = require("../settings");

module.exports = function(req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }

    try {
        // вид JWT - Bearer afjasklhjfask(сам токен)
        const token = req.headers.authorization.split(" ")[1];  // сам токен (без "Bearer ")
        if (!token) {
            return res.status(403).json({message: "пользователь не авторизован"});
        }

        const decodedData = jwt.verify(token, settings.SECRET);
        req.user = decodedData; // добавляем данные для дальнейшего использования по цепочке конвейера
        next();

    } catch (e) {
        console.log(e);
        return res.status(403).json({message: "пользователь не авторизован"});
    }
}

 */