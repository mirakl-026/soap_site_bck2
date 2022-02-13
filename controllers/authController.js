const keys = require("../keys/keys");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AccountService = require("../services/mongodb/accountService");
const EmailService = require("../services/emailService");
const MetaService = require("../services/mongodb/metaService");
const LoggerService = require("../services/loggerService");

/*
const User = require("../models/user");
const Role = require("../models/role");
const settings = require("../settings");

const bcrypt = require("bcrypt");
const {validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");


const generateAccessToken = (id, roles) => {
    // данные загружаемые в токен, и в нём можно будет их проверить
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, settings.SECRET,{expiresIn: "24h"});
}

module.exports.register = async function (req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({message:"ошибки при регистрации", errors});
        }

        const {username, password} = req.body;
        const candidate = await User.findOne({userName: username});
        if (candidate) {
            return res.status(400).json({message: "пользователь с таким именем уже существует!"});
        }

        // хэширование пароля
        const hashedPassword = bcrypt.hashSync(password, 7);

        // роли - пользователь
        const userRole = await Role.findOne({value: "USER"});

        const user = new User({
            userName: username,
            password: hashedPassword,
            roles: [userRole.value]
        });
        await user.save();

        return res.status(200).json({message:"пользователь успешно зарегестрирован"});

    } catch (e) {
        console.log(e);
        return res.status(500).json({message:"server error"});
    }
}


module.exports.initAdmin = async function(req, res) {
    try {
        const admin = await User.findOne({roles: {$in: ["ADMIN"]} });
        if (!admin) {

            const userRole = await Role.findOne({value: "ADMIN"});

            // хэширование пароля
            const hashedPassword = bcrypt.hashSync("admin", 7);

            const user = new User({
                userName: "admin",
                password: hashedPassword,
                roles: [userRole.value]
            });
            await user.save();
            return res.status(200).json({message:"админ успешно зарегестрирован"});
        }
        return res.status(200).json({message:"админ уже зарегестрирован"});

    } catch (e) {
        console.log(e);
        return res.status(500).json({message:"server error"});
    }
}


module.exports.login = async function(req, res) {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({userName: username});
        if (!user) {
            return res.status(400).json({message:`пользователь с именем ${username} не найден!`});
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({message: "неверный пароль!"});
        }

        // генерируем JWT токен
        const token = generateAccessToken(user._id, user.roles);
        return res.status(200).json({token: token});


    } catch (e) {
        console.log(e);
        return res.status(500).json({message:"server error"});
    }
}

module.exports.getUsers = async function(req, res) {
    try {
        const users = await User.find({});
        return res.status(200).json(users);

    } catch (e) {
        console.log(e);
        return res.status(500).json({message:"server error"});
    }
}


module.exports.initRoles = async function(req, res) {
    try {
        const currentRoles = await Role.find({});
        if (!(currentRoles && currentRoles.length && currentRoles.length > 1)) {
            const userRole = new Role({value: "USER"});
            const adminRole = new Role({value: "ADMIN"});
            await userRole.save();
            await adminRole.save();
        }

        return res.status(200).json(currentRoles);

    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "server error"});
    }
}


 */