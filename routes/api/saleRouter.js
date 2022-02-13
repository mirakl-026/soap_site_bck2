// роутер управления скидками
const {Router} = require("express");
const saleController = require("../../controllers/api/saleController");


const router = Router();

// REST
// POST - CREATE
router.post("/", saleController.createSale);

// GET - READ
router.get("/", saleController.readAllSales);

//
router.get("/:id", saleController.readSaleById);

// PUT - UPDATE
router.post("/edit", saleController.updateSale);

// DELETE - DELETE
router.post("/delete", saleController.deleteSale);


module.exports = router;