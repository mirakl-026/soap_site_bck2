//  роуты товаров
const { Router } = require("express");
const productController = require("../../controllers/api/productController");

const express = require("express");
let jsonParser = express.json();

const router = Router();


// REST
// POST - CREATE
router.post("/", productController.createProduct);

// GET one by id
router.get("/:id", productController.readProductById);

// GET one by Name
router.get("/name/:name", productController.readProductByName);

// GET ALL (activated)
router.get("/", productController.readAllActivatedProducts);

// GET all in collection by col_Id (activated)
router.get("/inCollection/:id", productController.readAllProductsInCollection_cid);

// GET ALL in collection by col_Name (activated)
router.get("/inCollection/name/:name", productController.readAllProductsInCollection_cname);

// read all products by array of ids
router.post("/get/byArrIds", jsonParser, productController.readAllProducts_arrId);

// PUT - UPDATE (через POST)
router.post("/edit", productController.updateProduct);

// DELETE - DELETE (через POST)
router.post("/delete", productController.deleteProductById);

// Extended
// read all activated products
router.get("/get/full", productController.readAllProducts);

// activate one
router.get("/activate/:id", productController.activateProductById);

// deactivate one
router.get("/deactivate/:id", productController.deactivateProductById);

// add sale
router.post("/addSale", productController.addSaleToProduct);

// remove sale
router.post("/removeSale", productController.removeSaleFromProduct);



module.exports = router;