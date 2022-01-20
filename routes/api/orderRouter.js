// API работы с заказами
const {Router} = require("express");
const OrderService = require("../../services/mongodb/orderService");
//const MetaService = require("../../services/mongodb/metaService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");

const acc_auth = require("../../middleware/checkAccMW");
const adm_auth = require("../../middleware/checkAdmMW");
const {createOrderViewModel} = require("../../services/mongodb/orderService");

const router = Router();

/*
// создаём объект логгера
let orderLogger = LoggerService.createCustomLogger("/logs/order.log");

// функция записи в этот логгер
function orderLoggerWrite (type, message) {
    try {
        // Логгер будет записывать только если в meta isLog установлено true
        if (MetaService.isLog()) {
            if (type === "info")
                orderLogger.info(message);
            else if (type === "error")
                orderLogger.error(message);
        }
    } catch (e) {
        console.log(e);
    }
}
*/


// оформление заказа
router.post("/confirmOrder", async (req, res) => {
    try {
        const order = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,

            items: JSON.parse(req.body.cart).items,
            status: "Заказ оформлен",
            cancelled: false,

            date: Date.now().toLocaleString(),
        }

        const result = await OrderService.createOrder(order);

        // логика с платежами

        LoggerService.serverLoggerWrite( "info",`api/order/confirmOrder/[POST] - order [${result._id} for ${result.email}] created;`);
        res.status(200).json(OrderService.createOrderShortViewModel(result));

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/confirmOrder/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// получить заказ по id и email
router.post("/check", async (req, res) => {
   try {
        const result = await OrderService.readOrderByEmailAndOrderId(req.body.email, req.body.orderId);
        if (!result.message) {
            res.status(200).json(OrderService.createOrderShortViewModel(result));
        } else {
            res.status(200).json(result);
        }

   } catch (e) {
       LoggerService.serverLoggerWrite( "error",`api/order/check/[POST] - ${e.message};`);
       res.status(500).json({
           message: "server error:" + e.message
       });
   }
});

// Отменить заказ по id и email
router.post("/cancel", async (req, res) => {
   try {
       let {email, orderId} = req.body;
       const result = await OrderService.cancelOrder(email, orderId);
       if (!result.message) {

           // логика с платежами

           LoggerService.serverLoggerWrite( "info",`api/order/cancel/[POST] - order [${orderId} cancelled by ${email}];`);
           res.status(200).json(OrderService.createOrderShortViewModel(result));
       } else {
           LoggerService.serverLoggerWrite( "info",`api/order/cancel/[POST] - fail to cancel order [${orderId} by ${email}];`);
           res.status(200).json(result);
       }

   } catch (e) {
       LoggerService.serverLoggerWrite( "error",`api/order/cancel/[POST] - ${e.message};`);
       res.status(500).json({
           message: "server error:" + e.message
       });
   }
});


// получить все заказы по email (аккаунт)
router.post("/allByEmail/", acc_auth, async (req, res) => {
    try {
        const orders = await OrderService.readAllOrdersByEmail(req.body.email);
        let ordersVM = [];
        for (let order of orders) {
            ordersVM.push(OrderService.createOrderViewModel(order));
        }
        res.status(200).json(ordersVM);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/allByEmail/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/admin/allByEmail/", adm_auth, async (req, res) => {
    try {
        const orders = await OrderService.readAllOrdersByEmail(req.body.email);
        let ordersVM = [];
        for (let order of orders) {
            ordersVM.push(OrderService.createOrderViewModel(order));
        }
        res.status(200).json(ordersVM);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/allByEmail/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// для админа
// обновить статус заказа
router.post("/admin/setStatus", adm_auth, async (req, res) => {
    try {
        const {status, id} = req.body;
        const result = await OrderService.updateOrderStatus(id, status);

        if (!result.message){
            LoggerService.serverLoggerWrite( "info",`api/order/admin/setStatus/[POST] - order ${id} updated ;`);
            res.status(200).json(createOrderViewModel(result));
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/admin/setStatus/[POST] - fail to update order ${id} - ${result.message} ;`);
            res.status(200).json(result);
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/setStatus/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



// create
router.post("/admin/create", adm_auth, async (req, res) => {
    try {
        const candidate = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,

            items: JSON.parse(req.body.items),

            status: "Заказ создан",
            cancelled: false,

            date: Date.now().toLocaleString(),
        }

        const result = await OrderService.createOrder(candidate);

        LoggerService.serverLoggerWrite( "info",`api/order/admin/create/[POST] - order ${result._id} created by admin;`);
        res.status(200).json(OrderService.createOrderViewModel(result));

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/create/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// read
router.get("/admin/read/:id", adm_auth, async (req, res) => {
    try {
        const order = await OrderService.readOrder(req.params.id);
        res.status(200).json(OrderService.createOrderViewModel(order));

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/read/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// readAll
router.get("/admin/readAll", adm_auth, async (req, res) => {
    try {
        const orders = await OrderService.readAllOrders();
        const ordersVM = [];
        for (let order of orders) {
            ordersVM.push(OrderService.createOrderViewModel(order));
        }

        res.status(200).json(ordersVM);

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/readAll/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// update
router.post("/admin/update", adm_auth, async (req, res) => {
    try {
        const candidate = {
            _id: req.body._id,

            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,

            items: JSON.parse(req.body.items),
            status: req.body.status,
            cancelled: req.body.cancelled,

            date: req.body.date,
        }

        const result = await OrderService.updateOrder(candidate);

        if (!result.message) {
            LoggerService.serverLoggerWrite( "info",`api/order/admin/update/[POST] - order ${req.body._id} updated;`);
            res.status(200).json(OrderService.createOrderViewModel(result));
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/admin/update/[POST] - fail to update order ${req.body._id};`);
            res.status(200).json(result);
        }


    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/update/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// delete
router.post("/admin/delete", adm_auth, async (req, res) => {
    try {
        const order = await OrderService.readOrder(req.body._id);
        if (order) {
            await DeleteService.addEntityToDeleted("order", order);
            const result = await OrderService.deleteOrder(req.body._id);
            if (result) {
                LoggerService.serverLoggerWrite( "info",`api/order/delete/[POST] - order ${req.body._id} deleted;`);
                res.status(200).json({
                    message: `order ${req.body._id} deleted`
                });
            } else {
                res.status(200).json({message:`cant delete order ${req.body._id}`})
            }
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/delete/[POST] - order ${req.body._id} NOT deleted;`);
            res.status(200).json({
                message: `order not deleted`
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/delete/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


module.exports = router;