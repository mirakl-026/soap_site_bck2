const Order = require("../../models/order");
let ObjectId = require('mongoose').Types.ObjectId;

// Create
module.exports.createOrder = async function (candidate) {
    try {
        const order = new Order({
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            address: candidate.address,
            items: [],
            status: candidate.status,
            cancelled: candidate.cancelled,
            date: candidate.date,
        });

        if (candidate.items && candidate.items.length) {
            for (let item of candidate.items) {
                order.items.push({
                    product: {
                        name: item.product.name,
                        price: item.product.price
                    },
                    count: item.count
                })
            }
        }

        await order.save();
        return order;

    } catch (e) {
        throw e;
    }
}

// Read
module.exports.readOrder = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Order.findById(id);
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}

// Update
module.exports.updateOrder = async function (candidate) {
    try {
        let order = await Order.findById(candidate._id);
        if(order) {
            order.name = candidate.name;
            order.email = candidate.email;
            order.phone = candidate.phone;
            order.address = candidate.address;

            if (candidate.items && candidate.items.length) {
                order.items = [];
                for (let item of candidate.items) {
                    order.items.push({
                        product: {
                            name: item.product.name,
                            price: item.product.price
                        },
                        count: item.count
                    })
                }
            }

            order.status = candidate.status;
            order.cancelled = candidate.cancelled;
            order.date = candidate.date;

            await order.save();
            return order;

        } else {
            return {message: "no order by id"};
        }
    } catch (e) {
        throw e;
    }
}

// Delete
module.exports.deleteOrder = async function (id) {
    try {
        if (ObjectId.isValid(id)) {
            return await Order.deleteOne({_id: id});
        } else {
            return null;
        }

    } catch (e) {
        throw e;
    }
}




// Additional
module.exports.createOrderViewModel = function(order) {
    try {
        // ViewModel
        let isEmpty = true;
        // проверка на пустой объект
        for(let i in order)
            isEmpty = false;   // не пустой

        let orderVM = {};
        if(order && !isEmpty) {
            orderVM._id = order._id;

            orderVM.name = order.name;
            orderVM.email = order.email;
            orderVM.phone = order.phone;
            orderVM.address = order.address;

            orderVM.items = [];
            if (order.items && order.items.length) {
                for (let item of order.items) {
                    orderVM.items.push({
                        product: {
                            name: item.product.name,
                            price: item.product.price
                        },
                        count: item.count
                    })
                }
            }

            orderVM.status = order.status;
            orderVM.cancelled = order.cancelled;

            orderVM.date = order.date;
        }

        return orderVM;

    } catch (e) {
        throw e;
    }
}

module.exports.createOrderShortViewModel = function (order) {
    try {
        // ViewModel
        let isEmpty = true;
        // проверка на пустой объект
        for(let i in order)
            isEmpty = false;   // не пустой

        let orderVM = {};
        if(order && !isEmpty) {
            orderVM.name = order.name;
            orderVM.email = order.email;
            orderVM.phone = order.phone;
            orderVM.address = order.address;

            orderVM.items = [];
            if (order.items && order.items.length) {
                for (let item of order.items) {
                    orderVM.items.push({
                        product: {
                            name: item.product.name,
                            price: item.product.price
                        },
                        count: item.count
                    })
                }
            }

            orderVM.status = order.status;
            orderVM.cancelled = order.cancelled;

            orderVM.date = order.date;
        }

        return orderVM;
    } catch (e) {
        throw e;
    }
}

module.exports.readAllOrders = async function () {
    try {
        return await Order.find({});

    } catch (e) {
        throw e;
    }
}


module.exports.readAllOrdersByEmail = async function (email) {
    try {
        return await Order.find({email: email});

    } catch (e) {
        throw e;
    }
}

module.exports.readOrderByEmailAndOrderId = async function (email, orderId) {
    try {
        if (ObjectId.isValid(orderId)) {
            const order = await Order.findById(orderId);
            if (order) {
                if (order.email === email) {
                    return order;
                } else {
                    return {message:"wrong email"};
                }
            } else {
                return {message:"no order by id"};
            }
        } else {
            return { message: "wrong id"};
        }
    } catch (e) {
        throw e;
    }
}

module.exports.updateOrderStatus = async function(orderId, newStatus) {
    try {
        if (ObjectId.isValid(orderId)) {
            let order = await Order.findById(orderId);
            if (order) {
                order.status = newStatus;

                await order.save();

                return order;
            } else {
                return {message: "no order by id"};
            }
        } else {
            return {message:"wrong id"};
        }
    } catch (e) {
        throw e;
    }
}

// отмена заказа
module.exports.cancelOrder = async function (email, orderId) {
    try {
        if (ObjectId.isValid(orderId)) {
            const order = await Order.findById(orderId);
            if (order) {
                if (order.email === email) {
                    order.cancelled = true;
                    await order.save();

                    return order;
                } else {
                    return {message: "wrong email"};
                }
            } else {
                return {message: "no order by id"};
            }
        } else {
            return {message: "wrong id"};
        }

    } catch (e) {
        throw e;
    }
}