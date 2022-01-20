// API работы с аккаунтами
const express = require("express");
const AccountService = require("../../services/mongodb/accountService");
const OrderService = require("../../services/mongodb/orderService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");
const bcrypt = require("bcryptjs");

const acc_auth = require("../../middleware/checkAccMW");
const adm_auth = require("../../middleware/checkAdmMW");

let jsonParser = express.json();



const router = express.Router();


// GET - Read
// информацию об аккаунте может получить авторизованный пользователь
router.get("/:id", acc_auth, async (req, res) => {
    try {
        const account = await AccountService.readAccountById(req.params.id);
        const accountViewModel = AccountService.createAccountViewModel(account);

        // ответ
        res.status(200).json(accountViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/account/:id[GET] error: ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// информацию об аккаунте может получить админ
router.get("/admin/:id", adm_auth, async (req, res) => {
    try {
        const account = await AccountService.readAccountById(req.params.id);
        const accountViewModel = AccountService.createAccountViewModel(account);

        // ответ
        res.status(200).json(accountViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/account/admin/:id[GET] error: ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



// DELETE - Delete
router.post("/delete", adm_auth, async (req, res) => {
    try {
        const account = await AccountService.readAccountById(req.body._id);
        if (account) {
            await DeleteService.addEntityToDeleted("account", account);
            const result = await AccountService.deleteAccountById(req.body._id);
            if (result) {
                LoggerService.serverLoggerWrite("info", `api/account/delete/[POST] account [${req.body._id}] deleted;`);
                res.status(200).json({
                    deletedId: req.body._id
                });
            } else {
                res.status(200).json({message:`cant delete account ${req.body._id}`});
            }
        } else {
            LoggerService.serverLoggerWrite("info", `api/account/delete/[POST] account [${req.body._id}] NOT deleted;`);
            res.status(200).json({
                message: "no account by this id"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/account/delete/[POST] error: ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// Additional
// получение мета-данных аккаунта - если сессия авторизована, можно по API получить - email и имя
router.get("/get/meta", acc_auth, async (req, res) => {
    try {
        const account = await AccountService.readAccountById(req.session.account._id);
        let answer = {};

        if (account) {
            answer.email = account.email;
            answer.name = account.name;
        }
        res.status(200).json(answer);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/account/get/meta/[GET] error: ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// информацию обо всех аккаунтах может получить только админ
router.get("/admin/get/all", adm_auth, async (req, res) => {
    try {
        const accounts = await AccountService.readAllAccounts();
        const accountsViewModel = [];
        for (let account of accounts) {
            accountsViewModel.push(AccountService.createAccountViewModel(account));
        }
        res.status(200).json(accountsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/account/get/all/[GET] error: ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// информация обо всех аккаунтах, но поверхностная VM
router.get("/admin/get/allLight", adm_auth, async (req, res) => {
    try {
        const accounts = await AccountService.readAllAccounts();

        const accountsViewModel = [];

        for (let account of accounts) {
            accountsViewModel.push(AccountService.createAccountShortViewModel(account));
        }

        res.status(200).json(accountsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/account/get/allLight/[GET] error: ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



// =================== Работа с корзиной ===================================

// Работса с корзиной аккаунта через AJAX
// запись данных из LocalStorage в аккаунт - бд - корзину
router.post("/cart/sendCart/", jsonParser, acc_auth, async (req, res) => {
    try {
        const result = await AccountService.syncCartFromLSData(req.session.account._id, req.body);
        res.status(200).json(result);

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
})



// получение корзины
router.get("/cart/readCart", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.readCartVMByAccId(req.session.account._id);
        res.status(200).json(result);

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
})

// добавление товара в корзину
router.post("/cart/addToCart/:id", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.addProductToCart(req.session.account._id, req.params.id);
        res.status(200).json(result);

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// удаление товара из корзины
router.post("/cart/removeFromCart/:id", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.removeFromCart(req.session.account._id, req.params.id);
        res.status(200).json(result);

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// очистка корзины
router.post("/cart/clearCart", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.clearCart(req.session.account._id);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// оформление заказа
router.post("/cart/confirmOrder", acc_auth, async (req, res) => {
    try {
        const orderTemplate = await AccountService.createOrderTemplateFromAccCart(req.session.account._id);
        if(orderTemplate.message) {
            // при создании шаблона произошла ошибка:
            res.status(200).json(orderTemplate);
        } else {
            const order = await OrderService.createOrder(orderTemplate);
            res.status(200).json(OrderService.createOrderViewModel(order));
        }
    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});





// ========================== Работа с закзами =============================
// получить все заказы аккаунта
router.get("/order/getAllOrders", acc_auth, async (req, res) => {
    try {
        const ordersIds = await AccountService.getOrdersFromAccount(req.session.account._id);
        if(ordersIds.message) {
            // ошибка по аккаунту
            res.status(200).json(ordersIds);

        } else {
            let ordersVM = [];
            for (let orderId of ordersIds) {
                const order = await OrderService.readOrder(orderId);
                ordersVM.push(OrderService.createOrderViewModel(order));
            }
            res.status(200).json(ordersVM);

        }
    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// получить конкретный заказ аккаунта
router.get("/order/getOrder/:id", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.getOrderFromAccount(req.session.account._id, req.params.id);
        if (result.message) {
            res.status(200).json(result);   // ошибка по accId или orderId

        } else {
            res.status(200).json(OrderService.createOrderViewModel(result));

        }
    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



// ========================== Работа со списком желаемого ============================
// получить список
router.get("/wishlist/getWishlist", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.getAccWishlist(req.session.account._id);
        res.status(200).json(result);

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// добавить товар в список
router.post("/wishlist/addToWishlist/:id", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.addToWishlist(req.session.account._id, req.params.id);
        res.status(200).json(result);

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// убрать товар из списка
router.post("/wishlist/removeFromWishlist", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.removeFromWishlist(req.session.account._id, req.params.id);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// очистить список
router.post("/wishlist/clearWishlist", acc_auth, async (req, res) => {
    try {
        const result = await AccountService.clearWishlist(req.session.account._id);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

module.exports = router;