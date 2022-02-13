/*
const jwt = require("jsonwebtoken");
const settings = require("../settings");

module.exports = function (roles) {
    // замыкание
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }

        try {
            // вид JWT - Bearer afjasklhjfask(сам токен)
            const token = req.headers.authorization.split(" ")[1];  // сам токен (без "Bearer ")
            if (!token) {
                return res.status(403).json({message: "пользователь не авторизован"});
            }

            const {roles: userRoles} = jwt.verify(token, settings.SECRET);
            let hasRole = false;
            for (let role of userRoles) {
                if (roles.includes(role)) {
                    hasRole = true;
                }
            }
            if (!hasRole) {
                return res.status(403).json({message: "отказано в доступе"});
            }
            next();

        } catch (e) {
            console.log(e);
            return res.status(403).json({message: "пользователь не авторизован"});
        }
    }
}


 */