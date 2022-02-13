const ProductService = require("../../services/mongodb/productService");
const CollectionService = require("../../services/mongodb/collectionService");
const StockService = require("../../services/mongodb/stockService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");
const SearchService = require("../../services/mongodb/searchService");


module.exports.createProduct = async function (req, res) {

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
            return res.status(201).json(ProductService.createViewModelFromProduct(result));

        } else {
            LoggerService.serverLoggerWrite("info", `api/product/[POST] - product ${name} already exists;`);
            return res.status(200).json({
                message: "product already exists"
            })
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readProductById = async function (req, res) {
    try {

        // получение товара по id
        const product = await ProductService.readProductById(req.params.id);

        // создание ViewModel
        const productViewModel = ProductService.createViewModelFromProduct(product);

        // формирование ответа
        return res.status(200).json(productViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readProductByName = async function (req, res) {
    try {
        const product = await ProductService.readProductByName(req.params.name);
        const productViewModel = ProductService.createViewModelFromProduct(product);
        return res.status(200).json(productViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/name/:name[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllProducts = async function (req, res) {
    try {
        const products = await ProductService.readAllActivatedProducts();

        const productsViewModel = [];

        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }

        return res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllProductsInCollection_cid = async function (req, res) {
    try {
        const products = await ProductService.getActivatedProductsByCollectionId(req.params.id);
        const productsViewModel = [];
        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }
        return res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/inCollection/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllProductsInCollection_cname = async function (req, res) {
    try {
        const products = await ProductService.getActivatedProductsByCollectionName(req.params.name);
        const productsViewModel = [];
        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }
        return res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/inCollection/name/:name[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllProducts_arrId = async function (req, res) {
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
        return res.status(200).json(productsVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/get/byArrIds[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.updateProduct = async function (req, res) {
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
        return res.status(200).json(ProductService.createViewModelFromProduct(result));
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/edit/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.deleteProductById = async function (req, res) {
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
                return res.status(200).json({ deletedId: req.body._id });
            } else {
                return res.status(200).json({message:`cant delete product ${req.body._id}`})
            }
        } else {
            LoggerService.serverLoggerWrite("info", `api/product/delete/[POST] - product ${req.body._id} NOT deleted!;`);
            return res.status(200).json({
                message: "no product"
            });

        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/delete/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllActivatedProducts = async function (req, res) {
    try {
        const products = await ProductService.readAllProducts();
        const productsViewModel = [];
        for (let product of products) {
            productsViewModel.push(ProductService.createViewModelFromProduct(product));
        }
        return res.status(200).json(productsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/get/full/[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.activateProductById = async function (req, res) {
    try {
        const result = await ProductService.activateProduct(req.params.id);

        // обновить поисковую информацию
        const product = await ProductService.readProductById(req.params.id);
        await SearchService.updateSearchDataFromProduct(product);

        LoggerService.serverLoggerWrite("info", `api/product/activate/:id[GET] - product ${req.params.id} activated;`);
        return res.status(200).json(result);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/activate/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.deactivateProductById = async function (req, res) {
    try {
        const result = await ProductService.deactivateProduct(req.params.id);

        // удалить поисковую информацию
        await SearchService.deleteSearchDataByProductId(req.params.id);

        LoggerService.serverLoggerWrite("info", `api/product/activate/:id[GET] - product ${req.params.id} deactivated;`);
        return res.status(200).json(result);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/deactivate/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.addSaleToProduct = async function (req, res) {
    try {
        let {productId, saleId} = req.body;
        const result = await ProductService.addSaleToProduct(productId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/product/addSale/[POST] - sale ${saleId} added to product ${productId};`);
            return res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/product/addSale/[POST] - sale ${saleId}, product ${productId} - ${result.message};`);
            return res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/addSale/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.removeSaleFromProduct = async function (req, res) {
    try {
        let {productId, saleId} = req.body;
        const result = await ProductService.removeSaleFromProduct(productId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/product/removeSale/[POST] - sale ${saleId} removed from product ${productId};`);
            return res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/product/removeSale/[POST] - sale ${saleId}, product ${productId} - ${result.message};`);
            return res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/removeSale/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}