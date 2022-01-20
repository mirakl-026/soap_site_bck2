// роуты
const {Router} = require("express");
const ProductService = require("../services/mongodb/productService");
const StaticPageService = require("../services/mongodb/staticPageService");
const LoggerService = require("../services/loggerService");
const Account = require("../models/account");



const router = Router();

// индекс
router.get("/", (req, res) => {
    res.render("index", {
        title: "Главная страница",
        isHome: true
    });
});

// магазин
router.get("/shop", async (req, res) => {
    try {
        const allProducts = await ProductService.readAllProducts();

        let allProductsViewModel = [];
        for (const product of allProducts) {
            allProductsViewModel.push(ProductService.createViewModelFromProduct(product));
        }

        res.render("shop", {
            title: "Магазин ",
            isShop: true,
            allProductsViewModel
        });

    } catch (e) {
        console.log(e);
    }
});

// корзина
router.get("/cart", async (req, res) => {
    try {
        res.render("cart", {
            title: "Оформление заказа",
            isCartOrder: true
        })
    } catch (e) {
        console.log(e);
    }
});


// заказы
// проверить заказ
router.get("/checkOrder", async (req, res) => {
    try {
        res.render("checkOrder", {
            title: "Проверка заказа",
        })
    } catch (e) {
        console.log(e);
    }
});

// отменить заказ
router.get("/cancelOrder", async (req, res) => {
    try {
        res.render("cancelOrder", {
            title: "Отмена заказа",
        })
    } catch (e) {
        console.log(e);
    }
});





// авторизация
router.get('/auth/login', async (req, res) => {
    try {
        res.render('loginRegister', {
            title: 'Авторизация',
            isLogin: true
        });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/login/[GET] - ${e.message};`);
        res.status(500).json({message: "Server error"});
    }
});


router.get('/auth/admin/login', async (req, res) => {
    try {
        res.render('admin/login', {
            title: 'Администратор',
            isLogin: true
        });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/admin/login/[GET] - ${e.message};`);
        res.status(500).json({message: "Server error"});
    }
});


router.get('/auth/register', async (req, res) => {
    try {
        res.render('loginRegister', {
            title: 'Регистрация пользователя',
            isRegister: true
        });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `auth/register/[GET] - ${e.message};`);
        res.status(500).json({message: "Server error"});
    }
});









// страницы
// о нас
router.get("/about", async(req, res) => {
    const content = await StaticPageService.readStaticPageContentByName("about");
    res.render("about", {
        title: "О нас",
        content
    });
});

// контакты
router.get("/contacts", async(req, res) => {
    const content = await StaticPageService.readStaticPageContentByName("contacts");
    res.render("contacts", {
        title: "Контакты",
        content
    });
});

// доставка
router.get("/delivery", async(req, res) => {
    const content = await StaticPageService.readStaticPageContentByName("delivery");
    res.render("delivery", {
        title: "Доставка",
        content
    });
});

// партнёрство
router.get("/partnership", async(req, res) => {
    const content = await StaticPageService.readStaticPageContentByName("partnership");
    res.render("partnership", {
        title: "Партнерство",
        content
    });
});

// секция вопрос-ответ
router.get("/qasection", async(req, res) => {
    const content = await StaticPageService.readStaticPageContentByName("qasection");
    res.render("qasection", {
        title: "Вопрос-ответ",
        content
    });
});

// секция сертификаты
router.get("/sertificates", async(req, res) => {
    const content = await StaticPageService.readStaticPageContentByName("sertificates");
    res.render("qasection", {
        title: "Вопрос-ответ",
        content
    });
});

// отказ доступа
router.get("/denied", (req, res) => {
    res.render("denied", {
        title: "Access denied"
    });
});


// сброс пароля шаг 1
router.get("/resetPassword", (req, res) => {
    res.render("resetPassword", {
        title: "Сброс пароля"
    });
});

// сброс пароля шаг 2
router.get("/resetPasswordS2/:token", async (req, res) => {
    if (!req.params.token) {
        return res.status(200).json({
            message: "S2: no token..."
        });
    }

    try {
        const account = await Account.findOne({
            resetToken: req.params.token,
            resetTokenExp: {
                $gt: Date.now()
            }
        });

        if (!account) {
            return res.status(200).json({
                message: "no account for password reset..."
            });
        } else {
            res.render("resetPasswordS2", {
                title: "Восстановление доступа",
                userId: account._id.toString(),
                token: req.params.token
            });
        }

    } catch(e) {
        console.log(e);
    }
});

module.exports = router;