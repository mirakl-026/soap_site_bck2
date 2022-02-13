// роутинг управления складом
const {Router} = require("express");
const stockController = require("../../controllers/api/stockController");

const router = Router();


// получить всё что есть
router.get("/", stockController.readStock);

// получить склад по конкретному товару
router.get("/:id", stockController.readProductId);

// установить значение для товара
router.post("/setProduct", stockController.setProduct);

// сброс значения для товара
router.post("/resetProduct/:id", stockController.resetProductById);

// увеличить на 1
router.post("/incrementProduct/:id", stockController.incrementProduct);

// увеличить на значение
router.post("/increaseProduct", stockController.increaseProduct);

// уменьшить на 1
router.post("/decrementProduct/:id", stockController.decrementProduct);

// уменьшить на значение
router.post("/decreaseProduct", stockController.decreaseProduct);


module.exports = router;