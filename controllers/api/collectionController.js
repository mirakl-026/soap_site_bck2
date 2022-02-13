const CollectionService = require("../../services/mongodb/collectionService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");
const SearchService = require("../../services/mongodb/searchService");


module.exports.createCollection = async function (req, res) {
    try {
        const {name, description, isActive, image, parentId} = req.body;

        let isActiveT = isActive ? true : false;

        // проверяем на коллекцию
        const isCollectionExists = await CollectionService.checkForCollectionInDb(name);
        if (!isCollectionExists) {
            // объект на основании данных формы
            const candidate = {
                name: name,
                description: description,
                isActive: isActiveT,
                image: image,
                parentId: parentId
            }

            // создание коллекции в БД
            const result = await CollectionService.createCollection(candidate);

            // обновление иерархии коллекций
            await CollectionService.updateCollectionsChilds();

            // обновляем товары в коллекции
            await CollectionService.refreshProductsInCollectionByName(name);

            // добавляем поисковую информацию
            await SearchService.updateSearchDataFromCollection(result);

            LoggerService.serverLoggerWrite("info", `api/collection/[POST] - collection ${name} created;`);
            return res.status(201).json(CollectionService.createViewModelFromCollection(result));

        } else {
            LoggerService.serverLoggerWrite("info", `api/collection/[POST] - collection ${name} already exists;`);
            return res.status(200).json({
                message: "collection already exists"
            });
        }
    } catch (error) {
        LoggerService.serverLoggerWrite("error", "api/collection/[POST] - can't create collection!;");
        return res.status(500).json({
            message: "server error:" + error.message
        });
    }
}

module.exports.readCollectionById = async function (req, res) {
    try {
        // получение коллекции по id
        const collection = await CollectionService.readCollectionById(req.params.id);

        // создание ViewModel
        const collectionViewModel = CollectionService.createViewModelFromCollection(collection);

        // формирование ответа
        return res.status(200).json(collectionViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/collection/:id[GET] - can't read ${req.params.id} collection!;`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readAllCollections = async function (req, res) {
    try {
        const collections = await CollectionService.readAllCollections();

        const collectionsViewModel = [];
        for (let collection of collections){
            collectionsViewModel.push(CollectionService.createViewModelFromCollection(collection));
        }

        return res.status(200).json(collectionsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", "[api/collection/].GET - can't read all collection!;");
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.updateCollection = async function (req, res) {
    try {
        const {_id, name, description, isActive, image, parentId} = req.body;

        let isActiveT = isActive ? true : false;

        // объект на основании данных формы
        const candidate = {
            _id: _id,
            name: name,
            description: description,
            isActive: isActiveT,
            image: image,
            parentId: parentId,
        };

        // обновление в БД (товары тоже)
        const result = await CollectionService.updateCollection(candidate);

        // обновление иерархии коллекций
        await CollectionService.updateCollectionsChilds();

        // обновление поисковой информации
        await SearchService.updateSearchDataFromCollection(result);

        LoggerService.serverLoggerWrite("info", `api/collection/edit/[POST] - collection ${_id} edited;`);
        return res.status(200).json(CollectionService.createViewModelFromCollection(result));

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/collection/edit/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.deleteCollection = async function (req, res) {
    try {
        const collection = await CollectionService.readCollectionById(req.body._id);
        if (collection) {
            await DeleteService.addEntityToDeleted("collection", collection);

            // удаление поисковой информации
            await SearchService.deleteSearchDataByCollectionId(collection._id);

            const result = await CollectionService.deleteCollectionById(req.body._id);
            await CollectionService.updateCollectionsChilds();

            if (result) {
                LoggerService.serverLoggerWrite( "info", `api/collection/delete/[POST] - collection ${req.body._id} deleted;`);
                return res.status(200).json({deletedId: req.body._id});

            } else {
                return res.status(200).json({message:`cant delete collection ${req.body._id}`});
            }
        } else {
            LoggerService.serverLoggerWrite( "info", `api/collection/delete/[POST] - collection ${req.body._id} NOT deleted;`);
            return res.status(200).json({
                message: "no collection to delete"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/collection/delete[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.readCollectionByName = async function (req, res) {
    try {
        const collection = await CollectionService.readCollectionByName(req.params.name);
        const collectionViewModel = CollectionService.createViewModelFromCollection(collection);
        return res.status(200).json(collectionViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/collection/name/:name[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.getAllCollectionNames = async function (req, res) {
    try {
        const collectionNames = await CollectionService.readAllCollectionNames();
        return res.status(200).json({
            names: collectionNames
        });

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/collection/all/names[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.getCollectionImageReferenceById = async function (req, res) {
    try {
        const imageRef = await CollectionService.getCollectionImageRef(req.params.id);
        return res.status(200).json({
            ref: imageRef
        });

    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `api/collection/imgRef/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.getCollectionImageReferenceByName = async function (req, res) {
    try {
        const imageRef = await CollectionService.getCollectionImageRefByName(req.params.name);
        return res.status(200).json({
            ref: imageRef
        });

    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `api/collection/imgRef/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.addSaleToCollection = async function (req, res) {
    try {
        let {collectionId, saleId} = req.body;
        const result = await CollectionService.addSaleToCollection(collectionId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/collection/addSale/[POST] - sale ${saleId} added to collection ${collectionId};`);
            return res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/collection/addSale/[POST] - sale ${saleId}, collection ${collectionId} - ${result.message};`);
            return res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/collection/addSale/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}

module.exports.removeSaleFromCollection = async function (req, res) {
    try {
        let {collectionId, saleId} = req.body;
        const result = await CollectionService.removeSaleFromCollection(collectionId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/collection/removeSale/[POST] - sale ${saleId} removed from collection ${collectionId};`);
            return res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/collection/removeSale/[POST] - sale ${saleId}, collection ${collectionId} - ${result.message};`);
            return res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/removeSale/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}