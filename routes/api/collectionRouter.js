// Роуты коллекций
const {Router} = require("express");
const CollectionService = require("../../services/mongodb/collectionService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");
const SearchService = require("../../services/mongodb/searchService");

const adm_auth = require("../../middleware/checkAdmMW");

const router = Router();


// REST
// POST - CREATE
router.post("/", adm_auth, async (req, res) =>{
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
            res.status(201).json(CollectionService.createViewModelFromCollection(result));

        } else {
            LoggerService.serverLoggerWrite("info", `api/collection/[POST] - collection ${name} already exists;`);
            res.status(200).json({
                message: "collection already exists"
            });
        }
    } catch (error) {
        LoggerService.serverLoggerWrite("error", "api/collection/[POST] - can't create collection!;");
        res.status(500).json({
            message: "server error:" + error.message
        });
    }
});

// GET - READ
router.get("/:id",  async (req, res) => {
    try {
        // получение коллекции по id
        const collection = await CollectionService.readCollectionById(req.params.id);

        // создание ViewModel
        const collectionViewModel = CollectionService.createViewModelFromCollection(collection);

        // формирование ответа
        res.status(200).json(collectionViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/collection/:id[GET] - can't read ${req.params.id} collection!;`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// GET ALL
router.get("/", async (req, res) => {
    try {
        const collections = await CollectionService.readAllCollections();

        const collectionsViewModel = [];
        for (let collection of collections){
            collectionsViewModel.push(CollectionService.createViewModelFromCollection(collection));
        }

        res.status(200).json(collectionsViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", "[api/collection/].GET - can't read all collection!;");
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// PUT - UPDATE (через POST)
router.post("/edit", adm_auth, async (req, res) => {
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
        res.status(200).json(CollectionService.createViewModelFromCollection(result));

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/collection/edit/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// DELETE - DELETE (через POST)
router.post("/delete", adm_auth, async(req, res) => {
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
                res.status(200).json({deletedId: req.body._id});

            } else {
                res.status(200).json({message:`cant delete collection ${req.body._id}`});
            }
        } else {
            LoggerService.serverLoggerWrite( "info", `api/collection/delete/[POST] - collection ${req.body._id} NOT deleted;`);
            res.status(200).json({
                message: "no collection to delete"
            });
        }
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/collection/delete[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});



// Extended
// считать по имени
router.get("/name/:name", async (req, res) => {
   try {
       const collection = await CollectionService.readCollectionByName(req.params.name);
       const collectionViewModel = CollectionService.createViewModelFromCollection(collection);
       res.status(200).json(collectionViewModel);

   } catch (e) {
       LoggerService.serverLoggerWrite("error", `api/collection/name/:name[GET] - ${e.message};`);
       res.status(500).json({
           message: "server error:" + e.message
       });
   }
});

// получить массив имён всех коллекций
router.get("/all/names", async (req, res) => {
   try {
       const collectionNames = await CollectionService.readAllCollectionNames();
       res.status(200).json({
           names: collectionNames
       });

   } catch (e) {
       LoggerService.serverLoggerWrite( "error",`api/collection/all/names[GET] - ${e.message};`);
       res.status(500).json({
           message: "server error:" + e.message
       });
   }
});


router.get("/imgRef/:id", async (req, res) => {
   try {
       const imageRef = await CollectionService.getCollectionImageRef(req.params.id);
       res.status(200).json({
           ref: imageRef
       });

   } catch (e) {
       LoggerService.serverLoggerWrite( "error", `api/collection/imgRef/:id[GET] - ${e.message};`);
       res.status(500).json({
           message: "server error:" + e.message
       });
   }
});


router.get("/imgRef/name/:name", async (req, res) => {
    try {
        const imageRef = await CollectionService.getCollectionImageRefByName(req.params.name);
        res.status(200).json({
            ref: imageRef
        });

    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `api/collection/imgRef/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});




// add sale
router.post("/addSale", adm_auth, async (req, res) => {
    try {
        let {collectionId, saleId} = req.body;
        const result = await CollectionService.addSaleToCollection(collectionId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/collection/addSale/[POST] - sale ${saleId} added to collection ${collectionId};`);
            res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/collection/addSale/[POST] - sale ${saleId}, collection ${collectionId} - ${result.message};`);
            res.status(200).json(result);
        }

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/collection/addSale/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// remove sale
router.post("/removeSale", adm_auth, async (req, res) => {
    try {
        let {collectionId, saleId} = req.body;
        const result = await CollectionService.removeSaleFromCollection(collectionId, saleId);
        if (!result.message) {
            LoggerService.serverLoggerWrite("info", `api/collection/removeSale/[POST] - sale ${saleId} removed from collection ${collectionId};`);
            res.status(200).json(result);
        } else {
            LoggerService.serverLoggerWrite("info", `api/collection/removeSale/[POST] - sale ${saleId}, collection ${collectionId} - ${result.message};`);
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