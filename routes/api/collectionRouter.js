// Роуты коллекций
const {Router} = require("express");
const collectionController = require("../../controllers/api/collectionController");

const router = Router();

// POST - CREATE
router.post("/", collectionController.createCollection);

// GET - READ
router.get("/:id",  collectionController.readCollectionById);

// GET ALL
router.get("/", collectionController.readAllCollections);

// PUT - UPDATE (через POST)
router.post("/edit", collectionController.updateCollection);

// DELETE - DELETE (через POST)
router.post("/delete", collectionController.deleteCollection);

// считать коллекцию по имени
router.get("/name/:name", collectionController.readCollectionByName);

// получить массив имён всех коллекций
router.get("/all/names", collectionController.getAllCollectionNames);

// получить ссылку на картинку коллекции по её id
router.get("/imgRef/:id", collectionController.getCollectionImageReferenceById);

// получить ссылку на картинку коллекции по её имени
router.get("/imgRef/name/:name", collectionController.getCollectionImageReferenceByName);

// add sale
router.post("/addSale", collectionController.addSaleToCollection);

// remove sale
router.post("/removeSale", collectionController.removeSaleFromCollection);


module.exports = router;