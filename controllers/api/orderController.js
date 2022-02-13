const OrderService = require("../../services/mongodb/orderService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");

module.exports.confirm = async function (req, res) {
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
        return res.status(200).json(OrderService.createOrderShortViewModel(result));

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/confirmOrder/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.check = async function (req, res) {
    try {
        const result = await OrderService.readOrderByEmailAndOrderId(req.body.email, req.body.orderId);
        if (!result.message) {
            return res.status(200).json(OrderService.createOrderShortViewModel(result));
        } else {
            return res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/check/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.cancel = async function (req, res) {
    try {
        let {email, orderId} = req.body;
        const result = await OrderService.cancelOrder(email, orderId);
        if (!result.message) {

            // логика с платежами

            LoggerService.serverLoggerWrite( "info",`api/order/cancel/[POST] - order [${orderId} cancelled by ${email}];`);
            return res.status(200).json(OrderService.createOrderShortViewModel(result));
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/cancel/[POST] - fail to cancel order [${orderId} by ${email}];`);
            return res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/cancel/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllByEmail = async function (req, res) {
    try {
        const orders = await OrderService.readAllOrdersByEmail(req.body.email);
        let ordersVM = [];
        for (let order of orders) {
            ordersVM.push(OrderService.createOrderViewModel(order));
        }
        return res.status(200).json(ordersVM);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/allByEmail/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

// admin...

module.exports.setStatus = async function (req, res) {
    try {
        const {status, id} = req.body;
        const result = await OrderService.updateOrderStatus(id, status);

        if (!result.message){
            LoggerService.serverLoggerWrite( "info",`api/order/admin/setStatus/[POST] - order ${id} updated ;`);
            return res.status(200).json(OrderService.createOrderViewModel(result));
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/admin/setStatus/[POST] - fail to update order ${id} - ${result.message} ;`);
            return res.status(200).json(result);
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/setStatus/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAll = async function (req, res) {
    try {
        const orders = await OrderService.readAllOrders();
        const ordersVM = [];
        for (let order of orders) {
            ordersVM.push(OrderService.createOrderViewModel(order));
        }

        return res.status(200).json(ordersVM);

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/readAll/[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readById = async function (req, res) {
    try {
        const order = await OrderService.readOrder(req.params.id);
        return res.status(200).json(OrderService.createOrderViewModel(order));

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/read/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.update = async function (req, res) {
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
            return res.status(200).json(OrderService.createOrderViewModel(result));
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/admin/update/[POST] - fail to update order ${req.body._id};`);
            return res.status(200).json(result);
        }


    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/admin/update/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.delete = async function (req, res) {
    try {
        const order = await OrderService.readOrder(req.body._id);
        if (order) {
            await DeleteService.addEntityToDeleted("order", order);
            const result = await OrderService.deleteOrder(req.body._id);
            if (result) {
                LoggerService.serverLoggerWrite( "info",`api/order/delete/[POST] - order ${req.body._id} deleted;`);
                return res.status(200).json({
                    message: `order ${req.body._id} deleted`
                });
            } else {
                return res.status(200).json({message:`cant delete order ${req.body._id}`})
            }
        } else {
            LoggerService.serverLoggerWrite( "info",`api/order/delete/[POST] - order ${req.body._id} NOT deleted;`);
            return res.status(200).json({
                message: `order not deleted`
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/order/delete/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}