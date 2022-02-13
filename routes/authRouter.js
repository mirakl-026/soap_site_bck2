const {Router} = require('express');


const router = Router();




module.exports = router;

/*
const express = require("express");
const authController = require("../controllers/authController");
const {check} = require("express-validator");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", [
    check("username", "нужно имя").notEmpty(),
    check("password", "пароль от 3 до 10 символов").isLength({min: 3, max: 10})
], authController.register);

router.post("/login", authController.login);

// router.get("/users", authMiddleware, authController.getUsers);
router.get("/users", roleMiddleware(["ADMIN"]), authController.getUsers);


router.get("/init", authController.initRoles);

router.post("/initAdmin", authController.initAdmin);

module.exports = router;

 */