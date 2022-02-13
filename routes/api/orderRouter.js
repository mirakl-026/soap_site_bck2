// API работы с заказами
const {Router} = require("express");
const orderController = require("../../controllers/api/orderController");

const router = Router();


// оформление заказа
router.post("/confirmOrder", orderController.confirm);

// получить заказ по id и email
router.post("/check", orderController.check);

// Отменить заказ по id и email
router.post("/cancel", orderController.cancel);

// получить все заказы по email (аккаунт)
router.post("/allByEmail/", orderController.readAllByEmail);


// admin...
// обновить статус заказа
router.post("/admin/setStatus", orderController.setStatus);

// read
router.get("/admin/read/:id", orderController.readById);

// readAll
router.get("/admin/readAll", orderController.readAll);

// update
router.post("/admin/update", orderController.update);

// delete
router.post("/admin/delete", orderController.delete);


module.exports = router;