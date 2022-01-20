//  роуты товаров
const { Router } = require("express");
const ProductService = require("../../services/mongodb/productService");
const CollectionService = require("../../services/mongodb/collectionService");
const StockService = require("../../services/mongodb/stockService");
//const MetaService = require("../../services/mongodb/metaService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");
const SearchService = require("../../services/mongodb/searchService");

const adm_auth = require("../../middleware/checkAdmMW");
const express = require("express");

const router = Router();

let jsonParser = express.json();

/*
// создаём объект логгера
let productLogger = LoggerService.createCustomLogger("/logs/product.log");

// функция записи в этот логгер
function productLoggerWrite (type, message) {
    try {
        // Логгер будет записывать только если в meta isLog установлено true
        if (MetaService.isLog()) {
            if (type === "info")
                productLogger.info(message);
            else if (type === "error")
                productLogger.error(message);
        }
    } catch (e) {
        console.log(e);
    }
}
*/

// REST
// POST - CREATE
router.post("/", adm_auth, async (req, res) => {

    try {
        let { name, collectionId, price, description, isActive, images } = req.body;

        const isProductExists = await ProductService.checkForProductInDb(name);
        if (!isProductExists) {
            let _collectionId;
            let collection = await CollectionService.readCollectionById(collectionId);
            if (collection)
                _collectionId = collection._id;

            let isActiveT = isActive ? true : false;

            let imagesAsArray;
            if (images) {
                imagesAsArray = JSON.parse(images);
            }

            const candidate = {
                name: name,
                collectionId: _collectionId,
                price: price,
                description: description,
                isActive: isActiveT,
                images: imagesAsArray
            };

            // создаётся товар в бд
            const result = await ProductService.createProduct(candidate);

            // обновляем поля products в коллекциях, так как создан товар
            await CollectionService.refreshProductsInCollections();

            // обновить поисковую информацию
            await SearchService.updateSearchDataFromProduct(result);

            // обновить склад
            await StockService.refreshStock();

            LoggerService.serverLoggerWrite("info", `api/product/[POST] - product ${name} created;`);
            // редирект
            res.status(201).json(ProductService.createViewModelFromProduct(result));

        } else {
            LoggerService.serverLoggerWrite("info", `api/product/[POST] - product ${name} already exists;`);
            res.status(200).json({
                message: "product already exists"
            })
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});




// GET one by id
router.get("/:id", async (req, res) => {
    try {

        // получение товара по id
        const product = await ProductService.readProductById(req.params.id);

        // создание ViewModel
        const productViewModel = ProductService.createViewModelFromProduct(product);

        // формирование ответа
        res.status(200).json(productViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// GET one by Name
router.get("/name/:name", async (req, res) => {
    try {
        const product = await ProductService.readProductByName(req.params.name);
        const productViewModel = ProductService.createViewModelFromProduct(product);
        res.status(200).json(productViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/name/:name[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// GET ALL (activated)
router.get("/", async (req, res) => {
    try {
        const products = await ProductService.readAllActivatedProducts();

        const productsViewModel = [];

        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }

        res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// GET all in collection by col_Id (activated)
router.get("/inCollection/:id", async (req, res) => {
    try {
        const products = await ProductService.getActivatedProductsByCollectionId(req.params.id);
        const productsViewModel = [];
        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }
        res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/inCollection/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// GET ALL in collection by col_Name (activated)
router.get("/inCollection/name/:name", async (req, res) => {
    try {
        const products = await ProductService.getActivatedProductsByCollectionName(req.params.name);
        const productsViewModel = [];
        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }
        res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/inCollection/name/:name[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// read all products by array of ids
router.post("/get/byArrIds", jsonParser, async (req, res) => {
    try {
        const { arrIds } = req.body;
        const products = await ProductService.getProductsByArrayIds(arrIds);

        let productsVM = [];
        for (let productId of arrIds) {
            const idx = products.map(product => product._id.toString()).indexOf(productId.toString());
            if (idx >= 0)
                productsVM.push(ProductService.createViewModelFromProduct(products[idx]));
        }

        // if (products && products.length) {
        //     for (let product of products) {
        //         productsVM.push(ProductService.createViewModelFromProduct(product));
        //     }
        // }
        res.status(200).json(productsVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/get/byArrIds[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});








// PUT - UPDATE (через POST)
router.post("/edit", adm_auth, async (req, res) => {
    try {
        let { _id, name, collectionId, price, description, isActive, images } = req.body;

        let _collectionId;
        let collection = await CollectionService.readCollectionById(collectionId);
        if (collection)
            _collectionId = collection._id;

        let isActiveT = isActive ? true : false;

        let imagesAsArray;
        if (images) {
            imagesAsArray = JSON.parse(images);
        }


        const candidate = {
            _id: _id,
            name: name,
            collectionId: _collectionId,
            price: price,
            description: description,
            isActive: isActiveT,
            images: imagesAsArray
        }

        const result = await ProductService.updateProduct(candidate);

        //обновляем коллекции
        await CollectionService.refreshProductsInCollections();

        // обновить поисковую иннформацию
        await SearchService.updateSearchDataFromProduct(result);

        LoggerService.serverLoggerWrite("info", `api/product/edit/[POST] - product ${_id} edited;`);
        res.status(200).json(ProductService.createViewModelFromProduct(result));
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/edit/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// DELETE - DELETE (через POST)
router.post("/delete", adm_auth, async (req, res) => {
    try {
        const product = await ProductService.readProductById(req.body._id);
        if (product) {
            await DeleteService.addEntityToDeleted("product", product);

            // удалить поисковую информацию
            await SearchService.deleteSearchDataByProductId(product._id);

            const result = await ProductService.deleteProductById(req.body._id);
            if (result) {
                // из-за того, что удалён товар - нужно обновлять данные в коллекциях
                await CollectionService.refreshProductsInCollections();
                // обновить склад
                await StockService.refreshStock();

                LoggerService.serverLoggerWrite("info", `api/product/delete/[POST] - product ${req.body._id} deleted!;`);
                res.status(200).json({ deletedId: req.body._id });
            } else {
                res.status(200).json({message:`cant delete product ${req.body._id}`})
            }
        } else {
            LoggerService.serverLoggerWrite("info", `api/product/delete/[POST] - product ${req.body._id} NOT deleted!;`);
            res.status(200).json({
                message: "no product"
            });

        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/delete/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});




// Extended
// read all activated products
router.get("/get/full", adm_auth, async (req, res) => {
    try {
        const products = await ProductService.readAllProducts();
        const productsViewModel = [];
        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }
        res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/get/full/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// activate one
router.get("/activate/:id", adm_auth, async (req, res) => {
    try {
        const result = await ProductService.activateProduct(req.params.id);

        // обновить поисковую информацию
        const product = await ProductService.readProductById(req.params.id);
        await SearchService.updateSearchDataFromProduct(product);

        LoggerService.serverLoggerWrite("info", `api/product/activate/:id[GET] - product ${req.params.id} activated;`);
        res.status(200).json(result);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/activate/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// deactivate one
router.get("/deactivate/:id", adm_auth, async (req, res) => {
    try {
        const result = await ProductService.deactivateProduct(req.params.id);

        // удалить поисковую информацию
        await SearchService.deleteSearchDataByProductId(req.params.id);

        LoggerService.serverLoggerWrite("info", `api/product/activate/:id[GET] - product ${req.params.id} deactivated;`);
        res.status(200).json(result);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/deactivate/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



// add sale
router.post("/addSale", adm_auth, async (req, res) => {
    try {
        let {productId, saleId} = req.body;
        const result = await ProductService.addSaleToProduct(productId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/product/addSale/[POST] - sale ${saleId} added to product ${productId};`);
            res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/product/addSale/[POST] - sale ${saleId}, product ${productId} - ${result.message};`);
            res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/addSale/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// remove sale
router.post("/removeSale", adm_auth, async (req, res) => {
    try {
        let {productId, saleId} = req.body;
        const result = await ProductService.removeSaleFromProduct(productId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/product/removeSale/[POST] - sale ${saleId} removed from product ${productId};`);
            res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/product/removeSale/[POST] - sale ${saleId}, product ${productId} - ${result.message};`);
            res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/removeSale/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



module.exports = router;