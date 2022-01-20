const {Router} = require('express');
const keys = require("../keys/keys");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AccountService = require("../services/mongodb/accountService");
const EmailService = require("../services/emailService");
const MetaService = require("../services/mongodb/metaService");
const LoggerService = require("../services/loggerService");

const router = Router();



// CSRF
router.get('/getCSRFToken', (req, res) => {
    try {
        res.status(200).json({ csrfToken: req.csrfToken ? req.csrfToken() : null });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/getCSRFToken/[GET] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});



// проверка на то, что пользователь авторизован
router.get("/checkIsAuth", async (req, res) => {
    try {
        if (req.session.isAccount) {
            res.status(200).json({
                isAccount: true
            });
        } else {
            res.status(200).json({
                isAccount: false
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/checkIsAuth/[GET] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});

// проверка на то, что админ авторизован
router.get("/checkIsAdm", async (req, res) => {
    try {
        if (req.session.isAdmin) {
            res.status(200).json({
                isAdmin: true
            });
        } else {
            res.status(200).json({
                isAdmin: false
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/checkIsAdm/[GET] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});



// post обычного пользователя
router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        const account = await AccountService.readAccountByEmail(email);
        if (account) {
            const areSame = await bcrypt.compare(password, account.password);
            if (areSame) {
                req.session.account = account;
                req.session.isAccount = true;
                res.status(200).json({ email: email, name: req.session.account.name });
            } else {
                res.status(200).json({
                    message: "Неправильный пароль"
                });
            }

        } else {
            res.status(200).json({
                message: "Email not found"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/login/[POST] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});


// post администратора
router.post("/admin/login", async (req, res) => {
    try {
        const {email, password, wordv2} = req.body;

        // проверка на ADMIN_EMAIL, ADMIN_PASS, ADMIN_W2
        if (email === keys.ADMIN_EMAIL //&&
            //password === keys.ADMIN_PASS &&
            //wordv2 === keys.ADMIN_W2) {
            ) {

            req.session.isAdmin = true;
        
            res.status(200).json({ message: "OK" });
        } else {
            res.status(200).json({ message: "Login as admin failed" });

        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/admin/login/[POST] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});


router.get('/logout', async (req, res) => {
    try {
        req.session.destroy(() => {
            // чистка БД
        });
        res.status(200).json({ message: "OK" });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/logout/[GET] - ${e.message};`);
        res.status(500).json({message: "Server error"});
    }
});



// регистрация пользователя
router.post("/register", async (req, res) => {
    try {
        // регистрируем нового пользователя
        const {email, password, name} = req.body;

        // проверяем на email
        const isEmailExists = await AccountService.checkForEmailInDb(email);
        if (!isEmailExists) {

            // шифрованный пароль
            const hashPassword = await bcrypt.hash(password, 8);

            // создаём пользователя
            const candidate = {
                email: email,
                name: name,
                password: hashPassword,
                verified: false
            };

            const account = await AccountService.registerAccount(candidate);

            const isEmails = MetaService.isEmails();
            if (isEmails) {
                // генерируем рандомный ключ
                crypto.randomBytes(32, async (error, buffer) => {
                    // получаем токен
                    const token = buffer.toString('hex');

                    // генерируем токен и прикрепляем в БД
                    account.emailToken = token;
                    account.emailTokenExp = Date.now() + 72 * 60 * 60 * 1000;  // жизнь токена 72 часа
                    await account.save();
                    LoggerService.serverLoggerWrite( "info", `auth/register/[POST] - account [${email}, ${name}] created (email was sent);`);
                    res.status(200).json({
                        message: "account created (email was sent)",
                    });

                    // отправляем письмо
                    await EmailService.sendEmail_AccountRegistered(email, token);
                });

            } else {
                await account.save();
                LoggerService.serverLoggerWrite( "info", `auth/register/[POST] - account [${email}, ${name}] created;`);
                res.status(200).json({
                    message: "account created",
                });
            }
        } else {
            LoggerService.serverLoggerWrite( "info", `auth/register/[POST] - account [${email}, ${name}] not created - email already used;`);
            res.status(200).json({
                message: "email already used",
            });
        }

    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/register/[POST] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/confirmAccountEmail/:token", async (req, res) => {
    try {
        const result = await AccountService.confirmAccEmail(req.params.token, Date.now());
        if (result) {
            LoggerService.serverLoggerWrite( "info", `auth/confirmAccountEmail/:token[GET] - account [${result.email}] verified;`);
            res.status(200).json({
                message: `account's email : ${result.email} verified!`
            });
        } else {
            res.status(200).json({
                message: "no account with that token"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/confirmAccountEmail/:token[GET] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
})




// ================= Сброс пароля =================================
router.post("/reset", (req, res) =>{
    try {
        // генерируем рандомный ключ
        crypto.randomBytes(32, async (error, buffer) => {

            // получаем токен
            const token = buffer.toString('hex');
            // проверка что email, сбрасывающий пароль вообще существует как пользователь
            const candidate = await AccountService.readAccountByEmail(req.body.email);

            if (candidate) {
                const isEmails = MetaService.isEmails();
                if (isEmails) {
                    // генерируем токен и прикрепляем в БД
                    candidate.resetToken = token;
                    candidate.resetTokenExp = Date.now() + 60*60*1000;  // жизнь токена 1 час
                    await candidate.save();

                    LoggerService.serverLoggerWrite( "info", `auth/reset/[POST] - account [${candidate.email}] resets password;`);
                    res.status(200).json({
                        message: "reset mail was sent",
                    });
                    // отправляем письмо
                    await EmailService.sendEmail_ChangePassword(candidate.email, token);
                } else {
                    res.status(200).json({
                        message: "cannot reset - isEmail = false",
                    });
                }
            } else {
                res.status(200).json({
                    message: "no account"
                });
            }
        })

    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/reset/[POST] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/confirmReset", async (req, res) => {
    try {
        const result = await AccountService.resetAccountPassword(req.body.userId, req.body.token, Date.now(), req.body.password);

        if (result) {
            LoggerService.serverLoggerWrite( "info", `auth/confirmReset/[POST] - account [${result.email}] confirm reset password;`);
            res.status(200).json({
                message: "password was changed!"
            });

        } else {
            res.status(200).json({
                message: "something goes wrong! try again!"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/confirmReset/[POST] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
})


module.exports = router;