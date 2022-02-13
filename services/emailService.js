const mailSettings = require("../mail/mailSettings");
const nodemailer = require("nodemailer");   //Nodemailer
let transporter;

// инициализация сервиса
module.exports.initEmailTransport = function () {
    try {
        transporter = nodemailer.createTransport({
            host: mailSettings.MAIL_HOST.host,
            port: mailSettings.MAIL_HOST.port,
            secure: mailSettings.MAIL_HOST.secure, // true for 465, false for other ports
            auth: {
                user: mailSettings.MAIL_HOST.auth.user, // generated ethereal user
                pass: mailSettings.MAIL_HOST.auth.pass, // generated ethereal password
            },
        });
        console.log("email transport initialized...");
    } catch (e) {
        throw e;
    }
}



// Работа с письмами
// ====================================== регистрация аккаунта =======================================================
// письмо после регистрации и письмо подтверждения email - объеденены, отдельное подтверждение по истечению срока -
// confirmEmail
function getDefaultRegisterEmail(email, token) {
    return {
        to: email,
        from: mailSettings.EMAIL_FROM,
        subject: "Аккаунт зарегестрирован",
        text: "register email",
        html: `
            <h1>Пользователь ${email} зарегестрирован!</h1>
            <p>Подтвердите свой e-mail — так будет удобнее управлять учётной записью.</p>
            <p> <a href="${mailSettings.BASE_URL}/auth/confirmAccountEmail/${token}">Подтвердить!</a></p>
            <hr />
            <p>Приятных покупок!</p>
            <a href="${mailSettings.BASE_URL}">Feel Lab</a>
        `,
    }
}

// регистрация аккунта
module.exports.sendEmail_AccountRegistered = async function (email, token) {
    try {
        // send mail with defined transport object
        let info = await transporter.sendMail(getDefaultRegisterEmail(email, token));
        //console.log("Message sent: %s", info.messageId);
        return true;

    } catch (e) {
        throw e;
    }
}




//====================================== подтверждение email пользователя ========================================
// письмо подтверждающее email пользователя
function getDefaultConfirmEmail(email, token) {
    return {
        to: email,
        from: mailSettings.EMAIL_FROM,
        subject: "Подтверждение email",
        text: "confirm email",
        html:  `
            <h1>Подтверждение email</h1>
            <p>Подтвердите свой e-mail — так будет удобнее управлять учётной записью.</p>
            <p> <a href="${mailSettings.BASE_URL}/confirmAccountEmail/${token}">Подтвердить!</a></p>

            <hr />
            <a href="${mailSettings.BASE_URL}">Feel Lab</a>
        `,
    }
}

// подтверждение пароля
module.exports.sendEmail_ConfirmRegisteredEmail = async function (email, token) {
    try {
        // send mail with defined transport object
        let info = await transporter.sendMail(getDefaultConfirmEmail(email, token));
        //console.log("Message sent: %s", info.messageId);
        return true;

    } catch (e) {
        throw e;
    }
}





// ======================================== изменение пароля аккаунта ==========================
// форма письма, отправляемого при сбросе пароля:
function getDefaultResetPasswordEmail (email, token) {
    return {
        to: email,
        from: mailSettings.EMAIL_FROM,
        subject: "Изменение пароля",
        text: "reset password",
        html:  `
            <h1>Вы хотите изменить пароль?</h1>
            <p>Если нет, то проигнорируйте данное письмо</p>
            <p>Иначе нажмите на ссылку ниже:</p>
            <p> <a href="${mailSettings.BASE_URL}/resetPasswordS2/${token}">Изменить пароль</a></p>

            <hr />
            <a href="${mailSettings.BASE_URL}">Feel Lab</a>
        `,
    }
}

// изменение пароля
module.exports.sendEmail_ChangePassword = async function (email, token) {
    try {
        let info = await transporter.sendMail(getDefaultResetPasswordEmail(email, token));
        //console.log("Message sent: %s", info.messageId);
        return true;

    } catch (e) {
        throw e;
    }
}





// ======================================== подтверждение заказа ==========================
// письмо подтверждающее заказ пользователя
function getDefaultOrderConfirmEmail (email, orderId) {
    return {
        to: email,
        from: mailSettings.EMAIL_FROM,
        subject: "Ваш заказ оформлен",
        text: "order confirm",
        html:  `
            <h1>Ваш заказ оформлен!</h1>
            <p>ID заказа: ${orderId}</p>
            <p>Проверить статус заказа вы можете по ссылке, указав свой email и ID заказа:</p>
            <p> <a href="#">Проверить статус</a></p>

            <hr />
            <a href="${mailSettings.BASE_URL}">Feel Lab</a>
        `,
    }
}

module.exports.sendEmail_OrderConfirm = async function (email, orderId) {
    try {
        let info = await transporter.sendMail(getDefaultOrderConfirmEmail(email, orderId));
        //console.log("Message sent: %s", info.messageId);
        return true;

    } catch (e) {
        throw e;
    }
}